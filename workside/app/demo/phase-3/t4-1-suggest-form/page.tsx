'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

function CharacterCounter({ current, max }: { current: number; max: number }) {
  const ratio = current / max;
  return (
    <span className={cn('text-xs tabular-nums', ratio > 0.9 ? 'text-error' : ratio > 0.7 ? 'text-warning' : 'text-text-tertiary')}>
      {current}/{max}
    </span>
  );
}

const mockSuggestions = [
  { id: 's1', title: '직장인 독서 모임 운영에 대해 어떻게 생각하시나요?', shout_out_count: 31 },
  { id: 's2', title: '업무 중 음악 듣는 것에 대한 의견', shout_out_count: 12 },
  { id: 's3', title: '점심시간 활용법 — 운동 vs 휴식 vs 공부', shout_out_count: 24 },
];

export default function SuggestFormDemoPage() {
  const [title, setTitle] = useState('');
  const [background, setBackground] = useState('');
  const [formalRequest, setFormalRequest] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitted(true);
  }, [title]);

  const handleReset = () => { setTitle(''); setBackground(''); setFormalRequest(false); setSubmitted(false); };

  return (
    <div className="min-h-screen bg-bg-page">
      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">

        <header>
          <h1 className="text-2xl font-bold text-text-primary">궁금합니다</h1>
        </header>

        {/* 안내 */}
        <section className="rounded-lg border border-primary/20 bg-primary-light p-5">
          <h2 className="text-lg font-bold text-primary mb-2">함께 나누고 싶은 궁금함이 있나요?</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            성장을 위한 질문과 아이디어를 자유롭게 나눠주세요.
            모든 내용은 함께 보고, Shout out이 모일수록 정식 설문으로 발전할 수 있어요.
          </p>
        </section>

        {submitted ? (
          /* 성공 메시지 */
          <section className="bg-white rounded-lg border border-border p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" stroke="#31A24C" strokeWidth="2" /><path d="M10 16l5 5 7-9" stroke="#31A24C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-1">궁금함이 전달되었어요!</h2>
            <p className="text-sm text-text-secondary mb-6">함께 보고, Shout out이 모이면 정식 설문으로 발전해요</p>
            <div className="flex gap-3 justify-center">
              <Link href="/feed" className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition">피드로 돌아가기</Link>
              <button onClick={handleReset} className="px-5 py-2.5 bg-white border border-border text-text-primary rounded-lg text-sm font-medium hover:bg-bg-hover transition">다른 궁금합니다</button>
            </div>
          </section>
        ) : (
          /* 폼 */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 제목 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="title" className="text-sm font-medium text-text-secondary">어떤 것이 궁금한가요? <span className="text-error">*</span></label>
                <CharacterCounter current={title.length} max={500} />
              </div>
              <input
                id="title" type="text" value={title} maxLength={500}
                placeholder="함께 나누고 싶은 궁금함을 적어주세요"
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
            </div>

            {/* 배경 설명 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="bg" className="text-sm font-medium text-text-secondary">배경 설명 <span className="text-xs text-text-tertiary">(선택)</span></label>
                <CharacterCounter current={background.length} max={1000} />
              </div>
              <textarea
                id="bg" value={background} maxLength={1000} rows={4}
                placeholder="이 궁금함의 배경을 나눠주시면 더 깊은 대화가 시작돼요"
                onChange={(e) => setBackground(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition resize-none"
              />
            </div>

            {/* 정식 설문 신청 */}
            <div className="rounded-lg border border-border bg-white px-4 py-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={formalRequest} onChange={(e) => setFormalRequest(e.target.checked)} className="mt-0.5 h-4 w-4 rounded accent-primary cursor-pointer" />
                <div>
                  <span className="text-sm font-medium text-text-primary">정식 설문으로 신청</span>
                  <span className="block text-xs text-text-tertiary mt-0.5">관리자 검토 후 특정 대상자에게 정식 설문으로 배포됩니다.</span>
                </div>
              </label>
            </div>

            {/* 공개 정책 */}
            <div className="rounded-lg bg-[#F7F8FA] px-4 py-3">
              <p className="text-sm text-text-secondary leading-relaxed">
                📢 기입된 내용은 모든 이들의 피드에 공개됩니다.
                <span className="block text-xs text-text-tertiary mt-0.5">Shout out이 많을수록 정식 설문으로 채택될 확률이 올라갑니다.</span>
              </p>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <Button type="button" variant="outline" size="md" onClick={handleReset} className="flex-1">초기화</Button>
              <Button type="submit" variant="primary" size="md" disabled={!title.trim()} className="flex-[2]">궁금해요</Button>
            </div>
          </form>
        )}

        {/* 최근 궁금합니다 */}
        <section>
          <h3 className="text-[15px] font-semibold text-text-secondary mb-3">최근 궁금합니다</h3>
          <div className="space-y-2">
            {mockSuggestions.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-border hover:bg-bg-hover transition">
                <span className="text-sm text-text-primary">{s.title}</span>
                <span className="text-xs text-text-tertiary ml-2 shrink-0">🔊 {s.shout_out_count}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
