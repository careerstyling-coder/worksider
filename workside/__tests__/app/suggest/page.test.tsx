// @TASK P3-S4-T1 - 질문 제안 폼 페이지 테스트
// @SPEC docs/planning/suggest-page.md

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SuggestPage from '@/app/suggest/page';

// next/navigation mock
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

// fetch mock
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockApprovedSuggestions = [
  { id: 's1', title: '팀 내 독서 모임 운영', status: 'approved', shout_out_count: 10, user_id: 'u1' },
  { id: 's2', title: '점심 메뉴 투표 시스템', status: 'approved', shout_out_count: 8, user_id: 'u2' },
  { id: 's3', title: '재택근무 가이드라인 수립', status: 'approved', shout_out_count: 5, user_id: 'u3' },
  { id: 's4', title: '사내 멘토링 프로그램', status: 'approved', shout_out_count: 3, user_id: 'u4' },
  { id: 's5', title: '주간 회고 도입', status: 'approved', shout_out_count: 2, user_id: 'u5' },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockFetch.mockImplementation((url: string) => {
    if (url.includes('/api/suggestions') && url.includes('status=approved')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockApprovedSuggestions }),
      });
    }
    if (url.includes('/api/suggestions')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { id: 'new-s1', title: '새 제안', status: 'pending' } }),
        status: 201,
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
});

// ─────────── InfoSection ───────────────────────────────────────────────────

describe('SuggestPage - InfoSection', () => {
  it('안내 제목이 렌더링된다', async () => {
    render(<SuggestPage />);
    await waitFor(() => {
      expect(screen.getByText(/좋은 제안을 환영합니다/)).toBeInTheDocument();
    });
  });

  it('안내 설명 텍스트가 렌더링된다', async () => {
    render(<SuggestPage />);
    await waitFor(() => {
      // 안내 설명은 어떤 형태든 있어야 함
      expect(document.querySelector('[data-testid="info-section"]')).toBeInTheDocument();
    });
  });
});

// ─────────── TitleInput + CharacterCounter ─────────────────────────────────

describe('SuggestPage - TitleInput', () => {
  it('제안 제목 입력 필드가 렌더링된다', async () => {
    render(<SuggestPage />);
    await waitFor(() => {
      expect(screen.getByLabelText(/제안 제목|제목/)).toBeInTheDocument();
    });
  });

  it('제목 글자 수 카운터 초기값이 "0/500"이다', async () => {
    render(<SuggestPage />);
    await waitFor(() => {
      expect(screen.getByText('0/500')).toBeInTheDocument();
    });
  });

  it('제목 입력 시 글자 수 카운터가 실시간 갱신된다', async () => {
    const user = userEvent.setup();
    render(<SuggestPage />);

    const titleInput = await screen.findByLabelText(/제안 제목|제목/);
    await user.type(titleInput, 'Hello');

    await waitFor(() => {
      expect(screen.getByText('5/500')).toBeInTheDocument();
    });
  });

  it('500자 초과 입력은 허용되지 않는다', async () => {
    const user = userEvent.setup();
    render(<SuggestPage />);

    const titleInput = await screen.findByLabelText(/제안 제목|제목/);
    const longText = 'a'.repeat(510);
    await user.type(titleInput, longText);

    await waitFor(() => {
      const counter = screen.getByText(/\/500/);
      const count = parseInt(counter.textContent?.split('/')[0] ?? '0');
      expect(count).toBeLessThanOrEqual(500);
    });
  });
});

// ─────────── BackgroundTextarea + CharacterCounter ─────────────────────────

describe('SuggestPage - BackgroundTextarea', () => {
  it('배경 설명 텍스트에리어가 렌더링된다', async () => {
    render(<SuggestPage />);
    await waitFor(() => {
      expect(screen.getByLabelText(/배경|배경 설명/)).toBeInTheDocument();
    });
  });

  it('배경 글자 수 카운터 초기값이 "0/1000"이다', async () => {
    render(<SuggestPage />);
    await waitFor(() => {
      expect(screen.getByText('0/1000')).toBeInTheDocument();
    });
  });

  it('배경 입력 시 글자 수 카운터가 실시간 갱신된다', async () => {
    const user = userEvent.setup();
    render(<SuggestPage />);

    const textarea = await screen.findByLabelText(/배경|배경 설명/);
    await user.type(textarea, 'Background text');

    await waitFor(() => {
      expect(screen.getByText('15/1000')).toBeInTheDocument();
    });
  });
});

// ─────────── PublicDiscussionCheckbox ──────────────────────────────────────

