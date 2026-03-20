// @TASK P2-S3-T2 - ShareButtons 컴포넌트 테스트
// @SPEC docs/planning/03-user-flow.md#share

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// next/link mock
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// navigator.clipboard mock
const mockWriteText = vi.fn();
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: mockWriteText },
  writable: true,
  configurable: true,
});

// window.open mock
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true,
  configurable: true,
});

import { ShareButtons } from '@/components/ShareButtons';

const defaultProps = {
  url: 'https://workside.app/share/token-abc',
  title: '나의 Work DNA: 전략적 성과자',
  description: '목표 지향적이며 효율적으로 성과를 만들어내는 타입',
};

describe('ShareButtons - 렌더링', () => {
  it('data-testid="share-buttons"로 렌더링된다', () => {
    render(<ShareButtons {...defaultProps} />);
    expect(screen.getByTestId('share-buttons')).toBeInTheDocument();
  });

  it('Twitter 공유 버튼이 렌더링된다', () => {
    render(<ShareButtons {...defaultProps} />);
    expect(screen.getByTestId('share-twitter')).toBeInTheDocument();
  });

  it('Facebook 공유 버튼이 렌더링된다', () => {
    render(<ShareButtons {...defaultProps} />);
    expect(screen.getByTestId('share-facebook')).toBeInTheDocument();
  });

  it('링크 복사 버튼이 렌더링된다', () => {
    render(<ShareButtons {...defaultProps} />);
    expect(screen.getByTestId('share-copy')).toBeInTheDocument();
  });

  it('description이 없어도 렌더링된다', () => {
    render(<ShareButtons url={defaultProps.url} title={defaultProps.title} />);
    expect(screen.getByTestId('share-buttons')).toBeInTheDocument();
  });
});

describe('ShareButtons - Twitter 공유', () => {
  beforeEach(() => {
    mockWindowOpen.mockClear();
  });

  it('Twitter 버튼 클릭 시 window.open이 호출된다', () => {
    render(<ShareButtons {...defaultProps} />);
    fireEvent.click(screen.getByTestId('share-twitter'));
    expect(mockWindowOpen).toHaveBeenCalledTimes(1);
  });

  it('Twitter URL에 tweet intent 경로가 포함된다', () => {
    render(<ShareButtons {...defaultProps} />);
    fireEvent.click(screen.getByTestId('share-twitter'));
    const calledUrl = mockWindowOpen.mock.calls[0][0] as string;
    expect(calledUrl).toContain('twitter.com/intent/tweet');
  });

  it('Twitter URL에 공유 URL이 인코딩되어 포함된다', () => {
    render(<ShareButtons {...defaultProps} />);
    fireEvent.click(screen.getByTestId('share-twitter'));
    const calledUrl = mockWindowOpen.mock.calls[0][0] as string;
    expect(calledUrl).toContain(encodeURIComponent(defaultProps.url));
  });

  it('Twitter URL에 타이틀이 인코딩되어 포함된다', () => {
    render(<ShareButtons {...defaultProps} />);
    fireEvent.click(screen.getByTestId('share-twitter'));
    const calledUrl = mockWindowOpen.mock.calls[0][0] as string;
    expect(calledUrl).toContain(encodeURIComponent(defaultProps.title));
  });
});

describe('ShareButtons - Facebook 공유', () => {
  beforeEach(() => {
    mockWindowOpen.mockClear();
  });

  it('Facebook 버튼 클릭 시 window.open이 호출된다', () => {
    render(<ShareButtons {...defaultProps} />);
    fireEvent.click(screen.getByTestId('share-facebook'));
    expect(mockWindowOpen).toHaveBeenCalledTimes(1);
  });

  it('Facebook URL에 sharer.php 경로가 포함된다', () => {
    render(<ShareButtons {...defaultProps} />);
    fireEvent.click(screen.getByTestId('share-facebook'));
    const calledUrl = mockWindowOpen.mock.calls[0][0] as string;
    expect(calledUrl).toContain('facebook.com/sharer');
  });

  it('Facebook URL에 공유 URL이 포함된다', () => {
    render(<ShareButtons {...defaultProps} />);
    fireEvent.click(screen.getByTestId('share-facebook'));
    const calledUrl = mockWindowOpen.mock.calls[0][0] as string;
    expect(calledUrl).toContain(encodeURIComponent(defaultProps.url));
  });
});

