// @TASK P3-S3-T1 + P3-S3-T2 - Question Result Page tests
// @SPEC docs/planning/03-user-flow.md#question-result

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// --- Mocks ---
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useParams: () => ({ questionId: 'q-uuid-1' }),
}));

vi.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="recharts-bar-chart">{children}</div>
  ),
  Bar: ({ dataKey }: { dataKey: string }) => <div data-testid={`recharts-bar-${dataKey}`} />,
  XAxis: () => <div data-testid="recharts-xaxis" />,
  YAxis: () => <div data-testid="recharts-yaxis" />,
  CartesianGrid: () => <div data-testid="recharts-cartesian-grid" />,
  Tooltip: () => <div data-testid="recharts-tooltip" />,
  Cell: () => <div data-testid="recharts-cell" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="recharts-responsive-container">{children}</div>
  ),
  LabelList: () => <div data-testid="recharts-label-list" />,
}));

vi.mock('@/components/ShareButtons', () => ({
  ShareButtons: ({ url, title }: { url: string; title: string }) => (
    <div data-testid="share-buttons">
      <span data-testid="share-url">{url}</span>
      <span data-testid="share-title">{title}</span>
    </div>
  ),
}));

// --- Mock aggregate data ---
export const mockAggregateData = {
  id: 'q-uuid-1',
  title: '팀에서 나는 어떤 역할을 선호하나요?',
  status: 'active' as const,
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
    { persona_label: '전략적 성과자', option: '리더', count: 18, percentage: 60 },
    { persona_label: '자율형 독립가', option: '실무자', count: 22, percentage: 45 },
    { persona_label: '협력적 조정자', option: '조율자', count: 15, percentage: 62 },
  ],
  minority_option: '전문가',
  minority_percentage: 15,
  insight: '자율형 독립가 중 45%가 실무자를 선택했어요',
  prev_question_id: 'q-uuid-0',
  next_question_id: 'q-uuid-2',
};

// Helper component imports - we test sub-components directly
import {
  QuestionSummary,
  MyResponseBadge,
  ResultsBarChart,
  TypeDistributionChart,
  MinorityViewCard,
  InsightText,
  NavigationButtons,
} from '@/app/question/[questionId]/result/page';

// ===== QuestionSummary =====
describe('QuestionSummary', () => {
  it('질문 제목이 표시된다', () => {
    render(
      <QuestionSummary
        title={mockAggregateData.title}
        status={mockAggregateData.status}
        participantCount={mockAggregateData.participant_count}
      />
    );
    expect(screen.getByTestId('question-title')).toHaveTextContent('팀에서 나는 어떤 역할을 선호하나요?');
  });

  it('마감 상태가 표시된다 (active)', () => {
    render(
      <QuestionSummary
        title="질문"
        status="active"
        participantCount={100}
      />
    );
    expect(screen.getByTestId('question-status')).toHaveTextContent('진행 중');
  });

  it('마감 상태가 표시된다 (closed)', () => {
    render(
      <QuestionSummary
        title="질문"
        status="closed"
        participantCount={100}
      />
    );
    expect(screen.getByTestId('question-status')).toHaveTextContent('마감');
  });

  it('총 참여자 수가 표시된다', () => {
    render(
      <QuestionSummary
        title="질문"
        status="active"
        participantCount={120}
      />
    );
    expect(screen.getByTestId('participant-count')).toHaveTextContent('120');
  });
});

// ===== MyResponseBadge =====
describe('MyResponseBadge', () => {
  it('사용자 응답이 있을 때 표시된다', () => {
    render(<MyResponseBadge myResponse="리더" />);
    expect(screen.getByTestId('my-response-badge')).toBeInTheDocument();
    expect(screen.getByTestId('my-response-badge')).toHaveTextContent('리더');
  });

  it('사용자 응답이 없을 때 렌더링하지 않는다', () => {
    render(<MyResponseBadge myResponse={null} />);
    expect(screen.queryByTestId('my-response-badge')).not.toBeInTheDocument();
  });
});

