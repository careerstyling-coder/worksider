// @TASK P3-R1-T1 - Questions Detail API tests (GET, PATCH, DELETE by id)
// @SPEC docs/planning/02-trd.md#questions

import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Supabase mock setup ---
const {
  mockFrom,
  mockSelect,
  mockUpdate,
  mockDelete,
  mockEq,
  mockSingle,
  mockAuth,
} = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockEq = vi.fn(() => ({
    single: mockSingle,
    eq: mockEq,
    select: vi.fn(() => ({ single: mockSingle })),
  }));
  const mockSelect = vi.fn(() => ({ eq: mockEq, single: mockSingle }));
  const mockUpdate = vi.fn(() => ({ eq: vi.fn(() => ({ select: vi.fn(() => ({ single: mockSingle })) })) }));
  const mockDelete = vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) }));
  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    update: mockUpdate,
    delete: mockDelete,
  }));
  const mockAuth = {
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
  };
  return { mockFrom, mockSelect, mockUpdate, mockDelete, mockEq, mockSingle, mockAuth };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: mockFrom,
    auth: mockAuth,
  }),
}));

import { GET, PATCH, DELETE } from '@/app/api/questions/[id]/route';

// --- Helper ---
function createRequest(url: string, options?: RequestInit) {
  return new Request(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
}

const mockParams = Promise.resolve({ id: 'q-uuid-1' });

// ===== GET /api/questions/[id] =====
describe('GET /api/questions/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
      delete: mockDelete,
    });
  });

  it('should return a question by id', async () => {
    const mockQuestion = {
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
    };
    mockSingle.mockResolvedValue({ data: mockQuestion, error: null });

    const request = createRequest('http://localhost/api/questions/q-uuid-1');
    const response = await GET(request, { params: mockParams });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.id).toBe('q-uuid-1');
    expect(body.data.title).toBe('Test Question');
  });

  it('should return 404 when question not found', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'not found' } });

    const request = createRequest('http://localhost/api/questions/nonexistent');
    const response = await GET(request, { params: Promise.resolve({ id: 'nonexistent' }) });

    expect(response.status).toBe(404);
  });
});

// ===== PATCH /api/questions/[id] (admin only) =====
describe('PATCH /api/questions/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
      delete: mockDelete,
    });
  });

  it('should return 401 when not authenticated', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: null }, error: null });

    const request = createRequest('http://localhost/api/questions/q-uuid-1', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Updated Title' }),
    });

    const response = await PATCH(request, { params: mockParams });
    expect(response.status).toBe(401);
  });

  it('should return 403 when user is not admin', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: 'user-uuid-1' } },
      error: null,
    });
    const mockRoleSingle = vi.fn().mockResolvedValue({ data: { role: 'user' }, error: null });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return { select: vi.fn(() => ({ eq: vi.fn(() => ({ single: mockRoleSingle })) })) };
      }
      return { update: mockUpdate };
    });

    const request = createRequest('http://localhost/api/questions/q-uuid-1', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Updated Title' }),
    });

    const response = await PATCH(request, { params: mockParams });
    expect(response.status).toBe(403);
  });

  it('should update a question when user is admin', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: 'admin-uuid-1' } },
      error: null,
    });
    const mockRoleSingle = vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null });
    const mockUpdateSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'q-uuid-1',
        title: 'Updated Title',
        description: null,
        type: 'simple',
        status: 'active',
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

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return { select: vi.fn(() => ({ eq: vi.fn(() => ({ single: mockRoleSingle })) })) };
      }
      return {
        update: vi.fn(() => ({ eq: vi.fn(() => ({ select: vi.fn(() => ({ single: mockUpdateSingle })) })) })),
      };
    });

    const request = createRequest('http://localhost/api/questions/q-uuid-1', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Updated Title' }),
    });

    const response = await PATCH(request, { params: mockParams });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.title).toBe('Updated Title');
  });
});

// ===== DELETE /api/questions/[id] (admin only) =====
describe('DELETE /api/questions/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
      delete: mockDelete,
    });
  });

  it('should return 401 when not authenticated', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: null }, error: null });

    const request = createRequest('http://localhost/api/questions/q-uuid-1', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: mockParams });
    expect(response.status).toBe(401);
  });

  it('should delete a question when user is admin', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: 'admin-uuid-1' } },
      error: null,
    });
    const mockRoleSingle = vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null });
    const mockDeleteEq = vi.fn().mockReturnValue({ error: null });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return { select: vi.fn(() => ({ eq: vi.fn(() => ({ single: mockRoleSingle })) })) };
      }
      return { delete: vi.fn(() => ({ eq: mockDeleteEq })) };
    });

    const request = createRequest('http://localhost/api/questions/q-uuid-1', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: mockParams });
    expect(response.status).toBe(204);
  });
});
