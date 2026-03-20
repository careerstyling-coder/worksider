'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, LabelList,
} from 'recharts';
import { ShareButtons } from '@/components/ShareButtons';
import { QuestionStatus } from '@/types/database';
import { ChevronLeft, ChevronRight, Lightbulb, Users, Eye, TrendingUp } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

export interface OptionResult { option: string; count: number; percentage: number; }
export interface PersonaDistributionItem { persona_label: string; option: string; count: number; percentage: number; }

export interface QuestionAggregateData {
  id: string; title: string; status: QuestionStatus; deadline: string | null;
  participant_count: number; options: string[]; results: OptionResult[];
  persona_distribution: PersonaDistributionItem[];
  minority_option: string | null; minority_percentage: number | null;
  insight: string | null;
  prev_question_id: string | null; next_question_id: string | null;
}

// ── Persona Insight DB ───────────────────────────────────────────────────────

const PERSONA_INSIGHTS: Record<string, { axes: string; tendency: string; why: (option: string) => string }> = {
  '전략적 성과자': {
    axes: '실행력(P)↑ 자율성(S)↑',
    tendency: '목표 달성과 효율적 실행을 최우선시하며, 방향을 제시하는 역할을 선호합니다.',
    why: (opt) => `성과 중심 사고로 인해 "${opt}"이(가) 목표 달성에 가장 효과적이라고 판단한 것으로 보입니다.`,
  },
  '실무형 전문가': {
    axes: '실행력(P)↑ 협력(C)↓',
    tendency: '깊이 있는 전문성을 추구하며, 직접 결과물을 만드는 것에 가치를 둡니다.',
    why: (opt) => `전문성 중심 가치관에서 "${opt}"이(가) 실질적 성장에 기여한다고 판단한 것으로 해석됩니다.`,
  },
  '협력적 조정자': {
    axes: '협력(C)↑ 영향력(Pol)↑',
    tendency: '관계와 소통을 중시하며, 함께 성장하는 환경을 선호합니다.',
    why: (opt) => `관계 지향적 성향으로 "${opt}"이(가) 동료와의 연결과 소통에 도움이 된다고 느낀 것으로 보입니다.`,
  },
  '자율형 독립가': {
    axes: '자율성(S)↑↑',
    tendency: '자기주도적 환경에서 최고의 성과를 내며, 독립적 실행을 선호합니다.',
    why: (opt) => `높은 자율성 선호로 "${opt}"이(가) 독립적으로 일할 수 있는 환경을 제공한다고 본 것입니다.`,
  },
  '조직형 정치인': {
    axes: '영향력(Pol)↑↑',
    tendency: '조직 역학을 잘 이해하고, 전략적 관계 형성을 통해 영향력을 발휘합니다.',
    why: (opt) => `조직 역학 감각으로 "${opt}"이(가) 전략적으로 유리하다고 판단한 것으로 분석됩니다.`,
  },
  '중도형 균형가': {
    axes: '전 축 균형',
    tendency: '상황에 따라 유연하게 대응하며, 균형 잡힌 시각을 가지고 있습니다.',
    why: (opt) => `균형적 사고로 "${opt}"이(가) 가장 합리적인 선택이라고 종합 판단한 것으로 보입니다.`,
  },
};

const OPTION_COLORS = ['#1877F2', '#31A24C', '#F7B928', '#9B59B6', '#E4002B', '#8A8D91'];
const PERSONA_COLORS: Record<string, string> = {
  '전략적 성과자': '#1877F2', '실무형 전문가': '#31A24C', '협력적 조정자': '#F7B928',
  '자율형 독립가': '#9B59B6', '조직형 정치인': '#E4002B', '중도형 균형가': '#8A8D91',
};

// ── QuestionSummary ──────────────────────────────────────────────────────────

export interface QuestionSummaryProps { title: string; status: QuestionStatus; participantCount: number; }

export function QuestionSummary({ title, status, participantCount }: QuestionSummaryProps) {
  return (
    <div data-testid="question-summary">
      <h1 data-testid="question-title" className="text-xl font-bold text-text-primary">{title}</h1>
      <div className="flex items-center gap-3 mt-2">
        <span data-testid="question-status" className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-text-secondary'}`}>
          {status === 'active' ? '진행 중' : '마감'}
        </span>
        <span className="text-sm text-text-secondary flex items-center gap-1">
          <Users size={14} /> <span data-testid="participant-count" className="font-semibold text-text-primary">{participantCount}</span>명 참여
        </span>
      </div>
    </div>
  );
}

export interface MyResponseBadgeProps { myResponse: string | null; }
export function MyResponseBadge({ myResponse }: MyResponseBadgeProps) {
  if (!myResponse) return null;
  return <div data-testid="my-response-badge" className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-light border border-primary/20 rounded-full text-primary text-sm font-medium">✓ 내 선택: {myResponse}</div>;
}

// ── ResultsSection (Stacked Bar + 타입 범례 + 종합 분석) ──────────────────────

export interface ResultsSectionProps {
  results: OptionResult[];
  distribution: PersonaDistributionItem[];
}

