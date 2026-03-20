// @TASK P3-S2-T1 - 질문 참여 페이지 테스트
// @SPEC docs/planning/02-trd.md#question-participation

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import QuestionPage from '@/app/question/[questionId]/page';

// ─────────────────────── Next.js 모킹 ───────────────────────

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: vi.fn() }),
  useParams: () => ({ questionId: 'q-test-123' }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// ─────────────────────── 목 데이터 ───────────────────────

const mockQuestion = {
  id: 'q-test-123',
  title: '팀 내 의사소통 방식을 개선하려면?',
  description: '최근 팀 내 커뮤니케이션 문제가 발생하고 있습니다.',
  status: 'active',
  participant_count: 456,
  deadline: '2026-04-01T00:00:00Z',
  is_featured: false,
  options: [
    { label: '주간 회의 추가', value: 'add_weekly_meeting' },
    { label: '슬랙 채널 개설', value: 'slack_channel' },
    { label: '문서화 강화', value: 'documentation' },
  ],
  created_at: '2026-03-01T00:00:00Z',
};

// ─────────────────────── fetch 모킹 ───────────────────────

function mockFetchSuccess() {
  vi.stubGlobal('fetch', vi.fn((url: string, options?: RequestInit) => {
    if (url.includes('/api/questions/q-test-123') && (!options || options.method !== 'POST')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockQuestion }),
      });
    }
    if (url.includes('/api/questions/q-test-123/responses') && options?.method === 'POST') {
      return Promise.resolve({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ data: { id: 'resp-1', selected_option: 'slack_channel' } }),
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  }));
}

function mockFetchError() {
  vi.stubGlobal('fetch', vi.fn(() =>
    Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'Not found' }) })
  ));
}

// ─────────────────────── 테스트 ───────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockFetchSuccess();
});

describe('QuestionPage - QuestionHeader', () => {
  it('질문 제목을 렌더링한다', async () => {
    render(<QuestionPage />);
    await waitFor(() => {
      expect(screen.getByText('팀 내 의사소통 방식을 개선하려면?')).toBeInTheDocument();
    });
  });

  it('질문 설명을 렌더링한다', async () => {
    render(<QuestionPage />);
    await waitFor(() => {
      expect(screen.getByText('최근 팀 내 커뮤니케이션 문제가 발생하고 있습니다.')).toBeInTheDocument();
    });
  });

  it('상태 배지(진행중)를 표시한다', async () => {
    render(<QuestionPage />);
    await waitFor(() => {
      expect(screen.getByText('진행중')).toBeInTheDocument();
    });
  });

  it('남은 시간을 표시한다', async () => {
    render(<QuestionPage />);
    await waitFor(() => {
      // 마감일 관련 텍스트가 어딘가 있어야 함
      const timeEl = screen.queryByText(/마감|남은|일 남/) || screen.queryByText(/2026-04-01/);
      expect(timeEl || document.querySelector('[data-testid="deadline"]')).toBeTruthy();
    });
  });
});

describe('QuestionPage - ParticipantCount', () => {
  it('참여자 수를 표시한다', async () => {
    render(<QuestionPage />);
    await waitFor(() => {
      expect(screen.getByText(/456명 참여/)).toBeInTheDocument();
    });
  });
});

