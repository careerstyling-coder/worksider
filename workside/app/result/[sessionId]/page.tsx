import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { DNARadarChart } from '@/components/charts/RadarChart';
import { PersonaBadge } from '@/components/ui/PersonaBadge';
import { ShareButtons } from '@/components/ShareButtons';
import { DNAResult } from '@/types/database';
import { PERSONA_DETAILS, AXIS_COMBINATION_INSIGHTS } from '@/constants/personas';
import ResultDetailClient from './ResultDetailClient';

interface ResultPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { sessionId } = await params;

  let result: DNAResult | null = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('dna_results')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (!error && data) result = data as DNAResult;
  } catch {}

  if (!result) {
    return (
      <main className="min-h-screen bg-white px-4 py-12">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6 text-center">
          <p className="text-text-secondary text-lg">결과를 찾을 수 없습니다</p>
          <Link href="/diagnosis" className="inline-flex items-center px-6 py-3 bg-primary text-white font-semibold rounded-lg text-sm hover:bg-primary-hover transition">
            나를 발견하러 가기
          </Link>
        </div>
      </main>
    );
  }

  const persona = PERSONA_DETAILS[result.persona_label];
  const scores = { p: result.p_score, c: result.c_score, pol: result.pol_score, s: result.s_score };
  const combinationInsights = AXIS_COMBINATION_INSIGHTS.filter(ci => ci.condition(scores)).map(ci => ci.insight);

  return (
    <main className="min-h-screen bg-bg-page px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* 헤더 */}
        <div className="text-center">
          <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-2">Workstyle DNA 결과</p>
          <PersonaBadge label={result.persona_label} variant="primary" />
        </div>

        {/* 레이더 차트 + 점수 */}
        <section className="bg-white rounded-lg border border-border p-6">
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              <DNARadarChart data={{ p_score: result.p_score, c_score: result.c_score, pol_score: result.pol_score, s_score: result.s_score }} size="large" />
            </div>
          </div>
          <div data-testid="score-display" className="mt-4 grid grid-cols-4 gap-2 text-center">
            {[
              { label: '실행력', score: result.p_score, color: '#1877F2' },
              { label: '협력', score: result.c_score, color: '#31A24C' },
              { label: '영향력', score: result.pol_score, color: '#F7B928' },
              { label: '자율성', score: result.s_score, color: '#9B59B6' },
            ].map(a => (
              <div key={a.label} className="p-2 bg-[#F7F8FA] rounded-lg">
                <span className="text-xl font-bold" style={{ color: a.color }}>{a.score}</span>
                <span className="block text-[11px] text-text-tertiary mt-0.5">{a.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 페르소나 종합 해설 */}
        {persona && (
          <section data-testid="description-section" className="bg-white rounded-lg border border-border p-6">
            <h2 className="text-lg font-bold text-text-primary mb-3">{result.persona_label}</h2>
            <p className="text-[15px] text-text-primary leading-relaxed">{persona.fullDescription}</p>

            {/* 축 조합 인사이트 */}
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

        {/* 클라이언트 컴포넌트: 점수 기반 동적 해석 + 강점/주의점/성장팁/상황별 */}
        {persona && <ResultDetailClient persona={persona} scores={scores} />}

        {/* 공유 */}
        <section className="bg-white rounded-lg border border-border p-5">
          <h3 className="text-[15px] font-semibold text-text-primary mb-3">결과 공유하기</h3>
          <ShareButtons
            url={`${process.env.NEXT_PUBLIC_APP_URL ?? 'https://workside.day'}/share/${result.share_token}`}
            title={`나의 Workstyle DNA: ${result.persona_label}`}
            description={persona?.description || result.persona_description}
            version={result.version}
          />
        </section>

        {/* 하단 CTA */}
        <div className="flex items-center justify-center gap-4">
          <Link href="/diagnosis" className="text-sm text-text-tertiary hover:text-primary transition">다시 진단하기</Link>
          <span className="text-border">·</span>
          <Link href="/feed" className="text-sm text-text-tertiary hover:text-primary transition">피드로 가기</Link>
        </div>
      </div>
    </main>
  );
}
