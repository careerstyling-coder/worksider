// @TASK P4-S5-T2 - 관리자 사전예약 통계 hook (SCR-5)
// @SPEC specs/screens/prelaunch/scr-5-admin-prelaunch.md
// @TEST __tests__/api/admin/prelaunch.test.ts

import { useState, useEffect } from 'react';

export interface PrelaunchStats {
  total_reservations: number;
  invite_conversion_rate: number;
  badge_count: number;
  avg_invites: number;
}

export interface DailyDataPoint {
  date: string;
  count: number;
}

export interface IndustryDataPoint {
  industry: string;
  count: number;
}

export interface ExperienceDataPoint {
  range: string;
  count: number;
  percentage: number;
}

export interface TopInviter {
  rank: number;
  inviter_id: string;
  successful_invites: number;
}

export interface UsePrelaunchStatsResult {
  stats: PrelaunchStats | null;
  dailyData: DailyDataPoint[];
  industryData: IndustryDataPoint[];
  experienceData: ExperienceDataPoint[];
  topInviters: TopInviter[];
  loading: boolean;
  error: string | null;
}

export type Period = 'today' | 'this_week' | 'this_month';

export function usePrelaunchStats(period: Period | string): UsePrelaunchStatsResult {
  const [stats, setStats] = useState<PrelaunchStats | null>(null);
  const [dailyData, setDailyData] = useState<DailyDataPoint[]>([]);
  const [industryData, setIndustryData] = useState<IndustryDataPoint[]>([]);
  const [experienceData, setExperienceData] = useState<ExperienceDataPoint[]>([]);
  const [topInviters, setTopInviters] = useState<TopInviter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/admin/prelaunch/stats?period=${period}`);

        if (!res.ok) {
          throw new Error(`통계 데이터를 불러오지 못했습니다 (${res.status})`);
        }

        const json = await res.json();

        if (cancelled) return;

        const d = json.data;
        setStats({
          total_reservations: d.total_reservations,
          invite_conversion_rate: d.invite_conversion_rate,
          badge_count: d.badge_count,
          avg_invites: d.avg_invites,
        });
        setDailyData(d.daily_stats ?? []);
        setIndustryData(d.industry_distribution ?? []);
        setExperienceData(d.experience_distribution ?? []);
        setTopInviters(d.top_inviters ?? []);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
        setStats(null);
        setDailyData([]);
        setIndustryData([]);
        setExperienceData([]);
        setTopInviters([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchStats();

    return () => {
      cancelled = true;
    };
  }, [period]);

  return {
    stats,
    dailyData,
    industryData,
    experienceData,
    topInviters,
    loading,
    error,
  };
}
