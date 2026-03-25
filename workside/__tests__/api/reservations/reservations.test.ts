// @TASK P1-R1-T1, P1-R1-T2 - Reservations API route tests (refactored)
// @SPEC docs/planning/prelaunch/reservations

import { describe, it, expect, vi, beforeEach } from 'vitest';

// -- Mock lib/reservations (business logic layer) --

const { mockCreateReservation } = vi.hoisted(() => {
  const mockCreateReservation = vi.fn();
  return { mockCreateReservation };
});

vi.mock('@/lib/reservations', () => ({
  createReservation: mockCreateReservation,
}));

// -- Mock lib/supabase/server (for GET handler which still uses it directly) --

const { mockSingle, setupMocks } = vi.hoisted(() => {
  const mockSingle = vi.fn();

  function setupMocks() {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    chain.single = mockSingle;
    chain.eq = vi.fn(() => ({ single: mockSingle }));
    chain.select = vi.fn(() => ({ eq: chain.eq, single: mockSingle }));
    chain.from = vi.fn(() => ({ select: chain.select }));
    return chain;
  }

  return { mockSingle, setupMocks };
});

let chain: ReturnType<typeof setupMocks>;

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(async () => {
    return { from: chain.from };
  }),
}));

import { POST, GET } from '@/app/api/reservations/route';

describe('POST /api/reservations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chain = setupMocks();
  });

  it('should return 201 with queue_position and invite_code on success', async () => {
    mockCreateReservation.mockResolvedValue({
      id: 'uuid-1',
      email: 'test@example.com',
      queue_position: 42,
      invite_code: 'ABC12345',
      industry: 'IT',
      experience_years: '5-10',
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    const request = new Request('http://localhost/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        industry: 'IT',
        experience_years: '5-10',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.id).toBeDefined();
    expect(body.email).toBe('test@example.com');
    expect(body.queue_position).toBeDefined();
    expect(body.invite_code).toBeDefined();
  });

  it('should return 409 for duplicate email', async () => {
    mockCreateReservation.mockRejectedValue(new Error('이미 예약하신 이메일입니다'));

    const request = new Request('http://localhost/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'existing@example.com',
        industry: 'IT',
        experience_years: '5-10',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toBe('이미 예약하신 이메일입니다');
  });

  it('should return 400 when required fields are missing', async () => {
    const request = new Request('http://localhost/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 400 for invalid email format', async () => {
    const request = new Request('http://localhost/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'not-valid',
        industry: 'IT',
        experience_years: '5-10',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});

describe('GET /api/reservations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chain = setupMocks();
  });

  it('should return 200 with reservation data for existing email', async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: 'uuid-1',
        email: 'test@example.com',
        queue_position: 42,
        invite_code: 'ABC12345',
        industry: 'IT',
        experience_years: '5-10',
        status: 'pending',
        created_at: new Date().toISOString(),
      },
      error: null,
    });

    const request = new Request('http://localhost/api/reservations?email=test@example.com');

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.email).toBe('test@example.com');
    expect(body.queue_position).toBe(42);
  });

  it('should return 404 for non-existent email', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

    const request = new Request('http://localhost/api/reservations?email=notfound@example.com');

    const response = await GET(request);
    expect(response.status).toBe(404);
  });
});
