'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DNARadarChart } from '@/components/charts/RadarChart';
import { PersonaBadge } from '@/components/ui/PersonaBadge';
import { ShareButtons } from '@/components/ShareButtons';
import { PERSONA_DETAILS, AXIS_COMBINATION_INSIGHTS } from '@/constants/personas';
import ResultDetailClient from '@/app/result/[sessionId]/ResultDetailClient';

const DEMO_RESULTS = {
  strategist: { p_score: 72, c_score: 45, pol_score: 38, s_score: 61, persona_label: '전략적 성과자' as const },
  expert: { p_score: 82, c_score: 35, pol_score: 28, s_score: 55, persona_label: '실무형 전문가' as const },
  coordinator: { p_score: 48, c_score: 78, pol_score: 65, s_score: 32, persona_label: '협력적 조정자' as const },
  independent: { p_score: 65, c_score: 30, pol_score: 25, s_score: 85, persona_label: '자율형 독립가' as const },
  politician: { p_score: 40, c_score: 60, pol_score: 82, s_score: 35, persona_label: '조직형 정치인' as const },
  balanced: { p_score: 55, c_score: 52, pol_score: 50, s_score: 48, persona_label: '중도형 균형가' as const },
};

type DemoKey = keyof typeof DEMO_RESULTS;

export default function ResultPageDemo() {
  const [key, setKey] = useState<DemoKey>('strategist');
  const r = DEMO_RESULTS[key];
  const persona = PERSONA_DETAILS[r.persona_label];
  const scores = { p: r.p_score, c: r.c_score, pol: r.pol_score, s: r.s_score };
  const combinationInsights = AXIS_COMBINATION_INSIGHTS.filter(ci => ci.condition(scores)).map(ci => ci.insight);

  return (
    <div className="min-h-screen bg-bg-page">
      {/* 데모 컨트롤 */}
      <div className="bg-white border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex flex-wrap gap-2">
          {(Object.keys(DEMO_RESULTS) as DemoKey[]).map(k => (
            <button key={k} onClick={() => setKey(k)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${key === k ? 'bg-primary text-white' : 'bg-[#F7F8FA] text-text-secondary hover:bg-bg-active'}`}>
              {DEMO_RESULTS[k].persona_label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {/* 헤더 */}
        <div className="text-center">
          <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-2">Workstyle DNA 결과</p>
          <PersonaBadge label={r.persona_label} variant="primary" />
        </div>

        {/* 차트 + 점수 */}
        <section className="bg-white rounded-lg border border-border p-6">
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              <DNARadarChart data={{ p_score: r.p_score, c_score: r.c_score, pol_score: r.pol_score, s_score: r.s_score }} size="large" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            {[
              { label: '실행력', score: r.p_score, color: '#1877F2' },
              { label: '협력', score: r.c_score, color: '#31A24C' },
              { label: '영향력', score: r.pol_score, color: '#F7B928' },
              { label: '자율성', score: r.s_score, color: '#9B59B6' },
            ].map(a => (
              <div key={a.label} className="p-2 bg-[#F7F8FA] rounded-lg">
                <span className="text-xl font-bold" style={{ color: a.color }}>{a.score}</span>
                <span className="block text-[11px] text-text-tertiary mt-0.5">{a.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 종합 해설 */}
        {persona && (
          <section className="bg-white rounded-lg border border-border p-6">
            <h2 className="text-lg font-bold text-text-primary mb-3">{r.persona_label}</h2>
            <p className="text-[15px] text-text-primary leading-relaxed">{persona.fullDescription}</p>

            {combinationInsights.length > 0 && (
              <div className="mt-4 p-4 bg-primary-light rounded-lg border border-primary/20">
                <p className="text-sm font-semibold text-primary mb-1">나의 축 조합이 말해주는 것</p>
                {combinationInsights.map((insight, i) => (
                  <p key={i} className="text-sm text-text-primary leading-relaxed mt-1">{insight}</p>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 강점/주의점/성장팁/상황별 (아코디언) */}
        {persona && <ResultDetailClient persona={persona} scores={scores} />}

        {/* 공유 */}
        <section className="bg-white rounded-lg border border-border p-5">
          <h3 className="text-[15px] font-semibold text-text-primary mb-3">결과 공유하기</h3>
          <ShareButtons url={`https://workside.day/share/demo`} title={`나의 Workstyle DNA: ${r.persona_label}`} />
        </section>

        {/* 하단 */}
        <div className="flex items-center justify-center gap-4">
          <Link href="/diagnosis" className="text-sm text-text-tertiary hover:text-primary transition">다시 진단하기</Link>
          <span className="text-border">·</span>
          <Link href="/feed" className="text-sm text-text-tertiary hover:text-primary transition">피드로 가기</Link>
        </div>
      </div>
    </div>
  );
}
