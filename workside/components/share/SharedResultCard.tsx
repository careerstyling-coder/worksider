// @TASK P2-S4-T1 - SharedResultCard 컴포넌트
// @SPEC docs/planning/03-user-flow.md#share
// @TEST __tests__/app/share/page.test.tsx

'use client';

import React from 'react';
import { DNARadarChart } from '@/components/charts/RadarChart';
import { PersonaBadge } from '@/components/ui/PersonaBadge';
import { DNAResult } from '@/types/database';

export interface SharedResultCardProps {
  result: DNAResult;
}

export const SharedResultCard: React.FC<SharedResultCardProps> = ({ result }) => {
  const { p_score, c_score, pol_score, s_score, persona_label, persona_description } = result;

  return (
    <div
      data-testid="shared-result-card"
      className="bg-bg-page border border-border rounded-2xl p-6 md:p-8 flex flex-col gap-6"
    >
      {/* 페르소나 배지 */}
      <div className="flex items-center gap-3">
        <PersonaBadge label={persona_label} variant="primary" />
      </div>

      {/* 레이더 차트 */}
      <div className="w-full">
        <DNARadarChart
          data={{ p_score, c_score, pol_score, s_score }}
          size="medium"
        />
      </div>

      {/* 점수 텍스트 */}
      <div
        data-testid="score-text"
        className="text-center text-sm font-mono text-text-secondary tracking-wide"
      >
        P: {p_score} | C: {c_score} | Pol: {pol_score} | S: {s_score}
      </div>

      {/* 페르소나 라벨 */}
      <h2
        data-testid="persona-label"
        className="text-xl md:text-2xl font-bold text-text-primary text-center"
      >
        {persona_label}
      </h2>

      {/* 페르소나 설명 */}
      <p
        data-testid="persona-description"
        className="text-text-secondary text-sm md:text-base text-center leading-relaxed"
      >
        {persona_description}
      </p>
    </div>
  );
};
