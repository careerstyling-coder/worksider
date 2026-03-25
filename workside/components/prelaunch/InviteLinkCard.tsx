'use client';

// @TASK P2-S2-T1 - 초대 링크 카드 컴포넌트
// @SPEC specs/screens/prelaunch/reserved

import { useState } from 'react';

interface InviteLinkCardProps {
  inviteCode: string;
}

export function InviteLinkCard({ inviteCode }: InviteLinkCardProps) {
  const [showToast, setShowToast] = useState(false);

  const inviteLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/prelaunch?ref=${inviteCode}`
      : `/prelaunch?ref=${inviteCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch {
      // clipboard API 미지원 환경 대비
    }
  };

  return (
    <div className="bg-bg-secondary border border-white/10 rounded-2xl p-6">
      <h2 className="text-white font-semibold mb-3">내 초대 링크</h2>
      <div className="flex items-center gap-2">
        <span className="flex-1 text-white/60 text-sm truncate bg-black/30 rounded-lg px-3 py-2">
          {inviteLink}
        </span>
        <button
          onClick={handleCopy}
          className="bg-accent-neon text-black font-semibold px-4 py-2 rounded-lg text-sm shrink-0 hover:bg-accent-neon/90 transition-colors"
          aria-label="링크 복사"
        >
          복사
        </button>
      </div>
      {showToast && (
        <p className="mt-2 text-sm text-green-400" role="status">
          링크가 복사되었습니다
        </p>
      )}
    </div>
  );
}
