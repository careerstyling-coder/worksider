'use client';

// @TASK P2-S1-T1 - 랜딩 페이지 HeroSection (공감 메시지 롤링, 라이트 테마)
// @SPEC specs/screens/prelaunch/landing

import { useState, useEffect, useCallback } from 'react';

const EMPATHY_SLIDES = [
  {
    hook: '같은 팀인데,\n왜 나만 다르게 일할까?',
    body: '매일 반복되는 회의, 끝없는 슬랙 메시지.\n그 안에서 나만의 리듬을 찾지 못한 당신에게.',
    cta: '당신의 일 스타일을 먼저 발견하세요.',
  },
  {
    hook: '열심히 했는데,\n왜 인정받지 못할까?',
    body: '일하는 방식이 다를 뿐인데\n성과가 안 보이는 건 아닙니다.',
    cta: '당신의 일하는 방식엔 이유가 있습니다.',
  },
  {
    hook: '3년차, 5년차, 10년차...\n나는 성장하고 있을까?',
    body: '연차는 쌓이는데 방향이 안 보일 때,\n먼저 나를 아는 것부터 시작합니다.',
    cta: '나만의 Work DNA를 발견하세요.',
  },
];

const INTERVAL_MS = 5000;

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback((index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrent(index);
      setIsTransitioning(false);
    }, 400);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % EMPATHY_SLIDES.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [current, goTo]);

  const slide = EMPATHY_SLIDES[current];

  return (
    <section className="bg-white px-6 pt-10 pb-6 text-center">
      <div className="max-w-2xl mx-auto">
        {/* 배지 */}
        <span className="inline-block mb-5 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-sm font-medium tracking-wide">
          Workside 프리론칭
        </span>

        {/* 공감 메시지 롤링 */}
        <div
          data-testid="empathy-slide"
          className={`min-h-[160px] flex flex-col justify-center transition-opacity duration-400 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-4 whitespace-pre-line">
            {slide.hook}
          </h1>

          <p className="text-base sm:text-lg text-slate-500 leading-relaxed mb-4 whitespace-pre-line">
            {slide.body}
          </p>

          <p className="text-indigo-600 text-base font-semibold">
            {slide.cta}
          </p>
        </div>

        {/* 인디케이터 */}
        <div className="flex items-center justify-center gap-2 mt-4" role="tablist">
          {EMPATHY_SLIDES.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={`슬라이드 ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-8 bg-indigo-500'
                  : 'w-2 bg-slate-200 hover:bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
