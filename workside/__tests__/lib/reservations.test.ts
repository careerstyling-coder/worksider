// @TASK P1-R1-T2 - Reservations business logic tests
// @SPEC docs/planning/prelaunch/reservations
// @TEST __tests__/lib/reservations.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';

// -- Supabase mock setup --

const { mockFrom, mockRpc } = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockLimit = vi.fn(() => ({ single: mockSingle }));
  const mockOrder = vi.fn(() => ({ limit: mockLimit, single: mockSingle }));
  const mockEq = vi.fn(() => ({ single: mockSingle, order: mockOrder }));
  const mockSelect = vi.fn(() => ({ eq: mockEq, order: mockOrder, single: mockSingle }));
  const mockInsert = vi.fn(() => ({ select: mockSelect }));
  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
  }));
  const mockRpc = vi.fn();

  return {
    mockFrom,
    mockRpc,
    mockSelect,
    mockInsert,
    mockEq,
    mockOrder,
    mockLimit,
    mockSingle,
  };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(async () => ({
    from: mockFrom,
    rpc: mockRpc,
  })),
}));

import {
  checkDuplicateEmail,
  generateInviteCode,
  resolveInviter,
  createReservation,
} from '@/lib/reservations';

// -- Helper to get nested mock functions --

function getChainMocks() {
  const fromResult = mockFrom('reservations');
  const selectResult = fromResult.select();
  const eqResult = selectResult.eq('email', 'any');
  return {
    from: mockFrom,
    select: fromResult.select as ReturnType<typeof vi.fn>,
    insert: fromResult.insert as ReturnType<typeof vi.fn>,
    eq: selectResult.eq as ReturnType<typeof vi.fn>,
    order: selectResult.order as ReturnType<typeof vi.fn>,
    limit: selectResult.order().limit as ReturnType<typeof vi.fn>,
    single: eqResult.single as ReturnType<typeof vi.fn>,
  };
}

describe('checkDuplicateEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true when email already exists', async () => {
    const mocks = getChainMocks();
    mocks.single.mockResolvedValue({
      data: { id: 'uuid-1', email: 'existing@example.com' },
      error: null,
    });

    const result = await checkDuplicateEmail('existing@example.com');
    expect(result).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('reservations');
  });

  it('should return false when email does not exist', async () => {
    const mocks = getChainMocks();
    mocks.single.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116' },
    });

    const result = await checkDuplicateEmail('new@example.com');
    expect(result).toBe(false);
  });
});

describe('generateInviteCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return an 8-character string', async () => {
    // Mock: first call checks uniqueness, returns no match
    const mocks = getChainMocks();
    mocks.single.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

    const code = await generateInviteCode();
    expect(typeof code).toBe('string');
    expect(code).toHaveLength(8);
  });

  it('should only contain valid characters (A-Z excluding I,O + 2-9)', async () => {
    const mocks = getChainMocks();
    mocks.single.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

    const code = await generateInviteCode();
    const validChars = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/;
    expect(code).toMatch(validChars);
  });

  it('should retry if generated code already exists', async () => {
    const mocks = getChainMocks();
    // First attempt: code exists
    mocks.single
      .mockResolvedValueOnce({ data: { id: 'uuid-1' }, error: null })
      // Second attempt: code is unique
      .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

    const code = await generateInviteCode();
    expect(code).toHaveLength(8);
    // single should have been called at least twice (retry)
    expect(mocks.single).toHaveBeenCalledTimes(2);
  });
});

describe('resolveInviter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return inviter id for valid ref code', async () => {
    const mocks = getChainMocks();
    mocks.single.mockResolvedValue({
      data: { id: 'inviter-uuid' },
      error: null,
    });

    const result = await resolveInviter('ABC12345');
    expect(result).toBe('inviter-uuid');
  });

  it('should return null for invalid ref code', async () => {
    const mocks = getChainMocks();
    mocks.single.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116' },
    });

    const result = await resolveInviter('INVALID1');
    expect(result).toBeNull();
  });

  it('should return null when ref is undefined', async () => {
    const result = await resolveInviter(undefined);
    expect(result).toBeNull();
  });
});

describe('createReservation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a reservation combining all business logic', async () => {
    const mocks = getChainMocks();

    // Mock sequence:
    // 1. checkDuplicateEmail → not found
    // 2. generateInviteCode uniqueness check → not found
    // 3. resolveInviter (no ref) → skipped
    // 4. insert → success
    mocks.single
      // checkDuplicateEmail
      .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
      // generateInviteCode uniqueness
      .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
      // insert().select().single()
      .mockResolvedValueOnce({
        data: {
          id: 'new-uuid',
          email: 'new@example.com',
          industry: 'IT',
          experience_years: '5-10',
          queue_position: 1,
          invite_code: 'TESTCODE',
          invited_by_id: null,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
        error: null,
      });

    const result = await createReservation({
      email: 'new@example.com',
      industry: 'IT',
      experience_years: '5-10',
    });

    expect(result.id).toBe('new-uuid');
    expect(result.email).toBe('new@example.com');
    expect(result.queue_position).toBe(1);
    expect(result.invite_code).toBeDefined();
  });

  it('should throw error for duplicate email', async () => {
    const mocks = getChainMocks();
    mocks.single.mockResolvedValueOnce({
      data: { id: 'uuid-existing', email: 'dup@example.com' },
      error: null,
    });

    await expect(
      createReservation({
        email: 'dup@example.com',
        industry: 'IT',
        experience_years: '5-10',
      })
    ).rejects.toThrow('이미 예약하신 이메일입니다');
  });

  it('should resolve inviter when ref is provided', async () => {
    const mocks = getChainMocks();

    mocks.single
      // checkDuplicateEmail → not found
      .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
      // generateInviteCode uniqueness → not found
      .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
      // resolveInviter → found
      .mockResolvedValueOnce({ data: { id: 'inviter-uuid' }, error: null })
      // insert
      .mockResolvedValueOnce({
        data: {
          id: 'new-uuid-2',
          email: 'referred@example.com',
          industry: 'Design',
          experience_years: '1-3',
          queue_position: 5,
          invite_code: 'NEWCODE1',
          invited_by_id: 'inviter-uuid',
          status: 'pending',
          created_at: new Date().toISOString(),
        },
        error: null,
      });

    const result = await createReservation({
      email: 'referred@example.com',
      industry: 'Design',
      experience_years: '1-3',
      ref: 'REFCODE1',
    });

    expect(result.invited_by_id).toBe('inviter-uuid');
  });

  it('should throw on insert failure', async () => {
    const mocks = getChainMocks();

    mocks.single
      // checkDuplicateEmail → not found
      .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
      // generateInviteCode uniqueness → not found
      .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
      // insert → error
      .mockResolvedValueOnce({
        data: null,
        error: { code: '42000', message: 'some db error' },
      });

    await expect(
      createReservation({
        email: 'fail@example.com',
        industry: 'IT',
        experience_years: '5-10',
      })
    ).rejects.toThrow('예약 처리 중 오류가 발생했습니다');
  });
});
