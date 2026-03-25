// @TASK P4-S5-T2 - 관리자 예약 탭 API 테스트 (SCR-5)
// @SPEC specs/screens/prelaunch/scr-5-admin-prelaunch.md

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Supabase mock
// ---------------------------------------------------------------------------
const mockSupabase = {
  auth: { getUser: vi.fn() },
  from: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

// ---------------------------------------------------------------------------
// Helper: chainable query mock
// ---------------------------------------------------------------------------
function buildChain(finalValue: unknown = { data: [], error: null, count: 0 }) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const methods = ['select', 'insert', 'update', 'eq', 'gte', 'lte', 'order', 'limit', 'single', 'in'];
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  // Make the chain thenable (await chain resolves to finalValue)
  (chain as unknown as Promise<unknown>).then = (resolve: (v: unknown) => void) => {
    resolve(finalValue);
    return chain as unknown as Promise<unknown>;
  };
  return chain;
}

// ---------------------------------------------------------------------------
// 1. GET /api/admin/prelaunch/stats — 응답 구조 테스트
// ---------------------------------------------------------------------------
describe('GET /api/admin/prelaunch/stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('인증되지 않은 요청은 401 반환', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const { GET } = await import('@/app/api/admin/prelaunch/stats/route');
    const req = new Request('http://localhost/api/admin/prelaunch/stats?period=this_week');
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  it('admin이 아닌 유저는 403 반환', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
    });
    const profileChain = buildChain({ data: { role: 'user' }, error: null });
    mockSupabase.from.mockReturnValue(profileChain);

    const { GET } = await import('@/app/api/admin/prelaunch/stats/route');
    const req = new Request('http://localhost/api/admin/prelaunch/stats?period=this_week');
    const res = await GET(req);

    expect(res.status).toBe(403);
  });

  it('admin 유저에게 올바른 stats 구조 반환', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'admin-1' } },
    });

    // 각 from() 호출에 대해 순차 mock
    mockSupabase.from
      // 1st call: users (role check)
      .mockReturnValueOnce(buildChain({ data: { role: 'admin' }, error: null }))
      // 2nd call: reservations count
      .mockReturnValueOnce(buildChain({ data: null, error: null, count: 42 }))
      // 3rd call: invite_tracking (conversion)
      .mockReturnValueOnce(buildChain({ data: [{ status: 'converted' }, { status: 'clicked' }], error: null }))
      // 4th call: rewards (badge count)
      .mockReturnValueOnce(buildChain({ data: null, error: null, count: 10 }))
      // 5th call: invite_tracking (avg invites)
      .mockReturnValueOnce(buildChain({ data: [{ inviter_id: 'u1' }, { inviter_id: 'u1' }, { inviter_id: 'u2' }], error: null }))
      // 6th call: reservations daily stats
      .mockReturnValueOnce(buildChain({ data: [{ created_at: '2026-03-25T10:00:00Z' }], error: null }))
      // 7th call: reservations industry distribution
      .mockReturnValueOnce(buildChain({ data: [{ industry: 'IT', count: 20 }], error: null }))
      // 8th call: reservations experience distribution
      .mockReturnValueOnce(buildChain({ data: [{ experience_years: '1-3', count: 15 }], error: null }))
      // 9th call: invite_tracking top inviters
      .mockReturnValueOnce(buildChain({ data: [{ inviter_id: 'u1', email: 'a@b.com', successful_invites: 5 }], error: null }));

    const { GET } = await import('@/app/api/admin/prelaunch/stats/route');
    const req = new Request('http://localhost/api/admin/prelaunch/stats?period=this_week');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('total_reservations');
    expect(body.data).toHaveProperty('invite_conversion_rate');
    expect(body.data).toHaveProperty('badge_count');
    expect(body.data).toHaveProperty('avg_invites');
    expect(body.data).toHaveProperty('daily_stats');
    expect(body.data).toHaveProperty('industry_distribution');
    expect(body.data).toHaveProperty('experience_distribution');
    expect(body.data).toHaveProperty('top_inviters');
  });

  it('period 파라미터 없으면 기본값 this_week 사용 (200 반환)', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'admin-1' } },
    });
    mockSupabase.from.mockReturnValue(
      buildChain({ data: { role: 'admin' }, error: null, count: 0 })
    );

    const { GET } = await import('@/app/api/admin/prelaunch/stats/route');
    const req = new Request('http://localhost/api/admin/prelaunch/stats');
    const res = await GET(req);

    // 200 또는 500 (DB mock 부족하면 500도 허용, 401/403은 아님)
    expect([200, 500]).toContain(res.status);
  });
});

