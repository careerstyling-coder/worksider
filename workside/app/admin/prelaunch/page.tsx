// @TASK P4-S5-T1 - 관리자 예약 탭 페이지 (SCR-5)
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

// ---- Mock 데이터 (T2에서 API 연동으로 교체) ----
const MOCK_STATS = [
  { label: '총 예약', value: 1240 },
  { label: '초대 전환율', value: '38%', change: '+5%' },
  { label: '배지 획득', value: 320 },
  { label: '평균 초대 수', value: 2.4 },
];

const MOCK_DAILY_DATA = [
  { date: '03-19', count: 45 },
  { date: '03-20', count: 62 },
  { date: '03-21', count: 38 },
  { date: '03-22', count: 71 },
  { date: '03-23', count: 55 },
  { date: '03-24', count: 88 },
  { date: '03-25', count: 94 },
];

const MOCK_INDUSTRY_DATA = [
  { industry: 'IT/소프트웨어', count: 420 },
  { industry: '금융', count: 280 },
  { industry: '마케팅', count: 210 },
  { industry: '디자인', count: 180 },
  { industry: '기타', count: 150 },
];

const MOCK_EXPERIENCE_DATA = [
  { range: '1-3년', count: 380, percentage: 31 },
  { range: '4-7년', count: 420, percentage: 34 },
  { range: '8-12년', count: 290, percentage: 23 },
  { range: '13년+', count: 150, percentage: 12 },
];

const MOCK_TOP_INVITERS = [
  { rank: 1, email: 'star1@example.com', successful_invites: 24, conversion_rate: 0.80 },
  { rank: 2, email: 'star2@example.com', successful_invites: 18, conversion_rate: 0.72 },
  { rank: 3, email: 'star3@example.com', successful_invites: 15, conversion_rate: 0.65 },
  { rank: 4, email: 'star4@example.com', successful_invites: 12, conversion_rate: 0.60 },
  { rank: 5, email: 'star5@example.com', successful_invites: 10, conversion_rate: 0.55 },
  { rank: 6, email: 'star6@example.com', successful_invites: 9, conversion_rate: 0.50 },
  { rank: 7, email: 'star7@example.com', successful_invites: 8, conversion_rate: 0.48 },
  { rank: 8, email: 'star8@example.com', successful_invites: 7, conversion_rate: 0.44 },
  { rank: 9, email: 'star9@example.com', successful_invites: 6, conversion_rate: 0.40 },
  { rank: 10, email: 'star10@example.com', successful_invites: 5, conversion_rate: 0.36 },
];

export default function AdminPrelaunchPage() {
  const [period, setPeriod] = useState('this_week');

  const handleCsvExport = () => {
    const headers = ['순위', '이메일', '초대 수', '전환율'];
    const rows = MOCK_TOP_INVITERS.map((inv) =>
      [inv.rank, inv.email, inv.successful_invites, `${Math.round(inv.conversion_rate * 100)}%`].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prelaunch-report-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">사전예약 현황</h1>
          <p className="text-sm text-white/50 mt-1">프리런치 대기자 및 초대 지표</p>
        </div>
        <div className="flex items-center gap-3">
          <FilterButtons selected={period} onSelect={setPeriod} />
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

      {/* 지표 카드 */}
      <div className="mb-6">
        <StatCards stats={MOCK_STATS} />
      </div>

      {/* 차트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <DailyChart data={MOCK_DAILY_DATA} />
        <IndustryChart data={MOCK_INDUSTRY_DATA} />
      </div>

      <div className="mb-6">
        <ExperienceChart data={MOCK_EXPERIENCE_DATA} />
      </div>

      {/* 상위 초대자 테이블 */}
      <TopInvitersTable inviters={MOCK_TOP_INVITERS} />
    </div>
  );
}
