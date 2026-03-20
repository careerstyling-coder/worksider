// @TASK P3-S1-T1 + P3-S1-T2 - 피드 페이지 데모
'use client';

import React, { useState } from 'react';
import { FilterTabs } from '@/components/FilterTabs';
import { QuestionCard } from '@/components/QuestionCard';
import { SuggestionCard } from '@/components/SuggestionCard';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { Plus } from 'lucide-react';

// ─── 데모 데이터 ───

const DEMO_QUESTIONS = [
  {
    id: 'q1',
    title: '업무 회의 빈도에 대해 어떻게 생각하시나요?',
    status: 'active',
    participant_count: 15,
    deadline: '2026-03-25',
    is_featured: true, survey_type: 'formal' as const,
  },
  {
    id: 'q2',
    title: '재택근무 확대를 원하시나요?',
    status: 'active',
    participant_count: 8,
    is_featured: false, survey_type: 'simple' as const,
  },
  {
    id: 'q3',
    title: '지난 분기 목표 달성률은?',
    status: 'closed',
    participant_count: 22,
    is_featured: false, survey_type: 'simple' as const,
  },
  {
    id: 'q4',
    title: '사무실 리모델링 우선순위를 골라주세요',
    status: 'active',
    participant_count: 11,
    deadline: '2026-03-30',
    is_featured: false, survey_type: 'simple' as const,
  },
];

const DEMO_SUGGESTIONS = [
  {
    id: 's1',
    title: '사내 도서관 운영을 제안합니다',
    user_id: 'user-1',
    shout_out_count: 12,
    status: 'open',
  },
  {
    id: 's2',
    title: '스탠딩 데스크 도입을 원합니다',
    user_id: 'user-2',
    shout_out_count: 5,
    status: 'accepted',
  },
  {
    id: 's3',
    title: '주 1회 직장인 런치 모임 제안',
    user_id: 'user-3',
    shout_out_count: 3,
    status: 'done',
  },
];

const TABS = [
  { label: '전체', value: 'all' },
  { label: '진행중', value: 'active', badge: 3 },
  { label: '마감', value: 'closed' },
  { label: '내 참여', value: 'mine' },
];

type DemoState = 'normal' | 'loading' | 'error' | 'empty';

const DEMO_STATES: Record<DemoState, { label: string; description: string }> = {
  normal: { label: '정상', description: '질문 + 제안 모두 로드됨' },
  loading: { label: '로딩', description: '데이터 로드 중' },
  error: { label: '에러', description: 'API 연결 실패' },
  empty: { label: '빈 상태', description: '질문/제안 없음' },
};

export default function FeedDemoPage() {
  const [demoState, setDemoState] = useState<DemoState>('normal');
  const [activeTab, setActiveTab] = useState('all');
  const [suggestions, setSuggestions] = useState(DEMO_SUGGESTIONS);

  const handleShoutOut = (id: string) => {
    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, shout_out_count: s.shout_out_count + 1 } : s
      )
    );
  };

  const filteredQuestions = DEMO_QUESTIONS.filter((q) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return q.status === 'active';
    if (activeTab === 'closed') return q.status === 'closed';
    return false;
  });

  const featuredQuestion = filteredQuestions.find((q) => q.is_featured);
  const regularQuestions = filteredQuestions.filter((q) => !q.is_featured);

  return (
    <div className="min-h-screen bg-white">
      {/* 상태 선택기 */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-border px-4 py-3">
        <p className="text-xs text-text-tertiary mb-2 font-mono">DEMO STATE</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(DEMO_STATES) as DemoState[]).map((s) => (
            <button
              key={s}
              onClick={() => setDemoState(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                demoState === s
                  ? 'bg-primary text-black'
                  : 'bg-bg-page text-text-secondary hover:bg-bg-active'
              }`}
            >
              {DEMO_STATES[s].label}
            </button>
          ))}
        </div>
        <p className="text-xs text-text-tertiary mt-2">{DEMO_STATES[demoState].description}</p>
      </div>

      {/* ── 로딩 상태 ── */}
      {demoState === 'loading' && (
        <main className="max-w-2xl mx-auto px-4 py-6 space-y-4" aria-busy="true">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-16 rounded-full bg-bg-page animate-pulse" />
            ))}
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-white animate-pulse" />
          ))}
        </main>
      )}

      {/* ── 에러 상태 ── */}
      {demoState === 'error' && (
        <main className="max-w-2xl mx-auto flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center">
            <p className="text-text-secondary mb-4">데이터를 불러오지 못했습니다.</p>
            <button className="text-primary underline text-sm">다시 시도</button>
          </div>
        </main>
      )}

      {/* ── 빈 상태 ── */}
      {demoState === 'empty' && (
        <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          <FilterTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
          <section aria-label="질문 목록" className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">질문</h2>
            <p className="text-text-tertiary text-sm py-8 text-center">
              해당 조건의 질문이 없습니다.
            </p>
          </section>
        </main>
      )}

      {/* ── 정상 상태 ── */}
      {demoState === 'normal' && (
        <main className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-6">
          <section aria-label="질문 필터">
            <FilterTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
          </section>

          <section aria-label="질문 목록" className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">질문</h2>

            {featuredQuestion && (
              <div className="mb-2">
                <QuestionCard
                  question={featuredQuestion}
                  userResponse={{ selected_option: '주 2회가 적당합니다' }}
                />
              </div>
            )}

            <ul className="space-y-3 list-none">
              {regularQuestions.map((q) => (
                <li key={q.id}>
                  <QuestionCard question={q} />
                </li>
              ))}
            </ul>
          </section>

          <section aria-label="제안 목록" className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">제안</h2>
            <ul className="space-y-3 list-none">
              {suggestions.map((s) => (
                <li key={s.id}>
                  <SuggestionCard suggestion={s} onShoutOut={handleShoutOut} />
                </li>
              ))}
            </ul>
          </section>
        </main>
      )}

      {/* FAB */}
      {demoState === 'normal' && (
        <FloatingActionButton
          label="궁금해요"
          icon={<Plus size={16} />}
          onClick={() => alert('/suggest 로 이동 (데모)')}
        />
      )}

      {/* 상태 정보 */}
      <div className="max-w-2xl mx-auto px-4 pb-32">
        <pre className="p-3 bg-white text-text-tertiary text-xs rounded-xl overflow-x-auto">
          {JSON.stringify(
            {
              demoState,
              activeTab,
              questionsCount: demoState === 'normal' ? filteredQuestions.length : 0,
              suggestionsCount: demoState === 'normal' ? suggestions.length : 0,
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}
