// @TASK P1-R2-T2 - Invite Tracking Business Logic Tests
// @SPEC docs/planning/prelaunch/invite-tracking

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Test UUIDs
const INVITER_UUID = 'a1111111-1111-4111-a111-111111111111';
const INVITEE_UUID = 'b2222222-2222-4222-a222-222222222222';
const TRACKING_UUID = 'c3333333-3333-4333-a333-333333333333';

// Mock Supabase server client
const mockSupabase = {
  from: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

// Helper to build chainable query mock
function buildChain(overrides: Record<string, unknown> = {}) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const methods = ['select', 'insert', 'update', 'eq', 'single', 'order', 'limit'];
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  Object.assign(chain, overrides);
  return chain;
}

describe('trackLinkClick', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should create tracking record for valid invite_code', async () => {
    // Mock: reservations lookup
    const reservationChain = buildChain();
    reservationChain.select = vi.fn().mockReturnValue(reservationChain);
    reservationChain.eq = vi.fn().mockReturnValue(reservationChain);
    reservationChain.single = vi.fn().mockResolvedValue({
      data: { id: INVITER_UUID, invite_code: 'ABC123' },
      error: null,
    });

    // Mock: invite_tracking insert
    const trackingChain = buildChain();
    trackingChain.insert = vi.fn().mockReturnValue(trackingChain);
    trackingChain.select = vi.fn().mockReturnValue(trackingChain);
    trackingChain.single = vi.fn().mockResolvedValue({
      data: {
        id: TRACKING_UUID,
        inviter_id: INVITER_UUID,
        invite_code: 'ABC123',
        link_clicked: true,
        clicked_at: '2026-03-25T00:00:00Z',
      },
      error: null,
    });

    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'reservations') return reservationChain;
      if (table === 'invite_tracking') return trackingChain;
      return buildChain();
    });

    const { trackLinkClick } = await import('@/lib/invite-tracking');
    const result = await trackLinkClick('ABC123');

    expect(result.id).toBe(TRACKING_UUID);
    expect(result.inviter_id).toBe(INVITER_UUID);
    expect(result.invite_code).toBe('ABC123');
    expect(result.link_clicked).toBe(true);
  });

  it('should throw error for invalid invite_code', async () => {
    const reservationChain = buildChain();
    reservationChain.select = vi.fn().mockReturnValue(reservationChain);
    reservationChain.eq = vi.fn().mockReturnValue(reservationChain);
    reservationChain.single = vi.fn().mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'not found' },
    });

    mockSupabase.from = vi.fn(() => reservationChain);

    const { trackLinkClick } = await import('@/lib/invite-tracking');

    await expect(trackLinkClick('INVALID')).rejects.toThrow('Invalid invite code');
  });
});

