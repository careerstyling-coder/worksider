'use client';

// @TASK P2-S2-T2 - useInviteProgress hook
// @SPEC specs/screens/prelaunch/reserved
// @TEST __tests__/hooks/useInviteProgress.test.ts

import { useState, useEffect } from 'react';
import type { Reward } from '@/lib/rewards';

interface InviteProgressState {
  current: number;
  total: number;
  rewards: Reward[];
  loading: boolean;
  error: string | null;
}

export function useInviteProgress(reservationId: string): InviteProgressState {
  const [state, setState] = useState<InviteProgressState>({
    current: 0,
    total: 5,
    rewards: [],
    loading: reservationId ? true : false,
    error: null,
  });

  useEffect(() => {
    if (!reservationId) return;

    let cancelled = false;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetch(`/api/rewards?reservation_id=${reservationId}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch rewards: ${res.status}`);
        }
        return res.json();
      })
      .then((data: { rewards: Reward[]; invite_success_count?: number }) => {
        if (cancelled) return;
        setState({
          current: data.invite_success_count ?? 0,
          total: 5,
          rewards: data.rewards ?? [],
          loading: false,
          error: null,
        });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setState({
          current: 0,
          total: 5,
          rewards: [],
          loading: false,
          error: err.message || '초대 현황을 불러오는데 실패했습니다',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [reservationId]);

  return state;
}
