'use client';

// @TASK P2-S2-T1 - SNS 공유 버튼 컴포넌트
// @SPEC specs/screens/prelaunch/reserved
// @NOTE P2-S2-T2에서 실제 SNS API 연동 예정

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
      <p className="text-white/70 text-sm font-medium">공유하기</p>
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
          className="flex-1 flex items-center justify-center gap-2 bg-black border border-white/20 text-white font-semibold py-3 px-4 rounded-xl hover:bg-white/5 transition-colors"
          aria-label="트위터(X)로 공유"
        >
          <span>트위터(X)</span>
        </button>
        <button
          onClick={onCopyClick}
          className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white font-semibold py-3 px-4 rounded-xl hover:bg-white/15 transition-colors"
          aria-label="링크 복사"
        >
          <span>링크 복사</span>
        </button>
      </div>
    </div>
  );
}
