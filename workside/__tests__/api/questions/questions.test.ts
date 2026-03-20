// @TASK P3-R1-T1 - Questions CRUD API tests
// @SPEC docs/planning/02-trd.md#questions

import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Supabase mock setup ---
const {
  mockFrom,
  mockSelect,
  mockInsert,
  mockUpdate,
  mockDelete,
  mockEq,
  mockSingle,
  mockOrder,
  mockLimit,
  mockRange,
  mockAuth,
} = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockRange = vi.fn(() => ({ data: [], error: null, count: 0 }));
  const mockLimit = vi.fn(() => ({ data: [], error: null }));
  const mockOrder = vi.fn(() => ({ range: mockRange, data: [], error: null }));
  const mockEq = vi.fn(() => ({
    single: mockSingle,
    order: mockOrder,
    eq: mockEq,
    range: mockRange,
    limit: mockLimit,
  }));
  const mockSelect = vi.fn(() => ({
    eq: mockEq,
    order: mockOrder,
    single: mockSingle,
    range: mockRange,
    limit: mockLimit,
  }));
  const mockInsert = vi.fn(() => ({ select: vi.fn(() => ({ single: mockSingle })) }));
  const mockUpdate = vi.fn(() => ({ eq: vi.fn(() => ({ select: vi.fn(() => ({ single: mockSingle })) })) }));
  const mockDelete = vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) }));
  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
  }));
  const mockAuth = {
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
  };
  return { mockFrom, mockSelect, mockInsert, mockUpdate, mockDelete, mockEq, mockSingle, mockOrder, mockLimit, mockRange, mockAuth };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: mockFrom,
    auth: mockAuth,
  }),
}));

import { GET, POST } from '@/app/api/questions/route';

// --- Helper ---
function createRequest(url: string, options?: RequestInit) {
  return new Request(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
}

// ===== GET /api/questions =====
describe('GET /api/questions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    });
  });

  it('should return active questions by default', async () => {
    const mockQuestions = [
      {
        id: 'q-uuid-1',
        title: 'Test Question',
        description: 'Description',
        type: 'simple',
        status: 'active',
        is_featured: false,
        options: ['A', 'B'],
        created_by: null,
        suggestion_id: null,
        deadline: null,
        participant_count: 0,
        created_at: '2026-03-17T00:00:00Z',
      },
    ];
    mockRange.mockResolvedValue({ data: mockQuestions, error: null, count: 1 });

    const request = createRequest('http://localhost/api/questions');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].title).toBe('Test Question');
  });

  it('should filter by status', async () => {
    mockRange.mockResolvedValue({ data: [], error: null, count: 0 });

    const request = createRequest('http://localhost/api/questions?status=draft');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockEq).toHaveBeenCalledWith('status', 'draft');
  });

  it('should filter by is_featured', async () => {
    mockRange.mockResolvedValue({ data: [], error: null, count: 0 });

    const request = createRequest('http://localhost/api/questions?is_featured=true');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockEq).toHaveBeenCalledWith('is_featured', true);
  });

  it('should support pagination with limit and offset', async () => {
    mockRange.mockResolvedValue({ data: [], error: null, count: 0 });

    const request = createRequest('http://localhost/api/questions?limit=5&offset=10');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockRange).toHaveBeenCalledWith(10, 14);
  });

  it('should return 500 when supabase query fails', async () => {
    mockRange.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    const request = createRequest('http://localhost/api/questions');
    const response = await GET(request);

    expect(response.status).toBe(500);
  });
});

// ===== POST /api/questions (admin only) =====
describe('POST /api/questions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    });
  });

  it('should return 401 when not authenticated', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: null }, error: null });

    const request = createRequest('http://localhost/api/questions', {
      method: 'POST',
      body: JSON.stringify({
        title: 'New Question',
        options: ['A', 'B'],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should return 403 when user is not admin', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: 'user-uuid-1' } },
      error: null,
    });
    mockSingle.mockResolvedValue({ data: { role: 'user' }, error: null });

    const request = createRequest('http://localhost/api/questions', {
      method: 'POST',
      body: JSON.stringify({
        title: 'New Question',
        options: ['A', 'B'],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(403);
  });

  it('should create a question when user is admin', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: 'admin-uuid-1' } },
      error: null,
    });
    // First call: role check
    const mockRoleSingle = vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null });
    // Second call: insert
    const mockInsertSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'q-new-uuid',
        title: 'New Question',
        description: null,
        type: 'simple',
        status: 'draft',
        is_featured: false,
        options: ['A', 'B'],
        created_by: 'admin-uuid-1',
        suggestion_id: null,
        deadline: null,
        participant_count: 0,
        created_at: '2026-03-17T00:00:00Z',
      },
      error: null,
    });

    let callCount = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: vi.fn(() => ({ eq: vi.fn(() => ({ single: mockRoleSingle })) })),
        };
      }
      // questions table
      return {
        insert: vi.fn(() => ({ select: vi.fn(() => ({ single: mockInsertSingle })) })),
      };
    });

    const request = createRequest('http://localhost/api/questions', {
      method: 'POST',
      body: JSON.stringify({
        title: 'New Question',
        options: ['A', 'B'],
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.title).toBe('New Question');
  });

  it('should return 400 for missing title', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: 'admin-uuid-1' } },
      error: null,
    });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
            })),
          })),
        };
      }
      return { insert: mockInsert };
    });

    const request = createRequest('http://localhost/api/questions', {
      method: 'POST',
      body: JSON.stringify({
        options: ['A', 'B'],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 400 for missing options', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: 'admin-uuid-1' } },
      error: null,
    });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
            })),
          })),
        };
      }
      return { insert: mockInsert };
    });

    const request = createRequest('http://localhost/api/questions', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Question without options',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
