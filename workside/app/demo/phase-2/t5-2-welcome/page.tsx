'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function WelcomeDemoPage() {
  return (
    <div className="min-h-screen bg-bg-page flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold text-primary">Workside</span>
        </div>

        {/* 환영 메시지 */}
        <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
          {/* 체크 아이콘 */}
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-2">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="#31A24C" strokeWidth="2" />
              <path d="M12 20l6 6 10-12" stroke="#31A24C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-text-primary">함께하게 되어 반갑습니다! 🎉</h2>
          <p className="text-[15px] text-text-secondary leading-relaxed max-w-sm">
            이제부터 함께 성장하는 여정이 시작돼요.<br />
            첫 번째 발견을 시작해볼까요?<br />
            3분이면 나의 Workstyle DNA를 만날 수 있어요.
          </p>

          {/* 다음 단계 */}
          <div className="w-full mt-4 space-y-3">
            <Link
              href="/diagnosis"
              className="flex items-center justify-between w-full px-5 py-4 rounded-lg border border-primary bg-primary-light hover:bg-blue-50 transition group"
            >
              <div className="text-left">
                <span className="text-[15px] font-semibold text-primary">나를 발견하러 가기</span>
                <span className="block text-[13px] text-text-secondary mt-0.5">3분이면 나의 성장 지도가 그려져요</span>
              </div>
              <ChevronRight className="text-primary group-hover:translate-x-0.5 transition-transform" size={20} />
            </Link>

            <Link
              href="/feed"
              className="flex items-center justify-between w-full px-5 py-4 rounded-lg border border-border bg-white hover:bg-bg-hover transition group"
            >
              <div className="text-left">
                <span className="text-[15px] font-semibold text-text-primary">피드 둘러보기</span>
                <span className="block text-[13px] text-text-secondary mt-0.5">다른 직장인들의 질문과 인사이트를 확인하세요</span>
              </div>
              <ChevronRight className="text-text-tertiary group-hover:translate-x-0.5 transition-transform" size={20} />
            </Link>
          </div>

          <p className="text-[13px] text-text-tertiary mt-2">아래에서 다음 단계를 선택해주세요</p>
        </div>
      </div>
    </div>
  );
}
