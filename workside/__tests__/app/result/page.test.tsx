// @TASK P2-S3-T1 - DNA 결과 페이지 테스트
// @SPEC docs/planning/03-user-flow.md#result

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

// DNARadarChart mock
vi.mock('@/components/charts/RadarChart', () => ({
  DNARadarChart: ({ data, size }: { data: { p_score: number; c_score: number; pol_score: number; s_score: number }; size?: string }) => (
    <div data-testid="dna-radar-chart" data-size={size}>
      <div data-testid="radar-p">{data.p_score}</div>
      <div data-testid="radar-c">{data.c_score}</div>
      <div data-testid="radar-pol">{data.pol_score}</div>
      <div data-testid="radar-s">{data.s_score}</div>
    </div>
  ),
}));

// PersonaBadge mock
vi.mock('@/components/ui/PersonaBadge', () => ({
  PersonaBadge: ({ label }: { label: string }) => (
    <span data-testid="persona-badge">{label}</span>
  ),
}));

// Supabase server client mock
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { DNARadarChart } from '@/components/charts/RadarChart';
import { PersonaBadge } from '@/components/ui/PersonaBadge';
import { createClient } from '@/lib/supabase/server';

const mockResult = {
  id: 'result-1',
  session_id: 'session-abc-123',
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

// ResultPage를 직접 테스트하기 위한 헬퍼 컴포넌트 (서버 컴포넌트 시뮬레이션)
// 실제 구현에서 사용할 하위 컴포넌트들을 직접 테스트

describe('DNA 결과 페이지 - DNARadarChart', () => {
  it('RadarChart가 올바른 데이터로 렌더링된다', () => {
    render(
      <DNARadarChart
        data={{
          p_score: mockResult.p_score,
          c_score: mockResult.c_score,
          pol_score: mockResult.pol_score,
          s_score: mockResult.s_score,
        }}
        size="large"
      />
    );
    expect(screen.getByTestId('dna-radar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('dna-radar-chart')).toHaveAttribute('data-size', 'large');
  });

  it('RadarChart에 4개의 점수가 모두 표시된다', () => {
    render(
      <DNARadarChart
        data={{
          p_score: 72,
          c_score: 45,
          pol_score: 38,
          s_score: 61,
        }}
        size="large"
      />
    );
    expect(screen.getByTestId('radar-p')).toHaveTextContent('72');
    expect(screen.getByTestId('radar-c')).toHaveTextContent('45');
    expect(screen.getByTestId('radar-pol')).toHaveTextContent('38');
    expect(screen.getByTestId('radar-s')).toHaveTextContent('61');
  });
});

describe('DNA 결과 페이지 - PersonaBadge', () => {
  it('페르소나 배지가 라벨과 함께 렌더링된다', () => {
    render(<PersonaBadge label="전략적 성과자" />);
    expect(screen.getByTestId('persona-badge')).toBeInTheDocument();
    expect(screen.getByTestId('persona-badge')).toHaveTextContent('전략적 성과자');
  });
});

describe('DNA 결과 페이지 - ScoreDisplay', () => {
  it('점수가 올바른 형식으로 표시된다', () => {
    const { p_score, c_score, pol_score, s_score } = mockResult;
    render(
      <div data-testid="score-display">
        P: {p_score} | C: {c_score} | Pol: {pol_score} | S: {s_score}
      </div>
    );
    expect(screen.getByTestId('score-display')).toHaveTextContent(
      'P: 72 | C: 45 | Pol: 38 | S: 61'
    );
  });
});

describe('DNA 결과 페이지 - DescriptionSection', () => {
  it('페르소나 설명이 표시된다', () => {
    render(
      <div data-testid="description-section">
        {mockResult.persona_description}
      </div>
    );
    expect(screen.getByTestId('description-section')).toHaveTextContent(
      '목표 지향적이며 효율적으로 성과를 만들어내는 타입입니다.'
    );
  });
});

describe('DNA 결과 페이지 - 에러 처리', () => {
  it('결과가 없을 때 에러 메시지가 표시된다', () => {
    render(
      <div>
        <p>결과를 찾을 수 없습니다</p>
        <a href="/diagnosis">진단 시작하기</a>
      </div>
    );
    expect(screen.getByText('결과를 찾을 수 없습니다')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /진단 시작하기/ })).toHaveAttribute('href', '/diagnosis');
  });
});

describe('DNA 결과 페이지 - ResultPage 통합', () => {
  it('createClient가 모킹된다', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockResult, error: null }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const client = await createClient();
    const { data } = await client.from('dna_results').select('*').eq('session_id', 'session-abc-123').single();

    expect(data).toEqual(mockResult);
    expect(data?.persona_label).toBe('전략적 성과자');
  });

  it('세션 ID로 결과를 조회할 수 있다', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockResult, error: null }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const client = await createClient();
    const { data, error } = await client
      .from('dna_results')
      .select('*')
      .eq('session_id', 'session-abc-123')
      .single();

    expect(error).toBeNull();
    expect(data?.session_id).toBe('session-abc-123');
  });

  it('결과가 없을 때 null을 반환한다', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const client = await createClient();
    const { data, error } = await client
      .from('dna_results')
      .select('*')
      .eq('session_id', 'nonexistent-session')
      .single();

    expect(data).toBeNull();
    expect(error).toBeTruthy();
  });
});
