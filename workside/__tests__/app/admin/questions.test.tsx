// @TASK P5-S2-T1 - 질문 관리 페이지 테스트
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminQuestionsPage from '@/app/admin/questions/page';

const mockQuestions = [
  {
    id: 'q1',
    title: '팀 회의 빈도에 대해 어떻게 생각하시나요?',
    status: 'active',
    participant_count: 95,
    created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'q2',
    title: '재택근무 확대를 원하시나요?',
    status: 'draft',
    participant_count: 0,
    created_at: '2026-03-05T00:00:00Z',
  },
  {
    id: 'q3',
    title: '지난 분기 목표 달성률은?',
    status: 'closed',
    participant_count: 22,
    created_at: '2026-02-01T00:00:00Z',
  },
];

const mockSuggestions = [
  {
    id: 's1',
    title: '사내 도서관 운영을 제안합니다',
    user_id: 'user-1',
    status: 'pending',
    created_at: '2026-03-10T00:00:00Z',
  },
  {
    id: 's2',
    title: '스탠딩 데스크 도입을 원합니다',
    user_id: 'user-2',
    status: 'pending',
    created_at: '2026-03-12T00:00:00Z',
  },
];

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn((url: string, options?: RequestInit) => {
    if (url.includes('/api/questions') && !options?.method) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ questions: mockQuestions }),
      });
    }
    if (url.includes('/api/suggestions') && !options?.method) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ suggestions: mockSuggestions }),
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  }));
});

describe('AdminQuestionsPage', () => {
  it('renders page heading', async () => {
    render(<AdminQuestionsPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /질문 관리|Questions/i })).toBeInTheDocument();
    });
  });

  it('renders filter tabs', async () => {
    render(<AdminQuestionsPage />);
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /모든 질문|전체|all/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /초안|draft/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /배포중|active/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /마감|closed/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /제안 검토|suggestion/i })).toBeInTheDocument();
    });
  });

  it('renders questions table', async () => {
    render(<AdminQuestionsPage />);
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  it('renders question rows with title', async () => {
    render(<AdminQuestionsPage />);
    await waitFor(() => {
      expect(screen.getByText('팀 회의 빈도에 대해 어떻게 생각하시나요?')).toBeInTheDocument();
      expect(screen.getByText('재택근무 확대를 원하시나요?')).toBeInTheDocument();
    });
  });

  it('renders action buttons for each question', async () => {
    render(<AdminQuestionsPage />);
    await waitFor(() => {
      const editBtns = screen.getAllByRole('button', { name: /수정|edit/i });
      expect(editBtns.length).toBeGreaterThan(0);
    });
  });

  it('renders create question button', async () => {
    render(<AdminQuestionsPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /질문 만들기|새 질문|create|new question/i })).toBeInTheDocument();
    });
  });

  it('opens create question modal on button click', async () => {
    render(<AdminQuestionsPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /질문 만들기|새 질문|create|new question/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /질문 만들기|새 질문|create|new question/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('renders suggestion review section when tab is active', async () => {
    render(<AdminQuestionsPage />);
    await waitFor(() => {
      const suggestionTab = screen.getByRole('tab', { name: /제안 검토|suggestion/i });
      fireEvent.click(suggestionTab);
    });

    await waitFor(() => {
      expect(screen.getByText('사내 도서관 운영을 제안합니다')).toBeInTheDocument();
      expect(screen.getByText('스탠딩 데스크 도입을 원합니다')).toBeInTheDocument();
    });
  });

  it('renders adopt and reject buttons in suggestion review', async () => {
    render(<AdminQuestionsPage />);
    await waitFor(() => {
      const suggestionTab = screen.getByRole('tab', { name: /제안 검토|suggestion/i });
      fireEvent.click(suggestionTab);
    });

    await waitFor(() => {
      const adoptBtns = screen.getAllByRole('button', { name: /채택|adopt/i });
      const rejectBtns = screen.getAllByRole('button', { name: /반려|reject/i });
      expect(adoptBtns.length).toBeGreaterThan(0);
      expect(rejectBtns.length).toBeGreaterThan(0);
    });
  });

  it('filters questions by status when draft tab clicked', async () => {
    render(<AdminQuestionsPage />);
    await waitFor(() => {
      const draftTab = screen.getByRole('tab', { name: /초안|draft/i });
      fireEvent.click(draftTab);
    });

    await waitFor(() => {
      expect(screen.getByText('재택근무 확대를 원하시나요?')).toBeInTheDocument();
    });
  });

  it('renders sidebar with admin navigation', () => {
    render(<AdminQuestionsPage />);
    expect(screen.getByRole('navigation', { name: /admin/i })).toBeInTheDocument();
  });
});
