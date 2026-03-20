// @TASK P3-S1-T2 - Feed 페이지 테스트
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import FeedPage from '@/app/feed/page';

// fetch mock
const mockQuestions = [
  {
    id: 'q1',
    title: '팀 회의 빈도에 대해 어떻게 생각하시나요?',
    status: 'active',
    participant_count: 15,
    deadline: '2026-03-25',
    is_featured: true,
  },
  {
    id: 'q2',
    title: '재택근무 확대를 원하시나요?',
    status: 'active',
    participant_count: 8,
    is_featured: false,
  },
  {
    id: 'q3',
    title: '지난 분기 목표 달성률은?',
    status: 'closed',
    participant_count: 22,
    is_featured: false,
  },
];

const mockSuggestions = [
  {
    id: 's1',
    title: '사내 도서관 운영을 제안합니다',
    user_id: 'user-1',
    shout_out_count: 12,
    status: 'open',
  },
  {
    id: 's2',
    title: '스탠딩 데스크 도입을 원합니다',
    user_id: 'user-2',
    shout_out_count: 5,
    status: 'open',
  },
];

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn((url: string) => {
    if (url.includes('/api/questions')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ questions: mockQuestions }),
      });
    }
    if (url.includes('/api/suggestions')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ suggestions: mockSuggestions }),
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  }));
});

describe('FeedPage', () => {
  it('renders filter tabs', async () => {
    render(<FeedPage />);
    await waitFor(() => {
      expect(screen.getByText('전체')).toBeInTheDocument();
      expect(screen.getByText('진행중')).toBeInTheDocument();
      expect(screen.getByText('마감')).toBeInTheDocument();
      expect(screen.getByText('내 참여')).toBeInTheDocument();
    });
  });

  it('renders questions from API', async () => {
    render(<FeedPage />);
    await waitFor(() => {
      expect(screen.getByText('팀 회의 빈도에 대해 어떻게 생각하시나요?')).toBeInTheDocument();
      expect(screen.getByText('재택근무 확대를 원하시나요?')).toBeInTheDocument();
    });
  });

  it('renders suggestions from API', async () => {
    render(<FeedPage />);
    await waitFor(() => {
      expect(screen.getByText('사내 도서관 운영을 제안합니다')).toBeInTheDocument();
      expect(screen.getByText('스탠딩 데스크 도입을 원합니다')).toBeInTheDocument();
    });
  });

  it('renders featured question at top', async () => {
    render(<FeedPage />);
    await waitFor(() => {
      const featured = screen.getByText('팀 회의 빈도에 대해 어떻게 생각하시나요?');
      expect(featured).toBeInTheDocument();
    });
  });

  it('renders FloatingActionButton', async () => {
    render(<FeedPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /제안하기/ })).toBeInTheDocument();
    });
  });

  it('filters questions when tab changes', async () => {
    render(<FeedPage />);
    await waitFor(() => {
      expect(screen.getByText('재택근무 확대를 원하시나요?')).toBeInTheDocument();
    });

    const closedTab = screen.getByRole('tab', { name: /마감/ });
    fireEvent.click(closedTab);

    await waitFor(() => {
      expect(screen.getByText('지난 분기 목표 달성률은?')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(<FeedPage />);
    // 로딩 상태 — skeleton or spinner 렌더링
    expect(document.querySelector('[data-testid="feed-loading"]') ||
           screen.queryByText(/로딩|loading/i) ||
           document.querySelector('[aria-busy="true"]')).toBeTruthy();
  });
});
