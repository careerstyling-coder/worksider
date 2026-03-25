'use client';

// @TASK P2-S2-T1 - 예약 완료 페이지
// @SPEC specs/screens/prelaunch/reserved

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WelcomeMessage } from '@/components/prelaunch/WelcomeMessage';
import { InviteLinkCard } from '@/components/prelaunch/InviteLinkCard';
import { InviteProgressBar } from '@/components/prelaunch/InviteProgressBar';
import { SocialShareButtons } from '@/components/prelaunch/SocialShareButtons';

export default function ReservedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queuePositionParam = searchParams.get('position');
  const inviteCode = searchParams.get('ref');

  const queuePosition = queuePositionParam ? parseInt(queuePositionParam, 10) : null;

  useEffect(() => {
    if (!queuePosition || !inviteCode) {
      router.replace('/prelaunch');
    }
  }, [queuePosition, inviteCode, router]);

  if (!queuePosition || !inviteCode) {
    return null;
  }

  return (
    <main className="min-h-screen bg-bg-primary px-4 py-12">
      <div className="max-w-lg mx-auto flex flex-col gap-6">
        <WelcomeMessage queuePosition={queuePosition} />

        <InviteLinkCard inviteCode={inviteCode} />

        <InviteProgressBar current={0} total={5} />

        <div className="bg-bg-secondary border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-2">리워드 안내</h2>
          <ul className="space-y-2 text-white/60 text-sm">
            <li>- 1명 초대: 1개월 무료 이용권</li>
            <li>- 3명 초대: 3개월 무료 이용권 + 프리미엄 배지</li>
            <li>- 5명 초대: 얼리어답터 배지 + 평생 할인 혜택</li>
          </ul>
        </div>

        <SocialShareButtons inviteCode={inviteCode} />
      </div>
    </main>
  );
}