function buildStackedData(results: OptionResult[], distribution: PersonaDistributionItem[]) {
  const allPersonas = [...new Set(distribution.map(d => d.persona_label))];
  return results.map(r => {
    const entry: Record<string, string | number> = { option: r.option, total: r.percentage };
    const related = distribution.filter(d => d.option === r.option);
    const totalCount = related.reduce((sum, d) => sum + d.count, 0) || r.count || 1;
    allPersonas.forEach(p => {
      const found = related.find(d => d.persona_label === p);
      entry[p] = found ? Math.round((found.count / totalCount) * r.percentage) : 0;
    });
    return entry;
  });
}

function generateSynthesis(results: OptionResult[], distribution: PersonaDistributionItem[]): string {
  const lines: string[] = [];

  // 각 선택지의 주도 타입 파악
  const optionLeaders = results.filter(r => r.count > 0).map(r => {
    const related = distribution.filter(d => d.option === r.option).sort((a, b) => b.percentage - a.percentage);
    return { option: r.option, percentage: r.percentage, topPersona: related[0]?.persona_label, topPct: related[0]?.percentage };
  });

  // 가장 인기 있는 선택지
  const top = optionLeaders.sort((a, b) => b.percentage - a.percentage)[0];
  if (top?.topPersona) {
    const info = PERSONA_INSIGHTS[top.topPersona];
    if (info) {
      lines.push(`가장 많은 응답을 받은 "${top.option}"(${top.percentage}%)은 ${top.topPersona} 유형이 ${top.topPct}%로 주도했습니다. ${info.tendency} 이러한 성향이 "${top.option}"을 선호하는 핵심 동인으로 작용한 것으로 분석됩니다.`);
    }
  }

  // 타입 간 선택 차이가 극명한 경우
  const contrasts = optionLeaders.filter(o => o.topPersona).slice(0, 3);
  if (contrasts.length >= 2 && contrasts[0].topPersona !== contrasts[1].topPersona) {
    const a = contrasts[0], b = contrasts[1];
    lines.push(`${a.topPersona}은 "${a.option}"을, ${b.topPersona}은 "${b.option}"을 선호하는 대조적 패턴이 나타납니다. 이는 업무 성향에 따라 같은 질문에도 전혀 다른 가치 판단을 내릴 수 있음을 보여줍니다.`);
  }

  // 의견 분열
  const sorted = [...results].sort((a, b) => b.percentage - a.percentage);
  if (sorted.length >= 2) {
    const gap = sorted[0].percentage - sorted[1].percentage;
    if (gap < 10 && sorted[0].percentage > 0) {
      lines.push(`"${sorted[0].option}"과 "${sorted[1].option}" 간 선호 차이가 ${gap}%p에 불과하여, 이 주제는 조직 내에서 충분한 논의가 필요한 사안으로 판단됩니다.`);
    }
  }

  return lines.join('\n\n');
}

