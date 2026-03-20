// @TASK P5-S3-T1 - 사용자 관리 페이지 테스트
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminUsersPage from '@/app/admin/users/page';

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
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: () => <div data-testid="recharts-pie" />,
  Cell: () => <div data-testid="recharts-cell" />,
  Line: () => <div data-testid="recharts-line" />,
  Bar: () => <div data-testid="recharts-bar" />,
  XAxis: () => <div data-testid="recharts-xaxis" />,
  YAxis: () => <div data-testid="recharts-yaxis" />,
  CartesianGrid: () => <div data-testid="recharts-grid" />,
  Tooltip: () => <div data-testid="recharts-tooltip" />,
  Legend: () => <div data-testid="recharts-legend" />,
}));

const mockUserStats = {
  total_users: 512,
  active_30d: 234,
  re_engagement_rate: 67.5,
  avg_session_minutes: 8.3,
};

const mockDemographics = {
  by_industry: [
    { industry: 'IT/소프트웨어', count: 180 },
    { industry: '금융/핀테크', count: 95 },
    { industry: '커머스/유통', count: 72 },
    { industry: '의료/바이오', count: 45 },
    { industry: '기타', count: 120 },
  ],
  by_company_size: [
    { size: '1-10명', count: 60 },
    { size: '11-50명', count: 120 },
    { size: '51-200명', count: 180 },
    { size: '201명 이상', count: 152 },
  ],
};

const mockUsers = [
  {
    id: 'u1',
    nickname: '비전있는나',
    email: 'vision@example.com',
    created_at: '2026-01-15T00:00:00Z',
    industry: 'IT/소프트웨어',
    dna_count: 3,
  },
  {
    id: 'u2',
    nickname: '성장중인팀',
    email: 'growth@example.com',
    created_at: '2026-02-01T00:00:00Z',
    industry: '금융/핀테크',
    dna_count: 1,
  },
  {
    id: 'u3',
    nickname: '커피한잔',
    email: 'coffee@example.com',
    created_at: '2026-03-01T00:00:00Z',
    industry: '커머스/유통',
    dna_count: 2,
  },
];

const mockCohort = Array.from({ length: 8 }, (_, i) => ({
  week: `2026-W${String(i + 1).padStart(2, '0')}`,
  re_engagement_rate: Math.floor(Math.random() * 40) + 40,
}));

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn((url: string) => {
    if (url.includes('/api/admin/user-stats')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserStats),
      });
    }
    if (url.includes('/api/admin/demographics')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockDemographics),
      });
    }
    if (url.includes('/api/admin/users')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ users: mockUsers }),
      });
    }
    if (url.includes('/api/admin/cohort')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ cohort: mockCohort }),
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  }));
});

describe('AdminUsersPage', () => {
  it('renders page heading', async () => {
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /사용자 관리|Users/i })).toBeInTheDocument();
    });
  });

  it('renders 4 user stat cards', async () => {
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(screen.getByText(/총 가입자|total.*user/i)).toBeInTheDocument();
      expect(screen.getByText(/활성 사용자|active.*user/i)).toBeInTheDocument();
      expect(screen.getByText(/재참여율|re.*engagement/i)).toBeInTheDocument();
      expect(screen.getByText(/평균 세션|avg.*session/i)).toBeInTheDocument();
    });
  });

  it('renders industry distribution pie chart', async () => {
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });
  });

  it('renders company size bar chart', async () => {
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  it('renders search bar', async () => {
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(screen.getByRole('searchbox')).toBeInTheDocument();
    });
  });

  it('renders user table', async () => {
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  it('renders user rows', async () => {
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(screen.getByText('비전있는나')).toBeInTheDocument();
      expect(screen.getByText('성장중인팀')).toBeInTheDocument();
    });
  });

  it('renders cohort line chart', async () => {
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  it('filters users by search input', async () => {
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(screen.getByRole('searchbox')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: '비전' } });

    await waitFor(() => {
      expect(screen.getByText('비전있는나')).toBeInTheDocument();
    });
  });

  it('renders sidebar with admin navigation', () => {
    render(<AdminUsersPage />);
    expect(screen.getByRole('navigation', { name: /admin/i })).toBeInTheDocument();
  });
});
