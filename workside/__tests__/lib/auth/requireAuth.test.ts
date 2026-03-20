// @TASK P1-R1-T3 - requireAuth guard tests
// @SPEC docs/planning/02-trd.md#Auth-Guards

import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGetUser } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
}));

const { mockRedirect } = vi.hoisted(() => ({
  mockRedirect: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: mockGetUser,
    },
  }),
}));

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

import { requireAuth } from '@/lib/auth/requireAuth';

describe('requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to /signup when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    await requireAuth();

    expect(mockRedirect).toHaveBeenCalledWith('/signup');
  });

  it('should return user when authenticated', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

    const result = await requireAuth();

    expect(result).toEqual(mockUser);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('should redirect when getUser returns an error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'expired' } });

    await requireAuth();

    expect(mockRedirect).toHaveBeenCalledWith('/signup');
  });
});
