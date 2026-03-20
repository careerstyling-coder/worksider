// @TASK P3-R2-T1 - Question Responses API tests
// @SPEC docs/planning/02-trd.md#question-responses

import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Supabase mock setup ---
const {
  mockFrom,
  mockSelect,
  mockInsert,
  mockEq,
  mockSingle,
  mockOrder,
  mockAuth,
} = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockOrder = vi.fn(() => ({ data: [], error: null }));
  const mockEq = vi.fn(() => ({
    single: mockSingle,
    order: mockOrder,
    eq: mockEq,
  }));
  const mockSelect = vi.fn(() => ({ eq: mockEq, order: mockOrder, single: mockSingle }));
  const mockInsert = vi.fn(() => ({ select: vi.fn(() => ({ single: mockSingle })) }));
  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
  }));
  const mockAuth = {
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
  };
  return { mockFrom, mockSelect, mockInsert, mockEq, mockSingle, mockOrder, mockAuth };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: mockFrom,
    auth: mockAuth,
  }),
}));

import { POST, GET } from '@/app/api/questions/[id]/responses/route';

// --- Helper ---
function createRequest(url: string, options?: RequestInit) {
  return new Request(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
}

const mockParams = Promise.resolve({ id: 'q-uuid-1' });

// ===== POST /api/questions/[id]/responses =====
describe('POST /api/questions/[id]/responses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
    });
  });

  it('should submit a response with valid data', async () => {
    const mockResponse = {
      id: 'resp-uuid-1',
      question_id: 'q-uuid-1',
      user_id: null,
      selected_option: 'A',
      persona_label: null,
      created_at: '2026-03-17T00:00:00Z',
    };
    const mockInsertSelect = vi.fn(() => ({ single: mockSingle }));
    mockInsert.mockReturnValue({ select: mockInsertSelect });
    mockSingle.mockResolvedValue({ data: mockResponse, error: null });

    // Also need to mock the question lookup and rpc for participant_count
    mockFrom.mockImplementation((table: string) => {
      if (table === 'questions') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { id: 'q-uuid-1', status: 'active' },
                error: null,
              }),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ error: null }),
          })),
        };
      }
      return {
        insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: mockResponse, error: null }) })) })),
      };
    });

    const request = createRequest('http://localhost/api/questions/q-uuid-1/responses', {
      method: 'POST',
      body: JSON.stringify({ selected_option: 'A' }),
    });

    const response = await POST(request, { params: mockParams });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.selected_option).toBe('A');
  });

  it('should return 400 for missing selected_option', async () => {
    const request = createRequest('http://localhost/api/questions/q-uuid-1/responses', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request, { params: mockParams });
    expect(response.status).toBe(400);
  });

  it('should include user_id when authenticated', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: 'user-uuid-1' } },
      error: null,
    });

    const mockResponse = {
      id: 'resp-uuid-2',
      question_id: 'q-uuid-1',
      user_id: 'user-uuid-1',
      selected_option: 'B',
      persona_label: 'innovator',
      created_at: '2026-03-17T00:00:00Z',
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === 'questions') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { id: 'q-uuid-1', status: 'active' },
                error: null,
              }),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ error: null }),
          })),
        };
      }
      return {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: mockResponse, error: null }),
          })),
        })),
      };
    });

    const request = createRequest('http://localhost/api/questions/q-uuid-1/responses', {
      method: 'POST',
      body: JSON.stringify({
        selected_option: 'B',
        persona_label: 'innovator',
      }),
    });

    const response = await POST(request, { params: mockParams });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.user_id).toBe('user-uuid-1');
    expect(body.data.persona_label).toBe('innovator');
  });

  it('should return 404 when question not found or not active', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'questions') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116', message: 'not found' },
              }),
            })),
          })),
        };
      }
      return { insert: mockInsert };
    });

    const request = createRequest('http://localhost/api/questions/nonexistent/responses', {
      method: 'POST',
      body: JSON.stringify({ selected_option: 'A' }),
    });

    const response = await POST(request, { params: Promise.resolve({ id: 'nonexistent' }) });
    expect(response.status).toBe(404);
  });
});

// ===== GET /api/questions/[id]/responses =====
describe('GET /api/questions/[id]/responses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
    });
  });

  it('should return user responses when authenticated', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: 'user-uuid-1' } },
      error: null,
    });

    const mockResponses = [
      {
        id: 'resp-1',
        question_id: 'q-uuid-1',
        user_id: 'user-uuid-1',
        selected_option: 'A',
        persona_label: null,
        created_at: '2026-03-17T00:00:00Z',
      },
    ];

    mockFrom.mockImplementation(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({ data: mockResponses, error: null }),
          })),
        })),
      })),
    }));

    const request = createRequest('http://localhost/api/questions/q-uuid-1/responses');
    const response = await GET(request, { params: mockParams });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
  });

  it('should return 401 when not authenticated for GET', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: null }, error: null });

    const request = createRequest('http://localhost/api/questions/q-uuid-1/responses');
    const response = await GET(request, { params: mockParams });

    expect(response.status).toBe(401);
  });
});
