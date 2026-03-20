// @TASK P2-S5-T2 - 가입 플로우 Supabase Auth 연동 + 리다이렉트
// @SPEC docs/planning/03-user-flow.md#signup

import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SignupPage from '@/app/signup/page';

// fetch mock
const mockFetch = vi.fn();
global.fetch = mockFetch;

// next/navigation mock
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
}));

// supabase auth mock
const mockSignUp = vi.fn();
vi.mock('@/lib/supabase/auth', () => ({
  signUp: mockSignUp,
}));

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ available: true }),
  });
  mockSignUp.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
  mockPush.mockClear();
  localStorageMock.clear();
});

describe('SignupPage - Step 1: 기본 정보', () => {
  it('ProgressIndicator에 Step 1/2 표시가 렌더링된다', () => {
    render(<SignupPage />);
    expect(screen.getByText(/1/)).toBeInTheDocument();
    expect(screen.getByText(/2/)).toBeInTheDocument();
  });

  it('이메일 입력 필드가 렌더링된다', () => {
    render(<SignupPage />);
    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument();
  });

  it('닉네임 입력 필드가 렌더링된다', () => {
    render(<SignupPage />);
    expect(screen.getByLabelText(/닉네임/i)).toBeInTheDocument();
  });

  it('비밀번호 입력 필드가 렌더링된다', () => {
    render(<SignupPage />);
    expect(screen.getByLabelText(/^비밀번호$/i)).toBeInTheDocument();
  });

  it('비밀번호 확인 입력 필드가 렌더링된다', () => {
    render(<SignupPage />);
    expect(screen.getByLabelText(/비밀번호 확인/i)).toBeInTheDocument();
  });

  it('[다음] 버튼이 렌더링된다', () => {
    render(<SignupPage />);
    expect(screen.getByRole('button', { name: /다음/i })).toBeInTheDocument();
  });

  it('Step 2 컨텐츠는 초기에 보이지 않는다', () => {
    render(<SignupPage />);
    expect(screen.queryByText(/산업군/i)).not.toBeInTheDocument();
  });
});

describe('SignupPage - Step 1: 이메일 검증', () => {
  it('잘못된 이메일 형식 입력 시 에러 메시지가 표시된다', async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    const emailInput = screen.getByLabelText(/이메일/i);
    await user.type(emailInput, 'invalid-email');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/유효한 이메일/i)).toBeInTheDocument();
    });
  });

  it('유효한 이메일 blur 시 중복 확인 API를 호출한다', async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    const emailInput = screen.getByLabelText(/이메일/i);
    await user.type(emailInput, 'test@example.com');
    await user.tab();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/auth/check-email',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('이미 사용 중인 이메일인 경우 에러 메시지를 표시한다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ available: false }),
    });

    const user = userEvent.setup();
    render(<SignupPage />);

    const emailInput = screen.getByLabelText(/이메일/i);
    await user.type(emailInput, 'taken@example.com');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/이미 사용 중/i)).toBeInTheDocument();
    });
  });
});

describe('SignupPage - Step 1: 닉네임 검증', () => {
  it('닉네임이 2자 미만이면 에러 메시지가 표시된다', async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    const nicknameInput = screen.getByLabelText(/닉네임/i);
    await user.type(nicknameInput, 'a');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/2자 이상/i)).toBeInTheDocument();
    });
  });

  it('닉네임이 20자 초과이면 에러 메시지가 표시된다', async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    const nicknameInput = screen.getByLabelText(/닉네임/i);
    await user.type(nicknameInput, 'a'.repeat(21));
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/20자 이하/i)).toBeInTheDocument();
    });
  });
});

