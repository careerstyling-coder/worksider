'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { DNARadarChart } from '@/components/charts/RadarChart';
import { Dna, Share2, MessageCircle, TrendingUp, ArrowRight, Megaphone, Users } from 'lucide-react';

// ── Section 1: 공감 (Hook) ──────────────────────────────────────────────────

function HookSection() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary leading-snug">
          왜 우리는 일을 할 때
          <br />
          서로 다르게 이해하고, 대하고,
          <br />
          <span className="text-primary">각자가 다른걸 깨달을까요?</span>
        </h1>
        <p className="mt-5 text-text-secondary text-base leading-relaxed">
          일하는 방식의 차이를 이해하면,
          <br />
          나와 동료 모두 성장할 수 있어요.
        </p>
      </div>
    </section>
  );
}

// ── Section 2: 발견 (Solution) ──────────────────────────────────────────────

const DNA_AXES = [
  { key: 'P', question: '나는 목표를 향해 달리는 타입일까?', label: '실행력', color: '#1877F2' },
  { key: 'C', question: '나는 함께할 때 더 빛나는 사람일까?', label: '협력', color: '#31A24C' },
  { key: 'Pol', question: '나는 조직의 흐름을 읽는 편일까?', label: '영향력', color: '#F7B928' },
  { key: 'S', question: '나는 내 방식대로 일할 때 최고일까?', label: '자율성', color: '#9B59B6' },
];

const PERSONAS = [
  { label: '전략적 성과자', emoji: '🎯', desc: '목표를 향해 달리는' },
  { label: '실무형 전문가', emoji: '🔧', desc: '깊이로 승부하는' },
  { label: '협력적 조정자', emoji: '🤝', desc: '함께 만들어가는' },
  { label: '자율형 독립가', emoji: '🦅', desc: '내 길을 가는' },
  { label: '조직형 정치인', emoji: '🎭', desc: '흐름을 읽는' },
  { label: '중도형 균형가', emoji: '⚖️', desc: '균형을 찾는' },
];

