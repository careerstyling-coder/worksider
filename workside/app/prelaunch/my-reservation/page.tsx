'use client';

// @TASK P3-S4-T2 - 예약자 대시보드 API 연동 (SCR-4)
// @SPEC specs/screens/prelaunch/my-reservation
// @TEST __tests__/hooks/useMyReservation.test.ts

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QueuePosition } from '@/components/prelaunch/QueuePosition';
import { RewardStatus } from '@/components/prelaunch/RewardStatus';
import { InviteProgressBar } from '@/components/prelaunch/InviteProgressBar';
import { InviteLinkCard } from '@/components/prelaunch/InviteLinkCard';
import { SocialShareButtons } from '@/components/prelaunch/SocialShareButtons';
import { useMyReservation } from '@/hooks/useMyReservation';

export default function MyReservationPage() {
  const router = useRouter();
  const { reservation, inviteStats, rewards, loading, error } = useMyReservation();

  // 비로그인/미예약 시 /prelaunch로 리다이렉트
  useEffect(() => {
    if (!loading && error === '이메일 정보가 없습니다') {
      router.replace('/prelaunch');
    }
    if (!loading && !reservation && error === '예약 정보를 찾을 수 없습니다') {
      router.replace('/prelaunch');
    }
  }, [loading, error, reservation, router]);

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-white/60 text-sm">불러오는 중...</div>
      </div>
    );
  }

  // 에러 상태 (리다이렉트 대상 외 에러)
  if (error && error !== '이메일 정보가 없습니다' && error !== '예약 정보를 찾을 수 없습니다') {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-accent-neon text-sm underline"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 데이터 없음 (리다이렉트 처리 중)
  if (!reservation) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-white/60 text-sm">이동 중...</div>
      </div>
    );
  }

  const successfulInvites = inviteStats?.successful_invites ?? 0;
  // lib/rewards.Reward의 unlocked_at: string|null → RewardStatus가 기대하는 unlocked_at?: string 변환
  const rewardList = (rewards ?? []).map((r) => ({
    ...r,
    unlocked_at: r.unlocked_at ?? undefined,
  }));

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-white mb-2">내 예약 현황</h1>

        {/* 예약 순번 */}
        <QueuePosition position={reservation.queue_position} />

        {/* 초대 진행 상황 */}
        <InviteProgressBar
          current={successfulInvites}
          total={5}
        />

        {/* 리워드 상태 */}
        <RewardStatus rewards={rewardList} />

        {/* 초대 링크 */}
        <InviteLinkCard inviteCode={reservation.invite_code} />

        {/* 소셜 공유 */}
        <SocialShareButtons inviteCode={reservation.invite_code} />
      </div>
    </div>
  );
}
