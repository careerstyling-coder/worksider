'use client';

// @TASK P3-S4-T2 - 예약자 대시보드 통합 데이터 hook
// @SPEC specs/screens/prelaunch/my-reservation
// @TEST __tests__/hooks/useMyReservation.test.ts

import { useState, useEffect } from 'react';
import type { ReservationData } from '@/hooks/useReservation';
import type { Reward } from '@/lib/rewards';

export interface InviteStats {
  successful_invites: number;
}

export interface MyReservationState {
  reservation: ReservationData | null;
  inviteStats: InviteStats | null;
  rewards: Reward[] | null;
  loading: boolean;
  error: string | null;
}

/**
 * 예약자 대시보드용 통합 데이터 hook
 *
 * 이메일을 localStorage에서 읽어 다음 순서로 API 호출:
 * 1. GET /api/reservations?email={email}
 * 2. (병렬) GET /api/invite-tracking?inviter_id={id}
 *          GET /api/rewards?reservation_id={id}
 */
export function useMyReservation(): MyReservationState {
  const [state, setState] = useState<MyReservationState>({
    reservation: null,
    inviteStats: null,
    rewards: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    const email =
      typeof window !== 'undefined' ? localStorage.getItem('workside_email') : null;

    if (!email) {
      setState({
        reservation: null,
        inviteStats: null,
        rewards: null,
        loading: false,
        error: '이메일 정보가 없습니다',
      });
      return;
    }

    let cancelled = false;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const fetchAll = async () => {
      // Step 1: reservation 조회
      const resResponse = await fetch(`/api/reservations?email=${encodeURIComponent(email)}`);

      if (!resResponse.ok) {
        const body = await resResponse.json().catch(() => ({}));
        throw new Error(body.error || '예약 정보를 찾을 수 없습니다');
      }

      const reservation: ReservationData = await resResponse.json();

      // Step 2: invite_tracking + rewards 병렬 조회
      const [inviteResponse, rewardsResponse] = await Promise.all([
        fetch(`/api/invite-tracking?inviter_id=${reservation.id}`),
        fetch(`/api/rewards?reservation_id=${reservation.id}`),
      ]);

      // invite_tracking: 실패 시 fallback { successful_invites: 0 }
      let inviteStats: InviteStats = { successful_invites: 0 };
      if (inviteResponse.ok) {
        const inviteData = await inviteResponse.json();
        inviteStats = { successful_invites: inviteData.successful_invites ?? 0 };
      }

      // rewards: 실패 시 fallback []
      let rewards: Reward[] = [];
      if (rewardsResponse.ok) {
        const rewardsData = await rewardsResponse.json();
        rewards = rewardsData.rewards ?? [];
      }

      return { reservation, inviteStats, rewards };
    };

    fetchAll()
      .then(({ reservation, inviteStats, rewards }) => {
        if (cancelled) return;
        setState({
          reservation,
          inviteStats,
          rewards,
          loading: false,
          error: null,
        });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setState({
          reservation: null,
          inviteStats: null,
          rewards: null,
          loading: false,
          error: err.message || '데이터를 불러오는데 실패했습니다',
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