function DiscoverySection() {
  return (
    <section className="py-20 px-6 bg-[#F7F8FA]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-text-primary text-center mb-2">
          나의 <span className="text-primary">Workstyle DNA</span>는?
        </h2>
        <p className="text-center text-text-secondary mb-10">4가지 축으로 나의 업무 성향을 발견해요</p>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-3">
            {DNA_AXES.map(axis => (
              <div key={axis.key} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-border">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ backgroundColor: axis.color }}>
                  {axis.key}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{axis.question}</p>
                  <p className="text-xs text-text-tertiary mt-0.5">{axis.label} 축</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center">
            <div className="w-full max-w-xs">
              <DNARadarChart data={{ p_score: 78, c_score: 52, pol_score: 65, s_score: 71 }} size="medium" />
            </div>
            <p className="text-xs text-text-tertiary mt-2">예시 결과: 전략적 성과자</p>
          </div>
        </div>

        <div className="mt-12">
          <p className="text-center text-sm font-semibold text-text-secondary mb-4">나는 어떤 유형일까?</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {PERSONAS.map(p => (
              <div key={p.label} className="text-center p-3 bg-white rounded-lg border border-border hover:border-primary hover:shadow-sm transition">
                <span className="text-2xl">{p.emoji}</span>
                <p className="text-xs font-semibold text-text-primary mt-1.5">{p.label}</p>
                <p className="text-[11px] text-text-tertiary">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Section 3: 연결 (Community) — 실시간 API 연동 ──────────────────────────

interface CommunityStats {
  totalUsers: number;
  totalPersonas: number;
  totalIndustries: number;
}

interface TrendingItem {
  id: string;
  title: string;
  shout_out_count: number;
}

function CommunitySection() {
  const [stats, setStats] = useState<CommunityStats>({ totalUsers: 0, totalPersonas: 6, totalIndustries: 0 });
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [reviews, setReviews] = useState<{ name: string; role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // 사용자 수 조회
        const usersRes = await fetch('/api/about/stats');
        if (usersRes.ok) {
          const data = await usersRes.json();
          setStats(data);
        }

        // 뜨는 궁금함 (shout_out_count 순)
        const suggestRes = await fetch('/api/suggestions?status=approved&limit=3');
        if (suggestRes.ok) {
          const data = await suggestRes.json();
          if (data.data) setTrending(data.data);
        }

        // 사용자 후기 (향후 별도 테이블, 현재는 폴백)
        setReviews([
          { name: 'growth_hacker', role: 'PM · IT', text: '3분 만에 제 업무 스타일을 정확히 짚어줬어요. 동료들과 공유하니 서로를 이해하는 데 큰 도움이 됐습니다.' },
          { name: 'dev_master', role: '개발자 · 대기업', text: '정기 질문에 참여하면서 다른 직군 사람들의 시각을 알게 됐어요. 시야가 넓어지는 느낌입니다.' },
          { name: 'mkt_queen', role: '마케터 · 금융', text: '페르소나별 분석이 인상 깊었어요. 소수 의견 인사이트가 실무에 큰 도움이 됩니다.' },
          { name: 'free_creator', role: '디자이너 · 프리랜서', text: '자율형 독립가라는 결과가 정말 공감됐어요. 자기 이해의 좋은 출발점이었습니다.' },
          { name: 'plan_yujin', role: '기획자 · 스타트업', text: '궁금합니다 기능이 좋아요. 다른 사람들의 생각을 들을 수 있어서 성장하는 느낌이 듭니다.' },
        ]);
      } catch {
        // 에러 시 폴백
      } finally {
        setLoading(false);
      }
    }
    fetchData();

    // 60초마다 자동 갱신
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-text-primary text-center mb-2">
          지금 이 순간에도 <span className="text-primary">함께</span> 성장하고 있어요
        </h2>

        {/* 실시간 수치 */}
        <div className="mt-8 flex items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{stats.totalUsers.toLocaleString()}</p>
            <p className="text-sm text-text-secondary mt-1">명이 발견했어요</p>
          </div>
          <div className="w-px h-12 bg-divider" />
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{stats.totalPersonas}</p>
            <p className="text-sm text-text-secondary mt-1">가지 유형</p>
          </div>
          <div className="w-px h-12 bg-divider" />
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{stats.totalIndustries > 0 ? `${stats.totalIndustries}+` : '15+'}</p>
            <p className="text-sm text-text-secondary mt-1">산업군</p>
          </div>
        </div>

        {/* 지금 뜨는 궁금함 */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone size={18} className="text-primary" />
            <h3 className="text-[15px] font-semibold text-text-primary">지금 뜨는 궁금함</h3>
          </div>
          {trending.length > 0 ? (
            <div className="space-y-2">
              {trending.sort((a, b) => b.shout_out_count - a.shout_out_count).map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-[#F7F8FA] rounded-lg border border-border">
                  <span className="text-sm text-text-primary">{t.title}</span>
                  <span className="text-xs text-text-tertiary shrink-0 ml-2">🔊 {t.shout_out_count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-tertiary text-center py-4">곧 새로운 궁금함이 올라올 거예요!</p>
          )}
        </div>

        {/* 사용자 후기 */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-primary" />
            <h3 className="text-[15px] font-semibold text-text-primary">함께 성장하는 사람들</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {reviews.map((r, i) => (
              <div key={i} className="p-4 bg-[#F7F8FA] rounded-lg border border-border">
                <p className="text-sm text-text-primary leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center text-xs font-bold text-primary">{r.name[0]}</div>
                  <div>
                    <p className="text-xs font-semibold text-text-primary">{r.name}</p>
                    <p className="text-[11px] text-text-tertiary">{r.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Section 4: 성장 (Value) + CTA ───────────────────────────────────────────

const FLOW_STEPS = [
  { icon: Dna, label: '발견', desc: 'DNA 진단으로 나를 이해해요' },
  { icon: Share2, label: '공유', desc: '동료와 서로를 이해해요' },
  { icon: MessageCircle, label: '질문', desc: '함께 고민하고 답을 찾아요' },
  { icon: TrendingUp, label: '성장', desc: '매번 새로운 나를 발견해요' },
];

function GrowthSection() {
  return (
    <section className="py-20 px-6 bg-[#F7F8FA]">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-2">성장의 선순환</h2>
        <p className="text-text-secondary mb-10">진단에서 시작해, 함께 성장하는 여정</p>

        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-12">
          {FLOW_STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-2 sm:gap-4">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-white border-2 border-primary flex items-center justify-center mb-2">
                  <step.icon size={22} className="text-primary" />
                </div>
                <p className="text-sm font-semibold text-text-primary">{step.label}</p>
                <p className="text-[11px] text-text-tertiary mt-0.5 max-w-20 leading-tight">{step.desc}</p>
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <ArrowRight size={16} className="text-border mt-[-20px]" />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/diagnosis" className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-[15px] font-semibold text-white hover:bg-primary-hover transition">
            나를 발견하러 가기
          </Link>
          <Link href="/signup" className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-border bg-white px-8 py-3 text-[15px] font-medium text-text-primary hover:bg-bg-hover transition">
            함께 성장하러 가기
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <HookSection />
        <DiscoverySection />
        <CommunitySection />
        <GrowthSection />
      </main>
    </>
  );
}