describe('ShareButtons - 링크 복사', () => {
  beforeEach(() => {
    mockWriteText.mockClear();
    mockWriteText.mockResolvedValue(undefined);
  });

  it('복사 버튼 클릭 시 navigator.clipboard.writeText가 호출된다', async () => {
    render(<ShareButtons {...defaultProps} />);
    fireEvent.click(screen.getByTestId('share-copy'));
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(defaultProps.url);
    });
  });

  it('복사 성공 시 Toast "링크가 복사되었습니다"가 표시된다', async () => {
    render(<ShareButtons {...defaultProps} />);
    fireEvent.click(screen.getByTestId('share-copy'));
    await waitFor(() => {
      expect(screen.getByText('링크가 복사되었습니다')).toBeInTheDocument();
    });
  });

  it('Toast 메시지가 일정 시간 후 사라진다', async () => {
    vi.useFakeTimers();
    render(<ShareButtons {...defaultProps} />);

    // clipboard 비동기 처리 후 state 업데이트를 act로 감싼다
    await act(async () => {
      fireEvent.click(screen.getByTestId('share-copy'));
    });

    expect(screen.getByText('링크가 복사되었습니다')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3500);
    });

    expect(screen.queryByText('링크가 복사되었습니다')).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});

describe('ShareButtons - 접근성', () => {
  it('Twitter 버튼에 aria-label이 있다', () => {
    render(<ShareButtons {...defaultProps} />);
    const twitterBtn = screen.getByTestId('share-twitter');
    expect(twitterBtn).toHaveAttribute('aria-label');
  });

  it('Facebook 버튼에 aria-label이 있다', () => {
    render(<ShareButtons {...defaultProps} />);
    const facebookBtn = screen.getByTestId('share-facebook');
    expect(facebookBtn).toHaveAttribute('aria-label');
  });

  it('복사 버튼에 aria-label이 있다', () => {
    render(<ShareButtons {...defaultProps} />);
    const copyBtn = screen.getByTestId('share-copy');
    expect(copyBtn).toHaveAttribute('aria-label');
  });
});

describe('SaveResultButton - 렌더링', () => {
  it('data-testid="save-result-button"으로 렌더링된다', () => {
    render(<ShareButtons {...defaultProps} />);
    expect(screen.getByTestId('save-result-button')).toBeInTheDocument();
  });

  it('"결과를 저장하려면 가입하세요" 텍스트가 표시된다', () => {
    render(<ShareButtons {...defaultProps} />);
    expect(screen.getByText(/결과를 저장하려면 가입하세요/)).toBeInTheDocument();
  });

  it('/signup 링크를 가진다', () => {
    render(<ShareButtons {...defaultProps} />);
    const link = screen.getByTestId('save-result-button');
    expect(link.closest('a') || link).toHaveAttribute('href', '/signup');
  });
});

describe('UpgradeSection - 렌더링', () => {
  it('version이 semi일 때 data-testid="upgrade-section"이 표시된다', () => {
    render(<ShareButtons {...defaultProps} version="semi" />);
    expect(screen.getByTestId('upgrade-section')).toBeInTheDocument();
  });

  it('version이 full일 때 upgrade-section이 표시되지 않는다', () => {
    render(<ShareButtons {...defaultProps} version="full" />);
    expect(screen.queryByTestId('upgrade-section')).not.toBeInTheDocument();
  });

  it('version이 없을 때 upgrade-section이 표시되지 않는다', () => {
    render(<ShareButtons {...defaultProps} />);
    expect(screen.queryByTestId('upgrade-section')).not.toBeInTheDocument();
  });

  it('"더 정밀한 진단을 원하시나요? 풀 버전으로 업그레이드" 텍스트가 표시된다', () => {
    render(<ShareButtons {...defaultProps} version="semi" />);
    expect(screen.getByText(/풀 버전으로 업그레이드/)).toBeInTheDocument();
  });

  it('/diagnosis 링크를 가진다', () => {
    render(<ShareButtons {...defaultProps} version="semi" />);
    const upgradeLink = screen.getByTestId('upgrade-link');
    expect(upgradeLink).toHaveAttribute('href', '/diagnosis');
  });
});
