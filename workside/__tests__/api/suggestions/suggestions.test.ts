// @TASK P3-R2-T2 - Suggestions CRUD API tests
// @SPEC docs/planning/02-trd.md#suggestions

import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Supabase mock setup ---
const {
  mockFrom, mockSelect, mockInsert, mockUpdate,
  mockEq, mockSingle, mockOrder, mockRange, mockGetUser,
} = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockRange = vi.fn(() => ({ data: [], error: null, count: 0 }));
  const mockOrder = vi.fn(() => ({ range: mockRange, data: [], error: null }));
  const mockEq = vi.fn(() => ({
    single: mockSingle,
    order: mockOrder,
    select: vi.fn(() => ({ single: mockSingle })),
  }));
  const mockSelect = vi.fn(() => ({ eq: mockEq, order: mockOrder, range: mockRange }));
  const mockInsert = vi.fn(() => ({ select: vi.fn(() => ({ single: mockSingle })) }));
  const mockUpdate = vi.fn(() => ({ eq: mockEq }));
  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
  }));
  const mockGetUser = vi.fn();
  return { mockFrom, mockSelect, mockInsert, mockUpdate, mockEq, mockSingle, mockOrder, mockRange, mockGetUser };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: mockFrom,
    auth: { getUser: mockGetUser },
  }),
}));

import { GET, POST } from '@/app/api/suggestions/route';

// --- Helper ---
function createRequest(url: string, options?: RequestInit) {
  return new Request(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
}

// ===== GET /api/suggestions =====
describe('GET /api/suggestions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    });
  });

  it('should return suggestions with default pagination', async () => {
    const mockSuggestions = [
      { id: 'sug-1', title: 'Test Suggestion', status: 'approved', shout_out_count: 5, created_at: '2026-03-17T00:00:00Z' },
    ];
    mockRange.mockResolvedValue({ data: mockSuggestions, error: null, count: 1 });
    mockOrder.mockReturnValue({ range: mockRange });
    mockSelect.mockReturnValue({ eq: mockEq, order: mockOrder });

    const request = createRequest('http://localhost/api/suggestions');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(mockFrom).toHaveBeenCalledWith('suggestions');
  });

  it('should filter by status when provided', async () => {
    mockRange.mockResolvedValue({ data: [], error: null, count: 0 });
    mockOrder.mockReturnValue({ range: mockRange });
    mockEq.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq, order: mockOrder });

    const request = createRequest('http://localhost/api/suggestions?status=approved');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockEq).toHaveBeenCalledWith('status', 'approved');
  });

  it('should support pagination with page and limit', async () => {
    mockRange.mockResolvedValue({ data: [], error: null, count: 0 });
    mockOrder.mockReturnValue({ range: mockRange });
    mockSelect.mockReturnValue({ eq: mockEq, order: mockOrder });

    const request = createRequest('http://localhost/api/suggestions?page=2&limit=5');
    const response = await GET(request);

    expect(response.status).toBe(200);
    // page=2, limit=5 => range(5, 9)
    expect(mockRange).toHaveBeenCalledWith(5, 9);
  });

  it('should return 400 for invalid status filter', async () => {
    const request = createRequest('http://localhost/api/suggestions?status=invalid');
    const response = await GET(request);

    expect(response.status).toBe(400);
  });

  it('should return 500 when supabase query fails', async () => {
    mockRange.mockResolvedValue({ data: null, error: { message: 'DB error' }, count: null });
    mockOrder.mockReturnValue({ range: mockRange });
    mockSelect.mockReturnValue({ eq: mockEq, order: mockOrder });

    const request = createRequest('http://localhost/api/suggestions');
    const response = await GET(request);

    expect(response.status).toBe(500);
  });
});

// ===== POST /api/suggestions =====
describe('POST /api/suggestions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    });
  });

  it('should create a suggestion when authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-uuid-1' } },
      error: null,
    });
    const mockSuggestion = {
      id: 'sug-uuid-1',
      user_id: 'user-uuid-1',
      title: 'New Feature',
      background: 'We need this',
      status: 'pending',
      shout_out_count: 0,
      created_at: '2026-03-17T00:00:00Z',
    };
    const mockSelectAfterInsert = vi.fn(() => ({ single: mockSingle }));
    mockInsert.mockReturnValue({ select: mockSelectAfterInsert });
    mockSingle.mockResolvedValue({ data: mockSuggestion, error: null });

    const request = createRequest('http://localhost/api/suggestions', {
      method: 'POST',
      body: JSON.stringify({ title: 'New Feature', background: 'We need this' }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.title).toBe('New Feature');
    expect(body.data.status).toBe('pending');
  });

  it('should return 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    });

    const request = createRequest('http://localhost/api/suggestions', {
      method: 'POST',
      body: JSON.stringify({ title: 'New Feature' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should return 400 when title is missing', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-uuid-1' } },
      error: null,
    });

    const request = createRequest('http://localhost/api/suggestions', {
      method: 'POST',
      body: JSON.stringify({ background: 'No title provided' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should create suggestion without background (optional)', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-uuid-1' } },
      error: null,
    });
    const mockSuggestion = {
      id: 'sug-uuid-2',
      user_id: 'user-uuid-1',
      title: 'Simple Idea',
      background: null,
      status: 'pending',
      shout_out_count: 0,
      created_at: '2026-03-17T00:00:00Z',
    };
    const mockSelectAfterInsert = vi.fn(() => ({ single: mockSingle }));
    mockInsert.mockReturnValue({ select: mockSelectAfterInsert });
    mockSingle.mockResolvedValue({ data: mockSuggestion, error: null });

    const request = createRequest('http://localhost/api/suggestions', {
      method: 'POST',
      body: JSON.stringify({ title: 'Simple Idea' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });

  it('should return 500 when supabase insert fails', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-uuid-1' } },
      error: null,
    });
    const mockSelectAfterInsert = vi.fn(() => ({ single: mockSingle }));
    mockInsert.mockReturnValue({ select: mockSelectAfterInsert });
    mockSingle.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    const request = createRequest('http://localhost/api/suggestions', {
      method: 'POST',
      body: JSON.stringify({ title: 'Will Fail' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });
});
