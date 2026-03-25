// @TASK P4-S5-T1, P4-S5-T2 - 관리자 예약 탭 페이지 (SCR-5)
// @SPEC specs/screens/prelaunch/scr-5-admin-prelaunch.md
'use client';

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { StatCards } from '@/components/admin/StatCards';
import { DailyChart } from '@/components/admin/DailyChart';
import { IndustryChart } from '@/components/admin/IndustryChart';
import { ExperienceChart } from '@/components/admin/ExperienceChart';
import { TopInvitersTable } from '@/components/admin/TopInvitersTable';
import { FilterButtons } from '@/components/admin/FilterButtons';
import { usePrelaunchStats } from '@/hooks/usePrelaunchStats';
import type { Period } from '@/hooks/usePrelaunchStats';

export default function AdminPrelaunchPage() {
  const [period, setPeriod] = useState<Period>('this_week');
  const {
    stats,
    dailyData,
    industryData,
    experienceData,
    topInviters,
    loading,
    error,
  } = usePrelaunchStats(period);

  const handleCsvExport = () => {
    window.location.href = `/api/admin/prelaunch/export?period=${period}`;
  };

  // StatCards에 넘길 형태로 변환
  const statCards = stats
    ? [
        { label: '총 예약', value: stats.total_reservations },
        {
          label: '초대 전환율',
          value: `${Math.round(stats.invite_conversion_rate * 100)}%`,
        },
        { label: '배지 획득', value: stats.badge_count },
        { label: '평균 초대 수', value: stats.avg_invites },
      ]
    : [];

  // TopInviters: rank, email(없으면 inviter_id 일부), successful_invites, conversion_rate
  const mappedTopInviters = topInviters.map((inv) => ({
    rank: inv.rank,
    email: inv.inviter_id,
    successful_invites: inv.successful_invites,
    conversion_rate: 0,
  }));

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">사전예약 현황</h1>
          <p className="text-sm text-white/50 mt-1">프리런치 대기자 및 초대 지표</p>
        </div>
        <div className="flex items-center gap-3">
          <FilterButtons selected={period} onSelect={(v) => setPeriod(v as Period)} />
          <button
            type="button"
            onClick={handleCsvExport}
            data-testid="csv-export"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors min-h-[44px]"
          >
            <Download size={16} aria-hidden="true" />
            CSV 내보내기
          </button>
        </div>
      </div>

      {/* 에러 상태 */}
      {error && (
        <div
          role="alert"
          className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
        >
          데이터를 불러오지 못했습니다: {error}
        </div>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <div
          aria-busy="true"
          aria-label="통계 데이터를 불러오는 중"
          className="mb-6 flex items-center gap-2 text-white/50 text-sm"
        >
          <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          불러오는 중...
        </div>
      )}

      {/* 지표 카드 */}
      {!loading && !error && (
        <>
          <div className="mb-6">
            <StatCards stats={statCards} />
          </div>

          {/* 차트 영역 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <DailyChart data={dailyData} />
            <IndustryChart data={industryData} />
          </div>

          <div className="mb-6">
            <ExperienceChart data={experienceData} />
          </div>

          {/* 상위 초대자 테이블 */}
          <TopInvitersTable inviters={mappedTopInviters} />
        </>
      )}
    </div>
  );
}
