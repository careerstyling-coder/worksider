'use client';

import { useState } from 'react';
import { ChevronDown, Sparkles, AlertTriangle, TrendingUp, MessageCircle, Lock, BarChart3 } from 'lucide-react';
import type { PersonaDetail } from '@/constants/personas';
import { generateDynamicInterpretation } from '@/lib/dna/interpretation';

interface Props {
  persona: PersonaDetail;
  scores?: { p: number; c: number; pol: number; s: number };
}

const AXIS_COLORS: Record<string, string> = {
  p: '#1877F2', c: '#31A24C', pol: '#F7B928', s: '#9B59B6',
};

function AccordionSection({ icon, title, children, defaultOpen = false }: {
  icon: React.ReactNode; title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button onClick={() => setOpen(p => !p)} className="w-full flex items-center justify-between p-4 bg-white hover:bg-[#F7F8FA] transition text-left">
        <div className="flex items-center gap-2.5">
          {icon}
          <span className="text-[15px] font-semibold text-text-primary">{title}</span>
        </div>
        <ChevronDown size={16} className={`text-text-tertiary transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-4 pb-4 pt-1 bg-white">{children}</div>}
    </div>
  );
}

export default function ResultDetailClient({ persona, scores }: Props) {
  const interpretation = scores ? generateDynamicInterpretation(scores, persona.label) : null;

  return (
    <div className="space-y-3">
      {/* 축별 동적 해석 (점수 기반) */}
      {interpretation && (
        <AccordionSection
          icon={<BarChart3 size={16} className="text-primary" />}
          title="나의 점수가 말해주는 것"
          defaultOpen={true}
        >
          <p className="text-sm text-text-primary leading-relaxed mb-4 p-3 bg-primary-light rounded-lg border border-primary/20">
            {interpretation.overallNuance}
          </p>
          <div className="space-y-4">
            {interpretation.axisInsights.map(a => (
              <div key={a.axis}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: AXIS_COLORS[a.axis] }} />
                  <span className="text-sm font-semibold text-text-primary">{a.label}</span>
                  <span className="text-sm font-bold" style={{ color: AXIS_COLORS[a.axis] }}>{a.score}</span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed pl-[18px]">{a.interpretation}</p>
              </div>
            ))}
          </div>
        </AccordionSection>
      )}

      {/* 강점 */}
      <AccordionSection
        icon={<Sparkles size={16} className="text-primary" />}
        title="나의 강점"
        defaultOpen={!interpretation}
      >
        <ul className="space-y-2">
          {persona.strengths.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-text-primary leading-relaxed">
              <span className="text-primary mt-0.5 shrink-0">✦</span>{s}
            </li>
          ))}
        </ul>
      </AccordionSection>

      {/* 주의점 */}
      <AccordionSection icon={<AlertTriangle size={16} className="text-warning" />} title="이런 점은 주의하세요">
        <ul className="space-y-2">
          {persona.watchPoints.map((w, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-text-primary leading-relaxed">
              <span className="text-warning mt-0.5 shrink-0">△</span>{w}
            </li>
          ))}
        </ul>
      </AccordionSection>

      {/* 성장 팁 */}
      <AccordionSection icon={<TrendingUp size={16} className="text-success" />} title="성장을 위한 팁">
        <ul className="space-y-2">
          {persona.growthTips.map((g, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-text-primary leading-relaxed">
              <span className="text-success mt-0.5 shrink-0">↑</span>{g}
            </li>
          ))}
        </ul>
      </AccordionSection>

      {/* 상황별 반응 */}
      <AccordionSection icon={<MessageCircle size={16} className="text-dna-s" />} title="상황별 나는?">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-text-secondary mb-1">💬 회의에서</p>
            <p className="text-sm text-text-primary leading-relaxed">{persona.scenarios.meeting}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-text-secondary mb-1">⚡ 갈등 상황에서</p>
            <p className="text-sm text-text-primary leading-relaxed">{persona.scenarios.conflict}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-text-secondary mb-1">🚀 새 프로젝트를 맡으면</p>
            <p className="text-sm text-text-primary leading-relaxed">{persona.scenarios.newProject}</p>
          </div>
        </div>
      </AccordionSection>

      {/* 세부 분석 유료 룸 */}
      <div className="border border-border rounded-lg p-4 bg-[#F7F8FA]">
        <div className="flex items-center gap-2 mb-1">
          <Lock size={14} className="text-text-tertiary" />
          <span className="text-sm font-semibold text-text-primary">더 깊은 분석</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-primary-light text-primary rounded font-medium">Coming Soon</span>
        </div>
        <p className="text-xs text-text-secondary">동료와의 궁합 분석, 맞춤 성장 로드맵, 산업별 벤치마크 비교가 곧 제공될 예정이에요.</p>
      </div>
    </div>
  );
}
