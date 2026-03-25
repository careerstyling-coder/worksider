'use client';

// @TASK P3-S3-T2 - 초대코드 검증 + 자동 추적 hook
// @SPEC specs/screens/prelaunch/invite-landing
// @TEST __tests__/hooks/useInviteCode.test.ts

import { useState, useEffect } from 'react';

export interface UseInviteCodeReturn {
  inviterName: string | null;
  loading: boolean;
  error: string | null;
  isValid: boolean;
}

export function useInviteCode(invite_code: string | undefined): UseInviteCodeReturn {
  const [inviterName, setInviterName] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!invite_code);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!invite_code) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchInviter = async () => {
      setLoading(true);
      setError(null);

      try {
        // 초대코드로 초대자 정보 조회
        const res = await fetch(`/api/reservations?invite_code=${encodeURIComponent(invite_code)}`);

        if (!res.ok) {
          if (!cancelled) {
            setIsValid(false);
            setInviterName(null);
            setLoading(false);
          }
          return;
        }

        const data = await res.json();

        if (!cancelled) {
          setInviterName(data.email ?? null);
          setIsValid(true);
          setLoading(false);
        }

        // 클릭 추적 (비크리티컬 — 실패해도 UX 영향 없음)
        try {
          await fetch('/api/invite-tracking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ invite_code }),
          });
        } catch {
          // 추적 실패는 무시
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '오류가 발생했습니다');
          setIsValid(false);
          setInviterName(null);
          setLoading(false);
        }
      }
    };

    fetchInviter();

    return () => {
      cancelled = true;
    };
  }, [invite_code]);

  return { inviterName, loading, error, isValid };
}