describe('SignupPage - Step 1: 비밀번호 강도 표시기', () => {
  it('8자 미만 비밀번호 입력 시 weak 강도를 표시한다', async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.type(screen.getByLabelText(/^비밀번호$/i), 'abc');

    await waitFor(() => {
      expect(screen.getByText(/weak|약함/i)).toBeInTheDocument();
    });
  });

  it('영문+숫자 조합 비밀번호 입력 시 medium 강도를 표시한다', async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.type(screen.getByLabelText(/^비밀번호$/i), 'abcd1234');

    await waitFor(() => {
      expect(screen.getByText(/medium|보통/i)).toBeInTheDocument();
    });
  });

  it('특수문자 포함 비밀번호 입력 시 strong 강도를 표시한다', async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.type(screen.getByLabelText(/^비밀번호$/i), 'abcd1234!');

    await waitFor(() => {
      expect(screen.getByText(/strong|강함/i)).toBeInTheDocument();
    });
  });
});

describe('SignupPage - Step 1: 비밀번호 확인', () => {
  it('비밀번호 확인이 불일치하면 에러 메시지가 표시된다', async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.type(screen.getByLabelText(/^비밀번호$/i), 'password123!');
    await user.type(screen.getByLabelText(/비밀번호 확인/i), 'different123!');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/일치하지 않/i)).toBeInTheDocument();
    });
  });
});

describe('SignupPage - Step 1 → Step 2 전환', () => {
  async function fillStep1Valid(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText(/이메일/i), 'test@example.com');
    await user.tab();
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());

    await user.type(screen.getByLabelText(/닉네임/i), 'testuser');
    await user.type(screen.getByLabelText(/^비밀번호$/i), 'password123!');
    await user.type(screen.getByLabelText(/비밀번호 확인/i), 'password123!');
  }

  it('유효한 데이터 입력 후 [다음] 클릭 시 Step 2로 전환된다', async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await fillStep1Valid(user);
    await user.click(screen.getByRole('button', { name: /다음/i }));

    await waitFor(() => {
      expect(screen.getByText(/산업군/i)).toBeInTheDocument();
    });
  });

  it('Step 2 전환 시 ProgressIndicator가 2단계를 표시한다', async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await fillStep1Valid(user);
    await user.click(screen.getByRole('button', { name: /다음/i }));

    await waitFor(() => {
      expect(screen.getByTestId('progress-step-2')).toHaveAttribute(
        'aria-current',
        'step'
      );
    });
  });

  it('필수 필드가 비어있으면 [다음] 클릭 시 Step 2로 전환되지 않는다', async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.click(screen.getByRole('button', { name: /다음/i }));

    await waitFor(() => {
      expect(screen.queryByText(/산업군/i)).not.toBeInTheDocument();
    });
  });
});

