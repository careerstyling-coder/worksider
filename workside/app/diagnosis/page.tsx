'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { SEMI_QUESTIONS, FULL_QUESTIONS, type DNAQuestion } from '@/constants/dna-questions';
import { Button } from '@/components/ui/Button';

type DiagnosisStep = 'version_select' | 'question' | 'loading';
type DiagnosisVersion = 'semi' | 'full';

// ─── VersionCard ────────────────────────────────────────────────────────────

function VersionCard({ version, title, duration, questionCount, description, onClick }: {
  version: DiagnosisVersion; title: string; duration: string; questionCount: string; description: string; onClick: () => void;
}) {
  const isSemi = version === 'semi';
  return (
    <button
      type="button"
      data-testid={`version-card-${version}`}
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-lg border p-6 transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        'border-border bg-white',
        'hover:border-primary hover:shadow-md hover:bg-primary-light',
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span className={cn(
          'text-xs font-semibold px-2.5 py-1 rounded-full',
          isSemi ? 'bg-primary-light text-primary' : 'bg-bg-active text-text-secondary'
        )}>
          {isSemi ? '추천' : '심층'}
        </span>
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-1">{title}</h3>
      <div className="flex items-center gap-3 mb-3">
        <span className={cn('text-sm font-medium', isSemi ? 'text-primary' : 'text-text-secondary')}>{duration}</span>
        <span className="text-border">·</span>
        <span className={cn('text-sm font-medium', isSemi ? 'text-primary' : 'text-text-secondary')}>{questionCount}</span>
      </div>
      <p className="text-sm text-text-secondary">{description}</p>
    </button>
  );
}

// ─── LikertScale ────────────────────────────────────────────────────────────

function LikertScale({ value, onChange, questionId }: { value: number | null; onChange: (value: number) => void; questionId: string }) {
  return (
    <div data-testid="likert-scale" role="radiogroup" aria-label="응답 척도 (1-7)">
      <div className="flex items-center justify-between gap-1 mb-3">
        {[1, 2, 3, 4, 5, 6, 7].map((v) => (
          <label key={v} className="flex flex-col items-center gap-1.5 cursor-pointer group">
            <input type="radio" name={`likert-${questionId}`} value={String(v)} checked={value === v} onChange={() => onChange(v)} className="sr-only" />
            <span className={cn(
              'w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all duration-150',
              value === v
                ? 'bg-primary border-primary text-white scale-110'
                : 'border-border text-text-secondary group-hover:border-primary group-hover:text-primary group-hover:bg-primary-light group-hover:scale-105'
            )} aria-hidden="true">{v}</span>
          </label>
        ))}
      </div>
      <div className="flex justify-between px-1">
        <span className="text-xs text-text-tertiary">전혀 아니다</span>
        <span className="text-xs text-text-tertiary">매우 그렇다</span>
      </div>
    </div>
  );
}

// ─── ProgressBar ────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const percent = (current / total) * 100;
  return (
    <div data-testid="progress-bar" className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">{current}/{total}</span>
        <span className="text-xs text-text-tertiary">{Math.round(percent)}%</span>
      </div>
      <div className="h-1.5 w-full bg-bg-active rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${percent}%` }} role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total} />
      </div>
    </div>
  );
}

// ─── QuestionCard ────────────────────────────────────────────────────────────

function QuestionCard({ question, currentIndex, total, selectedValue, onValueChange, onNext, onPrev, isFirst, isLast }: {
  question: DNAQuestion; currentIndex: number; total: number; selectedValue: number | null;
  onValueChange: (value: number) => void; onNext: () => void; onPrev: () => void; isFirst: boolean; isLast: boolean;
}) {
  return (
    <div data-testid="question-card" className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span data-testid="question-progress" className="text-sm font-medium text-text-secondary">{currentIndex + 1}/{total}</span>
          <span className="text-xs text-text-tertiary">{question.axis} 축</span>
        </div>
        <ProgressBar current={currentIndex + 1} total={total} />
      </div>
      <div className="py-4">
        <p data-testid="question-text" className="text-xl font-semibold text-text-primary leading-relaxed">{question.text}</p>
      </div>
      <LikertScale value={selectedValue} onChange={onValueChange} questionId={question.id} />
      <div className="flex gap-3">
        <Button data-testid="prev-button" variant="secondary" size="lg" className="flex-1" disabled={isFirst} onClick={onPrev}>이전</Button>
        <Button data-testid="next-button" variant="primary" size="lg" className="flex-1" disabled={selectedValue === null} onClick={onNext}>{isLast ? '완료' : '다음'}</Button>
      </div>
    </div>
  );
}

