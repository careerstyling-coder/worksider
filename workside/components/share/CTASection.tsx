// @TASK P2-S4-T1 - CTASection 컴포넌트
// @SPEC docs/planning/03-user-flow.md#share

import React from 'react';
import Link from 'next/link';

export const CTASection: React.FC = () => {
  return (
    <section
      data-testid="cta-section"
      className="bg-bg-page border border-border rounded-2xl p-8 text-center flex flex-col items-center gap-4"
    >
      <p className="text-text-secondary text-sm">
        이 결과는 나의 Work DNA 진단 결과입니다
      </p>
      <h3 className="text-xl md:text-2xl font-bold text-text-primary">
        나는 일을 어떻게 하는 사람일까?
      </h3>
      <Link
        href="/diagnosis"
        className="inline-block bg-primary text-black font-semibold px-8 py-3 rounded-full
          hover:bg-primary-hover transition-all duration-300 text-sm md:text-base"
      >
        3분 만에 나의 Work DNA를 확인해보세요
      </Link>
    </section>
  );
};
