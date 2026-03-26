'use client';

// @TASK P2-S2-T1 - SNS 공유 버튼 컴포넌트
// @SPEC specs/screens/prelaunch/reserved

interface SocialShareButtonsProps {
  inviteCode: string;
  onKakaoClick?: () => void;
  onTwitterClick?: () => void;
  onCopyClick?: () => void;
}

export function SocialShareButtons({
  inviteCode,
  onKakaoClick,
  onTwitterClick,
  onCopyClick,
}: SocialShareButtonsProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-slate-500 text-sm font-medium">친구에게 공유하기</p>
      <div className="flex gap-3">
        <button
          onClick={onKakaoClick}
          className="flex-1 flex items-center justify-center gap-2 bg-[#FEE500] text-black font-semibold py-3 px-4 rounded-xl hover:bg-[#FEE500]/90 transition-colors"
          aria-label="카카오톡으로 공유"
        >
          <span>카카오톡</span>
        </button>
        <button
          onClick={onTwitterClick}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white font-semibold py-3 px-4 rounded-xl hover:bg-slate-800 transition-colors"
          aria-label="트위터(X)로 공유"
        >
          <span>트위터(X)</span>
        </button>
        <button
          onClick={onCopyClick}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-semibold py-3 px-4 rounded-xl hover:bg-slate-200 transition-colors border border-slate-200"
          aria-label="링크 복사"
        >
          <span>링크 복사</span>
        </button>
      </div>
    </div>
  );
}
