'use client';

import MyDNAClient from '@/app/my-dna/MyDNAClient';
import type { User, DNAResult } from '@/types/database';

const mockUser: User = {
  id: 'demo-user-1',
  email: 'demo@workside.kr',
  nickname: '워크사이더',
  industry: 'IT/소프트웨어',
  company_size: 'medium',
  role: 'user',
  created_at: '2026-01-15T09:00:00Z',
  updated_at: '2026-03-17T09:00:00Z',
};

const mockResults: DNAResult[] = [
  {
    id: 'result-1',
    session_id: 'session-1',
    user_id: 'demo-user-1',
    p_score: 78,
    c_score: 45,
    pol_score: 62,
    s_score: 71,
    persona_label: '전략적 성과자',
    persona_description: '목표 지향적이며 효율적으로 성과를 만들어내는 타입입니다.',
    version: 'full',
    share_token: 'demo-share-token-1',
    created_at: '2026-03-15T14:30:00Z',
  },
  {
    id: 'result-2',
    session_id: 'session-2',
    user_id: 'demo-user-1',
    p_score: 65,
    c_score: 52,
    pol_score: 48,
    s_score: 60,
    persona_label: '실무형 전문가',
    persona_description: '실무 능력이 뛰어나며 깊이 있는 전문성을 추구합니다.',
    version: 'semi',
    share_token: 'demo-share-token-2',
    created_at: '2026-02-20T10:00:00Z',
  },
  {
    id: 'result-3',
    session_id: 'session-3',
    user_id: 'demo-user-1',
    p_score: 55,
    c_score: 70,
    pol_score: 58,
    s_score: 42,
    persona_label: '협력적 조정자',
    persona_description: '함께 성장하는 것을 중시하며 조율 역할을 자연스럽게 수행합니다.',
    version: 'semi',
    share_token: 'demo-share-token-3',
    created_at: '2026-01-25T16:00:00Z',
  },
];

const mockQuestions = [
  { id: 'q1', title: '업무 중 가장 스트레스를 받는 상황은?', status: 'active' },
  { id: 'q2', title: '재택근무 확대를 원하시나요?', status: 'active' },
  { id: 'q3', title: '이상적인 점심시간 활용법은?', status: 'closed' },
  { id: 'q4', title: '업무 성장에 가장 도움이 되는 것은?', status: 'active' },
];

const mockSuggestions = [
  { id: 's1', title: '직장인 독서 모임 운영에 대해 어떻게 생각하시나요?', shout_out_count: 31 },
  { id: 's2', title: '업무 중 음악 듣는 것에 대한 의견', shout_out_count: 12 },
  { id: 's3', title: '점심시간 활용법 — 운동 vs 휴식 vs 공부', shout_out_count: 24 },
];

const mockAdopted = [
  { id: 'a1', title: '재택근무 vs 출근근무 선호도', survey_type: 'simple' },
  { id: 'a2', title: '이상적인 상사의 리더십 스타일은?', survey_type: 'formal' },
];

export default function MyDNADemoPage() {
  return (
    <MyDNAClient
      profile={mockUser}
      dnaResults={mockResults}
      participationCount={24}
      suggestionsCount={5}
      approvedSuggestionsCount={2}
      recentQuestions={mockQuestions}
      recentSuggestions={mockSuggestions}
      recentAdopted={mockAdopted}
    />
  );
}