// ─── LoadingState ────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div data-testid="loading-state" className="flex flex-col items-center justify-center gap-6 py-16" role="status" aria-live="polite">
      <div className="w-12 h-12 rounded-full border-2 border-bg-active border-t-primary animate-spin" />
      <p className="text-text-secondary text-sm font-medium">당신의 성장 DNA를 분석하고 있어요...</p>
    </div>
  );
}

// ─── DiagnosisPage ──────────────────────────────────────────────────────────

export default function DiagnosisPage() {
  const router = useRouter();
  const [step, setStep] = useState<DiagnosisStep>('version_select');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [version, setVersion] = useState<DiagnosisVersion | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});

  const questions: DNAQuestion[] = version === 'full' ? FULL_QUESTIONS : SEMI_QUESTIONS;
  const currentQuestion = questions[currentIndex];
  const currentValue = currentQuestion ? (responses[currentQuestion.id] ?? null) : null;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;

  const handleVersionSelect = useCallback(async (selectedVersion: DiagnosisVersion) => {
    setVersion(selectedVersion);
    try {
      const res = await fetch('/api/dna/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ version: selectedVersion }) });
      if (res.ok) { const json = await res.json(); setSessionId(json.data?.id ?? null); }
    } catch { setSessionId('mock-session'); }
    setCurrentIndex(0);
    setResponses({});
    setStep('question');
  }, []);

  const handleValueChange = useCallback((value: number) => {
    if (!currentQuestion) return;
    setResponses((prev) => ({ ...prev, [currentQuestion.id]: value }));
  }, [currentQuestion]);

  const saveResponse = useCallback(async (questionId: string, value: number, sid: string | null) => {
    if (!sid) return;
    try { await fetch('/api/dna/responses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sid, question_id: questionId, value }) }); } catch {}
  }, []);

  const handleNext = useCallback(async () => {
    if (!currentQuestion || currentValue === null) return;
    await saveResponse(currentQuestion.id, currentValue, sessionId);
    if (!isLast) { setCurrentIndex((prev) => prev + 1); }
    else {
      setStep('loading');
      if (sessionId) {
        try { await fetch(`/api/dna/sessions/${sessionId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'completed' }) }); } catch {}
      }
      router.push(`/result/${sessionId}`);
    }
  }, [currentQuestion, currentValue, isLast, sessionId, saveResponse, router]);

  const handlePrev = useCallback(() => { if (!isFirst) setCurrentIndex((prev) => prev - 1); }, [isFirst]);

  return (
    <div className="min-h-screen bg-bg-page flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg bg-white rounded-lg border border-border p-8 shadow-sm">
        <div className="mb-8 text-center">
          <span className="text-xl font-bold text-primary">Workside</span>
        </div>
        {step === 'version_select' && (
          <div data-testid="version-selector" className="space-y-4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-text-primary mb-2">나를 발견하는 시간</h1>
              <p className="text-text-secondary text-sm">어떤 깊이로 나를 알아볼까요?</p>
            </div>
            <VersionCard version="semi" title="세미 진단" duration="3분" questionCount="12문항" description="짧지만 강력한 발견. 나의 핵심 성향을 만나보세요" onClick={() => handleVersionSelect('semi')} />
            <VersionCard version="full" title="풀 진단" duration="10분" questionCount="40문항" description="더 깊이 들여다보는 시간. 나의 성장 지도가 완성돼요" onClick={() => handleVersionSelect('full')} />
          </div>
        )}
        {step === 'question' && currentQuestion && (
          <QuestionCard question={currentQuestion} currentIndex={currentIndex} total={questions.length} selectedValue={currentValue} onValueChange={handleValueChange} onNext={handleNext} onPrev={handlePrev} isFirst={isFirst} isLast={isLast} />
        )}
        {step === 'loading' && <LoadingState />}
      </div>
    </div>
  );
}
