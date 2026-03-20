'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Dna, MessageCircle, Share2, Shield } from 'lucide-react';

// ── 후기 데이터 ──

const testimonials = [
  { name: 'growth_hacker', role: 'PM', text: '3분 만에 제 업무 스타일을 정확히 짚어줬어요.' },
  { name: 'dev_master', role: '개발자', text: '다른 직군 사람들의 시각을 알게 됐어요.' },
  { name: 'mkt_queen', role: '마케터', text: '페르소나별 분석이 실무에 큰 도움이 됩니다.' },
  { name: 'free_creator', role: '디자이너', text: '자기 이해의 좋은 출발점이었습니다.' },
  { name: 'plan_yujin', role: '기획자', text: '동료와 공유하니 서로를 더 깊이 이해하게 됐어요.' },
];

// ── 핵심 가치 ──

const values = [
  { icon: Dna, text: '가입 없이 3분 진단' },
  { icon: Share2, text: '공유하면 서로를 이해' },
  { icon: MessageCircle, text: '질문으로 함께 성장' },
  { icon: Shield, text: '이메일만으로 이용' },
];

// ── 롤링 후기 ──

function RollingTestimonials() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % testimonials.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const t = testimonials[current];

  return (
    <div className="min-h-[56px] flex items-center justify-center overflow-hidden px-2">
      <div key={current} className="flex items-center gap-2.5 animate-fade-in max-w-full">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary-light flex items-center justify-center text-[11px] sm:text-xs font-bold text-primary shrink-0">
          {t.name[0].toUpperCase()}
        </div>
        <p className="text-[13px] sm:text-sm text-text-secondary leading-snug">
          &ldquo;{t.text}&rdquo;
          <span className="block sm:inline sm:ml-1.5 text-text-tertiary text-[11px] sm:text-xs">— {t.name}</span>
        </p>
      </div>
    </div>
  );
}

// ── 메인 ──

export default function LandingHero() {
  return (
    <section className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 sm:px-6 py-8">
      <div className="w-full max-w-md sm:max-w-lg text-center">

        {/* 타이틀 */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary leading-tight">
          나를 발견하는 첫 걸음
          <br />
          <span className="text-primary">Workstyle DNA</span>
        </h1>

        <p className="mt-3 sm:mt-4 text-[15px] sm:text-base text-text-secondary leading-relaxed">
          나는 일을 어떻게 하는 사람일까?
          <br />
          3분이면 내 업무 성향의 실마리를 찾을 수 있어요
        </p>

        {/* 핵심 가치 (2x2 그리드) */}
        <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-x-6 gap-y-2 justify-items-center max-w-sm mx-auto">
          {values.map((v, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[13px] sm:text-sm text-text-secondary">
              <v.icon size={15} className="text-primary shrink-0" />
              <span>{v.text}</span>
            </div>
          ))}
        </div>

        {/* 후기 롤링 (CTA 위) */}
        <div className="mt-6 sm:mt-8">
          <RollingTestimonials />
        </div>

        {/* CTA */}
        <div className="mt-5 sm:mt-6 flex flex-col items-center gap-2.5 sm:flex-row sm:justify-center sm:gap-3">
          <Link
            href="/diagnosis"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-[15px] font-semibold text-white hover:bg-primary-hover active:scale-[0.98] transition"
          >
            나를 발견하러 가기
          </Link>
          <Link
            href="/feed"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-border bg-white px-8 py-3 text-[15px] font-medium text-text-primary hover:bg-bg-hover active:scale-[0.98] transition"
          >
            다른 사람들은 어떨까?
          </Link>
        </div>

        {/* 서비스 소개 링크 */}
        <div className="mt-4">
          <Link href="/about" className="text-[13px] text-text-tertiary hover:text-primary transition">
            Workside가 더 궁금하신가요? →
          </Link>
        </div>
      </div>
    </section>
  );
}
