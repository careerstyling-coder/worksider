// @TASK P4-S5-T1 - 관리자 예약 탭 지표 카드 컴포넌트
'use client';

import React from 'react';

export interface StatItem {
  label: string;
  value: string | number;
  change?: string;
}

export interface StatCardsProps {
  stats: StatItem[];
}

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div
      data-testid="stat-cards"
      className="grid grid-cols-2 gap-4"
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-bg-secondary border border-white/10 rounded-2xl p-6"
        >
          <p className="text-sm text-white/60 mb-2">{stat.label}</p>
          <p className="text-2xl font-bold text-white">{stat.value}</p>
          {stat.change && (
            <p className="text-xs text-green-400 mt-1">{stat.change}</p>
          )}
        </div>
      ))}
    </div>
  );
}
