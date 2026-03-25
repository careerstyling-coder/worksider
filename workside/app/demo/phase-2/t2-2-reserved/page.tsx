'use client';

// @TASK P2-S2-T1 - 예약 완료 UI 데모 페이지

import { useState } from 'react';
import { WelcomeMessage } from '@/components/prelaunch/WelcomeMessage';
import { InviteLinkCard } from '@/components/prelaunch/InviteLinkCard';
import { InviteProgressBar } from '@/components/prelaunch/InviteProgressBar';
import { SocialShareButtons } from '@/components/prelaunch/SocialShareButtons';

const DEMO_STATES = {
  normal: { queuePosition: 42, inviteCode: 'DEMO42', inviteCurrent: 3 },
  early: { queuePosition: 1, inviteCode: 'FIRST01', inviteCurrent: 0 },
  complete: { queuePosition: 200, inviteCode: 'FULL99', inviteCurrent: 5 },
} as const;

type DemoState = keyof typeof DEMO_STATES;

export default function ReservedDemoPage() {
  const [state, setState] = useState<DemoState>('normal');
  const data = DEMO_STATES[state];

  return (
    <div className="min-h-screen bg-bg-primary px-4 py-8">
      <h1 className="text-white text-xl font-bold mb-4">
        Demo: P2-S2-T1 예약 완료 UI
      </h1>

      <div className="flex gap-2 mb-8">
        {(Object.keys(DEMO_STATES) as DemoState[]).map((s) => (
          <button
            key={s}
            onClick={() => setState(s)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              state === s
                ? 'bg-accent-neon text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="max-w-lg flex flex-col gap-6">
        <WelcomeMessage queuePosition={data.queuePosition} />
        <InviteLinkCard inviteCode={data.inviteCode} />
        <InviteProgressBar current={data.inviteCurrent} total={5} />
        <div className="bg-bg-secondary border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-2">리워드 안내</h2>
          <ul className="space-y-2 text-white/60 text-sm">
            <li>- 1명 초대: 1개월 무료 이용권</li>
            <li>- 3명 초대: 3개월 무료 이용권 + 프리미엄 배지</li>
            <li>- 5명 초대: 얼리어답터 배지 + 평생 할인 혜택</li>
          </ul>
        </div>
        <SocialShareButtons inviteCode={data.inviteCode} />
      </div>

      <pre className="mt-8 p-4 bg-white/5 text-white/60 text-xs rounded-xl">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
