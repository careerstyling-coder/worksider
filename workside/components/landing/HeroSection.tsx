'use client';

import Link from 'next/link';

export default function HeroSection() {
  return (
    <section data-testid="hero-section" className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-24 text-center sm:py-32">
        <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
          나를 발견하는 첫 걸음<br />
          <span className="text-primary">Workstyle DNA</span>
        </h1>
        <p className="mt-4 text-lg text-text-secondary leading-relaxed">
          나는 일을 어떻게 하는 사람일까? 3분이면 내 업무 성향의 실마리를 찾을 수 있어요
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <Link href="/diagnosis" className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-[15px] font-semibold text-white hover:bg-primary-hover transition">
            나를 발견하러 가기
          </Link>
          <Link href="/feed" className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-border bg-white px-8 py-3 text-[15px] font-semibold text-text-primary hover:bg-bg-hover transition">
            다른 사람들은 어떨까?
          </Link>
        </div>
      </div>
    </section>
  );
}