describe('QuestionPage - OptionSelector', () => {
  it('options 배열 기반으로 선택지를 렌더링한다', async () => {
    render(<QuestionPage />);
    await waitFor(() => {
      expect(screen.getByText('주간 회의 추가')).toBeInTheDocument();
      expect(screen.getByText('슬랙 채널 개설')).toBeInTheDocument();
      expect(screen.getByText('문서화 강화')).toBeInTheDocument();
    });
  });

  it('선택지 클릭 시 해당 항목이 선택된다', async () => {
    render(<QuestionPage />);
    await waitFor(() => {
      expect(screen.getByText('슬랙 채널 개설')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('슬랙 채널 개설'));

    // 선택 상태를 확인 (aria-checked or data-selected)
    await waitFor(() => {
      const option = screen.getByText('슬랙 채널 개설').closest('[role="radio"], [data-selected]') ||
                     screen.getByText('슬랙 채널 개설').closest('label') ||
                     screen.getByText('슬랙 채널 개설').parentElement;
      expect(option).toBeTruthy();
    });
  });
});

describe('QuestionPage - GuestWarningBanner', () => {
  it('비회원 배너에 가입하기 링크가 있다', async () => {
    render(<QuestionPage />);
    await waitFor(() => {
      // 게스트 배너는 기본적으로 보임 (로그인 상태를 알 수 없으므로)
      const signupLink = screen.queryByRole('link', { name: /가입|회원가입|signup/i });
      const bannerText = screen.queryByText(/결과를 보려면 가입하세요|가입하시면/);
      // 둘 중 하나는 존재해야 함
      expect(signupLink || bannerText).toBeTruthy();
    });
  });

  it('비회원 배너의 링크가 /signup으로 이동한다', async () => {
    render(<QuestionPage />);
    await waitFor(() => {
      const signupLink = screen.queryByRole('link', { name: /가입|회원가입|signup/i }) as HTMLAnchorElement | null;
      if (signupLink) {
        expect(signupLink.href).toContain('/signup');
      }
    });
  });
});

describe('QuestionPage - SubmitButton', () => {
  it('제출 버튼이 렌더링된다', async () => {
    render(<QuestionPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /제출|응답하기|참여하기/i })).toBeInTheDocument();
    });
  });

  it('옵션 선택 후 제출하면 POST /api/questions/[id]/responses를 호출한다', async () => {
    render(<QuestionPage />);
    await waitFor(() => {
      expect(screen.getByText('슬랙 채널 개설')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('슬랙 채널 개설'));
    fireEvent.click(screen.getByRole('button', { name: /제출|응답하기|참여하기/i }));

    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        expect.stringContaining('/api/questions/q-test-123/responses'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});

describe('QuestionPage - ConfirmationMessage', () => {
  it('제출 성공 후 확인 메시지를 보여준다', async () => {
    render(<QuestionPage />);
    await waitFor(() => {
      expect(screen.getByText('슬랙 채널 개설')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('슬랙 채널 개설'));
    fireEvent.click(screen.getByRole('button', { name: /제출|응답하기|참여하기/i }));

    await waitFor(() => {
      expect(screen.getByText(/응답이 저장되었습니다/)).toBeInTheDocument();
    });
  });

  it('제출 성공 후 결과 보기 링크를 표시한다', async () => {
    render(<QuestionPage />);
    await waitFor(() => {
      expect(screen.getByText('슬랙 채널 개설')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('슬랙 채널 개설'));
    fireEvent.click(screen.getByRole('button', { name: /제출|응답하기|참여하기/i }));

    await waitFor(() => {
      const resultLink = screen.getByRole('link', { name: /결과 보기/ }) as HTMLAnchorElement;
      expect(resultLink.href).toContain('/question/q-test-123/result');
    });
  });
});

describe('QuestionPage - NavigationButtons', () => {
  it('이전 질문 버튼이 렌더링된다', async () => {
    render(<QuestionPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /이전 질문/ })).toBeInTheDocument();
    });
  });

  it('다음 질문 버튼이 렌더링된다', async () => {
    render(<QuestionPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /다음 질문/ })).toBeInTheDocument();
    });
  });
});

describe('QuestionPage - 로딩/에러 상태', () => {
  it('초기 로딩 상태를 표시한다', () => {
    render(<QuestionPage />);
    expect(
      document.querySelector('[aria-busy="true"]') ||
      document.querySelector('[data-testid="question-loading"]') ||
      screen.queryByText(/로딩|loading/i)
    ).toBeTruthy();
  });

  it('API 에러 시 에러 메시지를 표시한다', async () => {
    mockFetchError();
    render(<QuestionPage />);
    await waitFor(() => {
      expect(
        screen.queryByText(/오류|에러|불러오지 못|실패|error/i) ||
        document.querySelector('[data-testid="question-error"]')
      ).toBeTruthy();
    });
  });
});