describe('SignupPage - Step 2: 온보딩 정보', () => {
  async function goToStep2() {
    const user = userEvent.setup({ delay: null });
    render(<SignupPage />);

    await user.type(screen.getByLabelText(/이메일/i), 'test@example.com');
    await user.tab();
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());

    await user.type(screen.getByLabelText(/닉네임/i), 'testuser');
    await user.type(screen.getByLabelText(/^비밀번호$/i), 'password123!');
    await user.type(screen.getByLabelText(/비밀번호 확인/i), 'password123!');
    await user.click(screen.getByRole('button', { name: /다음/i }));

    await waitFor(() => {
      expect(screen.getByText(/산업군/i)).toBeInTheDocument();
    });

    return user;
  }

  it('IndustrySelector 드롭다운이 렌더링된다', async () => {
    await goToStep2();
    expect(screen.getByLabelText(/산업군/i)).toBeInTheDocument();
  });

  it('산업군 옵션에 IT가 포함된다', async () => {
    await goToStep2();
    const select = screen.getByLabelText(/산업군/i);
    expect(select).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'IT' })).toBeInTheDocument();
  });

  it('산업군 옵션에 Finance, Manufacturing, Service, Other가 포함된다', async () => {
    await goToStep2();
    expect(screen.getByRole('option', { name: 'Finance' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Manufacturing' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Service' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Other' })).toBeInTheDocument();
  });

  it('회사 규모 선택 카드들이 렌더링된다', async () => {
    await goToStep2();
    expect(screen.getByTestId('company-size-startup')).toBeInTheDocument();
    expect(screen.getByTestId('company-size-medium')).toBeInTheDocument();
    expect(screen.getByTestId('company-size-large')).toBeInTheDocument();
    expect(screen.getByTestId('company-size-xlarge')).toBeInTheDocument();
  });

  it('[건너뛰기] 버튼이 렌더링된다', async () => {
    await goToStep2();
    expect(screen.getByRole('button', { name: /건너뛰기/i })).toBeInTheDocument();
  });

  it('[가입 완료] 버튼이 렌더링된다', async () => {
    await goToStep2();
    expect(screen.getByRole('button', { name: /가입 완료/i })).toBeInTheDocument();
  });

  it('회사 규모 카드를 클릭하면 선택 상태가 표시된다', async () => {
    const user = await goToStep2();
    const startupCard = screen.getByTestId('company-size-startup');
    await user.click(startupCard);

    await waitFor(() => {
      expect(startupCard).toHaveAttribute('aria-pressed', 'true');
    });
  });
});

// ─── P2-S5-T2: Supabase Auth 연동 + 리다이렉트 테스트 ─────────────────────────

describe('SignupPage - 가입 제출: Supabase Auth 연동', () => {
  async function goToStep2() {
    const user = userEvent.setup({ delay: null });
    render(<SignupPage />);

    await user.type(screen.getByLabelText(/이메일/i), 'test@example.com');
    await user.tab();
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());

    await user.type(screen.getByLabelText(/닉네임/i), 'testuser');
    await user.type(screen.getByLabelText(/^비밀번호$/i), 'password123!');
    await user.type(screen.getByLabelText(/비밀번호 확인/i), 'password123!');
    await user.click(screen.getByRole('button', { name: /다음/i }));

    await waitFor(() => {
      expect(screen.getByText(/산업군/i)).toBeInTheDocument();
    });

    return user;
  }

  it('[가입 완료] 클릭 시 signUp()이 올바른 인자로 호출된다', async () => {
    const user = await goToStep2();
    await user.click(screen.getByRole('button', { name: /가입 완료/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        'test@example.com',
        'password123!',
        'testuser',
        expect.any(Object)
      );
    });
  });

  it('[건너뛰기] 클릭 시에도 signUp()이 호출된다', async () => {
    const user = await goToStep2();
    await user.click(screen.getByRole('button', { name: /건너뛰기/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalled();
    });
  });

  it('가입 성공 시 "가입되었습니다!" 메시지가 표시된다', async () => {
    const user = await goToStep2();
    await user.click(screen.getByRole('button', { name: /가입 완료/i }));

    await waitFor(() => {
      expect(screen.getByText(/가입되었습니다/i)).toBeInTheDocument();
    });
  });

  it('가입 성공 후 3초 뒤 /feed로 리다이렉트된다', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = await goToStep2();
    await user.click(screen.getByRole('button', { name: /가입 완료/i }));

    await waitFor(() => {
      expect(screen.getByText(/가입되었습니다/i)).toBeInTheDocument();
    });

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(mockPush).toHaveBeenCalledWith('/feed');
    vi.useRealTimers();
  });

  it('[피드로 이동] 버튼 클릭 시 즉시 /feed로 이동한다', async () => {
    const user = await goToStep2();
    await user.click(screen.getByRole('button', { name: /가입 완료/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /피드로 이동/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /피드로 이동/i }));
    expect(mockPush).toHaveBeenCalledWith('/feed');
  });

  it('가입 실패(API 에러) 시 에러 Toast가 표시된다', async () => {
    mockSignUp.mockResolvedValueOnce({
      data: null,
      error: { message: 'Email already registered' },
    });

    const user = await goToStep2();
    await user.click(screen.getByRole('button', { name: /가입 완료/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('이미 등록된 이메일 에러 시 적절한 에러 메시지가 표시된다', async () => {
    mockSignUp.mockResolvedValueOnce({
      data: null,
      error: { message: 'User already registered' },
    });

    const user = await goToStep2();
    await user.click(screen.getByRole('button', { name: /가입 완료/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('네트워크 에러 시 Toast 에러 메시지가 표시된다', async () => {
    mockSignUp.mockRejectedValueOnce(new Error('Network error'));

    const user = await goToStep2();
    await user.click(screen.getByRole('button', { name: /가입 완료/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('제출 중에는 [가입 완료] 버튼이 비활성화된다', async () => {
    let resolveSignUp!: (value: unknown) => void;
    mockSignUp.mockImplementationOnce(
      () => new Promise((resolve) => { resolveSignUp = resolve; })
    );

    const user = await goToStep2();

    // 클릭 직후 상태를 빠르게 확인하기 위해 클릭과 검증을 분리
    const submitButton = screen.getByRole('button', { name: /가입 완료/i });
    await user.click(submitButton);

    // 제출 중 — 버튼이 "처리 중..."으로 바뀌고 disabled
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /처리 중/i })).toBeDisabled();
    });

    // 정리
    await act(async () => {
      resolveSignUp({ data: { user: { id: '1' } }, error: null });
    });
  });
});

describe('SignupPage - 비회원 DNA 결과 연결', () => {
  async function goToStep2WithSession(sessionId: string) {
    localStorageMock.setItem('pendingSessionId', sessionId);
    const user = userEvent.setup({ delay: null });
    render(<SignupPage />);

    await user.type(screen.getByLabelText(/이메일/i), 'test@example.com');
    await user.tab();
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());

    await user.type(screen.getByLabelText(/닉네임/i), 'testuser');
    await user.type(screen.getByLabelText(/^비밀번호$/i), 'password123!');
    await user.type(screen.getByLabelText(/비밀번호 확인/i), 'password123!');
    await user.click(screen.getByRole('button', { name: /다음/i }));

    await waitFor(() => {
      expect(screen.getByText(/산업군/i)).toBeInTheDocument();
    });

    return user;
  }

  it('pendingSessionId가 있으면 가입 성공 후 PATCH /api/dna/results를 호출한다', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/auth/check-email') {
        return Promise.resolve({ ok: true, json: async () => ({ available: true }) });
      }
      if (url === '/api/dna/results') {
        return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });

    const user = await goToStep2WithSession('session-abc-123');
    await user.click(screen.getByRole('button', { name: /가입 완료/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/dna/results',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining('session-abc-123'),
        })
      );
    });
  });

  it('pendingSessionId가 없으면 PATCH 호출을 하지 않는다', async () => {
    const user = userEvent.setup({ delay: null });
    render(<SignupPage />);

    await user.type(screen.getByLabelText(/이메일/i), 'test@example.com');
    await user.tab();
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());

    await user.type(screen.getByLabelText(/닉네임/i), 'testuser');
    await user.type(screen.getByLabelText(/^비밀번호$/i), 'password123!');
    await user.type(screen.getByLabelText(/비밀번호 확인/i), 'password123!');
    await user.click(screen.getByRole('button', { name: /다음/i }));

    await waitFor(() => {
      expect(screen.getByText(/산업군/i)).toBeInTheDocument();
    });

    mockFetch.mockClear();
    await user.click(screen.getByRole('button', { name: /가입 완료/i }));

    await waitFor(() => {
      expect(screen.getByText(/가입되었습니다/i)).toBeInTheDocument();
    });

    const patchCalls = mockFetch.mock.calls.filter(
      (call: unknown[]) => call[1] && (call[1] as RequestInit).method === 'PATCH'
    );
    expect(patchCalls).toHaveLength(0);
  });
});
