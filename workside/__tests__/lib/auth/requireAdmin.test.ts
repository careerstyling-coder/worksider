// @TASK P1-R1-T3 - requireAdmin guard tests
// @SPEC docs/planning/02-trd.md#Auth-Guards

import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGetUser, mockFrom } = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
  const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

  return {
    mockGetUser: vi.fn(),
    mockFrom,
    // Expose inner mocks for assertion
    _mockSelect: mockSelect,
    _mockEq: mockEq,
    _mockSingle: mockSingle,
  };
});

const { mockRedirect } = vi.hoisted(() => ({
  mockRedirect: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  }),
}));

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

import { requireAdmin } from '@/lib/auth/requireAdmin';

// Helper to set up the chained mock return
function setupProfileMock(profile: { role: string } | null) {
  const mockSingle = vi.fn().mockResolvedValue({ data: profile, error: null });
  const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
  mockFrom.mockReturnValue({ select: mockSelect });
}

describe('requireAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to /signup when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    await requireAdmin();

    expect(mockRedirect).toHaveBeenCalledWith('/signup');
  });

  it('should redirect to / when user is not admin', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    setupProfileMock({ role: 'user' });

    await requireAdmin();

    expect(mockRedirect).toHaveBeenCalledWith('/');
  });

  it('should redirect to / when profile is not found', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    setupProfileMock(null);

    await requireAdmin();

    expect(mockRedirect).toHaveBeenCalledWith('/');
  });

  it('should return user when user is admin', async () => {
    const mockUser = { id: 'admin-123', email: 'admin@example.com' };
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    setupProfileMock({ role: 'admin' });

    const result = await requireAdmin();

    expect(result).toEqual(mockUser);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('should query users table with correct user id', async () => {
    const mockUser = { id: 'admin-456', email: 'admin@example.com' };
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    setupProfileMock({ role: 'admin' });

    await requireAdmin();

    expect(mockFrom).toHaveBeenCalledWith('users');
  });
});
