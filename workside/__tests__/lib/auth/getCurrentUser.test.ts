// @TASK P1-R1-T3 - getCurrentUser tests
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
  };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  }),
}));

import { getCurrentUser } from '@/lib/auth/getCurrentUser';

function setupProfileMock(data: Record<string, unknown> | null) {
  const mockSingle = vi.fn().mockResolvedValue({ data, error: null });
  const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
  mockFrom.mockReturnValue({ select: mockSelect });
}

describe('getCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const result = await getCurrentUser();

    expect(result).toBeNull();
  });

  it('should return user profile when authenticated', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockProfile = {
      id: 'user-123',
      email: 'test@example.com',
      nickname: 'tester',
      role: 'user',
      industry: null,
      company_size: null,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    };
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    setupProfileMock(mockProfile);

    const result = await getCurrentUser();

    expect(result).toEqual(mockProfile);
    expect(mockFrom).toHaveBeenCalledWith('users');
  });

  it('should return null when profile is not found', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    setupProfileMock(null);

    const result = await getCurrentUser();

    expect(result).toBeNull();
  });
});
