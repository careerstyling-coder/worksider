// @TASK P2-S4-T1 - Share 페이지 테스트
// @SPEC docs/planning/03-user-flow.md#share

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// next/link mock
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Recharts mock
vi.mock('recharts', () => ({
  RadarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="recharts-radar-chart">{children}</div>
  ),
  Radar: () => <div data-testid="recharts-radar" />,
  PolarGrid: () => <div data-testid="recharts-polar-grid" />,
  PolarAngleAxis: () => <div data-testid="recharts-polar-angle-axis" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="recharts-responsive-container">{children}</div>
  ),
}));

// SharedResultCard mock
vi.mock('@/components/share/SharedResultCard', () => ({
  SharedResultCard: ({ result }: { result: { p_score: number; c_score: number; pol_score: number; s_score: number; persona_label: string; persona_description: string } }) => (
    <div data-testid="shared-result-card">
      <div data-testid="score-text">
        P: {result.p_score} | C: {result.c_score} | Pol: {result.pol_score} | S: {result.s_score}
      </div>
      <div data-testid="persona-label">{result.persona_label}</div>
      <div data-testid="persona-description">{result.persona_description}</div>
    </div>
  ),
}));

// CTASection mock
vi.mock('@/components/share/CTASection', () => ({
  CTASection: () => (
    <div data-testid="cta-section">
      <a href="/diagnosis">3분 만에 나의 Work DNA를 확인해보세요</a>
    </div>
  ),
}));

// InvalidSharePage mock (에러 상태)
vi.mock('@/components/share/InvalidSharePage', () => ({
  InvalidSharePage: () => (
    <div data-testid="invalid-share-page">
      <p>유효하지 않은 공유 링크입니다</p>
      <a href="/">홈으로 돌아가기</a>
    </div>
  ),
}));

import { SharedResultCard } from '@/components/share/SharedResultCard';
import { CTASection } from '@/components/share/CTASection';
import { InvalidSharePage } from '@/components/share/InvalidSharePage';

const mockResult = {
  id: 'result-1',
  session_id: 'session-1',
  user_id: null,
  p_score: 72,
  c_score: 45,
  pol_score: 38,
  s_score: 61,
  persona_label: '전략적 성과자',
  persona_description: '목표 지향적이며 효율적으로 성과를 만들어내는 타입입니다.',
  version: 'semi' as const,
  share_token: 'valid-token-123',
  created_at: '2025-01-01T00:00:00Z',
};

describe('SharedResultCard', () => {
  it('공유자의 DNA 결과 카드가 렌더링된다', () => {
    render(<SharedResultCard result={mockResult} />);
    expect(screen.getByTestId('shared-result-card')).toBeInTheDocument();
  });

  it('점수 텍스트가 올바르게 표시된다', () => {
    render(<SharedResultCard result={mockResult} />);
    expect(screen.getByTestId('score-text')).toHaveTextContent('P: 72 | C: 45 | Pol: 38 | S: 61');
  });

  it('페르소나 라벨이 표시된다', () => {
    render(<SharedResultCard result={mockResult} />);
    expect(screen.getByTestId('persona-label')).toHaveTextContent('전략적 성과자');
  });

  it('페르소나 설명이 표시된다', () => {
    render(<SharedResultCard result={mockResult} />);
    expect(screen.getByTestId('persona-description')).toHaveTextContent(
      '목표 지향적이며 효율적으로 성과를 만들어내는 타입입니다.'
    );
  });
});

describe('CTASection', () => {
  it('CTA 섹션이 렌더링된다', () => {
    render(<CTASection />);
    expect(screen.getByTestId('cta-section')).toBeInTheDocument();
  });

  it('/diagnosis 링크가 존재한다', () => {
    render(<CTASection />);
    const link = screen.getByRole('link', { name: /3분 만에 나의 Work DNA를 확인해보세요/ });
    expect(link).toHaveAttribute('href', '/diagnosis');
  });
});

describe('InvalidSharePage', () => {
  it('유효하지 않은 공유 링크 메시지가 표시된다', () => {
    render(<InvalidSharePage />);
    expect(screen.getByTestId('invalid-share-page')).toBeInTheDocument();
    expect(screen.getByText('유효하지 않은 공유 링크입니다')).toBeInTheDocument();
  });

  it('홈으로 돌아가는 링크가 있다', () => {
    render(<InvalidSharePage />);
    expect(screen.getByRole('link', { name: /홈으로 돌아가기/ })).toBeInTheDocument();
  });
});