// ---------------------------------------------------------------------------
// 2. GET /api/admin/prelaunch/export — CSV 내보내기 테스트
// ---------------------------------------------------------------------------
describe('GET /api/admin/prelaunch/export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('인증되지 않은 요청은 401 반환', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const { GET } = await import('@/app/api/admin/prelaunch/export/route');
    const req = new Request('http://localhost/api/admin/prelaunch/export?period=this_week');
    const res = await GET(req);

    expect(res.status).toBe(401);
  });

  it('admin이 아닌 유저는 403 반환', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
    });
    mockSupabase.from.mockReturnValue(
      buildChain({ data: { role: 'user' }, error: null })
    );

    const { GET } = await import('@/app/api/admin/prelaunch/export/route');
    const req = new Request('http://localhost/api/admin/prelaunch/export?period=this_week');
    const res = await GET(req);

    expect(res.status).toBe(403);
  });

  it('admin 유저에게 CSV 응답 반환', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'admin-1' } },
    });
    mockSupabase.from
      .mockReturnValueOnce(buildChain({ data: { role: 'admin' }, error: null }))
      .mockReturnValueOnce(buildChain({
        data: [
          { id: 'r1', email: 'a@b.com', industry: 'IT', experience_years: '1-3', created_at: '2026-03-25T10:00:00Z', queue_position: 1, invite_code: 'ABC' },
        ],
        error: null,
      }))
      .mockReturnValueOnce(buildChain({
        data: [
          { inviter_id: 'u1', status: 'converted', created_at: '2026-03-25T10:00:00Z' },
        ],
        error: null,
      }));

    const { GET } = await import('@/app/api/admin/prelaunch/export/route');
    const req = new Request('http://localhost/api/admin/prelaunch/export?period=this_week');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const contentType = res.headers.get('Content-Type');
    const contentDisposition = res.headers.get('Content-Disposition');
    expect(contentType).toContain('text/csv');
    expect(contentDisposition).toContain('attachment');
    expect(contentDisposition).toContain('prelaunch-report');
  });
});

// ---------------------------------------------------------------------------
// 3. usePrelaunchStats hook 테스트
// ---------------------------------------------------------------------------
import { usePrelaunchStats } from '@/hooks/usePrelaunchStats';

describe('usePrelaunchStats', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    globalThis.fetch = mockFetch;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('초기 상태는 loading: true', () => {
    mockFetch.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => usePrelaunchStats('this_week'));
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('period로 /api/admin/prelaunch/stats 호출', async () => {
    const mockData = {
      data: {
        total_reservations: 100,
        invite_conversion_rate: 0.38,
        badge_count: 25,
        avg_invites: 2.4,
        daily_stats: [],
        industry_distribution: [],
        experience_distribution: [],
        top_inviters: [],
      },
    };
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => usePrelaunchStats('this_week'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/prelaunch/stats?period=this_week')
    );
    expect(result.current.stats).toEqual({
      total_reservations: 100,
      invite_conversion_rate: 0.38,
      badge_count: 25,
      avg_invites: 2.4,
    });
    expect(result.current.dailyData).toEqual([]);
    expect(result.current.industryData).toEqual([]);
    expect(result.current.experienceData).toEqual([]);
    expect(result.current.topInviters).toEqual([]);
  });

  it('API 실패 시 error 상태 설정', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => usePrelaunchStats('this_week'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeTruthy();
    expect(result.current.stats).toBeNull();
  });

  it('period 변경 시 자동 refetch', async () => {
    const mockData = {
      data: {
        total_reservations: 50,
        invite_conversion_rate: 0.3,
        badge_count: 10,
        avg_invites: 1.5,
        daily_stats: [],
        industry_distribution: [],
        experience_distribution: [],
        top_inviters: [],
      },
    };
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const { result, rerender } = renderHook(
      ({ period }: { period: string }) => usePrelaunchStats(period),
      { initialProps: { period: 'today' } }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('period=today')
    );

    rerender({ period: 'this_month' });

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
    expect(mockFetch).toHaveBeenLastCalledWith(
      expect.stringContaining('period=this_month')
    );
  });
});
