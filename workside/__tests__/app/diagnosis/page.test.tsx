// @TASK P2-S2-T1, P2-S2-T2 - DNA 진단 페이지 테스트
// @SPEC docs/planning/03-user-flow.md#diagnosis

import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// router mock
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

import DiagnosisPage from '@/app/diagnosis/page';

// fetch mock
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  mockPush.mockReset();
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ id: 'session-123' }),
  });
});

describe('DiagnosisPage', () => {
  describe('VersionSelector — 초기 렌더링', () => {
    it('버전 선택 화면이 기본으로 렌더링된다', () => {
      render(<DiagnosisPage />);
      expect(screen.getByTestId('version-selector')).toBeInTheDocument();
    });

    it('세미 버전 카드가 렌더링된다', () => {
      render(<DiagnosisPage />);
      expect(screen.getByTestId('version-card-semi')).toBeInTheDocument();
    });

    it('풀 버전 카드가 렌더링된다', () => {
      render(<DiagnosisPage />);
      expect(screen.getByTestId('version-card-full')).toBeInTheDocument();
    });

    it('세미 버전 카드에 "3분, 12문항" 텍스트가 있다', () => {
      render(<DiagnosisPage />);
      const card = screen.getByTestId('version-card-semi');
      expect(within(card).getByText(/3분/)).toBeInTheDocument();
      expect(within(card).getByText(/12문항/)).toBeInTheDocument();
    });

    it('풀 버전 카드에 "10분, 40문항" 텍스트가 있다', () => {
      render(<DiagnosisPage />);
      const card = screen.getByTestId('version-card-full');
      expect(within(card).getByText(/10분/)).toBeInTheDocument();
      expect(within(card).getByText(/40문항/)).toBeInTheDocument();
    });

    it('문항 화면은 초기에 보이지 않는다', () => {
      render(<DiagnosisPage />);
      expect(screen.queryByTestId('question-card')).not.toBeInTheDocument();
    });
  });

  describe('VersionSelector — 세미 버전 선택', () => {
    it('세미 카드 클릭 시 문항 화면으로 전환된다', async () => {
      render(<DiagnosisPage />);
      fireEvent.click(screen.getByTestId('version-card-semi'));
      expect(await screen.findByTestId('question-card')).toBeInTheDocument();
    });

    it('세미 카드 클릭 시 버전 선택 화면이 사라진다', async () => {
      render(<DiagnosisPage />);
      fireEvent.click(screen.getByTestId('version-card-semi'));
      expect(await screen.findByTestId('question-card')).toBeInTheDocument();
      expect(screen.queryByTestId('version-selector')).not.toBeInTheDocument();
    });
  });

  describe('VersionSelector — 풀 버전 선택', () => {
    it('풀 카드 클릭 시 문항 화면으로 전환된다', async () => {
      render(<DiagnosisPage />);
      fireEvent.click(screen.getByTestId('version-card-full'));
      expect(await screen.findByTestId('question-card')).toBeInTheDocument();
    });
  });

  describe('QuestionCard — 문항 렌더링', () => {
    beforeEach(async () => {
      render(<DiagnosisPage />);
      fireEvent.click(screen.getByTestId('version-card-semi'));
      await screen.findByTestId('question-card');
    });

    it('question-card data-testid가 존재한다', () => {
      expect(screen.getByTestId('question-card')).toBeInTheDocument();
    });

    it('문항 번호 "1/12"가 표시된다', () => {
      expect(screen.getByTestId('question-progress')).toHaveTextContent('1/12');
    });

    it('첫 번째 문항 텍스트가 표시된다', () => {
      expect(screen.getByTestId('question-text')).toBeInTheDocument();
      expect(screen.getByTestId('question-text').textContent?.length).toBeGreaterThan(0);
    });

    it('LikertScale이 렌더링된다', () => {
      expect(screen.getByTestId('likert-scale')).toBeInTheDocument();
    });
  });

  describe('LikertScale — 7점 척도', () => {
    beforeEach(async () => {
      render(<DiagnosisPage />);
      fireEvent.click(screen.getByTestId('version-card-semi'));
      await screen.findByTestId('likert-scale');
    });

    it('7개의 라디오 버튼이 렌더링된다', () => {
      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(7);
    });

    it('라디오 버튼 값이 1~7이다', () => {
      const radios = screen.getAllByRole('radio');
      radios.forEach((radio, i) => {
        expect(radio).toHaveAttribute('value', String(i + 1));
      });
    });

    it('"전혀 아니다" 레이블이 표시된다', () => {
      expect(screen.getByText(/전혀 아니다/)).toBeInTheDocument();
    });

    it('"매우 그렇다" 레이블이 표시된다', () => {
      expect(screen.getByText(/매우 그렇다/)).toBeInTheDocument();
    });

    it('라디오 버튼 선택 시 상태가 업데이트된다', () => {
      const radios = screen.getAllByRole('radio');
      fireEvent.click(radios[3]); // value=4
      expect(radios[3]).toBeChecked();
    });

    it('한 번에 하나만 선택된다', () => {
      const radios = screen.getAllByRole('radio');
      fireEvent.click(radios[2]); // value=3
      fireEvent.click(radios[5]); // value=6
      expect(radios[2]).not.toBeChecked();
      expect(radios[5]).toBeChecked();
    });
  });

  describe('문항 진행', () => {
    beforeEach(async () => {
      render(<DiagnosisPage />);
      fireEvent.click(screen.getByTestId('version-card-semi'));
      await screen.findByTestId('question-card');
    });

    it('다음 버튼이 존재한다', () => {
      expect(screen.getByTestId('next-button')).toBeInTheDocument();
    });

    it('값 선택 후 다음 버튼 클릭 시 2번 문항으로 이동한다', async () => {
      const radios = screen.getAllByRole('radio');
      fireEvent.click(radios[2]);
      fireEvent.click(screen.getByTestId('next-button'));
      await waitFor(() => {
        expect(screen.getByTestId('question-progress')).toHaveTextContent('2/12');
      });
    });
  });

  // ── P2-S2-T2: ProgressBar ────────────────────────────────────────────────────
  describe('ProgressBar', () => {
    beforeEach(async () => {
      render(<DiagnosisPage />);
      fireEvent.click(screen.getByTestId('version-card-semi'));
      await screen.findByTestId('question-card');
    });

    it('progress-bar data-testid가 존재한다', () => {
      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
    });

    it('첫 문항에서 "1/12" 형식 텍스트가 표시된다', () => {
      expect(screen.getByTestId('progress-bar')).toHaveTextContent('1/12');
    });

    it('두 번째 문항으로 이동하면 "2/12"가 표시된다', async () => {
      const radios = screen.getAllByRole('radio');
      fireEvent.click(radios[2]);
      fireEvent.click(screen.getByTestId('next-button'));
      await waitFor(() => {
        expect(screen.getByTestId('progress-bar')).toHaveTextContent('2/12');
      });
    });
  });

  // ── P2-S2-T2: NavigationButtons ──────────────────────────────────────────────
  describe('NavigationButtons', () => {
    beforeEach(async () => {
      render(<DiagnosisPage />);
      fireEvent.click(screen.getByTestId('version-card-semi'));
      await screen.findByTestId('question-card');
    });

    it('prev-button data-testid가 존재한다', () => {
      expect(screen.getByTestId('prev-button')).toBeInTheDocument();
    });

    it('첫 문항에서 이전 버튼이 비활성화된다', () => {
      expect(screen.getByTestId('prev-button')).toBeDisabled();
    });

    it('값 미선택 시 다음 버튼이 비활성화된다', () => {
      expect(screen.getByTestId('next-button')).toBeDisabled();
    });

    it('값 선택 후 다음 버튼이 활성화된다', () => {
      const radios = screen.getAllByRole('radio');
      fireEvent.click(radios[2]);
      expect(screen.getByTestId('next-button')).not.toBeDisabled();
    });

    it('두 번째 문항에서 이전 버튼이 활성화된다', async () => {
      const radios = screen.getAllByRole('radio');
      fireEvent.click(radios[2]);
      fireEvent.click(screen.getByTestId('next-button'));
      await waitFor(() => {
        expect(screen.getByTestId('prev-button')).not.toBeDisabled();
      });
    });

    it('이전 버튼 클릭 시 이전 문항으로 돌아간다', async () => {
      const radios = screen.getAllByRole('radio');
      fireEvent.click(radios[2]);
      fireEvent.click(screen.getByTestId('next-button'));
      await waitFor(() => {
        expect(screen.getByTestId('question-progress')).toHaveTextContent('2/12');
      });
      fireEvent.click(screen.getByTestId('prev-button'));
      expect(screen.getByTestId('question-progress')).toHaveTextContent('1/12');
    });

    it('마지막 문항이 아니면 다음 버튼 텍스트가 "다음"이다', () => {
      expect(screen.getByTestId('next-button')).toHaveTextContent('다음');
    });
  });

  // ── P2-S2-T2: 마지막 문항 완료 버튼 ─────────────────────────────────────────
  describe('마지막 문항 — 완료 버튼', () => {
    it('마지막 문항에서 다음 버튼 텍스트가 "완료"이다', async () => {
      render(<DiagnosisPage />);
      fireEvent.click(screen.getByTestId('version-card-semi'));
      await screen.findByTestId('question-card');

      // 12문항 모두 응답하며 이동 (semi=12문항)
      for (let i = 0; i < 11; i++) {
        const radios = screen.getAllByRole('radio');
        fireEvent.click(radios[3]);
        fireEvent.click(screen.getByTestId('next-button'));
        await screen.findByTestId('question-card');
      }

      expect(screen.getByTestId('next-button')).toHaveTextContent('완료');
    });
  });

  // ── P2-S2-T2: 응답 저장 API 호출 ────────────────────────────────────────────
  describe('응답 저장', () => {
    it('다음 버튼 클릭 시 POST /api/dna/responses 가 호출된다', async () => {
      render(<DiagnosisPage />);
      fireEvent.click(screen.getByTestId('version-card-semi'));
      await screen.findByTestId('question-card');

      const radios = screen.getAllByRole('radio');
      fireEvent.click(radios[2]);
      fireEvent.click(screen.getByTestId('next-button'));

      await waitFor(() => {
        const calls = mockFetch.mock.calls;
        const responseCall = calls.find(c => String(c[0]).includes('/api/dna/responses'));
        expect(responseCall).toBeTruthy();
      });
    });
  });

  // ── P2-S2-T2: 완료 처리 ─────────────────────────────────────────────────────
  describe('완료 처리', () => {
    it('완료 클릭 시 loading-state가 표시된다', async () => {
      render(<DiagnosisPage />);
      fireEvent.click(screen.getByTestId('version-card-semi'));
      await screen.findByTestId('question-card');

      // 12문항 모두 응답
      for (let i = 0; i < 11; i++) {
        const radios = screen.getAllByRole('radio');
        fireEvent.click(radios[3]);
        fireEvent.click(screen.getByTestId('next-button'));
        await screen.findByTestId('question-card');
      }

      // 마지막 문항 응답 후 완료 클릭
      const radios = screen.getAllByRole('radio');
      fireEvent.click(radios[3]);
      fireEvent.click(screen.getByTestId('next-button'));

      expect(await screen.findByTestId('loading-state')).toBeInTheDocument();
    });

    it('완료 클릭 시 PATCH /api/dna/sessions/[id] 가 호출된다', async () => {
      render(<DiagnosisPage />);
      fireEvent.click(screen.getByTestId('version-card-semi'));
      await screen.findByTestId('question-card');

      for (let i = 0; i < 11; i++) {
        const radios = screen.getAllByRole('radio');
        fireEvent.click(radios[3]);
        fireEvent.click(screen.getByTestId('next-button'));
        await screen.findByTestId('question-card');
      }

      const radios = screen.getAllByRole('radio');
      fireEvent.click(radios[3]);
      fireEvent.click(screen.getByTestId('next-button'));

      await waitFor(() => {
        const calls = mockFetch.mock.calls;
        const patchCall = calls.find(
          c => String(c[0]).includes('/api/dna/sessions/') && c[1]?.method === 'PATCH'
        );
        expect(patchCall).toBeTruthy();
      });
    });

    it('완료 후 /result/:sessionId 로 리다이렉트된다', async () => {
      render(<DiagnosisPage />);
      fireEvent.click(screen.getByTestId('version-card-semi'));
      await screen.findByTestId('question-card');

      for (let i = 0; i < 11; i++) {
        const radios = screen.getAllByRole('radio');
        fireEvent.click(radios[3]);
        fireEvent.click(screen.getByTestId('next-button'));
        await screen.findByTestId('question-card');
      }

      const radios = screen.getAllByRole('radio');
      fireEvent.click(radios[3]);
      fireEvent.click(screen.getByTestId('next-button'));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/result/'));
      });
    });
  });

  describe('접근성', () => {
    it('VersionSelector 카드들은 button role을 가진다', () => {
      render(<DiagnosisPage />);
      expect(screen.getByTestId('version-card-semi').tagName).toBe('BUTTON');
      expect(screen.getByTestId('version-card-full').tagName).toBe('BUTTON');
    });

    it('LikertScale은 radiogroup role을 가진다', async () => {
      render(<DiagnosisPage />);
      fireEvent.click(screen.getByTestId('version-card-semi'));
      await screen.findByTestId('likert-scale');
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });
  });
});
