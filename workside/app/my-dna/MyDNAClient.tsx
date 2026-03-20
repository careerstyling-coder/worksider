'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User, DNAResult } from '@/types/database';
import { DNARadarChart } from '@/components/charts/RadarChart';
import { PersonaBadge } from '@/components/ui';
import { LogOut, Share2, UserCog, Zap, FileText, ClipboardList, ChevronRight, Lock } from 'lucide-react';

interface MyDNAClientProps {
  profile: User;
  dnaResults: DNAResult[];
  participationCount: number;
  suggestionsCount: number;
  approvedSuggestionsCount: number;
  recentQuestions?: { id: string; title: string; status: string }[];
  recentSuggestions?: { id: string; title: string; shout_out_count: number }[];
  recentAdopted?: { id: string; title: string; survey_type: string }[];
}

function avg(arr: number[]) {
  return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
}

const AXIS = [
  { key: 'p', label: '실행력', score: (r: DNAResult) => r.p_score, color: '#1877F2' },
  { key: 'c', label: '협력', score: (r: DNAResult) => r.c_score, color: '#31A24C' },
  { key: 'pol', label: '영향력', score: (r: DNAResult) => r.pol_score, color: '#F7B928' },
  { key: 's', label: '자율성', score: (r: DNAResult) => r.s_score, color: '#9B59B6' },
];

function getTrendNote(results: DNAResult[]): string[] {
  if (results.length < 2) return [];
  const latest = results[0];
  const prev = results[1];
  const notes: string[] = [];
  const diffs = [
    { name: '실행력', diff: latest.p_score - prev.p_score },
    { name: '협력', diff: latest.c_score - prev.c_score },
    { name: '영향력', diff: latest.pol_score - prev.pol_score },
    { name: '자율성', diff: latest.s_score - prev.s_score },
  ];
  const rising = diffs.filter(d => d.diff > 5).sort((a, b) => b.diff - a.diff);
  const falling = diffs.filter(d => d.diff < -5).sort((a, b) => a.diff - b.diff);
  const stable = diffs.filter(d => Math.abs(d.diff) <= 5);

  if (rising.length > 0) notes.push(`${rising.map(d => `${d.name}(+${d.diff})`).join(', ')}이 상승하고 있습니다.`);
  if (falling.length > 0) notes.push(`${falling.map(d => `${d.name}(${d.diff})`).join(', ')}에 변화가 감지됩니다.`);
  if (stable.length === 4) notes.push('전 영역이 안정적으로 유지되고 있습니다.');

  return notes;
}

