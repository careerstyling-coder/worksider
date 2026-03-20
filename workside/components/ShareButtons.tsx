// @TASK P2-S3-T2 - ShareButtons 컴포넌트 (공유 + 저장 CTA + 업그레이드)
// @SPEC docs/planning/03-user-flow.md#share
// @TEST __tests__/components/ShareButtons.test.tsx

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DNAVersion } from '@/types/database';

export interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  version?: DNAVersion;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({
  url,
  title,
  description,
  version,
}) => {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastTimer, setToastTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleTwitter = () => {
    const tweetText = description
      ? `${title}\n${description}`
      : title;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      if (toastTimer) clearTimeout(toastTimer);
      setToastVisible(true);
      const timer = setTimeout(() => {
        setToastVisible(false);
      }, 3000);
      setToastTimer(timer);
    } catch {
      // clipboard 실패 시 무시
    }
  };

  return (
    <div data-testid="share-buttons" className="flex flex-col gap-4">
      {/* SNS 공유 버튼 그룹 */}
      <div className="flex flex-wrap gap-3 justify-center">
        {/* Twitter 공유 */}
        <button
          data-testid="share-twitter"
          onClick={handleTwitter}
          aria-label="Twitter에 공유"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2] border border-[#1DA1F2]/20
            hover:bg-[#1DA1F2]/20 transition-all duration-200 text-sm font-medium"
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zM17.083 19.77h1.833L7.084 4.126H5.117L17.083 19.77z" />
          </svg>
          Twitter
        </button>

        {/* Facebook 공유 */}
        <button
          data-testid="share-facebook"
          onClick={handleFacebook}
          aria-label="Facebook에 공유"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1877F2]/10 text-[#1877F2] border border-[#1877F2]/20
            hover:bg-[#1877F2]/20 transition-all duration-200 text-sm font-medium"
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </button>

        {/* 링크 복사 */}
        <button
          data-testid="share-copy"
          onClick={handleCopy}
          aria-label="링크 복사"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-bg-active text-text-primary border border-border
            hover:bg-bg-active transition-all duration-200 text-sm font-medium"
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          링크 복사
        </button>
      </div>

      {/* Toast 알림 */}
      {toastVisible && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex justify-center"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-bg-page border border-border rounded-full text-text-primary text-sm">
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1877F2"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            링크가 복사되었습니다
          </span>
        </div>
      )}

      {/* SaveResultButton - 비회원 결과 저장 CTA */}
      <div className="flex justify-center">
        <Link
          href="/signup"
          data-testid="save-result-button"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-black font-semibold rounded-full text-sm
            hover:bg-primary-hover transition-all duration-200"
        >
          결과를 저장하려면 가입하세요
        </Link>
      </div>

      {/* UpgradeSection - 세미 → 풀 버전 업그레이드 CTA */}
      {version === 'semi' && (
        <section
          data-testid="upgrade-section"
          className="bg-bg-page border border-border rounded-2xl p-6 text-center flex flex-col items-center gap-3"
        >
          <p className="text-text-secondary text-sm">
            더 정밀한 진단을 원하시나요?
          </p>
          <Link
            href="/diagnosis"
            data-testid="upgrade-link"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-bg-active text-text-primary border border-border rounded-full
              text-sm font-medium hover:bg-bg-active transition-all duration-200"
          >
            풀 버전으로 업그레이드
          </Link>
        </section>
      )}
    </div>
  );
};
