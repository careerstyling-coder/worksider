// @TASK P2-S4-T1 - InvalidSharePage 컴포넌트
// @SPEC docs/planning/03-user-flow.md#share

import React from 'react';
import Link from 'next/link';

export const InvalidSharePage: React.FC = () => {
  return (
    <div
      data-testid="invalid-share-page"
      className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4"
    >
      <div className="text-5xl mb-2" role="img" aria-label="오류">
        🔗
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
        이 링크는 더 이상 유효하지 않아요
      </h2>
      <p className="text-text-secondary text-sm md:text-base max-w-md">
        링크가 만료되었거나 올바르지 않습니다. 공유한 사람에게 다시 요청해보세요.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <Link
          href="/"
          className="inline-block bg-bg-active text-text-primary font-medium px-6 py-3 rounded-full
            hover:bg-bg-active transition-all duration-300 text-sm"
        >
          홈으로 돌아가기
        </Link>
        <Link
          href="/diagnosis"
          className="inline-block bg-primary text-black font-semibold px-6 py-3 rounded-full
            hover:bg-primary-hover transition-all duration-300 text-sm"
        >
          나의 Work DNA 진단하기
        </Link>
      </div>
    </div>
  );
};
