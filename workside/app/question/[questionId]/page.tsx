// @TASK P3-S2-T1 - 질문 참여 페이지
// @SPEC docs/planning/02-trd.md#question-participation
// @TEST __tests__/app/question/page.test.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Users, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';

// ─────────────────────── 타입 ───────────────────────

interface QuestionOption {
  id?: string;
  label: string;
  value?: string;
}

interface Question {
  id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'active' | 'closed';
  participant_count: number;
  deadline: string | null;
  is_featured: boolean;
  options: QuestionOption[];
  created_at: string;
}

type Step = 'question' | 'submitted';

// ─────────────────────── 헬퍼 ───────────────────────

const STATUS_LABEL: Record<string, string> = {
  active: '진행중',
  closed: '마감',
  draft: '준비중',
};

const STATUS_STYLE: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400',
  closed: 'bg-bg-page text-text-tertiary',
  draft: 'bg-yellow-500/20 text-yellow-400',
};

function formatDeadline(deadline: string): string {
  const now = new Date();
  const end = new Date(deadline);
  const diffMs = end.getTime() - now.getTime();

  if (diffMs <= 0) return '마감됨';

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (diffDays > 0) return `${diffDays}일 남음`;
  if (diffHours > 0) return `${diffHours}시간 남음`;
  return '곧 마감';
}

// ─────────────────────── 서브 컴포넌트 ───────────────────────

interface QuestionHeaderProps {
  question: Question;
}

function QuestionHeader({ question }: QuestionHeaderProps) {
  const statusLabel = STATUS_LABEL[question.status] ?? question.status;
  const statusStyle = STATUS_STYLE[question.status] ?? 'bg-bg-page text-text-secondary';

  return (
    <header className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={cn('inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full', statusStyle)}>
          {statusLabel}
        </span>
        {question.deadline && (
          <span
            className="inline-flex items-center gap-1 text-xs text-text-tertiary"
            data-testid="deadline"
          >
            <Clock size={12} aria-hidden="true" />
            {formatDeadline(question.deadline)}
          </span>
        )}
      </div>

      <h1 className="text-xl font-bold text-text-primary leading-snug">
        {question.title}
      </h1>

      {question.description && (
        <p className="text-sm text-text-secondary leading-relaxed">
          {question.description}
        </p>
      )}
    </header>
  );
}

interface ParticipantCountProps {
  count: number;
}

function ParticipantCount({ count }: ParticipantCountProps) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-text-secondary">
      <Users size={14} aria-hidden="true" />
      <span>{count}명 참여</span>
    </div>
  );
}

interface OptionSelectorProps {
  options: QuestionOption[];
  selectedOption: string | null;
  disabled?: boolean;
  onSelect: (value: string) => void;
}

