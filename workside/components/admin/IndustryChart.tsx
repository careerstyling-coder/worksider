// @TASK P4-S5-T1 - 직군분포 수평 막대 차트 (div 기반)
'use client';

import React from 'react';

export interface IndustryDataPoint {
  industry: string;
  count: number;
}

export interface IndustryChartProps {
  data: IndustryDataPoint[];
}

export function IndustryChart({ data }: IndustryChartProps) {
  const maxCount = data.length > 0 ? Math.max(...data.map((d) => d.count)) : 1;
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div
      data-testid="industry-chart"
      className="bg-bg-secondary border border-white/10 rounded-2xl p-6"
    >
      <h3 className="text-sm font-semibold text-white/70 mb-4">직군 분포</h3>
      <div className="flex flex-col gap-3">
        {data.map((item) => {
          const widthPct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
          const sharePct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div key={item.industry}>
              <div className="flex justify-between text-xs text-white/60 mb-1">
                <span>{item.industry}</span>
                <span>{sharePct}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-neon/70 rounded-full transition-all duration-500"
                  style={{ width: `${widthPct}%` }}
                  aria-label={`${item.industry}: ${item.count}명`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