export function ResultsSection({ results, distribution }: ResultsSectionProps) {
  const hasDistribution = distribution.length > 0;
  const allPersonas = [...new Set(distribution.map(d => d.persona_label))];
  const stackedData = hasDistribution ? buildStackedData(results, distribution) : [];
  const synthesis = hasDistribution ? generateSynthesis(results, distribution) : '';

  return (
    <div data-testid="results-bar-chart">
      {/* Stacked Bar Chart (타입 색상 포함) 또는 일반 Bar Chart */}
      <ResponsiveContainer width="100%" height={results.length * 56 + 10}>
        <BarChart data={hasDistribution ? stackedData : results.map(r => ({ ...r }))} layout="vertical" margin={{ top: 0, right: 50, left: 0, bottom: 0 }}>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis dataKey="option" type="category" width={80} tick={{ fill: '#050505', fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: '#F0F2F5' }}
            contentStyle={{ background: '#fff', border: '1px solid #CED0D4', borderRadius: 8, fontSize: 13 }}
            formatter={(value, name) => [`${value}%`, name === 'total' ? '전체' : name]}
          />
          {hasDistribution ? (
            // Stacked: 타입별 색상
            allPersonas.map(persona => (
              <Bar key={persona} dataKey={persona} stackId="a" fill={PERSONA_COLORS[persona] || '#8A8D91'} radius={0} maxBarSize={36} />
            ))
          ) : (
            <Bar dataKey="percentage" radius={[0, 6, 6, 0]} maxBarSize={36}>
              {results.map((_, i) => <Cell key={i} fill={OPTION_COLORS[i] || OPTION_COLORS[0]} />)}
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>

      {/* 범례: 수치 + 타입 */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
        {results.map((r, i) => (
          <span key={r.option} className="text-xs text-text-secondary">
            {!hasDistribution && <span className="inline-block w-2.5 h-2.5 rounded-full mr-1 align-middle" style={{ backgroundColor: OPTION_COLORS[i] }} />}
            {r.option}: <strong className="text-text-primary">{r.percentage}%</strong> ({r.count}명)
          </span>
        ))}
      </div>

      {/* 타입 범례 */}
      {hasDistribution && (
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
          {allPersonas.map(p => (
            <span key={p} className="flex items-center gap-1 text-[11px] text-text-tertiary">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PERSONA_COLORS[p] || '#8A8D91' }} />
              {p}
            </span>
          ))}
        </div>
      )}

      {/* 종합 분석 */}
      {synthesis && (
        <div className="mt-5 bg-primary-light border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={16} className="text-primary" />
            <h3 className="text-sm font-semibold text-primary">종합 분석</h3>
          </div>
          {synthesis.split('\n\n').map((paragraph, i) => (
            <p key={i} className="text-sm text-text-primary leading-relaxed mb-2 last:mb-0">{paragraph}</p>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ResultsBarChart (호환용 export) ──────────────────────────────────────────
export interface ResultsBarChartProps { results: OptionResult[]; }
export function ResultsBarChart({ results }: ResultsBarChartProps) {
  return <ResultsSection results={results} distribution={[]} />;
}

// ── TypeDistributionChart (호환용 export) ─────────────────────────────────────
export interface TypeDistributionChartProps { distribution: PersonaDistributionItem[]; isAuthenticated: boolean; results?: OptionResult[]; }
export function TypeDistributionChart({ distribution, isAuthenticated }: TypeDistributionChartProps) {
  if (!isAuthenticated || !distribution.length) return null;
  return null; // 이제 ResultsSection에 통합됨
}

// ── MinorityViewCard ──────────────────────────────────────────────────────────
export interface MinorityViewCardProps { minorityOption: string | null; minorityPercentage: number | null; }
export function MinorityViewCard({ minorityOption, minorityPercentage }: MinorityViewCardProps) {
  if (!minorityOption || minorityPercentage === null) return null;
  return (
    <div data-testid="minority-view-card" className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
      <Lightbulb size={18} className="text-warning shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-text-primary">다른 시선이 보여주는 것</p>
        <p className="text-sm text-text-secondary mt-0.5">&ldquo;{minorityOption}&rdquo;을 선택한 비율은 {minorityPercentage}%로 적지만, 다수와 다른 시선은 우리가 미처 보지 못한 것을 발견하게 해줘요</p>
      </div>
    </div>
  );
}

// ── InsightText ──────────────────────────────────────────────────────────────
export interface InsightTextProps { insight: string | null; distribution?: PersonaDistributionItem[]; results?: OptionResult[]; }
export function InsightText({ insight }: InsightTextProps) {
  if (!insight) return null;
  return (
    <div data-testid="insight-text" className="bg-[#F7F8FA] rounded-lg p-4 border border-divider">
      <div className="flex items-start gap-2">
        <Lightbulb size={16} className="text-warning shrink-0 mt-0.5" />
        <p className="text-sm text-text-secondary leading-relaxed">{insight}</p>
      </div>
    </div>
  );
}

// ── NavigationButtons ────────────────────────────────────────────────────────
export interface NavigationButtonsProps { prevQuestionId: string | null; nextQuestionId: string | null; }
export function NavigationButtons({ prevQuestionId, nextQuestionId }: NavigationButtonsProps) {
  return (
    <div className="flex items-center justify-between">
      {prevQuestionId ? <Link href={`/question/${prevQuestionId}/result`} className="flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition"><ChevronLeft size={16} /> 이전</Link> : <span />}
      <Link href="/feed" className="text-sm text-primary hover:underline">피드로</Link>
      {nextQuestionId ? <Link href={`/question/${nextQuestionId}/result`} className="flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition">다음 <ChevronRight size={16} /></Link> : <span />}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function QuestionResultPage() {
  const params = useParams();
  const questionId = params.questionId as string;
  const [data, setData] = useState<QuestionAggregateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try { const res = await fetch(`/api/questions/${questionId}/aggregate`); if (res.ok) setData(await res.json()); } catch {} finally { setLoading(false); }
    }
    if (questionId) load();
  }, [questionId]);

  if (loading) return <div className="min-h-screen bg-bg-page flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-divider border-t-primary animate-spin" /></div>;
  if (!data) return <div className="min-h-screen bg-bg-page flex items-center justify-center"><p className="text-text-secondary">결과를 불러올 수 없습니다. <Link href="/feed" className="text-primary hover:underline">피드로</Link></p></div>;

  return (
    <div className="min-h-screen bg-bg-page px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-5">
        <QuestionSummary title={data.title} status={data.status} participantCount={data.participant_count} />
        <section className="bg-white rounded-lg border border-border p-5">
          <h2 className="text-[15px] font-semibold text-text-primary mb-4">선택지별 결과</h2>
          <ResultsSection results={data.results} distribution={data.persona_distribution} />
        </section>
        <InsightText insight={data.insight} distribution={data.persona_distribution} results={data.results} />
        <MinorityViewCard minorityOption={data.minority_option} minorityPercentage={data.minority_percentage} />
        <section className="bg-white rounded-lg border border-border p-5">
          <h2 className="text-[15px] font-semibold text-text-primary mb-3">공유하기</h2>
          <ShareButtons url={`https://workside.day/question/${data.id}/result`} title={`[Workside] ${data.title}`} />
        </section>
        <NavigationButtons prevQuestionId={data.prev_question_id} nextQuestionId={data.next_question_id} />
      </div>
    </div>
  );
}
