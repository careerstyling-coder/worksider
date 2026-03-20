// @TASK P1-R1-T2 - Auth helper function tests
// @SPEC docs/planning/02-trd.md#Auth-API

import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.hoisted ensures mocks are available before vi.mock hoisting
const { mockSignUp, mockSignInWithPassword, mockSignOut, mockGetUser } = vi.hoisted(() => ({
  mockSignUp: vi.fn(),
  mockSignInWithPassword: vi.fn(),
  mockSignOut: vi.fn(),
  mockGetUser: vi.fn(),
}));

// Mock browser client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: mockSignUp,
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
    },
  }),
}));

// Mock server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: mockGetUser,
    },
  }),
}));

import { signUp, signIn, signOut, getSession } from '@/lib/supabase/auth';

describe('Auth helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signUp', () => {
    it('should call supabase.auth.signUp with correct params', async () => {
      mockSignUp.mockResolvedValue({ data: { user: { id: '1' } }, error: null });

      await signUp('test@example.com', 'password123', 'testuser');

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: { nickname: 'testuser' },
        },
      });
    });

    it('should pass metadata when provided', async () => {
      mockSignUp.mockResolvedValue({ data: { user: { id: '1' } }, error: null });

      await signUp('test@example.com', 'password123', 'testuser', {
        industry: 'tech',
        company_size: '1-10',
      });

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: { nickname: 'testuser', industry: 'tech', company_size: '1-10' },
        },
      });
    });

    it('should return supabase response', async () => {
      const mockResponse = { data: { user: { id: '1' } }, error: null };
      mockSignUp.mockResolvedValue(mockResponse);

      const result = await signUp('test@example.com', 'password123', 'testuser');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('signIn', () => {
    it('should call supabase.auth.signInWithPassword', async () => {
      mockSignInWithPassword.mockResolvedValue({ data: { session: {} }, error: null });

      await signIn('test@example.com', 'password123');

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  describe('signOut', () => {
    it('should call supabase.auth.signOut', async () => {
      mockSignOut.mockResolvedValue({ error: null });

      await signOut();

      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('getSession', () => {
    it('should use server client and call getUser', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: '1' } }, error: null });

      const result = await getSession();

      expect(mockGetUser).toHaveBeenCalled();
      expect(result).toEqual({ data: { user: { id: '1' } }, error: null });
    });
  });
});