describe('recordConversion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should update existing tracking record with conversion data', async () => {
    // Mock: find tracking record
    const selectChain = buildChain();
    selectChain.select = vi.fn().mockReturnValue(selectChain);
    selectChain.eq = vi.fn().mockReturnValue(selectChain);
    selectChain.order = vi.fn().mockReturnValue(selectChain);
    selectChain.single = vi.fn().mockResolvedValue({
      data: { id: TRACKING_UUID, invite_code: 'ABC123', link_clicked: true },
      error: null,
    });

    // Mock: update tracking record
    const updateChain = buildChain();
    updateChain.update = vi.fn().mockReturnValue(updateChain);
    updateChain.eq = vi.fn().mockReturnValue(updateChain);
    updateChain.select = vi.fn().mockReturnValue(updateChain);
    updateChain.single = vi.fn().mockResolvedValue({
      data: {
        id: TRACKING_UUID,
        converted: true,
        converted_at: '2026-03-25T00:00:00Z',
        invitee_id: INVITEE_UUID,
      },
      error: null,
    });

    let callIndex = 0;
    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'invite_tracking') {
        callIndex++;
        return callIndex === 1 ? selectChain : updateChain;
      }
      return buildChain();
    });

    const { recordConversion } = await import('@/lib/invite-tracking');
    await recordConversion('ABC123', INVITEE_UUID);

    // Verify update was called with correct data
    expect(updateChain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        converted: true,
        invitee_id: INVITEE_UUID,
      })
    );
  });

  it('should create new record when no prior click tracking exists', async () => {
    // Mock: no existing record found
    const selectChain = buildChain();
    selectChain.select = vi.fn().mockReturnValue(selectChain);
    selectChain.eq = vi.fn().mockReturnValue(selectChain);
    selectChain.order = vi.fn().mockReturnValue(selectChain);
    selectChain.single = vi.fn().mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'not found' },
    });

    // Mock: reservations lookup for inviter
    const reservationChain = buildChain();
    reservationChain.select = vi.fn().mockReturnValue(reservationChain);
    reservationChain.eq = vi.fn().mockReturnValue(reservationChain);
    reservationChain.single = vi.fn().mockResolvedValue({
      data: { id: INVITER_UUID, invite_code: 'ABC123' },
      error: null,
    });

    // Mock: insert new tracking record
    const insertChain = buildChain();
    insertChain.insert = vi.fn().mockReturnValue(insertChain);
    insertChain.select = vi.fn().mockReturnValue(insertChain);
    insertChain.single = vi.fn().mockResolvedValue({
      data: {
        id: TRACKING_UUID,
        inviter_id: INVITER_UUID,
        invite_code: 'ABC123',
        link_clicked: false,
        converted: true,
        converted_at: '2026-03-25T00:00:00Z',
        invitee_id: INVITEE_UUID,
      },
      error: null,
    });

    let callIndex = 0;
    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'invite_tracking') {
        callIndex++;
        return callIndex === 1 ? selectChain : insertChain;
      }
      if (table === 'reservations') return reservationChain;
      return buildChain();
    });

    const { recordConversion } = await import('@/lib/invite-tracking');
    await recordConversion('ABC123', INVITEE_UUID);

    // Verify insert was called (new record created)
    expect(insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        inviter_id: INVITER_UUID,
        invite_code: 'ABC123',
        converted: true,
        invitee_id: INVITEE_UUID,
      })
    );
  });
});

describe('getSuccessfulInvites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should return 0 when no converted records exist', async () => {
    const chain = buildChain();
    chain.select = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    // Final eq returns resolved value
    let eqCallCount = 0;
    chain.eq = vi.fn().mockImplementation(() => {
      eqCallCount++;
      if (eqCallCount >= 2) {
        // After both eq calls, resolve
        return Promise.resolve({ data: [], error: null, count: 0 });
      }
      return chain;
    });

    mockSupabase.from = vi.fn(() => chain);

    const { getSuccessfulInvites } = await import('@/lib/invite-tracking');
    const count = await getSuccessfulInvites(INVITER_UUID);

    expect(count).toBe(0);
  });

  it('should return correct count for converted records', async () => {
    const chain = buildChain();
    chain.select = vi.fn().mockReturnValue(chain);
    let eqCallCount = 0;
    chain.eq = vi.fn().mockImplementation(() => {
      eqCallCount++;
      if (eqCallCount >= 2) {
        return Promise.resolve({
          data: [{ id: '1' }, { id: '2' }, { id: '3' }],
          error: null,
          count: 3,
        });
      }
      return chain;
    });

    mockSupabase.from = vi.fn(() => chain);

    const { getSuccessfulInvites } = await import('@/lib/invite-tracking');
    const count = await getSuccessfulInvites(INVITER_UUID);

    expect(count).toBe(3);
  });
});

describe('getInviterStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should return comprehensive stats for inviter', async () => {
    const records = [
      { id: '1', inviter_id: INVITER_UUID, converted: true, link_clicked: true },
      { id: '2', inviter_id: INVITER_UUID, converted: false, link_clicked: true },
      { id: '3', inviter_id: INVITER_UUID, converted: true, link_clicked: true },
    ];

    const chain = buildChain();
    chain.select = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.order = vi.fn().mockResolvedValue({
      data: records,
      error: null,
    });

    mockSupabase.from = vi.fn(() => chain);

    const { getInviterStats } = await import('@/lib/invite-tracking');
    const stats = await getInviterStats(INVITER_UUID);

    expect(stats.total_clicks).toBe(3);
    expect(stats.successful_invites).toBe(2);
    expect(stats.records).toHaveLength(3);
  });

  it('should return zero stats when no records exist', async () => {
    const chain = buildChain();
    chain.select = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.order = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    mockSupabase.from = vi.fn(() => chain);

    const { getInviterStats } = await import('@/lib/invite-tracking');
    const stats = await getInviterStats(INVITER_UUID);

    expect(stats.total_clicks).toBe(0);
    expect(stats.successful_invites).toBe(0);
    expect(stats.records).toHaveLength(0);
  });
});
