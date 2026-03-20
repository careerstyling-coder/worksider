// @TASK P2-S3-T2 - ShareButtons 데모 페이지

'use client';

import { useState } from 'react';
import { ShareButtons } from '@/components/ShareButtons';
import { DNAVersion } from '@/types/database';

type DemoState = 'semi-version' | 'full-version' | 'no-version';

const DEMO_STATES: Record<DemoState, { label: string; description: string; version?: DNAVersion }> = {
  'semi-version': {
    label: '세미 버전',
    description: 'version="semi" - 업그레이드 CTA 표시',
    version: 'semi',
  },
  'full-version': {
    label: '풀 버전',
    description: 'version="full" - 업그레이드 CTA 숨김',
    version: 'full',
  },
  'no-version': {
    label: '버전 없음',
    description: 'version 미지정 - 업그레이드 CTA 숨김',
    version: undefined,
  },
};

const mockProps = {
  url: 'https://workside.app/share/demo-token-abc',
  title: '나의 Work DNA: 전략적 성과자',
  description: '목표 지향적이며 효율적으로 성과를 만들어내는 타입',
};

export default function ShareButtonsDemoPage() {
  const [state, setState] = useState<DemoState>('semi-version');

  const currentConfig = DEMO_STATES[state];

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-text-primary text-xl font-bold mb-2">P2-S3-T2: ShareButtons 데모</h1>
      <p className="text-text-secondary text-sm mb-6">공유 버튼 + 저장 CTA + 업그레이드 섹션</p>

      {/* 상태 선택기 */}
      <div className="flex flex-wrap gap-2 mb-8">
        {(Object.keys(DEMO_STATES) as DemoState[]).map((s) => (
          <button
            key={s}
            onClick={() => setState(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              state === s
                ? 'bg-primary text-black'
                : 'bg-bg-active text-text-primary hover:bg-bg-active'
            }`}
          >
            {DEMO_STATES[s].label}
          </button>
        ))}
      </div>

      {/* 상태 설명 */}
      <p className="text-text-tertiary text-xs mb-6">{currentConfig.description}</p>

      {/* 컴포넌트 렌더링 */}
      <div className="max-w-2xl mx-auto bg-bg-page border border-border rounded-2xl p-6">
        <ShareButtons
          url={mockProps.url}
          title={mockProps.title}
          description={mockProps.description}
          version={currentConfig.version}
        />
      </div>

      {/* 상태 정보 */}
      <pre className="mt-8 p-4 bg-white text-text-secondary text-xs rounded-xl overflow-x-auto">
        {JSON.stringify(
          {
            currentState: state,
            props: { ...mockProps, version: currentConfig.version },
          },
          null,
          2
        )}
      </pre>
    </div>
  );
}
