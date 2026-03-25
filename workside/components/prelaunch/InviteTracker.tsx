'use client';

// @TASK P3-S3-T2 - 초대 클릭 추적 클라이언트 컴포넌트
// @SPEC specs/screens/prelaunch/invite-landing

import { useEffect } from 'react';

interface InviteTrackerProps {
  invite_code: string;
}

export function InviteTracker({ invite_code }: InviteTrackerProps) {
  useEffect(() => {
    if (!invite_code) return;

    // 접속 시 클릭 추적 (비크리티컬)
    fetch('/api/invite-tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invite_code }),
    }).catch(() => {
      // 추적 실패는 UX에 영향 없음
    });
  }, [invite_code]);

  // 렌더링 없음 — 순수 사이드이펙트 컴포넌트
  return null;
}
