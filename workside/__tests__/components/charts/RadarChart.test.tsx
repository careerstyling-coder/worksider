// @TASK P2-S4-T1 - RadarChart 컴포넌트 테스트
// @SPEC docs/planning/02-trd.md#dna-results

import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DNARadarChart } from '@/components/charts/RadarChart';

// Recharts는 SVG 렌더링에 ResizeObserver가 필요함
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

// Recharts mock - jsdom 환경에서 SVG 렌더링 이슈 우회
vi.mock('recharts', () => ({
  RadarChart: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div data-testid="recharts-radar-chart" {...props}>
      {children}
    </div>
  ),
  Radar: ({ name, dataKey }: { name: string; dataKey: string }) => (
    <div data-testid="recharts-radar" data-name={name} data-datakey={dataKey} />
  ),
  PolarGrid: () => <div data-testid="recharts-polar-grid" />,
  PolarAngleAxis: ({ dataKey }: { dataKey: string }) => (
    <div data-testid="recharts-polar-angle-axis" data-datakey={dataKey} />
  ),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="recharts-responsive-container">{children}</div>
  ),
}));

const mockData = {
  p_score: 72,
  c_score: 45,
  pol_score: 38,
  s_score: 61,
};

describe('DNARadarChart', () => {
  describe('기본 렌더링', () => {
    it('RadarChart 컴포넌트가 렌더링된다', () => {
      render(<DNARadarChart data={mockData} />);
      expect(screen.getByTestId('dna-radar-chart')).toBeInTheDocument();
    });

    it('Recharts RadarChart가 내부에 렌더링된다', () => {
      render(<DNARadarChart data={mockData} />);
      expect(screen.getByTestId('recharts-radar-chart')).toBeInTheDocument();
    });

    it('PolarGrid가 렌더링된다', () => {
      render(<DNARadarChart data={mockData} />);
      expect(screen.getByTestId('recharts-polar-grid')).toBeInTheDocument();
    });

    it('PolarAngleAxis가 렌더링된다', () => {
      render(<DNARadarChart data={mockData} />);
      expect(screen.getByTestId('recharts-polar-angle-axis')).toBeInTheDocument();
    });

    it('Radar 요소가 렌더링된다', () => {
      render(<DNARadarChart data={mockData} />);
      expect(screen.getByTestId('recharts-radar')).toBeInTheDocument();
    });
  });

  describe('size prop', () => {
    it('size prop 없이 기본 렌더링된다 (medium 기본값)', () => {
      render(<DNARadarChart data={mockData} />);
      const chart = screen.getByTestId('dna-radar-chart');
      expect(chart).toBeInTheDocument();
    });

    it('size="small" 로 렌더링된다', () => {
      render(<DNARadarChart data={mockData} size="small" />);
      const chart = screen.getByTestId('dna-radar-chart');
      expect(chart).toBeInTheDocument();
    });

    it('size="medium" 로 렌더링된다', () => {
      render(<DNARadarChart data={mockData} size="medium" />);
      const chart = screen.getByTestId('dna-radar-chart');
      expect(chart).toBeInTheDocument();
    });

    it('size="large" 로 렌더링된다', () => {
      render(<DNARadarChart data={mockData} size="large" />);
      const chart = screen.getByTestId('dna-radar-chart');
      expect(chart).toBeInTheDocument();
    });

    it('size="small"이면 높이 200px 스타일을 가진다', () => {
      render(<DNARadarChart data={mockData} size="small" />);
      const chart = screen.getByTestId('dna-radar-chart');
      expect(chart.style.height).toBe('200px');
    });

    it('size="medium"이면 높이 300px 스타일을 가진다', () => {
      render(<DNARadarChart data={mockData} size="medium" />);
      const chart = screen.getByTestId('dna-radar-chart');
      expect(chart.style.height).toBe('300px');
    });

    it('size="large"이면 높이 400px 스타일을 가진다', () => {
      render(<DNARadarChart data={mockData} size="large" />);
      const chart = screen.getByTestId('dna-radar-chart');
      expect(chart.style.height).toBe('400px');
    });
  });

  describe('데이터 처리', () => {
    it('4개 축(P, C, Pol, S) 라벨이 데이터로 사용된다', () => {
      render(<DNARadarChart data={mockData} />);
      // PolarAngleAxis의 dataKey가 'axis'임을 확인
      const axis = screen.getByTestId('recharts-polar-angle-axis');
      expect(axis).toHaveAttribute('data-datakey', 'axis');
    });

    it('Radar의 dataKey가 "score"이다', () => {
      render(<DNARadarChart data={mockData} />);
      const radar = screen.getByTestId('recharts-radar');
      expect(radar).toHaveAttribute('data-datakey', 'score');
    });
  });
});
