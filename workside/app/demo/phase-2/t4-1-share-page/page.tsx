// @TASK P2-S4-T1 - Share Page 데모
// @SPEC docs/planning/03-user-flow.md#share

'use client';

import { useState } from 'react';
import { SharedResultCard } from '@/components/share/SharedResultCard';
import { CTASection } from '@/components/share/CTASection';
import { InvalidSharePage } from '@/components/share/InvalidSharePage';
import { DNARadarChart } from '@/components/charts/RadarChart';
import { DNAResult } from '@/types/database';

const mockResult: DNAResult = {
  id: 'result-demo-1',
  session_id: 'session-demo-1',
  user_id: null,
  p_score: 72,
  c_score: 45,
  pol_score: 38,
  s_score: 61,
  persona_label: '전략적 성과자',
  persona_description: '목표 지향적이며 효율적으로 성과를 만들어내는 타입입니다. 자율적으로 일하면서도 뚜렷한 결과를 추구합니다.',
  version: 'semi',
  share_token: 'demo-token',
  created_at: '2025-01-01T00:00:00Z',
};

type DemoState = 'normal' | 'error' | 'chart-small' | 'chart-large';

const DEMO_STATES: Record<DemoState, { label: string; description: string }> = {
  normal: { label: '정상', description: '정상 상태 - SharedResultCard + CTASection' },
  error: { label: '에러', description: '잘못된 토큰 - InvalidSharePage' },
  'chart-small': { label: '차트 Small', description: 'RadarChart size=small (200px)' },
  'chart-large': { label: '차트 Large', description: 'RadarChart size=large (400px)' },
};

export default function ShareDemoPage() {
  const [state, setState] = useState<DemoState>('normal');

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-text-primary text-xl font-bold mb-2">P2-S4-T1: Share Page 데모</h1>
      <p className="text-text-secondary text-sm mb-6">/share/[shareId] 페이지 UI 컴포넌트</p>

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
      <p className="text-text-tertiary text-xs mb-6">{DEMO_STATES[state].description}</p>

      {/* 컴포넌트 렌더링 */}
      <div className="max-w-2xl mx-auto">
        {state === 'normal' && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <span className="text-primary text-xs font-semibold uppercase tracking-widest">
                Work DNA 공유 결과
              </span>
            </div>
            <SharedResultCard result={mockResult} />
            <CTASection />
          </div>
        )}
        {state === 'error' && <InvalidSharePage />}
        {state === 'chart-small' && (
          <div className="bg-bg-page border border-border rounded-2xl p-6">
            <p className="text-text-secondary text-xs mb-4">size=&quot;small&quot; (200px)</p>
            <DNARadarChart
              data={{ p_score: 72, c_score: 45, pol_score: 38, s_score: 61 }}
              size="small"
            />
          </div>
        )}
        {state === 'chart-large' && (
          <div className="bg-bg-page border border-border rounded-2xl p-6">
            <p className="text-text-secondary text-xs mb-4">size=&quot;large&quot; (400px)</p>
            <DNARadarChart
              data={{ p_score: 72, c_score: 45, pol_score: 38, s_score: 61 }}
              size="large"
            />
          </div>
        )}
      </div>

      {/* 상태 정보 */}
      <pre className="mt-8 p-4 bg-white text-text-secondary text-xs rounded-xl overflow-x-auto">
        {JSON.stringify({ currentState: state, ...DEMO_STATES[state] }, null, 2)}
      </pre>
    </div>
  );
}