// ===== ResultsBarChart =====
describe('ResultsBarChart', () => {
  it('결과 차트가 렌더링된다', () => {
    render(<ResultsBarChart results={mockAggregateData.results} />);
    expect(screen.getByTestId('results-bar-chart')).toBeInTheDocument();
  });

  it('Recharts ResponsiveContainer가 렌더링된다', () => {
    render(<ResultsBarChart results={mockAggregateData.results} />);
    expect(screen.getByTestId('recharts-responsive-container')).toBeInTheDocument();
  });

  it('각 선택지별 결과가 표시된다', () => {
    render(<ResultsBarChart results={mockAggregateData.results} />);
    // 옵션 레이블이 화면에 표시되어야 함
    expect(screen.getByText('리더')).toBeInTheDocument();
    expect(screen.getByText('실무자')).toBeInTheDocument();
  });

  it('비율(%)이 표시된다', () => {
    render(<ResultsBarChart results={mockAggregateData.results} />);
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('참여자 수(n)가 표시된다', () => {
    render(<ResultsBarChart results={mockAggregateData.results} />);
    expect(screen.getByText('30명')).toBeInTheDocument();
    expect(screen.getByText('48명')).toBeInTheDocument();
  });
});

// ===== TypeDistributionChart =====
describe('TypeDistributionChart', () => {
  it('회원인 경우 페르소나 분포가 렌더링된다', () => {
    render(
      <TypeDistributionChart
        distribution={mockAggregateData.persona_distribution}
        isAuthenticated={true}
      />
    );
    expect(screen.getByTestId('type-distribution-chart')).toBeInTheDocument();
  });

  it('비회원인 경우 렌더링하지 않는다', () => {
    render(
      <TypeDistributionChart
        distribution={mockAggregateData.persona_distribution}
        isAuthenticated={false}
      />
    );
    expect(screen.queryByTestId('type-distribution-chart')).not.toBeInTheDocument();
  });

  it('각 페르소나 이름이 표시된다', () => {
    render(
      <TypeDistributionChart
        distribution={mockAggregateData.persona_distribution}
        isAuthenticated={true}
      />
    );
    expect(screen.getByText('전략적 성과자')).toBeInTheDocument();
    expect(screen.getByText('자율형 독립가')).toBeInTheDocument();
  });
});

// ===== MinorityViewCard =====
describe('MinorityViewCard', () => {
  it('소수 의견이 있을 때 렌더링된다', () => {
    render(
      <MinorityViewCard
        minorityOption={mockAggregateData.minority_option}
        minorityPercentage={mockAggregateData.minority_percentage}
      />
    );
    expect(screen.getByTestId('minority-view-card')).toBeInTheDocument();
  });

  it('소수 의견 선택지명이 표시된다', () => {
    render(
      <MinorityViewCard
        minorityOption="전문가"
        minorityPercentage={15}
      />
    );
    expect(screen.getByTestId('minority-view-card')).toHaveTextContent('전문가');
  });

  it('소수 의견 비율이 표시된다', () => {
    render(
      <MinorityViewCard
        minorityOption="전문가"
        minorityPercentage={15}
      />
    );
    expect(screen.getByTestId('minority-view-card')).toHaveTextContent('15%');
  });

  it('소수 의견이 없을 때 렌더링하지 않는다', () => {
    render(
      <MinorityViewCard
        minorityOption={null}
        minorityPercentage={null}
      />
    );
    expect(screen.queryByTestId('minority-view-card')).not.toBeInTheDocument();
  });
});

// ===== InsightText =====
describe('InsightText', () => {
  it('인사이트 텍스트가 표시된다', () => {
    render(<InsightText insight={mockAggregateData.insight} />);
    expect(screen.getByTestId('insight-text')).toBeInTheDocument();
    expect(screen.getByTestId('insight-text')).toHaveTextContent('자율형 독립가 중 45%가 실무자를 선택했어요');
  });

  it('인사이트가 null이면 렌더링하지 않는다', () => {
    render(<InsightText insight={null} />);
    expect(screen.queryByTestId('insight-text')).not.toBeInTheDocument();
  });
});

// ===== NavigationButtons =====
describe('NavigationButtons', () => {
  it('이전/다음 질문 결과 버튼이 렌더링된다', () => {
    render(
      <NavigationButtons
        prevQuestionId="q-uuid-0"
        nextQuestionId="q-uuid-2"
      />
    );
    expect(screen.getByTestId('nav-prev')).toBeInTheDocument();
    expect(screen.getByTestId('nav-next')).toBeInTheDocument();
  });

  it('피드로 버튼이 렌더링된다', () => {
    render(
      <NavigationButtons
        prevQuestionId="q-uuid-0"
        nextQuestionId="q-uuid-2"
      />
    );
    expect(screen.getByTestId('nav-feed')).toBeInTheDocument();
  });

  it('이전 질문 버튼이 올바른 href를 가진다', () => {
    render(
      <NavigationButtons
        prevQuestionId="q-uuid-0"
        nextQuestionId="q-uuid-2"
      />
    );
    const prevLink = screen.getByTestId('nav-prev');
    expect(prevLink.closest('a')).toHaveAttribute('href', '/question/q-uuid-0/result');
  });

  it('다음 질문 버튼이 올바른 href를 가진다', () => {
    render(
      <NavigationButtons
        prevQuestionId="q-uuid-0"
        nextQuestionId="q-uuid-2"
      />
    );
    const nextLink = screen.getByTestId('nav-next');
    expect(nextLink.closest('a')).toHaveAttribute('href', '/question/q-uuid-2/result');
  });

  it('이전 질문이 없을 때 이전 버튼이 비활성화된다', () => {
    render(
      <NavigationButtons
        prevQuestionId={null}
        nextQuestionId="q-uuid-2"
      />
    );
    const prevBtn = screen.getByTestId('nav-prev');
    expect(prevBtn).toHaveAttribute('aria-disabled', 'true');
  });

  it('다음 질문이 없을 때 다음 버튼이 비활성화된다', () => {
    render(
      <NavigationButtons
        prevQuestionId="q-uuid-0"
        nextQuestionId={null}
      />
    );
    const nextBtn = screen.getByTestId('nav-next');
    expect(nextBtn).toHaveAttribute('aria-disabled', 'true');
  });

  it('피드로 버튼 href가 /feed를 가리킨다', () => {
    render(
      <NavigationButtons
        prevQuestionId="q-uuid-0"
        nextQuestionId="q-uuid-2"
      />
    );
    expect(screen.getByTestId('nav-feed').closest('a')).toHaveAttribute('href', '/feed');
  });
});
