// @TASK P1-R2-T1 - Invite Tracking API Tests
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
  const methods = ['select', 'insert', 'update', 'eq', 'single', 'order'];
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  // Apply overrides (e.g., final resolution values)
  Object.assign(chain, overrides);
  return chain;
}

describe('POST /api/invite-tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 201 with tracking record for valid invite_code', async () => {
    // Mock: reservations lookup returns inviter
    const reservationChain = buildChain();
    reservationChain.select = vi.fn().mockReturnValue(reservationChain);
    reservationChain.eq = vi.fn().mockReturnValue(reservationChain);
    reservationChain.single = vi.fn().mockResolvedValue({
      data: { id: 'a1111111-1111-4111-a111-111111111111', invite_code: 'ABC123' },
      error: null,
    });

    // Mock: invite_tracking insert
    const trackingChain = buildChain();
    trackingChain.insert = vi.fn().mockReturnValue(trackingChain);
    trackingChain.select = vi.fn().mockReturnValue(trackingChain);
    trackingChain.single = vi.fn().mockResolvedValue({
      data: {
        id: 'c3333333-3333-4333-a333-333333333333',
        inviter_id: 'a1111111-1111-4111-a111-111111111111',
        invite_code: 'ABC123',
        link_clicked: true,
        clicked_at: '2026-03-25T00:00:00Z',
      },
      error: null,
    });

    let callCount = 0;
    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'reservations') return reservationChain;
      if (table === 'invite_tracking') return trackingChain;
      return buildChain();
    });

    const { POST } = await import('@/app/api/invite-tracking/route');

    const request = new Request('http://localhost/api/invite-tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invite_code: 'ABC123' }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.id).toBe('c3333333-3333-4333-a333-333333333333');
    expect(body.inviter_id).toBe('a1111111-1111-4111-a111-111111111111');
    expect(body.invite_code).toBe('ABC123');
  });

  it('should return 404 for invalid invite_code', async () => {
    const reservationChain = buildChain();
    reservationChain.select = vi.fn().mockReturnValue(reservationChain);
    reservationChain.eq = vi.fn().mockReturnValue(reservationChain);
    reservationChain.single = vi.fn().mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'not found' },
    });

    mockSupabase.from = vi.fn(() => reservationChain);

    const { POST } = await import('@/app/api/invite-tracking/route');

    const request = new Request('http://localhost/api/invite-tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invite_code: 'INVALID' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(404);
  });
});

describe('PATCH /api/invite-tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 when conversion is recorded', async () => {
    // Mock: find tracking record
    const selectChain = buildChain();
    selectChain.select = vi.fn().mockReturnValue(selectChain);
    selectChain.eq = vi.fn().mockReturnValue(selectChain);
    selectChain.order = vi.fn().mockReturnValue(selectChain);
    selectChain.single = vi.fn().mockResolvedValue({
      data: { id: 'c3333333-3333-4333-a333-333333333333', invite_code: 'ABC123', link_clicked: true },
      error: null,
    });

    // Mock: update tracking record
    const updateChain = buildChain();
    updateChain.update = vi.fn().mockReturnValue(updateChain);
    updateChain.eq = vi.fn().mockReturnValue(updateChain);
    updateChain.select = vi.fn().mockReturnValue(updateChain);
    updateChain.single = vi.fn().mockResolvedValue({
      data: {
        id: 'c3333333-3333-4333-a333-333333333333',
        converted: true,
        converted_at: '2026-03-25T00:00:00Z',
        invitee_id: 'b2222222-2222-4222-a222-222222222222',
      },
      error: null,
    });

    let callIndex = 0;
    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'invite_tracking') {
        callIndex++;
        // First call is select (find), second is update
        return callIndex === 1 ? selectChain : updateChain;
      }
      return buildChain();
    });

    const { PATCH } = await import('@/app/api/invite-tracking/route');

    const request = new Request('http://localhost/api/invite-tracking', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invite_code: 'ABC123', invitee_id: 'b2222222-2222-4222-a222-222222222222' }),
    });

    const response = await PATCH(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.converted).toBe(true);
  });

  it('should return 404 when tracking record not found', async () => {
    const selectChain = buildChain();
    selectChain.select = vi.fn().mockReturnValue(selectChain);
    selectChain.eq = vi.fn().mockReturnValue(selectChain);
    selectChain.order = vi.fn().mockReturnValue(selectChain);
    selectChain.single = vi.fn().mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'not found' },
    });

    mockSupabase.from = vi.fn(() => selectChain);

    const { PATCH } = await import('@/app/api/invite-tracking/route');

    const request = new Request('http://localhost/api/invite-tracking', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invite_code: 'NONEXIST', invitee_id: 'b2222222-2222-4222-a222-222222222222' }),
    });

    const response = await PATCH(request);
    expect(response.status).toBe(404);
  });
});

describe('GET /api/invite-tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return records and successful_invites count for inviter_id', async () => {
    const records = [
      { id: '1', inviter_id: 'a1111111-1111-4111-a111-111111111111', converted: true, link_clicked: true },
      { id: '2', inviter_id: 'a1111111-1111-4111-a111-111111111111', converted: false, link_clicked: true },
      { id: '3', inviter_id: 'a1111111-1111-4111-a111-111111111111', converted: true, link_clicked: true },
    ];

    const chain = buildChain();
    chain.select = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.order = vi.fn().mockResolvedValue({
      data: records,
      error: null,
    });

    mockSupabase.from = vi.fn(() => chain);

    const { GET } = await import('@/app/api/invite-tracking/route');

    const request = new Request(
      'http://localhost/api/invite-tracking?inviter_id=a1111111-1111-4111-a111-111111111111',
      { method: 'GET' }
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.records).toHaveLength(3);
    expect(body.successful_invites).toBe(2);
  });
});
