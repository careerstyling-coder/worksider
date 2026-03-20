'use client';

import Link from 'next/link';

export default function CTASection() {
  return (
    <section data-testid="cta-section" className="bg-primary py-16 px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold text-white">성장은 나를 아는 것에서 시작됩니다</h2>
        <p className="mt-2 text-blue-100">지금 이 순간, 나를 발견하는 여정을 시작해볼까요?</p>
        <Link href="/diagnosis" className="mt-8 inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 text-[15px] font-semibold text-primary hover:bg-blue-50 transition">
          무료 진단 시작
        </Link>
      </div>
    </section>
  );
}
