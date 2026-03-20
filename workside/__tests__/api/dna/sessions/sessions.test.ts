// @TASK P2-R1-T1 - DNA Sessions CRUD API tests
// @SPEC docs/planning/02-trd.md#dna-sessions

import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Supabase mock setup ---
const { mockFrom, mockSelect, mockInsert, mockUpdate, mockEq, mockSingle, mockOrder } = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockOrder = vi.fn(() => ({ data: [], error: null }));
  const mockEq = vi.fn(() => ({ single: mockSingle, order: mockOrder }));
  const mockSelect = vi.fn(() => ({ eq: mockEq, order: mockOrder, single: mockSingle }));
  const mockInsert = vi.fn(() => ({ select: vi.fn(() => ({ single: mockSingle })) }));
  const mockUpdate = vi.fn(() => ({ eq: mockEq }));
  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
  }));
  return { mockFrom, mockSelect, mockInsert, mockUpdate, mockEq, mockSingle, mockOrder };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: mockFrom,
  }),
}));

import { POST, GET } from '@/app/api/dna/sessions/route';
import { GET as GET_BY_ID, PATCH } from '@/app/api/dna/sessions/[id]/route';

// --- Helper ---
function createRequest(url: string, options?: RequestInit) {
  return new Request(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
}

// ===== POST /api/dna/sessions =====
describe('POST /api/dna/sessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    });
  });

  it('should create a session with version "semi"', async () => {
    const mockSession = {
      id: 'uuid-1',
      user_id: null,
      version: 'semi',
      status: 'in_progress',
      share_token: null,
      created_at: '2026-03-17T00:00:00Z',
      completed_at: null,
    };
    const mockSelectAfterInsert = vi.fn(() => ({ single: mockSingle }));
    mockInsert.mockReturnValue({ select: mockSelectAfterInsert });
    mockSingle.mockResolvedValue({ data: mockSession, error: null });

    const request = createRequest('http://localhost/api/dna/sessions', {
      method: 'POST',
      body: JSON.stringify({ version: 'semi' }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.version).toBe('semi');
    expect(body.data.status).toBe('in_progress');
    expect(mockFrom).toHaveBeenCalledWith('dna_sessions');
  });

  it('should create a session with version "full"', async () => {
    const mockSession = {
      id: 'uuid-2',
      user_id: null,
      version: 'full',
      status: 'in_progress',
      share_token: null,
      created_at: '2026-03-17T00:00:00Z',
      completed_at: null,
    };
    const mockSelectAfterInsert = vi.fn(() => ({ single: mockSingle }));
    mockInsert.mockReturnValue({ select: mockSelectAfterInsert });
    mockSingle.mockResolvedValue({ data: mockSession, error: null });

    const request = createRequest('http://localhost/api/dna/sessions', {
      method: 'POST',
      body: JSON.stringify({ version: 'full' }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.version).toBe('full');
  });

  it('should create a session with optional user_id', async () => {
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const mockSession = {
      id: 'uuid-3',
      user_id: userId,
      version: 'semi',
      status: 'in_progress',
      share_token: null,
      created_at: '2026-03-17T00:00:00Z',
      completed_at: null,
    };
    const mockSelectAfterInsert = vi.fn(() => ({ single: mockSingle }));
    mockInsert.mockReturnValue({ select: mockSelectAfterInsert });
    mockSingle.mockResolvedValue({ data: mockSession, error: null });

    const request = createRequest('http://localhost/api/dna/sessions', {
      method: 'POST',
      body: JSON.stringify({ version: 'semi', user_id: userId }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.user_id).toBe(userId);
  });

  it('should return 400 for invalid version', async () => {
    const request = createRequest('http://localhost/api/dna/sessions', {
      method: 'POST',
      body: JSON.stringify({ version: 'invalid' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 400 for missing version', async () => {
    const request = createRequest('http://localhost/api/dna/sessions', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 500 when supabase insert fails', async () => {
    const mockSelectAfterInsert = vi.fn(() => ({ single: mockSingle }));
    mockInsert.mockReturnValue({ select: mockSelectAfterInsert });
    mockSingle.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    const request = createRequest('http://localhost/api/dna/sessions', {
      method: 'POST',
      body: JSON.stringify({ version: 'semi' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });
});

// ===== GET /api/dna/sessions =====
describe('GET /api/dna/sessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    });
  });

  it('should return sessions filtered by user_id', async () => {
    const mockSessions = [
      { id: 'uuid-1', user_id: 'user-123', version: 'semi', status: 'in_progress' },
    ];
    mockOrder.mockResolvedValue({ data: mockSessions, error: null });
    mockEq.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq, order: mockOrder });

    const request = createRequest('http://localhost/api/dna/sessions?user_id=user-123', {
      method: 'GET',
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
  });

  it('should return 400 when user_id is missing', async () => {
    const request = createRequest('http://localhost/api/dna/sessions', {
      method: 'GET',
    });

    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it('should return 500 when supabase query fails', async () => {
    mockOrder.mockResolvedValue({ data: null, error: { message: 'DB error' } });
    mockEq.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq, order: mockOrder });

    const request = createRequest('http://localhost/api/dna/sessions?user_id=user-123', {
      method: 'GET',
    });

    const response = await GET(request);
    expect(response.status).toBe(500);
  });
});

// ===== GET /api/dna/sessions/[id] =====
describe('GET /api/dna/sessions/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    });
    mockSelect.mockReturnValue({ eq: mockEq, order: mockOrder, single: mockSingle });
    mockEq.mockReturnValue({ single: mockSingle });
  });

  it('should return a single session by id', async () => {
    const mockSession = {
      id: 'uuid-1',
      user_id: null,
      version: 'semi',
      status: 'in_progress',
      share_token: null,
      created_at: '2026-03-17T00:00:00Z',
      completed_at: null,
    };
    mockSingle.mockResolvedValue({ data: mockSession, error: null });

    const request = createRequest('http://localhost/api/dna/sessions/uuid-1', {
      method: 'GET',
    });

    const response = await GET_BY_ID(request, { params: Promise.resolve({ id: 'uuid-1' }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.id).toBe('uuid-1');
    expect(mockEq).toHaveBeenCalledWith('id', 'uuid-1');
  });

  it('should return 404 when session not found', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

    const request = createRequest('http://localhost/api/dna/sessions/nonexistent', {
      method: 'GET',
    });

    const response = await GET_BY_ID(request, { params: Promise.resolve({ id: 'nonexistent' }) });
    expect(response.status).toBe(404);
  });
});

// ===== PATCH /api/dna/sessions/[id] =====
describe('PATCH /api/dna/sessions/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    });
  });

  it('should update session status to completed', async () => {
    const mockUpdated = {
      id: 'uuid-1',
      user_id: null,
      version: 'semi',
      status: 'completed',
      share_token: null,
      created_at: '2026-03-17T00:00:00Z',
      completed_at: '2026-03-17T01:00:00Z',
    };
    const mockSelectAfterUpdate = vi.fn(() => ({ single: mockSingle }));
    const mockEqAfterUpdate = vi.fn(() => ({ select: mockSelectAfterUpdate }));
    mockUpdate.mockReturnValue({ eq: mockEqAfterUpdate });
    mockSingle.mockResolvedValue({ data: mockUpdated, error: null });

    const request = createRequest('http://localhost/api/dna/sessions/uuid-1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'completed' }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: 'uuid-1' }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.status).toBe('completed');
  });

  it('should return 400 for invalid status', async () => {
    const request = createRequest('http://localhost/api/dna/sessions/uuid-1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'invalid_status' }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: 'uuid-1' }) });
    expect(response.status).toBe(400);
  });

  it('should return 400 for empty body', async () => {
    const request = createRequest('http://localhost/api/dna/sessions/uuid-1', {
      method: 'PATCH',
      body: JSON.stringify({}),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: 'uuid-1' }) });
    expect(response.status).toBe(400);
  });

  it('should return 500 when supabase update fails', async () => {
    const mockSelectAfterUpdate = vi.fn(() => ({ single: mockSingle }));
    const mockEqAfterUpdate = vi.fn(() => ({ select: mockSelectAfterUpdate }));
    mockUpdate.mockReturnValue({ eq: mockEqAfterUpdate });
    mockSingle.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    const request = createRequest('http://localhost/api/dna/sessions/uuid-1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'completed' }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: 'uuid-1' }) });
    expect(response.status).toBe(500);
  });
});
