'use client';

// @TASK P2-S2-T2 - 예약 완료 페이지 (라이트 테마)
// @SPEC specs/screens/prelaunch/reserved

import { Suspense, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WelcomeMessage } from '@/components/prelaunch/WelcomeMessage';
import { InviteLinkCard } from '@/components/prelaunch/InviteLinkCard';
import { InviteProgressBar } from '@/components/prelaunch/InviteProgressBar';
import { SocialShareButtons } from '@/components/prelaunch/SocialShareButtons';
import { useInviteProgress } from '@/hooks/useInviteProgress';
import { copyToClipboard, shareToKakao, shareToTwitter, getInviteLink } from '@/lib/share';

function ReservedPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queuePositionParam = searchParams.get('position');
  const reservationId = searchParams.get('reservation_id') ?? '';
  const inviteCode = searchParams.get('ref');

  const queuePosition = queuePositionParam ? parseInt(queuePositionParam, 10) : null;

  const { current, total } = useInviteProgress(reservationId);

  useEffect(() => {
    if (!queuePosition || !inviteCode) {
      router.replace('/prelaunch');
    }
  }, [queuePosition, inviteCode, router]);

  const handleKakaoClick = useCallback(() => {
    if (!inviteCode) return;
    const link = getInviteLink(inviteCode);
    shareToKakao({
      title: 'Workside 얼리어답터 초대',
      description: '지금 예약하면 얼리어답터 혜택을 받을 수 있어요!',
      link,
    });
  }, [inviteCode]);

  const handleTwitterClick = useCallback(() => {
    if (!inviteCode) return;
    const link = getInviteLink(inviteCode);
    shareToTwitter({
      text: 'Workside 얼리어답터 모집 중! 지금 예약하면 특별 혜택을 받을 수 있어요.',
      url: link,
    });
  }, [inviteCode]);

  const handleCopyClick = useCallback(async () => {
    if (!inviteCode) return;
    const link = getInviteLink(inviteCode);
    await copyToClipboard(link);
  }, [inviteCode]);

  if (!queuePosition || !inviteCode) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-lg mx-auto flex flex-col gap-5">
        <WelcomeMessage queuePosition={queuePosition} />

        <InviteLinkCard inviteCode={inviteCode} />

        <InviteProgressBar current={current} total={total} />

        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
          <h2 className="text-slate-900 font-semibold mb-3">초대 리워드 안내</h2>
          <ul className="space-y-2 text-slate-600 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 mt-0.5">•</span>
              <span><strong>1명 초대</strong> — 1개월 무료 이용권</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 mt-0.5">•</span>
              <span><strong>3명 초대</strong> — 3개월 무료 이용권 + 프리미엄 배지</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 mt-0.5">•</span>
              <span><strong>5명 초대</strong> — 얼리어답터 배지 + 평생 할인 혜택</span>
            </li>
          </ul>
        </div>

        <SocialShareButtons
          inviteCode={inviteCode}
          onKakaoClick={handleKakaoClick}
          onTwitterClick={handleTwitterClick}
          onCopyClick={handleCopyClick}
        />
      </div>
    </div>
  );
}

export default function ReservedPage() {
  return (
    <Suspense fallback={null}>
      <ReservedPageContent />
    </Suspense>
  );
}
