// @TASK P3-R2-T2 - Shout Out (POST/DELETE) API tests
// @SPEC docs/planning/02-trd.md#shout-outs

import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Supabase mock setup ---
const { mockFrom, mockInsert, mockDelete, mockEq, mockSingle, mockSelect, mockGetUser, mockRpc } = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockSelect = vi.fn(() => ({ single: mockSingle }));
  const mockEq = vi.fn(() => ({ eq: mockEq, select: mockSelect, single: mockSingle }));
  const mockInsert = vi.fn(() => ({ select: vi.fn(() => ({ single: mockSingle })) }));
  const mockDelete = vi.fn(() => ({ eq: mockEq }));
  const mockFrom = vi.fn(() => ({
    insert: mockInsert,
    delete: mockDelete,
  }));
  const mockGetUser = vi.fn();
  const mockRpc = vi.fn();
  return { mockFrom, mockInsert, mockDelete, mockEq, mockSingle, mockSelect, mockGetUser, mockRpc };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: mockFrom,
    auth: { getUser: mockGetUser },
    rpc: mockRpc,
  }),
}));

import { POST, DELETE } from '@/app/api/suggestions/[id]/shout-out/route';

// --- Helper ---
function createRequest(url: string, options?: RequestInit) {
  return new Request(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
}

function createContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

// ===== POST /api/suggestions/[id]/shout-out =====
describe('POST /api/suggestions/[id]/shout-out', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      insert: mockInsert,
      delete: mockDelete,
    });
  });

  it('should add a shout out when authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-uuid-1' } },
      error: null,
    });
    const mockShoutOut = {
      id: 'so-uuid-1',
      suggestion_id: 'sug-uuid-1',
      user_id: 'user-uuid-1',
      created_at: '2026-03-17T00:00:00Z',
    };
    const mockSelectAfterInsert = vi.fn(() => ({ single: mockSingle }));
    mockInsert.mockReturnValue({ select: mockSelectAfterInsert });
    mockSingle.mockResolvedValue({ data: mockShoutOut, error: null });
    mockRpc.mockResolvedValue({ error: null });

    const request = createRequest('http://localhost/api/suggestions/sug-uuid-1/shout-out', {
      method: 'POST',
    });

    const response = await POST(request, createContext('sug-uuid-1'));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.suggestion_id).toBe('sug-uuid-1');
    expect(mockFrom).toHaveBeenCalledWith('shout_outs');
  });

  it('should return 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    });

    const request = createRequest('http://localhost/api/suggestions/sug-uuid-1/shout-out', {
      method: 'POST',
    });

    const response = await POST(request, createContext('sug-uuid-1'));
    expect(response.status).toBe(401);
  });

  it('should return 409 when duplicate shout out', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-uuid-1' } },
      error: null,
    });
    const mockSelectAfterInsert = vi.fn(() => ({ single: mockSingle }));
    mockInsert.mockReturnValue({ select: mockSelectAfterInsert });
    mockSingle.mockResolvedValue({
      data: null,
      error: { code: '23505', message: 'duplicate key' },
    });

    const request = createRequest('http://localhost/api/suggestions/sug-uuid-1/shout-out', {
      method: 'POST',
    });

    const response = await POST(request, createContext('sug-uuid-1'));
    expect(response.status).toBe(409);
  });
});

// ===== DELETE /api/suggestions/[id]/shout-out =====
describe('DELETE /api/suggestions/[id]/shout-out', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // For DELETE chain: from().delete().eq().eq()
    const innerEq = vi.fn().mockResolvedValue({ error: null });
    mockEq.mockReturnValue({ eq: innerEq });
    mockDelete.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({
      insert: mockInsert,
      delete: mockDelete,
    });
  });

  it('should remove a shout out when authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-uuid-1' } },
      error: null,
    });
    mockRpc.mockResolvedValue({ error: null });

    const request = createRequest('http://localhost/api/suggestions/sug-uuid-1/shout-out', {
      method: 'DELETE',
    });

    const response = await DELETE(request, createContext('sug-uuid-1'));
    expect(response.status).toBe(200);
  });

  it('should return 401 when not authenticated for delete', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    });

    const request = createRequest('http://localhost/api/suggestions/sug-uuid-1/shout-out', {
      method: 'DELETE',
    });

    const response = await DELETE(request, createContext('sug-uuid-1'));
    expect(response.status).toBe(401);
  });
});
