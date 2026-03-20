// @TASK P3-S3-T1 + P3-S3-T2 - Question Result Page Demo
// @SPEC docs/planning/03-user-flow.md#question-result

'use client';

import React, { useState } from 'react';
import {
  QuestionSummary,
  ResultsSection,
  MinorityViewCard,
  InsightText,
  NavigationButtons,
  MyResponseBadge,
  type QuestionAggregateData,
} from '@/app/question/[questionId]/result/page';
import { ShareButtons } from '@/components/ShareButtons';

// ── Mock data states ──────────────────────────────────────────────────────────

const DEMO_STATES: Record<string, QuestionAggregateData> = {
  normal: {
    id: 'q-demo-1',
    title: '일할 때 나는 어떤 역할을 선호하나요?',
    status: 'active',
    deadline: null,
    participant_count: 120,
    options: ['리더', '실무자', '조율자', '전문가'],
    results: [
      { option: '리더', count: 30, percentage: 25 },
      { option: '실무자', count: 48, percentage: 40 },
      { option: '조율자', count: 24, percentage: 20 },
      { option: '전문가', count: 18, percentage: 15 },
    ],
    persona_distribution: [
      // 리더 선택자 타입 분포
      { persona_label: '전략적 성과자', option: '리더', count: 18, percentage: 60 },
      { persona_label: '조직형 정치인', option: '리더', count: 7, percentage: 23 },
      { persona_label: '중도형 균형가', option: '리더', count: 5, percentage: 17 },
      // 실무자 선택자 타입 분포
      { persona_label: '자율형 독립가', option: '실무자', count: 22, percentage: 45 },
      { persona_label: '실무형 전문가', option: '실무자', count: 18, percentage: 38 },
      { persona_label: '중도형 균형가', option: '실무자', count: 8, percentage: 17 },
      // 조율자 선택자 타입 분포
      { persona_label: '협력적 조정자', option: '조율자', count: 15, percentage: 62 },
      { persona_label: '중도형 균형가', option: '조율자', count: 6, percentage: 25 },
      { persona_label: '전략적 성과자', option: '조율자', count: 3, percentage: 13 },
      // 전문가 선택자 타입 분포
      { persona_label: '실무형 전문가', option: '전문가', count: 10, percentage: 56 },
      { persona_label: '자율형 독립가', option: '전문가', count: 5, percentage: 28 },
      { persona_label: '조직형 정치인', option: '전문가', count: 3, percentage: 16 },
    ],
    minority_option: '전문가',
    minority_percentage: 15,
    insight: '자율형 독립가 유형은 실무에서 직접 결과를 만들어내는 것에 높은 가치를 두는 경향이 있습니다. 반면, 전략적 성과자 유형은 리더 역할을 통해 방향을 제시하는 것을 선호합니다.',
    prev_question_id: 'q-demo-0',
    next_question_id: 'q-demo-2',
  },
  closed: {
    id: 'q-demo-2',
    title: '원격 근무 vs 사무실 출근, 어느 쪽이 더 생산적인가요?',
    status: 'closed',
    deadline: '2026-03-01T00:00:00Z',
    participant_count: 347,
    options: ['원격 근무', '사무실 출근', '혼합 형태'],
    results: [
      { option: '원격 근무', count: 139, percentage: 40 },
      { option: '사무실 출근', count: 69, percentage: 20 },
      { option: '혼합 형태', count: 139, percentage: 40 },
    ],
    persona_distribution: [
      // 원격 근무 선택자
      { persona_label: '자율형 독립가', option: '원격 근무', count: 45, percentage: 75 },
      { persona_label: '실무형 전문가', option: '원격 근무', count: 30, percentage: 50 },
      { persona_label: '중도형 균형가', option: '원격 근무', count: 15, percentage: 25 },
      // 사무실 출근 선택자
      { persona_label: '협력적 조정자', option: '사무실 출근', count: 28, percentage: 55 },
      { persona_label: '조직형 정치인', option: '사무실 출근', count: 22, percentage: 43 },
      // 혼합 형태 선택자
      { persona_label: '중도형 균형가', option: '혼합 형태', count: 50, percentage: 65 },
      { persona_label: '전략적 성과자', option: '혼합 형태', count: 35, percentage: 45 },
      { persona_label: '협력적 조정자', option: '혼합 형태', count: 20, percentage: 26 },
    ],
    minority_option: '사무실 출근',
    minority_percentage: 20,
    insight: '자율형 독립가 유형의 75%가 원격 근무를 선택한 것은, 이 유형이 자기주도적 환경에서 더 높은 생산성을 경험하기 때문으로 해석됩니다. 반면 협력적 조정자 유형은 대면 소통이 관계 구축에 필수적이라고 느끼는 경향이 있습니다.',
    prev_question_id: 'q-demo-1',
    next_question_id: null,
  },
  empty: {
    id: 'q-demo-3',
    title: '새로 올라온 질문입니다. 아직 응답이 없어요.',
    status: 'active',
    deadline: null,
    participant_count: 0,
    options: ['옵션 A', '옵션 B', '옵션 C'],
    results: [
      { option: '옵션 A', count: 0, percentage: 0 },
      { option: '옵션 B', count: 0, percentage: 0 },
      { option: '옵션 C', count: 0, percentage: 0 },
    ],
    persona_distribution: [],
    minority_option: null,
    minority_percentage: null,
    insight: null,
    prev_question_id: null,
    next_question_id: 'q-demo-1',
  },
};

