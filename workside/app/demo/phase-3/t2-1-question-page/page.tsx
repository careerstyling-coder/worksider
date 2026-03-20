// @TASK P3-S2-T1 - 질문 참여 페이지 데모
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Users, Clock, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

// ─────────────────────── 데모 목 데이터 ───────────────────────

const mockQuestion = {
  id: 'demo-q-1',
  title: '직장 내 의사소통 방식을 개선하려면?',
  description: '최근 직장 내 커뮤니케이션 문제가 발생하고 있습니다. 가장 효과적인 개선 방법을 선택해 주세요.',
  status: 'active' as const,
  participant_count: 456,
  deadline: '2026-04-01T00:00:00Z',
  is_featured: false,
  options: [
    { label: '주간 회의 추가', value: 'add_weekly_meeting' },
    { label: '슬랙 채널 개설', value: 'slack_channel' },
    { label: '문서화 강화', value: 'documentation' },
  ],
};

type DemoState = 'loading' | 'normal' | 'submitted' | 'closed' | 'error';

const DEMO_STATES: { key: DemoState; label: string }[] = [
  { key: 'loading', label: '로딩' },
  { key: 'normal', label: '기본' },
  { key: 'submitted', label: '제출 완료' },
  { key: 'closed', label: '마감' },
  { key: 'error', label: '에러' },
];

// ─────────────────────── 미니 컴포넌트 (데모용) ───────────────────────

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = { active: '진행중', closed: '마감', draft: '준비중' };
  const styles: Record<string, string> = {
    active: 'bg-emerald-500/20 text-emerald-400',
    closed: 'bg-bg-page text-text-tertiary',
    draft: 'bg-yellow-500/20 text-yellow-400',
  };
  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', styles[status] ?? 'bg-bg-page text-text-secondary')}>
      {labels[status] ?? status}
    </span>
  );
}

// ─────────────────────── 데모 페이지 ───────────────────────

export default function QuestionPageDemo() {
  const [demoState, setDemoState] = useState<DemoState>('normal');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const question = demoState === 'closed'
    ? { ...mockQuestion, status: 'closed' as const }
    : mockQuestion;

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-xl mx-auto space-y-8">

        {/* 데모 컨트롤 */}
        <div className="rounded-xl border border-border bg-bg-page p-4 space-y-3">
          <p className="text-xs text-text-tertiary font-mono">DEMO: QuestionPage (P3-S2-T1)</p>
          <div className="flex gap-2 flex-wrap">
            {DEMO_STATES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  setDemoState(key);
                  setSelectedOption(null);
                }}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  demoState === key
                    ? 'bg-primary text-black'
                    : 'bg-bg-page text-text-secondary hover:bg-bg-active'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── 로딩 상태 ── */}
        {demoState === 'loading' && (
          <div aria-busy="true" data-testid="question-loading" className="space-y-5">
            <div className="h-6 w-24 rounded-full bg-bg-page animate-pulse" />
            <div className="h-8 w-3/4 rounded-lg border border-border bg-white animate-pulse" />
            <div className="h-4 w-full rounded bg-white animate-pulse" />
            <div className="space-y-3 mt-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-white animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {/* ── 에러 상태 ── */}
        {demoState === 'error' && (
          <div className="flex flex-col items-center gap-4 py-12" data-testid="question-error">
            <AlertCircle size={40} className="text-error" />
            <p className="text-text-secondary">질문을 불러오지 못했습니다.</p>
            <button className="text-primary underline text-sm">다시 시도</button>
          </div>
        )}

        {/* ── 정상 / 마감 상태 ── */}
        {(demoState === 'normal' || demoState === 'closed') && (
          <div className="space-y-6">
            {/* QuestionHeader */}
            <header className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={question.status} />
                {question.deadline && (
                  <span className="flex items-center gap-1 text-xs text-text-tertiary" data-testid="deadline">
                    <Clock size={12} />
                    2일 남음
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-text-primary">{question.title}</h1>
              <p className="text-sm text-text-secondary">{question.description}</p>
            </header>

            {/* ParticipantCount */}
            <div className="flex items-center gap-1.5 text-sm text-text-secondary">
              <Users size={14} />
              <span>{question.participant_count}명 참여</span>
            </div>

            {/* OptionSelector */}
            <fieldset className="space-y-3">
              <legend className="sr-only">응답 선택</legend>
              {question.options.map((opt) => {
                const isSelected = selectedOption === opt.value;
                return (
                  <label
                    key={opt.value}
                    data-selected={isSelected ? 'true' : undefined}
                    className={cn(
                      'flex items-center gap-3 w-full rounded-xl border p-4 cursor-pointer transition-all duration-200',
                      isSelected
                        ? 'border-primary/60 bg-primary-light text-text-primary'
                        : 'border-border bg-bg-page text-text-secondary hover:border-border hover:bg-white',
                      demoState === 'closed' && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    <input
                      type="radio"
                      name="demo-option"
                      value={opt.value}
                      checked={isSelected}
                      disabled={demoState === 'closed'}
                      onChange={() => demoState !== 'closed' && setSelectedOption(opt.value)}
                      className="sr-only"
                      role="radio"
                      aria-checked={isSelected}
                    />
                    <span
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                        isSelected ? 'border-primary bg-primary' : 'border-white/30'
                      )}
                      aria-hidden="true"
                    >
                      {isSelected && <span className="w-2 h-2 rounded-full bg-black" />}
                    </span>
                    <span className="text-sm font-medium">{opt.label}</span>
                  </label>
                );
              })}
            </fieldset>

            {/* GuestWarningBanner */}
            <aside className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-primary shrink-0" />
                <p className="text-sm text-text-secondary">결과를 보려면 가입하세요</p>
              </div>
              <Link href="/signup" className="text-sm font-semibold text-primary underline underline-offset-2 whitespace-nowrap" aria-label="회원가입">
                가입하기
              </Link>
            </aside>

            {/* SubmitButton */}
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!selectedOption || demoState === 'closed'}
              aria-label="응답하기"
            >
              응답하기
            </Button>
          </div>
        )}

        {/* ── 제출 완료 상태 ── */}
        {demoState === 'submitted' && (
          <div className="space-y-6">
            {/* ConfirmationMessage */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-4">
              <CheckCircle2 size={48} className="text-emerald-400 mx-auto" />
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-text-primary">응답이 저장되었습니다</h2>
                <p className="text-sm text-text-secondary">소중한 의견 감사합니다.</p>
              </div>
              <Link
                href="/question/demo-q-1/result"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-black font-semibold text-sm px-5 py-2.5 hover:bg-[#b8ef00]"
              >
                결과 보기
              </Link>
            </div>

            {/* NavigationButtons */}
            <nav aria-label="질문 탐색" className="flex gap-3">
              <Button variant="secondary" size="md" className="flex-1" aria-label="이전 질문">
                <ChevronLeft size={16} />
                이전 질문
              </Button>
              <Button variant="secondary" size="md" className="flex-1" aria-label="다음 질문">
                다음 질문
                <ChevronRight size={16} />
              </Button>
            </nav>
          </div>
        )}

        {/* 상태 정보 */}
        <details className="mt-4">
          <summary className="text-xs text-text-tertiary cursor-pointer">Props / State</summary>
          <pre className="mt-2 p-3 bg-bg-page text-xs text-text-secondary rounded-lg overflow-auto">
            {JSON.stringify({ demoState, selectedOption, question }, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
