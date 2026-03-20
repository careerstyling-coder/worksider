// @TASK P2-R1-T2 - DNA Responses CRUD API tests
// @SPEC docs/planning/02-trd.md#dna-responses

import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Supabase mock setup ---
const { mockFrom, mockSelect, mockInsert, mockEq, mockSingle, mockOrder } = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockOrder = vi.fn(() => ({ data: [], error: null }));
  const mockEq = vi.fn(() => ({ single: mockSingle, order: mockOrder }));
  const mockSelect = vi.fn(() => ({ eq: mockEq, order: mockOrder, single: mockSingle }));
  const mockInsert = vi.fn(() => ({ select: vi.fn(() => ({ single: mockSingle })) }));
  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
  }));
  return { mockFrom, mockSelect, mockInsert, mockEq, mockSingle, mockOrder };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: mockFrom,
  }),
}));

import { POST, GET } from '@/app/api/dna/responses/route';

// --- Helper ---
function createRequest(url: string, options?: RequestInit) {
  return new Request(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
}

// ===== POST /api/dna/responses =====
describe('POST /api/dna/responses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
    });
  });

  it('should save a response with valid data', async () => {
    const mockResponse = {
      id: 'resp-uuid-1',
      session_id: '550e8400-e29b-41d4-a716-446655440000',
      question_id: 'q1',
      value: 5,
      created_at: '2026-03-17T00:00:00Z',
    };
    const mockSelectAfterInsert = vi.fn(() => ({ single: mockSingle }));
    mockInsert.mockReturnValue({ select: mockSelectAfterInsert });
    mockSingle.mockResolvedValue({ data: mockResponse, error: null });

    const request = createRequest('http://localhost/api/dna/responses', {
      method: 'POST',
      body: JSON.stringify({
        session_id: '550e8400-e29b-41d4-a716-446655440000',
        question_id: 'q1',
        value: 5,
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.question_id).toBe('q1');
    expect(body.data.value).toBe(5);
    expect(mockFrom).toHaveBeenCalledWith('dna_responses');
  });

  it('should accept value 1 (minimum)', async () => {
    const mockResponse = {
      id: 'resp-uuid-2',
      session_id: '550e8400-e29b-41d4-a716-446655440000',
      question_id: 'q2',
      value: 1,
      created_at: '2026-03-17T00:00:00Z',
    };
    const mockSelectAfterInsert = vi.fn(() => ({ single: mockSingle }));
    mockInsert.mockReturnValue({ select: mockSelectAfterInsert });
    mockSingle.mockResolvedValue({ data: mockResponse, error: null });

    const request = createRequest('http://localhost/api/dna/responses', {
      method: 'POST',
      body: JSON.stringify({
        session_id: '550e8400-e29b-41d4-a716-446655440000',
        question_id: 'q2',
        value: 1,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });

  it('should accept value 7 (maximum)', async () => {
    const mockResponse = {
      id: 'resp-uuid-3',
      session_id: '550e8400-e29b-41d4-a716-446655440000',
      question_id: 'q3',
      value: 7,
      created_at: '2026-03-17T00:00:00Z',
    };
    const mockSelectAfterInsert = vi.fn(() => ({ single: mockSingle }));
    mockInsert.mockReturnValue({ select: mockSelectAfterInsert });
    mockSingle.mockResolvedValue({ data: mockResponse, error: null });

    const request = createRequest('http://localhost/api/dna/responses', {
      method: 'POST',
      body: JSON.stringify({
        session_id: '550e8400-e29b-41d4-a716-446655440000',
        question_id: 'q3',
        value: 7,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });

  it('should return 400 for value below 1', async () => {
    const request = createRequest('http://localhost/api/dna/responses', {
      method: 'POST',
      body: JSON.stringify({
        session_id: '550e8400-e29b-41d4-a716-446655440000',
        question_id: 'q1',
        value: 0,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 400 for value above 7', async () => {
    const request = createRequest('http://localhost/api/dna/responses', {
      method: 'POST',
      body: JSON.stringify({
        session_id: '550e8400-e29b-41d4-a716-446655440000',
        question_id: 'q1',
        value: 8,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 400 for non-integer value', async () => {
    const request = createRequest('http://localhost/api/dna/responses', {
      method: 'POST',
      body: JSON.stringify({
        session_id: '550e8400-e29b-41d4-a716-446655440000',
        question_id: 'q1',
        value: 3.5,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 400 for missing session_id', async () => {
    const request = createRequest('http://localhost/api/dna/responses', {
      method: 'POST',
      body: JSON.stringify({
        question_id: 'q1',
        value: 5,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 400 for missing question_id', async () => {
    const request = createRequest('http://localhost/api/dna/responses', {
      method: 'POST',
      body: JSON.stringify({
        session_id: '550e8400-e29b-41d4-a716-446655440000',
        value: 5,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 400 for missing value', async () => {
    const request = createRequest('http://localhost/api/dna/responses', {
      method: 'POST',
      body: JSON.stringify({
        session_id: '550e8400-e29b-41d4-a716-446655440000',
        question_id: 'q1',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 400 for invalid session_id format', async () => {
    const request = createRequest('http://localhost/api/dna/responses', {
      method: 'POST',
      body: JSON.stringify({
        session_id: 'not-a-uuid',
        question_id: 'q1',
        value: 5,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 500 when supabase insert fails', async () => {
    const mockSelectAfterInsert = vi.fn(() => ({ single: mockSingle }));
    mockInsert.mockReturnValue({ select: mockSelectAfterInsert });
    mockSingle.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    const request = createRequest('http://localhost/api/dna/responses', {
      method: 'POST',
      body: JSON.stringify({
        session_id: '550e8400-e29b-41d4-a716-446655440000',
        question_id: 'q1',
        value: 5,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });
});

// ===== GET /api/dna/responses =====
describe('GET /api/dna/responses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
    });
  });

  it('should return responses filtered by session_id', async () => {
    const mockResponses = [
      { id: 'resp-1', session_id: 'session-123', question_id: 'q1', value: 5, created_at: '2026-03-17T00:00:00Z' },
      { id: 'resp-2', session_id: 'session-123', question_id: 'q2', value: 3, created_at: '2026-03-17T00:01:00Z' },
    ];
    mockOrder.mockResolvedValue({ data: mockResponses, error: null });
    mockEq.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq, order: mockOrder });

    const request = createRequest('http://localhost/api/dna/responses?session_id=session-123', {
      method: 'GET',
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(mockFrom).toHaveBeenCalledWith('dna_responses');
    expect(mockEq).toHaveBeenCalledWith('session_id', 'session-123');
  });

  it('should return 400 when session_id is missing', async () => {
    const request = createRequest('http://localhost/api/dna/responses', {
      method: 'GET',
    });

    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it('should return 500 when supabase query fails', async () => {
    mockOrder.mockResolvedValue({ data: null, error: { message: 'DB error' } });
    mockEq.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq, order: mockOrder });

    const request = createRequest('http://localhost/api/dna/responses?session_id=session-123', {
      method: 'GET',
    });

    const response = await GET(request);
    expect(response.status).toBe(500);
  });
});
