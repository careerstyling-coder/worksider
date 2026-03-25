'use client';

// @TASK P3-S4-T1 - 예약자 대시보드 페이지 (SCR-4)
// @SPEC specs/screens/prelaunch/my-reservation
// @NOTE API 연동 및 인증 리다이렉트는 T2에서 구현

import { QueuePosition } from '@/components/prelaunch/QueuePosition';
import { RewardStatus } from '@/components/prelaunch/RewardStatus';
import { InviteProgressBar } from '@/components/prelaunch/InviteProgressBar';
import { InviteLinkCard } from '@/components/prelaunch/InviteLinkCard';
import { SocialShareButtons } from '@/components/prelaunch/SocialShareButtons';

// Mock 데이터 (T2에서 API 연동으로 교체)
const MOCK_DATA = {
  reservation: {
    queue_position: 42,
    invite_code: 'WORK2024',
  },
  invite_tracking: {
    successful_invites: 2,
    required_invites: 5,
  },
  rewards: [
    { type: 'early_adopter_badge', status: 'locked' },
    { type: 'priority_access', status: 'locked' },
  ],
};

export default function MyReservationPage() {
  const { reservation, invite_tracking, rewards } = MOCK_DATA;

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-white mb-2">내 예약 현황</h1>

        {/* 예약 순번 */}
        <QueuePosition position={reservation.queue_position} />

        {/* 초대 진행 상황 */}
        <InviteProgressBar
          current={invite_tracking.successful_invites}
          total={invite_tracking.required_invites}
        />

        {/* 리워드 상태 */}
        <RewardStatus rewards={rewards} />

        {/* 초대 링크 */}
        <InviteLinkCard inviteCode={reservation.invite_code} />

        {/* 소셜 공유 */}
        <SocialShareButtons inviteCode={reservation.invite_code} />
      </div>
    </div>
  );
}
