// @TASK P4-S5-T1 - 일별 추이 꺾은선 차트 (div 기반)
'use client';

import React from 'react';

export interface DailyDataPoint {
  date: string;
  count: number;
}

export interface DailyChartProps {
  data: DailyDataPoint[];
}

export function DailyChart({ data }: DailyChartProps) {
  if (!data || data.length === 0) {
    return (
      <div data-testid="daily-chart" className="bg-bg-secondary border border-white/10 rounded-2xl p-6">
        <p className="text-white/40 text-sm text-center">데이터 없음</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div
      data-testid="daily-chart"
      className="bg-bg-secondary border border-white/10 rounded-2xl p-6"
    >
      <h3 className="text-sm font-semibold text-white/70 mb-4">일별 예약 추이</h3>
      <div className="flex items-end gap-2 h-40">
        {data.map((point) => {
          const heightPct = maxCount > 0 ? (point.count / maxCount) * 100 : 0;
          return (
            <div key={point.date} className="flex flex-col items-center flex-1 gap-1">
              <span className="text-xs text-white/50">{point.count}</span>
              <div
                className="w-full bg-accent-neon/80 rounded-t"
                style={{ height: `${heightPct}%`, minHeight: '4px' }}
                aria-label={`${point.date}: ${point.count}명`}
              />
              <span className="text-xs text-white/40 whitespace-nowrap">{point.date}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
