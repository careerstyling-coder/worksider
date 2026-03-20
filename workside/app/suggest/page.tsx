// @TASK P3-S4-T1 - 궁금합니다 폼 페이지
// @SPEC docs/planning/suggest-page.md
// @TEST __tests__/app/suggest/page.test.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';

// ─── 타입 ─────────────────────────────────────────────────────────────────────

interface FormData {
  title: string;
  background: string;
  publicDiscussion: boolean;
  formalRequest: boolean;
}

interface Suggestion {
  id: string;
  title: string;
  status: string;
  shout_out_count?: number;
  user_id?: string;
}

const INITIAL_FORM: FormData = {
  title: '',
  background: '',
  publicDiscussion: false,
  formalRequest: false,
};

// ─── CharacterCounter ─────────────────────────────────────────────────────────

interface CharacterCounterProps {
  current: number;
  max: number;
}

function CharacterCounter({ current, max }: CharacterCounterProps) {
  const isNearLimit = current >= max * 0.9;
  return (
    <span
      className={cn(
        'text-xs tabular-nums',
        isNearLimit ? 'text-error' : 'text-text-tertiary'
      )}
      aria-live="polite"
    >
      {current}/{max}
    </span>
  );
}

// ─── InfoSection ──────────────────────────────────────────────────────────────

function InfoSection() {
  return (
    <section
      data-testid="info-section"
      className="rounded-2xl border border-primary/20 bg-primary/5 p-5"
      aria-label="안내"
    >
      <h2 className="text-xl font-bold text-primary mb-2">
        함께 나누고 싶은 궁금함이 있나요?
      </h2>
      <p className="text-text-secondary text-sm leading-relaxed">
        성장을 위한 질문과 아이디어를 자유롭게 나눠주세요.
        모든 내용은 함께 보고, Shout out이 모일수록 정식 설문으로 발전할 수 있어요.
      </p>
    </section>
  );
}

// ─── RecentSuggestions ────────────────────────────────────────────────────────

interface RecentSuggestionsProps {
  suggestions: Suggestion[];
  loading: boolean;
}