export default function MyDNAClient({
  profile, dnaResults, participationCount, suggestionsCount, approvedSuggestionsCount,
  recentQuestions = [], recentSuggestions = [], recentAdopted = [],
}: MyDNAClientProps) {
  const router = useRouter();
  const latestResult = dnaResults[0] || null;
  const recentFour = dnaResults.slice(0, 4);
  const compareData = recentFour.slice(1).map(r => ({
    p_score: r.p_score, c_score: r.c_score, pol_score: r.pol_score, s_score: r.s_score,
  }));

  const avgScores = {
    p_score: avg(dnaResults.map(r => r.p_score)),
    c_score: avg(dnaResults.map(r => r.c_score)),
    pol_score: avg(dnaResults.map(r => r.pol_score)),
    s_score: avg(dnaResults.map(r => r.s_score)),
  };

  const trendNotes = getTrendNote(dnaResults);

  const handleLogout = async () => {
    const { signOut } = await import('@/lib/supabase/auth');
    await signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-bg-page">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">

        {/* ── 프로필 ── */}
        <section className="bg-white rounded-lg border border-border p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-lg font-bold text-primary shrink-0">
            {profile.nickname?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-text-primary">{profile.nickname}</h1>
            <p className="text-sm text-text-secondary truncate">{profile.email}</p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            {profile.industry && <span className="px-2 py-0.5 bg-bg-page border border-divider rounded text-[11px] text-text-secondary">{profile.industry}</span>}
            {profile.company_size && <span className="px-2 py-0.5 bg-bg-page border border-divider rounded text-[11px] text-text-secondary">{profile.company_size}</span>}
          </div>
        </section>

        {/* ── 종합 DNA ── */}
        {latestResult ? (
          <section className="bg-white rounded-lg border border-border p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-text-primary">나의 성장 지도</h2>
              <PersonaBadge label={latestResult.persona_label} />
            </div>
            <p className="text-xs text-text-tertiary mb-4">{dnaResults.length}회 진단을 통해 발견한 나 · 최근 {recentFour.length}회 추이 표시</p>

            {/* 레이더 차트 (종합 + 최근 4회 누적) */}
            <div className="flex justify-center">
              <div className="w-72">
                <DNARadarChart data={avgScores} size="medium" compareData={compareData} />
              </div>
            </div>
            {compareData.length > 0 && (
              <p className="text-center text-[11px] text-text-tertiary mt-1">실선: 종합 평균 · 점선: 이전 결과 (최대 3회)</p>
            )}

            {/* 축별 점수 요약 (한 줄씩) */}
            <div className="mt-5 grid grid-cols-4 gap-2">
              {AXIS.map(a => {
                const score = avgScores[`${a.key}_score` as keyof typeof avgScores];
                return (
                  <div key={a.key} className="text-center p-2 bg-bg-page rounded-lg">
                    <span className="text-xl font-bold" style={{ color: a.color }}>{score}</span>
                    <span className="block text-[11px] text-text-tertiary mt-0.5">{a.label}</span>
                  </div>
                );
              })}
            </div>

            {/* 변화 해설 주석 */}
            {trendNotes.length > 0 && (
              <div className="mt-4 pt-4 border-t border-divider">
                {trendNotes.map((note, i) => (
                  <p key={i} className="text-xs text-text-secondary leading-relaxed">
                    <span className="text-text-tertiary mr-1">*</span>{note}
                  </p>
                ))}
              </div>
            )}

            {/* 세부 분석 (유료) */}
            <div className="mt-4 p-4 bg-bg-page rounded-lg border border-divider">
              <div className="flex items-center gap-2 mb-1">
                <Lock size={14} className="text-text-tertiary" />
                <span className="text-sm font-semibold text-text-primary">성장을 위한 깊은 탐구</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-primary-light text-primary rounded font-medium">Coming Soon</span>
              </div>
              <p className="text-xs text-text-secondary">각 영역의 의미를 더 깊이 이해하고, 나만의 성장 방향을 발견할 수 있어요</p>
            </div>

            {/* 액션 */}
            <div className="mt-4 flex gap-2">
              <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/share/${latestResult.share_token}`)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-border rounded-lg text-sm text-text-secondary hover:bg-bg-hover transition">
                <Share2 size={14} /> 공유
              </button>
              <Link href="/diagnosis" className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary rounded-lg text-sm text-white hover:bg-primary-hover transition">
                <Zap size={14} /> 다시 발견하기
              </Link>
            </div>
          </section>
        ) : (
          <section className="bg-white rounded-lg border border-border p-8 text-center">
            <Zap size={36} className="text-text-tertiary mx-auto mb-3" />
            <h2 className="text-lg font-bold text-text-primary mb-1">아직 나를 발견하지 못했어요</h2>
            <p className="text-sm text-text-secondary mb-4">첫 번째 발견을 시작해볼까요?</p>
            <Link href="/diagnosis" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary rounded-lg text-sm font-semibold text-white hover:bg-primary-hover transition">
              <Zap size={16} /> 나를 발견하러 가기
            </Link>
          </section>
        )}

        {/* ── 질문 참여 ── */}
        <section className="bg-white rounded-lg border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-semibold text-text-primary">질문 참여 <span className="text-text-tertiary font-normal text-xs">({participationCount})</span></h3>
            <Link href="/feed" className="text-xs text-primary hover:underline">더 보기</Link>
          </div>
          {recentQuestions.length > 0 ? (
            <div className="space-y-1.5">
              {recentQuestions.slice(0, 4).map(q => (
                <Link key={q.id} href={`/question/${q.id}`} className="flex items-center justify-between p-2.5 bg-[#F7F8FA] rounded hover:bg-bg-hover transition">
                  <span className="text-sm text-text-primary truncate flex-1">{q.title}</span>
                  <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ml-2 shrink-0 ${q.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-text-tertiary'}`}>
                    {q.status === 'active' ? '진행중' : '마감'}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-tertiary py-2 text-center">아직 참여한 질문이 없습니다</p>
          )}
        </section>

        {/* ── 궁금합니다 + 채택됨 ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <section className="bg-white rounded-lg border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-semibold text-text-primary">궁금합니다 <span className="text-text-tertiary font-normal text-xs">({suggestionsCount})</span></h3>
              <Link href="/suggest" className="text-xs text-primary hover:underline">궁금함 나누기</Link>
            </div>
            {recentSuggestions.length > 0 ? (
              <div className="space-y-1.5">
                {recentSuggestions.slice(0, 3).map(s => (
                  <Link key={s.id} href={`/feed/suggestion/${s.id}`} className="block p-2.5 bg-[#F7F8FA] rounded hover:bg-bg-hover transition">
                    <span className="text-sm text-text-primary line-clamp-1">{s.title}</span>
                    <span className="text-[11px] text-text-tertiary">🔊 {s.shout_out_count}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-tertiary py-2 text-center">아직 없습니다</p>
            )}
          </section>

          <section className="bg-white rounded-lg border border-border p-5">
            <h3 className="text-[15px] font-semibold text-text-primary mb-3">채택됨 <span className="text-text-tertiary font-normal text-xs">({approvedSuggestionsCount})</span></h3>
            {recentAdopted.length > 0 ? (
              <div className="space-y-1.5">
                {recentAdopted.slice(0, 3).map(a => (
                  <div key={a.id} className="p-2.5 bg-green-50 rounded">
                    <span className="text-sm text-text-primary line-clamp-1">{a.title}</span>
                    <span className={`text-[11px] font-medium ${a.survey_type === 'formal' ? 'text-purple-600' : 'text-blue-600'}`}>
                      {a.survey_type === 'formal' ? '정식 설문' : '단순 질문'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-tertiary py-2 text-center">아직 없습니다</p>
            )}
          </section>
        </div>

        {/* ── 참여할 설문 ── */}
        <section className="bg-white rounded-lg border border-border p-5">
          <h3 className="text-[15px] font-semibold text-text-primary mb-2">참여할 질문 & 설문</h3>
          <div className="space-y-1.5">
            <Link href="/feed" className="flex items-center justify-between p-2.5 bg-primary-light rounded hover:bg-blue-100 transition">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                <span className="text-sm text-text-primary">피드에서 질문 참여하기</span>
              </div>
              <ChevronRight size={14} className="text-text-tertiary" />
            </Link>
            <div className="flex items-center gap-2 p-2.5 bg-purple-50 rounded border border-purple-100">
              <ClipboardList size={16} className="text-purple-600" />
              <span className="text-sm text-text-secondary">아직 도착한 설문이 없어요</span>
            </div>
          </div>
        </section>

        {/* ── 하단 액션 ── */}
        <div className="flex gap-2 text-sm">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-border rounded-lg text-text-secondary hover:bg-bg-hover transition"><UserCog size={14} /> 프로필</button>
          <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-border rounded-lg text-error hover:bg-red-50 transition"><LogOut size={14} /> 로그아웃</button>
        </div>
      </div>
    </div>
  );
}
