// @TASK P5-S1-T1 - 관리자 대시보드 페이지 테스트
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminDashboardPage from '@/app/admin/page';

// Recharts mock
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Line: () => <div data-testid="recharts-line" />,
  Bar: () => <div data-testid="recharts-bar" />,
  XAxis: () => <div data-testid="recharts-xaxis" />,
  YAxis: () => <div data-testid="recharts-yaxis" />,
  CartesianGrid: () => <div data-testid="recharts-grid" />,
  Tooltip: () => <div data-testid="recharts-tooltip" />,
  Legend: () => <div data-testid="recharts-legend" />,
}));

const mockStats = {
  dna_completed: 142,
  question_participations: 389,
  share_clicks: 57,
  dau: 23,
};

const mockTrend = Array.from({ length: 14 }, (_, i) => ({
  date: `2026-03-${String(i + 1).padStart(2, '0')}`,
  count: Math.floor(Math.random() * 20) + 5,
}));

const mockEngagement = [
  { question_id: 'q1', title: '팀 회의 빈도', participation_count: 95 },
  { question_id: 'q2', title: '재택근무 확대', participation_count: 78 },
  { question_id: 'q3', title: '점심 식사 제도', participation_count: 64 },
  { question_id: 'q4', title: '사내 교육 프로그램', participation_count: 51 },
  { question_id: 'q5', title: '복지 포인트 확대', participation_count: 43 },
];

const mockSettings = {
  signup_gate_position: 'after_dna',
  question_deploy_cycle: 'weekly',
};

const mockActivities = [
  { id: 'a1', type: 'dna_completed', user: 'user@example.com', created_at: '2026-03-17T10:00:00Z' },
  { id: 'a2', type: 'question_participated', user: 'another@example.com', created_at: '2026-03-17T09:30:00Z' },
];

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn((url: string) => {
    if (url.includes('/api/admin/stats')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStats),
      });
    }
    if (url.includes('/api/admin/trend')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ trend: mockTrend }),
      });
    }
    if (url.includes('/api/admin/engagement')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ engagement: mockEngagement }),
      });
    }
    if (url.includes('/api/admin/settings') && !url.includes('PATCH')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSettings),
      });
    }
    if (url.includes('/api/admin/activities')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ activities: mockActivities }),
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  }));
});

describe('AdminDashboardPage', () => {
  it('renders page heading', async () => {
    render(<AdminDashboardPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /대시보드|Dashboard/i })).toBeInTheDocument();
    });
  });

  it('renders 4 stat cards', async () => {
    render(<AdminDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText(/DNA 진단 완료|dna.*완료/i)).toBeInTheDocument();
      expect(screen.getByText(/질문 참여|question.*참여/i)).toBeInTheDocument();
      expect(screen.getByText(/공유 클릭|share.*클릭/i)).toBeInTheDocument();
      expect(screen.getByText(/활성 사용자|DAU|dau/i)).toBeInTheDocument();
    });
  });

  it('renders DNA trend line chart', async () => {
    render(<AdminDashboardPage />);
    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  it('renders question engagement bar chart', async () => {
    render(<AdminDashboardPage />);
    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  it('renders settings panel with signup gate radio buttons', async () => {
    render(<AdminDashboardPage />);
    await waitFor(() => {
      const radios = screen.getAllByRole('radio');
      expect(radios.length).toBeGreaterThan(0);
    });
  });

  it('renders question deploy cycle select', async () => {
    render(<AdminDashboardPage />);
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  it('renders save settings button', async () => {
    render(<AdminDashboardPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /저장|save/i })).toBeInTheDocument();
    });
  });

  it('renders activity feed section', async () => {
    render(<AdminDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText(/최근 활동|Activity/i)).toBeInTheDocument();
    });
  });

  it('calls PATCH on save settings', async () => {
    const fetchMock = vi.fn((url: string, options?: RequestInit) => {
      if (options?.method === 'PATCH' && url.includes('/api/admin/settings')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockSettings) });
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<AdminDashboardPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /저장|save/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /저장|save/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/settings'),
        expect.objectContaining({ method: 'PATCH' })
      );
    });
  });

  it('renders sidebar with admin navigation', async () => {
    render(<AdminDashboardPage />);
    expect(screen.getByRole('navigation', { name: /admin/i })).toBeInTheDocument();
  });
});
