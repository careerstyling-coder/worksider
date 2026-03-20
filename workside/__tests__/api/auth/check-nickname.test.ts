// @TASK P1-R1-T2 - Check nickname API route test
// @SPEC docs/planning/02-trd.md#Auth-API

import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockFrom, mockSelect, mockEq, mockSingle } = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockEq = vi.fn(() => ({ single: mockSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));
  return { mockFrom, mockSelect, mockEq, mockSingle };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: mockFrom,
  }),
}));

import { POST } from '@/app/api/auth/check-nickname/route';

describe('POST /api/auth/check-nickname', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
  });

  it('should return available: true when nickname is not taken', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

    const request = new Request('http://localhost/api/auth/check-nickname', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: 'newnick' }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(body.available).toBe(true);
  });

  it('should return available: false when nickname is taken', async () => {
    mockSingle.mockResolvedValue({ data: { id: '1' }, error: null });

    const request = new Request('http://localhost/api/auth/check-nickname', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: 'existingnick' }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(body.available).toBe(false);
  });

  it('should return 400 for short nickname', async () => {
    const request = new Request('http://localhost/api/auth/check-nickname', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: 'a' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 400 for long nickname', async () => {
    const request = new Request('http://localhost/api/auth/check-nickname', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: 'a'.repeat(21) }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