function RecentSuggestions({ suggestions, loading }: RecentSuggestionsProps) {
  return (
    <section
      data-testid="recent-suggestions"
      aria-label="최근 승인된 제안"
      className="mt-8"
    >
      <h2 className="text-base font-semibold text-text-secondary mb-3">
        최근 승인된 제안
      </h2>
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-white animate-pulse" />
          ))}
        </div>
      ) : suggestions.length === 0 ? (
        <p className="text-text-tertiary text-sm py-4 text-center">
          아직 승인된 제안이 없습니다.
        </p>
      ) : (
        <ul className="space-y-2 list-none">
          {suggestions.map((s) => (
            <li
              key={s.id}
              className="rounded-xl border border-border bg-[#F7F8FA] px-4 py-3"
            >
              <p className="text-sm text-text-secondary leading-snug">{s.title}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ─── SuccessMessage ───────────────────────────────────────────────────────────

interface SuccessMessageProps {
  onGoFeed: () => void;
  onAnotherSuggest: () => void;
}

function SuccessMessage({ onGoFeed, onAnotherSuggest }: SuccessMessageProps) {
  return (
    <div
      role="status"
      className="rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center space-y-4"
    >
      <div className="text-4xl">✓</div>
      <h2 className="text-xl font-bold text-primary">
        궁금함이 전달되었어요!
      </h2>
      <p className="text-text-secondary text-sm">
        검토 후 피드에 등록됩니다. 감사합니다.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Button
          variant="primary"
          size="md"
          onClick={onGoFeed}
        >
          피드로 돌아가기
        </Button>
        <Button
          variant="outline"
          size="md"
          onClick={onAnotherSuggest}
        >
          다른 제안
        </Button>
      </div>
    </div>
  );
}

// ─── SuggestPage ──────────────────────────────────────────────────────────────

export default function SuggestPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [recentSuggestions, setRecentSuggestions] = useState<Suggestion[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);

  // 최근 승인된 제안 fetch
  useEffect(() => {
    const controller = new AbortController();
    async function fetchRecent() {
      setRecentLoading(true);
      try {
        const res = await fetch(
          '/api/suggestions?status=approved&limit=5',
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error('fetch failed');
        const json = await res.json();
        setRecentSuggestions(json.data ?? []);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setRecentSuggestions([]);
        }
      } finally {
        setRecentLoading(false);
      }
    }
    fetchRecent();
    return () => controller.abort();
  }, []);

  // 폼 초기화
  const handleReset = useCallback(() => {
    setFormData(INITIAL_FORM);
    setSubmitError(null);
  }, []);

  // 제출
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          background: formData.background.trim() || undefined,
          publicDiscussion: formData.publicDiscussion,
          status: 'pending',
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? '제출에 실패했습니다. 다시 시도해주세요.');
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError((err as Error).message || '오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  }, [formData]);

  // 다른 제안 (폼 초기화 + submitted 해제)
  const handleAnotherSuggest = useCallback(() => {
    setFormData(INITIAL_FORM);
    setSubmitted(false);
    setSubmitError(null);
  }, []);

  // 피드로 이동
  const handleGoFeed = useCallback(() => {
    router.push('/feed');
  }, [router]);

  return (
    <main className="min-h-screen bg-white pb-24">
      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">

        {/* 페이지 제목 */}
        <header>
          <h1 className="text-2xl font-bold text-text-primary">궁금합니다</h1>
        </header>

        {/* 안내 섹션 */}
        <InfoSection />

        {/* 성공 메시지 또는 폼 */}
        {submitted ? (
          <SuccessMessage
            onGoFeed={handleGoFeed}
            onAnotherSuggest={handleAnotherSuggest}
          />
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5"
            aria-label="궁금합니다 폼"
          >
            {/* ── TitleInput ── */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="suggest-title"
                  className="block text-sm font-medium text-text-secondary"
                >
                  어떤 것이 궁금한가요?
                  <span className="text-error ml-1" aria-hidden="true">*</span>
                </label>
                <CharacterCounter
                  current={formData.title.length}
                  max={500}
                />
              </div>
              <input
                id="suggest-title"
                type="text"
                value={formData.title}
                maxLength={500}
                placeholder="함께 나누고 싶은 궁금함을 적어주세요"
                required
                aria-required="true"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className={cn(
                  'w-full rounded-xl border border-border bg-[#F7F8FA] px-4 py-3',
                  'text-text-primary placeholder:text-text-tertiary text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                  'transition-all duration-200'
                )}
              />
            </div>

            {/* ── BackgroundTextarea ── */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="suggest-background"
                  className="block text-sm font-medium text-text-secondary"
                >
                  왜 이것이 궁금한가요?
                  <span className="text-text-tertiary text-xs ml-1">(선택, 1000자 권장)</span>
                </label>
                <CharacterCounter
                  current={formData.background.length}
                  max={1000}
                />
              </div>
              <textarea
                id="suggest-background"
                value={formData.background}
                maxLength={1000}
                rows={5}
                placeholder="이 궁금함의 배경이나 맥락을 나눠주시면 더 깊은 대화가 시작돼요"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, background: e.target.value }))
                }
                className={cn(
                  'w-full rounded-xl border border-border bg-[#F7F8FA] px-4 py-3',
                  'text-text-primary placeholder:text-text-tertiary text-sm resize-none',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                  'transition-all duration-200'
                )}
              />
            </div>

            {/* 정식 설문 신청 */}
            <div className="rounded-xl border border-border bg-white px-4 py-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.formalRequest || false}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, formalRequest: e.target.checked }))
                  }
                  className="mt-0.5 h-4 w-4 rounded accent-primary cursor-pointer"
                />
                <div>
                  <span className="text-sm font-medium text-text-primary">정식 설문으로 신청</span>
                  <span className="block text-xs text-text-tertiary mt-0.5">
                    더 깊은 탐구가 필요하다면, 관리자 검토 후 정식 설문으로 발전시킬 수 있어요
                    미선택 시 채택되면 피드에서 함께 답을 찾아가요
                  </span>
                </div>
              </label>
            </div>

            {/* 공개 정책 안내 */}
            <div className="rounded-xl bg-[#F7F8FA] px-4 py-3">
              <p className="text-sm text-text-secondary leading-relaxed">
                📢 기입된 내용은 모든 이들의 피드에 공개됩니다.
                <span className="block text-xs text-text-tertiary mt-0.5">
                  Shout out이 많을수록 정식 설문으로 채택될 확률이 올라갑니다.
                </span>
              </p>
            </div>

            {/* 에러 메시지 */}
            {submitError && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-error"
              >
                {submitError}
              </div>
            )}

            {/* ── 버튼 그룹 ── */}
            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleReset}
                className="flex-1"
              >
                초기화
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={submitting}
                disabled={!formData.title.trim() || submitting}
                className="flex-[2]"
              >
                {submitting ? '제출 중...' : '궁금해요'}
              </Button>
            </div>
          </form>
        )}

        {/* ── RecentSuggestions ── */}
        <RecentSuggestions
          suggestions={recentSuggestions}
          loading={recentLoading}
        />
      </div>
    </main>
  );
}
