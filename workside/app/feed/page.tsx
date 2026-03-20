// @TASK P3-S1-T2 - 피드 (메인) 페이지
// @SPEC docs/planning/feed-page.md
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { FilterTabs } from '@/components/FilterTabs';
import { QuestionCard } from '@/components/QuestionCard';
import { SuggestionCard } from '@/components/SuggestionCard';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';

// ─────────────────────── 타입 ───────────────────────

interface Question {
  id: string;
  title: string;
  status: string;
  participant_count: number;
  deadline?: string;
  is_featured?: boolean;
}

interface Suggestion {
  id: string;
  title: string;
  user_id: string;
  shout_out_count: number;
  status: string;
}

// ─────────────────────── 상수 ───────────────────────

const FILTER_TABS = [
  { label: '전체', value: 'all' },
  { label: '진행중', value: 'active' },
  { label: '마감', value: 'closed' },
  { label: '내 참여', value: 'mine' },
] as const;

// ─────────────────────── 페이지 ───────────────────────

export default function FeedPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 페치
  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [qRes, sRes] = await Promise.all([
          fetch('/api/questions', { signal: controller.signal }),
          fetch('/api/suggestions', { signal: controller.signal }),
        ]);

        if (!qRes.ok || !sRes.ok) throw new Error('데이터를 불러오지 못했습니다.');

        const [qData, sData] = await Promise.all([qRes.json(), sRes.json()]);

        setQuestions(qData.data ?? []);
        setSuggestions(sData.data ?? []);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError((err as Error).message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    return () => controller.abort();
  }, []);

  // 탭 필터링
  const filteredQuestions = questions.filter((q) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return q.status === 'active';
    if (activeTab === 'closed') return q.status === 'closed';
    return true; // 'mine' — 서버 사이드 필터링으로 추후 대체
  });

  const featuredQuestion = filteredQuestions.find((q) => q.is_featured);
  const regularQuestions = filteredQuestions.filter((q) => !q.is_featured);

  // ShoutOut 핸들러
  const handleShoutOut = async (id: string) => {
    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, shout_out_count: s.shout_out_count + 1 } : s
      )
    );
  };

  // ── 로딩 상태 ──
  if (loading) {
    return (
      <main
        className="min-h-screen bg-white px-4 py-6"
        aria-busy="true"
        data-testid="feed-loading"
      >
        <div className="max-w-2xl mx-auto space-y-4">
          {/* 탭 스켈레톤 */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-16 rounded-full bg-bg-page animate-pulse" />
            ))}
          </div>
          {/* 카드 스켈레톤 */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-white animate-pulse" />
          ))}
        </div>
      </main>
    );
  }

  // ── 에러 상태 ──
  if (error) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-text-secondary mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-primary underline text-sm"
          >
            다시 시도
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* ── 필터 탭 ── */}
        <section aria-label="질문 필터">
          <FilterTabs
            tabs={[...FILTER_TABS]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </section>

        {/* ── 질문 섹션 ── */}
        <section aria-label="질문 목록" className="space-y-3">
          <h2 className="text-lg font-semibold text-text-primary">질문</h2>

          {/* 주요 질문 (상단 고정) */}
          {featuredQuestion && (
            <div className="mb-2">
              <QuestionCard question={featuredQuestion} />
            </div>
          )}

          {/* 일반 질문 목록 */}
          {regularQuestions.length > 0 ? (
            <ul className="space-y-3 list-none">
              {regularQuestions.map((q) => (
                <li key={q.id}>
                  <QuestionCard question={q} />
                </li>
              ))}
            </ul>
          ) : (
            !featuredQuestion && (
              <p className="text-text-tertiary text-sm py-8 text-center">
                아직 이 조건에 맞는 질문이 없어요. 곧 새로운 질문이 올라올 거예요!
              </p>
            )
          )}
        </section>

        {/* ── 궁금합니다 섹션 ── */}
        {suggestions.length > 0 && (
          <section aria-label="궁금합니다 목록" className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">궁금합니다</h2>
            <ul className="space-y-3 list-none">
              {[...suggestions].sort((a, b) => b.shout_out_count - a.shout_out_count).map((s) => (
                <li key={s.id}>
                  <SuggestionCard suggestion={s} onShoutOut={handleShoutOut} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* ── Floating Action Button ── */}
      <FloatingActionButton
        label="궁금해요"
        icon={<Plus size={16} />}
        onClick={() => router.push('/suggest')}
      />
    </main>
  );
}
