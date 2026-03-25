// @TASK P1-R3-T2 - Rewards Business Logic tests
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

// --- Mock invite-tracking ---
const { mockGetSuccessfulInvites } = vi.hoisted(() => {
  const mockGetSuccessfulInvites = vi.fn();
  return { mockGetSuccessfulInvites };
});

vi.mock('@/lib/invite-tracking', () => ({
  getSuccessfulInvites: mockGetSuccessfulInvites,
}));

import {
  createInitialRewards,
  getRewardsByReservation,
  checkAndUnlockRewards,
  updateRewardStatus,
} from '@/lib/rewards';

// --- Helper ---
const RESERVATION_ID = 'res-uuid-1';

function makePendingRewards() {
  return [
    { id: 'reward-1', reservation_id: RESERVATION_ID, type: 'early_adopter_badge', status: 'pending', unlocked_at: null, created_at: '2026-03-25T00:00:00Z' },
    { id: 'reward-2', reservation_id: RESERVATION_ID, type: 'priority_access', status: 'pending', unlocked_at: null, created_at: '2026-03-25T00:00:00Z' },
  ];
}

function makeUnlockedRewards() {
  return [
    { id: 'reward-1', reservation_id: RESERVATION_ID, type: 'early_adopter_badge', status: 'unlocked', unlocked_at: '2026-03-25T01:00:00Z', created_at: '2026-03-25T00:00:00Z' },
    { id: 'reward-2', reservation_id: RESERVATION_ID, type: 'priority_access', status: 'unlocked', unlocked_at: '2026-03-25T01:00:00Z', created_at: '2026-03-25T00:00:00Z' },
  ];
}

// ===== createInitialRewards =====
describe('createInitialRewards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    });
  });

  it('should create 2 rewards (early_adopter_badge + priority_access)', async () => {
    const rewards = makePendingRewards();

    // Check existing: none found
    mockEq.mockResolvedValueOnce({ data: [], error: null });
    mockSelect.mockReturnValue({ eq: mockEq });

    // Insert returns created rewards
    const mockSelectAfterInsert = vi.fn().mockResolvedValue({ data: rewards, error: null });
    mockInsert.mockReturnValue({ select: mockSelectAfterInsert });

    const result = await createInitialRewards(RESERVATION_ID);

    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('early_adopter_badge');
    expect(result[1].type).toBe('priority_access');
    expect(mockInsert).toHaveBeenCalledWith([
      { reservation_id: RESERVATION_ID, type: 'early_adopter_badge', status: 'pending' },
      { reservation_id: RESERVATION_ID, type: 'priority_access', status: 'pending' },
    ]);
  });

  it('should not duplicate rewards if they already exist', async () => {
    const existingRewards = makePendingRewards();

    // Check existing: found rewards
    mockEq.mockResolvedValueOnce({ data: existingRewards, error: null });
    mockSelect.mockReturnValue({ eq: mockEq });

    const result = await createInitialRewards(RESERVATION_ID);

    expect(result).toEqual(existingRewards);
    expect(mockInsert).not.toHaveBeenCalled();
  });
});

// ===== getRewardsByReservation =====
describe('getRewardsByReservation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    });
  });

  it('should return all rewards for a reservation', async () => {
    const rewards = makePendingRewards();
    mockEq.mockResolvedValueOnce({ data: rewards, error: null });
    mockSelect.mockReturnValue({ eq: mockEq });

    const result = await getRewardsByReservation(RESERVATION_ID);

    expect(result).toHaveLength(2);
    expect(mockFrom).toHaveBeenCalledWith('rewards');
    expect(mockEq).toHaveBeenCalledWith('reservation_id', RESERVATION_ID);
  });
});

// ===== checkAndUnlockRewards =====
describe('checkAndUnlockRewards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    });
  });

  it('should return unlocked: false when invites < 5', async () => {
    const rewards = makePendingRewards();
    mockGetSuccessfulInvites.mockResolvedValue(3);

    // getRewardsByReservation
    mockEq.mockResolvedValueOnce({ data: rewards, error: null });
    mockSelect.mockReturnValue({ eq: mockEq });

    const result = await checkAndUnlockRewards(RESERVATION_ID);

    expect(result.unlocked).toBe(false);
    expect(result.rewards).toHaveLength(2);
    expect(result.rewards[0].status).toBe('pending');
    expect(mockGetSuccessfulInvites).toHaveBeenCalledWith(RESERVATION_ID);
  });

  it('should unlock all rewards when invites >= 5', async () => {
    const pendingRewards = makePendingRewards();
    const unlockedRewards = makeUnlockedRewards();

    mockGetSuccessfulInvites.mockResolvedValue(5);

    // getRewardsByReservation returns pending rewards
    mockEq.mockResolvedValueOnce({ data: pendingRewards, error: null });
    mockSelect.mockReturnValue({ eq: mockEq });

    // update calls for each reward
    const mockSelectAfterUpdate = vi.fn().mockResolvedValue({ data: unlockedRewards, error: null });
    const mockEqStatus = vi.fn(() => ({ select: mockSelectAfterUpdate }));
    const mockEqReservation = vi.fn(() => ({ eq: mockEqStatus }));
    mockUpdate.mockReturnValue({ eq: mockEqReservation });

    // After update, re-fetch returns unlocked rewards
    mockEq.mockResolvedValueOnce({ data: unlockedRewards, error: null });

    const result = await checkAndUnlockRewards(RESERVATION_ID);

    expect(result.unlocked).toBe(true);
    expect(result.rewards.every((r: { status: string }) => r.status === 'unlocked')).toBe(true);
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('should not re-unlock already unlocked rewards', async () => {
    const unlockedRewards = makeUnlockedRewards();

    mockGetSuccessfulInvites.mockResolvedValue(7);

    // getRewardsByReservation returns already unlocked rewards
    mockEq.mockResolvedValueOnce({ data: unlockedRewards, error: null });
    mockSelect.mockReturnValue({ eq: mockEq });

    const result = await checkAndUnlockRewards(RESERVATION_ID);

    expect(result.unlocked).toBe(true);
    expect(result.rewards).toEqual(unlockedRewards);
    // Should NOT call update since already unlocked
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

// ===== updateRewardStatus =====
describe('updateRewardStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    });
  });

  it('should update reward status successfully', async () => {
    const updatedReward = {
      id: 'reward-1',
      reservation_id: RESERVATION_ID,
      type: 'early_adopter_badge',
      status: 'unlocked',
      unlocked_at: '2026-03-25T01:00:00Z',
    };

    const mockSingleAfterUpdate = vi.fn().mockResolvedValue({ data: updatedReward, error: null });
    const mockSelectAfterUpdate = vi.fn(() => ({ single: mockSingleAfterUpdate }));
    const mockEqType = vi.fn(() => ({ select: mockSelectAfterUpdate }));
    const mockEqReservation = vi.fn(() => ({ eq: mockEqType }));
    mockUpdate.mockReturnValue({ eq: mockEqReservation });

    const result = await updateRewardStatus(RESERVATION_ID, 'early_adopter_badge', 'unlocked');

    expect(result.status).toBe('unlocked');
    expect(mockFrom).toHaveBeenCalledWith('rewards');
  });
});
