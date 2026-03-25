// @TASK P1-R3-T1 - Rewards API tests
// @SPEC docs/planning/prelaunch/rewards

import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Supabase mock setup ---
const {
  mockFrom,
  mockSelect,
  mockInsert,
  mockUpdate,
  mockEq,
  mockSingle,
} = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockEq = vi.fn(() => ({ eq: mockEq, single: mockSingle, data: [], error: null }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockInsert = vi.fn(() => ({ select: vi.fn(() => ({ data: [], error: null })) }));
  const mockUpdate = vi.fn(() => ({ eq: mockEq }));
  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
  }));
  return { mockFrom, mockSelect, mockInsert, mockUpdate, mockEq, mockSingle };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: mockFrom,
  }),
}));

import { GET, POST, PATCH } from '@/app/api/rewards/route';

// --- Helper ---
function createRequest(url: string, options?: RequestInit) {
  return new Request(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
}

// ===== GET /api/rewards =====
describe('GET /api/rewards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    });
  });

  it('should return rewards for valid reservation_id', async () => {
    const mockRewards = [
      { id: 'reward-1', type: 'early_adopter_badge', status: 'pending', unlocked_at: null },
      { id: 'reward-2', type: 'priority_access', status: 'pending', unlocked_at: null },
    ];
    mockEq.mockResolvedValue({ data: mockRewards, error: null });
    mockSelect.mockReturnValue({ eq: mockEq });

    const request = createRequest('http://localhost/api/rewards?reservation_id=res-uuid-1');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.rewards).toHaveLength(2);
    expect(mockFrom).toHaveBeenCalledWith('rewards');
    expect(mockEq).toHaveBeenCalledWith('reservation_id', 'res-uuid-1');
  });

  it('should return 400 when reservation_id is missing', async () => {
    const request = createRequest('http://localhost/api/rewards');
    const response = await GET(request);

    expect(response.status).toBe(400);
  });
});

// ===== POST /api/rewards =====
describe('POST /api/rewards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    });
  });

  it('should create 2 rewards (early_adopter_badge + priority_access) and return 201', async () => {
    const mockCreatedRewards = [
      { id: 'reward-1', type: 'early_adopter_badge', status: 'pending', unlocked_at: null },
      { id: 'reward-2', type: 'priority_access', status: 'pending', unlocked_at: null },
    ];
    const mockSelectAfterInsert = vi.fn().mockResolvedValue({ data: mockCreatedRewards, error: null });
    mockInsert.mockReturnValue({ select: mockSelectAfterInsert });

    const request = createRequest('http://localhost/api/rewards', {
      method: 'POST',
      body: JSON.stringify({ reservation_id: 'res-uuid-1' }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.rewards).toHaveLength(2);
    expect(body.rewards[0].type).toBe('early_adopter_badge');
    expect(body.rewards[1].type).toBe('priority_access');
    expect(mockFrom).toHaveBeenCalledWith('rewards');
    expect(mockInsert).toHaveBeenCalledWith([
      { reservation_id: 'res-uuid-1', type: 'early_adopter_badge', status: 'pending' },
      { reservation_id: 'res-uuid-1', type: 'priority_access', status: 'pending' },
    ]);
  });

  it('should return 400 when reservation_id is missing', async () => {
    const request = createRequest('http://localhost/api/rewards', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});

// ===== PATCH /api/rewards =====
describe('PATCH /api/rewards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    });
  });

  it('should update reward status and return 200', async () => {
    const mockUpdatedReward = {
      id: 'reward-1',
      type: 'early_adopter_badge',
      status: 'unlocked',
      unlocked_at: '2026-03-25T00:00:00Z',
    };
    // update().eq('reservation_id', ...).eq('type', ...).select().single()
    const mockSingleAfterUpdate = vi.fn().mockResolvedValue({ data: mockUpdatedReward, error: null });
    const mockSelectAfterUpdate = vi.fn(() => ({ single: mockSingleAfterUpdate }));
    const mockEqType = vi.fn(() => ({ select: mockSelectAfterUpdate }));
    const mockEqReservation = vi.fn(() => ({ eq: mockEqType }));
    mockUpdate.mockReturnValue({ eq: mockEqReservation });

    const request = createRequest('http://localhost/api/rewards', {
      method: 'PATCH',
      body: JSON.stringify({
        reservation_id: 'res-uuid-1',
        type: 'early_adopter_badge',
        status: 'unlocked',
      }),
    });

    const response = await PATCH(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.reward.status).toBe('unlocked');
  });

  it('should return 404 when reward not found', async () => {
    const mockSingleAfterUpdate = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'not found' } });
    const mockSelectAfterUpdate = vi.fn(() => ({ single: mockSingleAfterUpdate }));
    const mockEqType = vi.fn(() => ({ select: mockSelectAfterUpdate }));
    const mockEqReservation = vi.fn(() => ({ eq: mockEqType }));
    mockUpdate.mockReturnValue({ eq: mockEqReservation });

    const request = createRequest('http://localhost/api/rewards', {
      method: 'PATCH',
      body: JSON.stringify({
        reservation_id: 'non-existent',
        type: 'early_adopter_badge',
        status: 'unlocked',
      }),
    });

    const response = await PATCH(request);
    expect(response.status).toBe(404);
  });
});