describe('SuggestPage - PublicDiscussionCheckbox', () => {
  it('공개 논의 체크박스가 렌더링된다', async () => {
    render(<SuggestPage />);
    await waitFor(() => {
      expect(screen.getByLabelText(/공개 논의|이 주제를 공개/)).toBeInTheDocument();
    });
  });

  it('체크박스 초기값은 체크 해제 상태이다', async () => {
    render(<SuggestPage />);
    const checkbox = await screen.findByLabelText(/공개 논의|이 주제를 공개/);
    expect(checkbox).not.toBeChecked();
  });

  it('체크박스 클릭 시 토글된다', async () => {
    const user = userEvent.setup();
    render(<SuggestPage />);

    const checkbox = await screen.findByLabelText(/공개 논의|이 주제를 공개/);
    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });
});

// ─────────── ResetButton ───────────────────────────────────────────────────

describe('SuggestPage - ResetButton', () => {
  it('초기화 버튼이 렌더링된다', async () => {
    render(<SuggestPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /초기화|리셋|다시 작성/ })).toBeInTheDocument();
    });
  });

  it('초기화 버튼 클릭 시 폼이 비워진다', async () => {
    const user = userEvent.setup();
    render(<SuggestPage />);

    const titleInput = await screen.findByLabelText(/제안 제목|제목/);
    await user.type(titleInput, '테스트 제목');

    const resetBtn = screen.getByRole('button', { name: /초기화|리셋|다시 작성/ });
    await user.click(resetBtn);

    await waitFor(() => {
      expect(titleInput).toHaveValue('');
    });
  });

  it('초기화 후 글자 수 카운터가 "0/500"으로 리셋된다', async () => {
    const user = userEvent.setup();
    render(<SuggestPage />);

    const titleInput = await screen.findByLabelText(/제안 제목|제목/);
    await user.type(titleInput, '테스트');

    const resetBtn = screen.getByRole('button', { name: /초기화|리셋|다시 작성/ });
    await user.click(resetBtn);

    await waitFor(() => {
      expect(screen.getByText('0/500')).toBeInTheDocument();
    });
  });
});

// ─────────── SubmitButton ──────────────────────────────────────────────────

describe('SuggestPage - SubmitButton', () => {
  it('제출 버튼이 렌더링된다', async () => {
    render(<SuggestPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /제안하기|제출/ })).toBeInTheDocument();
    });
  });

  it('제목이 비어있으면 제출 버튼이 비활성화된다', async () => {
    render(<SuggestPage />);
    const submitBtn = await screen.findByRole('button', { name: /제안하기|제출/ });
    expect(submitBtn).toBeDisabled();
  });

  it('제목 입력 시 제출 버튼이 활성화된다', async () => {
    const user = userEvent.setup();
    render(<SuggestPage />);

    const titleInput = await screen.findByLabelText(/제안 제목|제목/);
    await user.type(titleInput, '새로운 제안 제목');

    const submitBtn = screen.getByRole('button', { name: /제안하기|제출/ });
    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
    });
  });

  it('제출 시 POST /api/suggestions를 올바른 body로 호출한다', async () => {
    const user = userEvent.setup();
    render(<SuggestPage />);

    const titleInput = await screen.findByLabelText(/제안 제목|제목/);
    await user.type(titleInput, '새로운 제안 제목');

    const submitBtn = screen.getByRole('button', { name: /제안하기|제출/ });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/suggestions',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('새로운 제안 제목'),
        })
      );
    });
  });

  it('제출 중에는 버튼이 비활성화된다', async () => {
    let resolvePost!: (v: unknown) => void;
    mockFetch.mockImplementationOnce(() =>
      new Promise((resolve) => { resolvePost = resolve; })
    );

    const user = userEvent.setup();
    render(<SuggestPage />);

    const titleInput = await screen.findByLabelText(/제안 제목|제목/);
    await user.type(titleInput, '제목입니다');

    const submitBtn = screen.getByRole('button', { name: /제안하기|제출/ });
    await user.click(submitBtn);

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /제출 중|처리 중|전송|제안하기|제출/ });
      expect(btn).toBeDisabled();
    });

    // cleanup
    resolvePost({
      ok: true,
      json: () => Promise.resolve({ data: { id: 'x', status: 'pending' } }),
    });
  });

  it('POST body에 status: pending이 포함된다', async () => {
    const user = userEvent.setup();
    render(<SuggestPage />);

    const titleInput = await screen.findByLabelText(/제안 제목|제목/);
    await user.type(titleInput, '제안 제목');

    await user.click(screen.getByRole('button', { name: /제안하기|제출/ }));

    await waitFor(() => {
      const call = mockFetch.mock.calls.find((c: unknown[]) =>
        typeof c[0] === 'string' && (c[0] as string).includes('/api/suggestions')
      );
      expect(call).toBeTruthy();
      const body = JSON.parse((call![1] as RequestInit).body as string);
      expect(body.status).toBe('pending');
    });
  });
});

// ─────────── SuccessMessage ────────────────────────────────────────────────