function OptionSelector({ options, selectedOption, disabled, onSelect }: OptionSelectorProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="sr-only">응답 선택</legend>
      {options.map((opt) => {
        const optValue = opt.value || opt.id || opt.label;
        const isSelected = selectedOption === optValue;
        return (
          <label
            key={optValue}
            data-selected={isSelected ? 'true' : undefined}
            className={cn(
              'flex items-center gap-3 w-full rounded-xl border p-4 cursor-pointer transition-all duration-200',
              isSelected
                ? 'border-primary/60 bg-primary-light text-text-primary'
                : 'border-border bg-bg-page text-text-secondary hover:border-border hover:bg-white',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <input
              type="radio"
              name="question-option"
              value={optValue}
              checked={isSelected}
              disabled={disabled}
              aria-checked={isSelected}
              onChange={() => !disabled && onSelect(optValue)}
              className="sr-only"
              role="radio"
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
  );
}

function GuestWarningBanner() {
  return (
    <aside className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <AlertCircle size={16} className="text-primary shrink-0" aria-hidden="true" />
        <p className="text-sm text-text-secondary">결과를 보려면 가입하세요</p>
      </div>
      <Link
        href="/signup"
        className="text-sm font-semibold text-primary underline underline-offset-2 hover:text-[#b8ef00] whitespace-nowrap"
        aria-label="회원가입"
      >
        가입하기
      </Link>
    </aside>
  );
}

interface ConfirmationMessageProps {
  questionId: string;
}

function ConfirmationMessage({ questionId }: ConfirmationMessageProps) {
  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-4">
      <div className="flex justify-center">
        <CheckCircle2 size={48} className="text-emerald-400" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-text-primary">응답이 저장되었습니다</h2>
        <p className="text-sm text-text-secondary">소중한 의견 감사합니다.</p>
      </div>
      <Link
        href={`/question/${questionId}/result`}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-black font-semibold text-sm px-5 py-2.5 hover:bg-[#b8ef00] transition-colors"
      >
        결과 보기
      </Link>
    </div>
  );
}

interface NavigationButtonsProps {
  questionId: string;
}

function NavigationButtons({ questionId }: NavigationButtonsProps) {
  const router = useRouter();

  // 실제 이전/다음 질문 ID를 알기 위해서는 목록 API가 필요하지만
  // 현재 스펙 상 단순히 버튼을 제공하고 피드로 복귀
  return (
    <nav aria-label="질문 탐색" className="flex gap-3">
      <Button
        variant="secondary"
        size="md"
        className="flex-1"
        onClick={() => router.back()}
        aria-label="이전 질문"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        이전 질문
      </Button>
      <Button
        variant="secondary"
        size="md"
        className="flex-1"
        onClick={() => router.push('/feed')}
        aria-label="다음 질문"
      >
        다음 질문
        <ChevronRight size={16} aria-hidden="true" />
      </Button>
    </nav>
  );
}

// ─────────────────────── 페이지 ───────────────────────

export default function QuestionPage() {
  const params = useParams();
  const questionId = params?.questionId as string;

  const [step, setStep] = useState<Step>('question');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 질문 데이터 로드
  useEffect(() => {
    if (!questionId) return;

    const controller = new AbortController();

    async function loadQuestion() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/questions/${questionId}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('질문을 불러오지 못했습니다.');
        const json = await res.json();
        setQuestion(json.data);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError((err as Error).message || '오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadQuestion();
    return () => controller.abort();
  }, [questionId]);

  // 제출 핸들러
  async function handleSubmit() {
    if (!selectedOption || !questionId) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/questions/${questionId}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected_option: selectedOption }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || '제출에 실패했습니다.');
      }

      setStep('submitted');
    } catch (err) {
      setSubmitError((err as Error).message || '제출 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── 로딩 ──
  if (loading) {
    return (
      <main
        className="min-h-screen bg-white px-4 py-8"
        aria-busy="true"
        data-testid="question-loading"
      >
        <div className="max-w-xl mx-auto space-y-5">
          <div className="h-6 w-24 rounded-full bg-bg-page animate-pulse" />
          <div className="h-8 w-3/4 rounded-lg border border-border bg-white animate-pulse" />
          <div className="h-4 w-full rounded bg-white animate-pulse" />
          <div className="space-y-3 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-white animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  // ── 에러 ──
  if (error || !question) {
    return (
      <main
        className="min-h-screen bg-white flex items-center justify-center px-4"
        data-testid="question-error"
      >
        <div className="text-center space-y-3">
          <AlertCircle size={40} className="text-error mx-auto" aria-hidden="true" />
          <p className="text-text-secondary">{error || '질문을 불러오지 못했습니다.'}</p>
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

  const isClosed = question.status === 'closed';

  return (
    <main className="min-h-screen bg-white pb-24">
      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">

        {/* 질문 헤더 */}
        <QuestionHeader question={question} />

        {/* 참여자 수 */}
        <ParticipantCount count={question.participant_count} />

        {/* 제출 완료 상태 */}
        {step === 'submitted' ? (
          <ConfirmationMessage questionId={questionId} />
        ) : (
          <>
            {/* 옵션 선택기 */}
            <section aria-label="응답 선택">
              <OptionSelector
                options={question.options}
                selectedOption={selectedOption}
                disabled={isClosed}
                onSelect={setSelectedOption}
              />
            </section>

            {/* 비회원 경고 배너 */}
            <GuestWarningBanner />

            {/* 제출 에러 */}
            {submitError && (
              <p className="text-sm text-error text-center" role="alert">
                {submitError}
              </p>
            )}

            {/* 제출 버튼 */}
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!selectedOption || isClosed || submitting}
              loading={submitting}
              onClick={handleSubmit}
              aria-label="응답하기"
            >
              응답하기
            </Button>
          </>
        )}

        {/* 네비게이션 버튼 */}
        <NavigationButtons questionId={questionId} />
      </div>
    </main>
  );
}