type DemoStateKey = keyof typeof DEMO_STATES;

export default function QuestionResultDemoPage() {
  const [stateKey, setStateKey] = useState<DemoStateKey>('normal');
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const myResponse = isAuthenticated ? '실무자' : null;

  const data = DEMO_STATES[stateKey];
  const shareUrl = `https://workside.app/question/${data.id}/result`;

  return (
    <div className="min-h-screen bg-white px-4 py-10">
      <div className="max-w-2xl mx-auto flex flex-col gap-8">

        {/* Demo Controls */}
        <div className="bg-bg-page border border-border rounded-2xl p-5">
          <p className="text-text-secondary text-xs font-semibold uppercase tracking-widest mb-3">Demo Controls</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {(Object.keys(DEMO_STATES) as DemoStateKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setStateKey(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  stateKey === key
                    ? 'bg-primary text-black'
                    : 'bg-bg-page text-text-secondary hover:bg-bg-active'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAuthenticated((v) => !v)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isAuthenticated
                  ? 'bg-primary text-black'
                  : 'bg-bg-page text-text-secondary hover:bg-bg-active'
              }`}
            >
              회원 로그인 시뮬레이션: {isAuthenticated ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Page Header */}
        <div>
          <span className="text-primary text-xs font-semibold uppercase tracking-widest">
            질문 결과
          </span>
        </div>

        {/* 1. QuestionSummary */}
        <QuestionSummary
          title={data.title}
          status={data.status}
          participantCount={data.participant_count}
        />

        {/* 2. MyResponseBadge */}
        <MyResponseBadge myResponse={myResponse} />

        {/* 3. 선택지별 결과 + 타입 분석 통합 */}
        <section className="bg-white border border-border rounded-lg p-5">
          <h2 className="text-text-primary text-[15px] font-semibold mb-4">선택지별 결과</h2>
          <ResultsSection results={data.results} distribution={isAuthenticated ? data.persona_distribution : []} />
        </section>

        {/* 5. MinorityViewCard */}
        <MinorityViewCard
          minorityOption={data.minority_option}
          minorityPercentage={data.minority_percentage}
        />

        {/* 6. InsightText */}
        <InsightText insight={data.insight} distribution={data.persona_distribution} results={data.results} />

        {/* 7. ShareSection */}
        <section className="bg-bg-page border border-border rounded-2xl p-5">
          <h2 className="text-text-primary text-sm font-semibold mb-4">공유하기</h2>
          <ShareButtons
            url={shareUrl}
            title={`[Workside] ${data.title} - 결과 확인하기`}
            description={data.insight ?? undefined}
          />
        </section>

        {/* 8. NavigationButtons */}
        <NavigationButtons
          prevQuestionId={data.prev_question_id}
          nextQuestionId={data.next_question_id}
        />

        {/* State Info */}
        <details className="bg-bg-page border border-border rounded-2xl p-5">
          <summary className="text-text-secondary text-xs font-semibold uppercase tracking-widest cursor-pointer">
            현재 State JSON
          </summary>
          <pre className="mt-3 text-text-secondary text-xs overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>

      </div>
    </div>
  );
}