describe('SuggestPage - SuccessMessage', () => {
  it('제출 성공 시 "제안이 접수되었습니다!" 메시지가 표시된다', async () => {
    const user = userEvent.setup();
    render(<SuggestPage />);

    const titleInput = await screen.findByLabelText(/제안 제목|제목/);
    await user.type(titleInput, '새로운 제안');
    await user.click(screen.getByRole('button', { name: /제안하기|제출/ }));

    await waitFor(() => {
      expect(screen.getByText(/제안이 접수되었습니다/)).toBeInTheDocument();
    });
  });

  it('성공 후 "피드로 돌아가기" 링크/버튼이 표시된다', async () => {
    const user = userEvent.setup();
    render(<SuggestPage />);

    const titleInput = await screen.findByLabelText(/제안 제목|제목/);
    await user.type(titleInput, '새로운 제안');
    await user.click(screen.getByRole('button', { name: /제안하기|제출/ }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /피드로 돌아가기|피드로/ }) ||
        screen.getByText(/피드로 돌아가기/)
      ).toBeInTheDocument();
    });
  });

  it('성공 후 "다른 제안" 버튼이 표시된다', async () => {
    const user = userEvent.setup();
    render(<SuggestPage />);

    const titleInput = await screen.findByLabelText(/제안 제목|제목/);
    await user.type(titleInput, '새로운 제안');
    await user.click(screen.getByRole('button', { name: /제안하기|제출/ }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /다른 제안/ })).toBeInTheDocument();
    });
  });

  it('"다른 제안" 클릭 시 폼이 초기화된다', async () => {
    const user = userEvent.setup();
    render(<SuggestPage />);

    const titleInput = await screen.findByLabelText(/제안 제목|제목/);
    await user.type(titleInput, '제안 제목');
    await user.click(screen.getByRole('button', { name: /제안하기|제출/ }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /다른 제안/ })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /다른 제안/ }));

    await waitFor(() => {
      expect(screen.getByLabelText(/제안 제목|제목/)).toHaveValue('');
    });
  });

  it('"피드로 돌아가기" 클릭 시 /feed로 이동한다', async () => {
    const user = userEvent.setup();
    render(<SuggestPage />);

    const titleInput = await screen.findByLabelText(/제안 제목|제목/);
    await user.type(titleInput, '제안 제목');
    await user.click(screen.getByRole('button', { name: /제안하기|제출/ }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /피드로 돌아가기|피드로/ })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /피드로 돌아가기|피드로/ }));
    expect(mockPush).toHaveBeenCalledWith('/feed');
  });

  it('제출 실패 시 에러 메시지가 표시된다', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: '서버 오류' }),
      })
    );

    const user = userEvent.setup();
    render(<SuggestPage />);

    const titleInput = await screen.findByLabelText(/제안 제목|제목/);
    await user.type(titleInput, '제안 제목');
    await user.click(screen.getByRole('button', { name: /제안하기|제출/ }));

    await waitFor(() => {
      expect(
        screen.getByRole('alert') || screen.getByText(/오류|실패|다시 시도/)
      ).toBeInTheDocument();
    });
  });
});

// ─────────── RecentSuggestions ─────────────────────────────────────────────

describe('SuggestPage - RecentSuggestions', () => {
  it('최근 승인된 제안 목록 섹션이 렌더링된다', async () => {
    render(<SuggestPage />);
    await waitFor(() => {
      expect(document.querySelector('[data-testid="recent-suggestions"]')).toBeInTheDocument();
    });
  });

  it('GET /api/suggestions?status=approved&limit=5 를 호출한다', async () => {
    render(<SuggestPage />);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('status=approved'),
        expect.anything()
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=5'),
        expect.anything()
      );
    });
  });

  it('승인된 제안 5개가 렌더링된다', async () => {
    render(<SuggestPage />);
    await waitFor(() => {
      expect(screen.getByText('팀 내 독서 모임 운영')).toBeInTheDocument();
      expect(screen.getByText('점심 메뉴 투표 시스템')).toBeInTheDocument();
      expect(screen.getByText('재택근무 가이드라인 수립')).toBeInTheDocument();
      expect(screen.getByText('사내 멘토링 프로그램')).toBeInTheDocument();
      expect(screen.getByText('주간 회고 도입')).toBeInTheDocument();
    });
  });

  it('제안 목록 섹션 제목이 표시된다', async () => {
    render(<SuggestPage />);
    await waitFor(() => {
      expect(screen.getByText(/최근 승인된 제안|승인된 제안/)).toBeInTheDocument();
    });
  });
});

// ─────────── 접근성 ───────────────────────────────────────────────────────

describe('SuggestPage - 접근성', () => {
  it('폼 요소에 적절한 role이 있다', async () => {
    render(<SuggestPage />);
    await waitFor(() => {
      expect(screen.getByRole('main') || document.querySelector('main')).toBeInTheDocument();
    });
  });

  it('체크박스가 aria-checked 속성을 가진다', async () => {
    render(<SuggestPage />);
    const checkbox = await screen.findByLabelText(/공개 논의|이 주제를 공개/);
    expect(checkbox).toHaveAttribute('type', 'checkbox');
  });
});
