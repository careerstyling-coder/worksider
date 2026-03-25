// @TASK P4-S5-T1 - 연차분포 원형(도넛) 차트 (CSS/SVG 기반)
'use client';

import React from 'react';

export interface ExperienceDataPoint {
  range: string;
  count: number;
  percentage: number;
}

export interface ExperienceChartProps {
  data: ExperienceDataPoint[];
}

const COLORS = [
  '#c8ff00',
  '#60e8a0',
  '#38bdf8',
  '#f472b6',
];

export function ExperienceChart({ data }: ExperienceChartProps) {
  // SVG 도넛 차트
  const size = 140;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div
      data-testid="experience-chart"
      className="bg-bg-secondary border border-white/10 rounded-2xl p-6"
    >
      <h3 className="text-sm font-semibold text-white/70 mb-4">연차 분포</h3>
      <div className="flex items-center gap-6">
        {/* 도넛 SVG */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden="true"
          className="shrink-0"
        >
          {data.map((item, index) => {
            const dashLength = (item.percentage / 100) * circumference;
            const gapLength = circumference - dashLength;
            const offset = circumference - (cumulativePercent / 100) * circumference;
            cumulativePercent += item.percentage;

            return (
              <circle
                key={item.range}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashLength} ${gapLength}`}
                strokeDashoffset={offset}
                strokeLinecap="butt"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            );
          })}
        </svg>

        {/* 범례 */}
        <div className="flex flex-col gap-2 flex-1">
          {data.map((item, index) => (
            <div key={item.range} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-white/70">{item.range}</span>
              </div>
              <span className="text-xs font-semibold text-white">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
