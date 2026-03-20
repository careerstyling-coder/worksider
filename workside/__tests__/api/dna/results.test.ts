// @TASK P2-R2-T1 - DNA Results CRUD API test
// @SPEC docs/planning/02-trd.md#dna-results

import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockFrom, mockSelect, mockEq, mockOrder, mockInsert } = vi.hoisted(() => {
  const mockOrder = vi.fn();
  const mockEq = vi.fn(() => ({ order: mockOrder, eq: vi.fn() }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockFrom = vi.fn(() => ({ select: mockSelect, insert: vi.fn() }));
  const mockInsert = vi.fn();
  return { mockFrom, mockSelect, mockEq, mockOrder, mockInsert };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: mockFrom,
  }),
}));

import { GET } from '@/app/api/dna/results/route';

describe('GET /api/dna/results', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder });
  });

  it('should return results filtered by session_id', async () => {
    const mockResults = [
      {
        id: 'result-1',
        session_id: 'session-1',
        user_id: null,
        p_score: 80,
        c_score: 70,
        pol_score: 60,
        s_score: 50,
        persona_label: 'Strategist',
        persona_description: 'A strategic thinker',
        version: 'semi',
        share_token: 'token-abc',
        created_at: '2026-01-01T00:00:00Z',
      },
    ];
    mockOrder.mockResolvedValue({ data: mockResults, error: null });

    const url = new URL('http://localhost/api/dna/results?session_id=session-1');
    const request = new Request(url.toString());
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(mockResults);
    expect(mockFrom).toHaveBeenCalledWith('dna_results');
    expect(mockEq).toHaveBeenCalledWith('session_id', 'session-1');
  });

  it('should return results filtered by user_id', async () => {
    const mockResults = [
      {
        id: 'result-2',
        session_id: 'session-2',
        user_id: 'user-1',
        p_score: 90,
        c_score: 80,
        pol_score: 70,
        s_score: 60,
        persona_label: 'Leader',
        persona_description: 'A natural leader',
        version: 'full',
        share_token: 'token-def',
        created_at: '2026-01-02T00:00:00Z',
      },
    ];
    mockOrder.mockResolvedValue({ data: mockResults, error: null });

    const url = new URL('http://localhost/api/dna/results?user_id=user-1');
    const request = new Request(url.toString());
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(mockResults);
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-1');
  });

  it('should return 400 when neither session_id nor user_id is provided', async () => {
    const request = new Request('http://localhost/api/dna/results');
    const response = await GET(request);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  it('should return 500 when database error occurs', async () => {
    mockOrder.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    const url = new URL('http://localhost/api/dna/results?session_id=session-1');
    const request = new Request(url.toString());
    const response = await GET(request);

    expect(response.status).toBe(500);
  });
});
