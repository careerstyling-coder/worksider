// @TASK P5-R1-T1 - Admin Settings CRUD API tests
// @SPEC docs/planning/02-trd.md#app-settings

import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Supabase mock setup ---
const {
  mockFrom,
  mockSelect,
  mockUpdate,
  mockEq,
  mockSingle,
  mockAuth,
} = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockEq = vi.fn(() => ({
    single: mockSingle,
    eq: mockEq,
  }));
  const mockSelect = vi.fn(() => ({
    eq: mockEq,
    single: mockSingle,
  }));
  const mockUpdate = vi.fn(() => ({
    eq: vi.fn(() => ({ select: vi.fn(() => ({ single: mockSingle })) })),
  }));
  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    update: mockUpdate,
  }));
  const mockAuth = {
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
  };
  return { mockFrom, mockSelect, mockUpdate, mockEq, mockSingle, mockAuth };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: mockFrom,
    auth: mockAuth,
  }),
}));

import { GET, PATCH } from '@/app/api/admin/settings/route';

// --- Helper ---
function createRequest(url: string, options?: RequestInit) {
  return new Request(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
}

// ===== GET /api/admin/settings =====
describe('GET /api/admin/settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
    });
  });

  it('should return 401 when not authenticated', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: null }, error: null });

    const request = createRequest('http://localhost/api/admin/settings');
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('should return 403 when user is not admin', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: 'user-uuid-1' } },
      error: null,
    });

    const mockRoleSingle = vi.fn().mockResolvedValue({
      data: { role: 'user' },
      error: null,
    });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({ single: mockRoleSingle })),
          })),
        };
      }
      return { select: mockSelect };
    });

    const request = createRequest('http://localhost/api/admin/settings');
    const response = await GET(request);

    expect(response.status).toBe(403);
  });

  it('should return all settings for admin', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: 'admin-uuid-1' } },
      error: null,
    });

    const mockSettings = [
      { id: 's-uuid-1', key: 'gate_location', value: 'result', updated_at: '2026-03-17T00:00:00Z' },
      { id: 's-uuid-2', key: 'question_distribution', value: 'weekly', updated_at: '2026-03-17T00:00:00Z' },
    ];

    const mockRoleSingle = vi.fn().mockResolvedValue({
      data: { role: 'admin' },
      error: null,
    });
    const mockSettingsSelect = vi.fn().mockResolvedValue({
      data: mockSettings,
      error: null,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({ single: mockRoleSingle })),
          })),
        };
      }
      return { select: mockSettingsSelect };
    });

    const request = createRequest('http://localhost/api/admin/settings');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.data[0].key).toBe('gate_location');
  });

  it('should return 500 when supabase query fails', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: 'admin-uuid-1' } },
      error: null,
    });

    const mockRoleSingle = vi.fn().mockResolvedValue({
      data: { role: 'admin' },
      error: null,
    });
    const mockSettingsSelect = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'DB error' },
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({ single: mockRoleSingle })),
          })),
        };
      }
      return { select: mockSettingsSelect };
    });

    const request = createRequest('http://localhost/api/admin/settings');
    const response = await GET(request);

    expect(response.status).toBe(500);
  });
});

// ===== PATCH /api/admin/settings =====
describe('PATCH /api/admin/settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
    });
  });

  it('should return 401 when not authenticated', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: null }, error: null });

    const request = createRequest('http://localhost/api/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify({ key: 'gate_location', value: 'question' }),
    });
    const response = await PATCH(request);

    expect(response.status).toBe(401);
  });

  it('should return 403 when user is not admin', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: 'user-uuid-1' } },
      error: null,
    });

    const mockRoleSingle = vi.fn().mockResolvedValue({
      data: { role: 'user' },
      error: null,
    });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({ single: mockRoleSingle })),
          })),
        };
      }
      return { select: mockSelect, update: mockUpdate };
    });

    const request = createRequest('http://localhost/api/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify({ key: 'gate_location', value: 'question' }),
    });
    const response = await PATCH(request);

    expect(response.status).toBe(403);
  });

  it('should return 400 for missing key', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: 'admin-uuid-1' } },
      error: null,
    });

    const mockRoleSingle = vi.fn().mockResolvedValue({
      data: { role: 'admin' },
      error: null,
    });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({ single: mockRoleSingle })),
          })),
        };
      }
      return { select: mockSelect, update: mockUpdate };
    });

    const request = createRequest('http://localhost/api/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify({ value: 'question' }),
    });
    const response = await PATCH(request);

    expect(response.status).toBe(400);
  });

  it('should return 400 for missing value', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: 'admin-uuid-1' } },
      error: null,
    });

    const mockRoleSingle = vi.fn().mockResolvedValue({
      data: { role: 'admin' },
      error: null,
    });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({ single: mockRoleSingle })),
          })),
        };
      }
      return { select: mockSelect, update: mockUpdate };
    });

    const request = createRequest('http://localhost/api/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify({ key: 'gate_location' }),
    });
    const response = await PATCH(request);

    expect(response.status).toBe(400);
  });

  it('should update setting when admin provides valid data', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: 'admin-uuid-1' } },
      error: null,
    });

    const updatedSetting = {
      id: 's-uuid-1',
      key: 'gate_location',
      value: 'question',
      updated_at: '2026-03-17T01:00:00Z',
    };

    const mockRoleSingle = vi.fn().mockResolvedValue({
      data: { role: 'admin' },
      error: null,
    });
    const mockUpdateSingle = vi.fn().mockResolvedValue({
      data: updatedSetting,
      error: null,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({ single: mockRoleSingle })),
          })),
        };
      }
      return {
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({ single: mockUpdateSingle })),
          })),
        })),
      };
    });

    const request = createRequest('http://localhost/api/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify({ key: 'gate_location', value: 'question' }),
    });
    const response = await PATCH(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.key).toBe('gate_location');
    expect(body.data.value).toBe('question');
  });

  it('should return 500 when update fails', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: 'admin-uuid-1' } },
      error: null,
    });

    const mockRoleSingle = vi.fn().mockResolvedValue({
      data: { role: 'admin' },
      error: null,
    });
    const mockUpdateSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'DB error' },
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({ single: mockRoleSingle })),
          })),
        };
      }
      return {
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({ single: mockUpdateSingle })),
          })),
        })),
      };
    });

    const request = createRequest('http://localhost/api/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify({ key: 'gate_location', value: 'question' }),
    });
    const response = await PATCH(request);

    expect(response.status).toBe(500);
  });
});
