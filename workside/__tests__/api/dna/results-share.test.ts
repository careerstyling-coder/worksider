// @TASK P2-R2-T1 - DNA Results share token API test
// @SPEC docs/planning/02-trd.md#dna-results

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

import { GET } from '@/app/api/dna/results/[shareToken]/route';

describe('GET /api/dna/results/[shareToken]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
  });

  it('should return result when valid share token is provided', async () => {
    const mockResult = {
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
      share_token: 'valid-token',
      created_at: '2026-01-01T00:00:00Z',
    };
    mockSingle.mockResolvedValue({ data: mockResult, error: null });

    const request = new Request('http://localhost/api/dna/results/valid-token');
    const response = await GET(request, { params: Promise.resolve({ shareToken: 'valid-token' }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(mockResult);
    expect(mockFrom).toHaveBeenCalledWith('dna_results');
    expect(mockEq).toHaveBeenCalledWith('share_token', 'valid-token');
  });

  it('should return 404 when share token is not found', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

    const request = new Request('http://localhost/api/dna/results/invalid-token');
    const response = await GET(request, { params: Promise.resolve({ shareToken: 'invalid-token' }) });

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  it('should return 500 when database error occurs', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: 'OTHER', message: 'DB error' } });

    const request = new Request('http://localhost/api/dna/results/some-token');
    const response = await GET(request, { params: Promise.resolve({ shareToken: 'some-token' }) });

    expect(response.status).toBe(500);
  });
});
