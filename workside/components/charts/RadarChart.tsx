'use client';

import React from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export interface RadarChartProps {
  data: {
    p_score: number;
    c_score: number;
    pol_score: number;
    s_score: number;
  };
  size?: 'small' | 'medium' | 'large';
  /** 이전 결과와 비교할 때 사용 */
  compareData?: {
    p_score: number;
    c_score: number;
    pol_score: number;
    s_score: number;
  }[];
}

const SIZE_MAP: Record<NonNullable<RadarChartProps['size']>, number> = {
  small: 200,
  medium: 300,
  large: 400,
};

const AXIS_LABELS: Record<string, string> = {
  P: '실행력(P)',
  C: '협력(C)',
  Pol: '영향력(Pol)',
  S: '자율성(S)',
};

function toChartData(
  data: RadarChartProps['data'],
  compareData?: RadarChartProps['compareData']
) {
  const axes = [
    { key: 'P', score: data.p_score },
    { key: 'C', score: data.c_score },
    { key: 'Pol', score: data.pol_score },
    { key: 'S', score: data.s_score },
  ];

  return axes.map((a) => {
    const entry: Record<string, string | number> = {
      axis: AXIS_LABELS[a.key],
      latest: a.score,
    };
    compareData?.forEach((cd, i) => {
      const scores = { P: cd.p_score, C: cd.c_score, Pol: cd.pol_score, S: cd.s_score };
      entry[`prev_${i}`] = scores[a.key as keyof typeof scores];
    });
    return entry;
  });
}

const COMPARE_COLORS = ['#CED0D4', '#E4E6EB', '#F0F2F5'];

export const DNARadarChart: React.FC<RadarChartProps> = ({
  data,
  size = 'medium',
  compareData,
}) => {
  const height = SIZE_MAP[size];
  const chartData = toChartData(data, compareData);

  return (
    <div data-testid="dna-radar-chart" style={{ height: `${height}px`, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData}>
          <PolarGrid stroke="#E4E6EB" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: '#65676B', fontSize: size === 'small' ? 11 : 13, fontWeight: 500 }}
          />
          {/* 이전 결과들 (연한 회색) */}
          {compareData?.map((_, i) => (
            <Radar
              key={`prev_${i}`}
              name={`이전 ${i + 1}`}
              dataKey={`prev_${i}`}
              stroke={COMPARE_COLORS[i] || '#E4E6EB'}
              fill={COMPARE_COLORS[i] || '#E4E6EB'}
              fillOpacity={0.15}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          ))}
          {/* 최신 결과 (Primary 파란색) */}
          <Radar
            name="최신"
            dataKey="latest"
            stroke="#1877F2"
            fill="#1877F2"
            fillOpacity={0.2}
            strokeWidth={2.5}
          />
          {compareData && compareData.length > 0 && (
            <Legend
              wrapperStyle={{ fontSize: 11, color: '#65676B' }}
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
