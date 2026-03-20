// @TASK P3-R2-T2 - Suggestion detail (PATCH) API tests
// @SPEC docs/planning/02-trd.md#suggestions

import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Supabase mock setup ---
const { mockFrom, mockUpdate, mockEq, mockSingle, mockSelect, mockGetUser } = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockSelect = vi.fn(() => ({ single: mockSingle }));
  const mockEq = vi.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockUpdate = vi.fn(() => ({ eq: mockEq }));
  const mockFrom = vi.fn(() => ({
    update: mockUpdate,
  }));
  const mockGetUser = vi.fn();
  return { mockFrom, mockUpdate, mockEq, mockSingle, mockSelect, mockGetUser };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: mockFrom,
    auth: { getUser: mockGetUser },
  }),
}));

import { PATCH } from '@/app/api/suggestions/[id]/route';

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

// ===== PATCH /api/suggestions/[id] =====
describe('PATCH /api/suggestions/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ update: mockUpdate });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ single: mockSingle });
  });

  it('should update suggestion status (admin)', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-uuid' } },
      error: null,
    });
    const mockUpdated = {
      id: 'sug-uuid-1',
      status: 'approved',
      title: 'Great Idea',
      shout_out_count: 0,
      created_at: '2026-03-17T00:00:00Z',
    };
    mockSingle.mockResolvedValue({ data: mockUpdated, error: null });

    const request = createRequest('http://localhost/api/suggestions/sug-uuid-1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'approved' }),
    });

    const response = await PATCH(request, createContext('sug-uuid-1'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.status).toBe('approved');
    expect(mockFrom).toHaveBeenCalledWith('suggestions');
  });

  it('should return 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    });

    const request = createRequest('http://localhost/api/suggestions/sug-uuid-1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'approved' }),
    });

    const response = await PATCH(request, createContext('sug-uuid-1'));
    expect(response.status).toBe(401);
  });

  it('should return 400 for invalid status value', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-uuid' } },
      error: null,
    });

    const request = createRequest('http://localhost/api/suggestions/sug-uuid-1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'invalid-status' }),
    });

    const response = await PATCH(request, createContext('sug-uuid-1'));
    expect(response.status).toBe(400);
  });

  it('should return 500 when supabase update fails', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-uuid' } },
      error: null,
    });
    mockSingle.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    const request = createRequest('http://localhost/api/suggestions/sug-uuid-1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'rejected' }),
    });

    const response = await PATCH(request, createContext('sug-uuid-1'));
    expect(response.status).toBe(500);
  });
});
