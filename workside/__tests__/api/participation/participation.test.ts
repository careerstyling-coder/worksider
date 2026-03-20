// @TASK P3-R3-T1 - Participation History API tests
// @SPEC docs/planning/02-trd.md#participation-history

import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Supabase mock setup ---
const { mockFrom, mockSelect, mockInsert, mockEq, mockSingle, mockOrder, mockGetUser } = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockOrder = vi.fn(() => ({ data: [], error: null }));
  const mockEq = vi.fn(() => ({ order: mockOrder, single: mockSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq, order: mockOrder }));
  const mockInsert = vi.fn(() => ({ select: vi.fn(() => ({ single: mockSingle })) }));
  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
  }));
  const mockGetUser = vi.fn();
  return { mockFrom, mockSelect, mockInsert, mockEq, mockSingle, mockOrder, mockGetUser };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: mockFrom,
    auth: { getUser: mockGetUser },
  }),
}));

import { GET, POST } from '@/app/api/participation/route';

// --- Helper ---
function createRequest(url: string, options?: RequestInit) {
  return new Request(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
}

// ===== GET /api/participation =====
describe('GET /api/participation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
    });
  });

  it('should return user participation history', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-uuid-1' } },
      error: null,
    });
    const mockHistory = [
      { id: 'ph-1', user_id: 'user-uuid-1', action_type: 'diagnosis', target_id: 'target-1', created_at: '2026-03-17T00:00:00Z' },
      { id: 'ph-2', user_id: 'user-uuid-1', action_type: 'suggestion', target_id: 'target-2', created_at: '2026-03-17T01:00:00Z' },
    ];
    mockOrder.mockResolvedValue({ data: mockHistory, error: null });
    mockEq.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq });

    const request = createRequest('http://localhost/api/participation');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(mockFrom).toHaveBeenCalledWith('participation_history');
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-uuid-1');
  });

  it('should return 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    });

    const request = createRequest('http://localhost/api/participation');
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('should return 500 when supabase query fails', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-uuid-1' } },
      error: null,
    });
    mockOrder.mockResolvedValue({ data: null, error: { message: 'DB error' } });
    mockEq.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq });

    const request = createRequest('http://localhost/api/participation');
    const response = await GET(request);

    expect(response.status).toBe(500);
  });
});

// ===== POST /api/participation =====
describe('POST /api/participation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
    });
  });

  it('should record a participation history entry', async () => {
    const mockEntry = {
      id: 'ph-uuid-1',
      user_id: 'user-uuid-1',
      action_type: 'diagnosis',
      target_id: 'session-uuid-1',
      created_at: '2026-03-17T00:00:00Z',
    };
    const mockSelectAfterInsert = vi.fn(() => ({ single: mockSingle }));
    mockInsert.mockReturnValue({ select: mockSelectAfterInsert });
    mockSingle.mockResolvedValue({ data: mockEntry, error: null });

    const request = createRequest('http://localhost/api/participation', {
      method: 'POST',
      body: JSON.stringify({
        user_id: 'user-uuid-1',
        action_type: 'diagnosis',
        target_id: 'session-uuid-1',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.action_type).toBe('diagnosis');
    expect(mockFrom).toHaveBeenCalledWith('participation_history');
  });

  it('should return 400 for invalid action_type', async () => {
    const request = createRequest('http://localhost/api/participation', {
      method: 'POST',
      body: JSON.stringify({
        user_id: 'user-uuid-1',
        action_type: 'invalid_action',
        target_id: 'target-1',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 400 for missing user_id', async () => {
    const request = createRequest('http://localhost/api/participation', {
      method: 'POST',
      body: JSON.stringify({
        action_type: 'diagnosis',
        target_id: 'target-1',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 400 for missing target_id', async () => {
    const request = createRequest('http://localhost/api/participation', {
      method: 'POST',
      body: JSON.stringify({
        user_id: 'user-uuid-1',
        action_type: 'diagnosis',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 400 for missing action_type', async () => {
    const request = createRequest('http://localhost/api/participation', {
      method: 'POST',
      body: JSON.stringify({
        user_id: 'user-uuid-1',
        target_id: 'target-1',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should accept all valid action types', async () => {
    const validTypes = ['diagnosis', 'question', 'suggestion', 'share', 'shout_out'];

    for (const actionType of validTypes) {
      vi.clearAllMocks();
      mockFrom.mockReturnValue({
        select: mockSelect,
        insert: mockInsert,
      });
      const mockEntry = {
        id: `ph-${actionType}`,
        user_id: 'user-uuid-1',
        action_type: actionType,
        target_id: 'target-1',
        created_at: '2026-03-17T00:00:00Z',
      };
      const mockSelectAfterInsert = vi.fn(() => ({ single: mockSingle }));
      mockInsert.mockReturnValue({ select: mockSelectAfterInsert });
      mockSingle.mockResolvedValue({ data: mockEntry, error: null });

      const request = createRequest('http://localhost/api/participation', {
        method: 'POST',
        body: JSON.stringify({
          user_id: 'user-uuid-1',
          action_type: actionType,
          target_id: 'target-1',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(201);
    }
  });

  it('should return 500 when supabase insert fails', async () => {
    const mockSelectAfterInsert = vi.fn(() => ({ single: mockSingle }));
    mockInsert.mockReturnValue({ select: mockSelectAfterInsert });
    mockSingle.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    const request = createRequest('http://localhost/api/participation', {
      method: 'POST',
      body: JSON.stringify({
        user_id: 'user-uuid-1',
        action_type: 'diagnosis',
        target_id: 'target-1',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });
});
