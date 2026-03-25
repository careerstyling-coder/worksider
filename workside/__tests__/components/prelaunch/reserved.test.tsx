// @TASK P2-S2-T1 - 예약 완료 UI 컴포넌트 테스트
// @SPEC specs/screens/prelaunch/reserved

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { WelcomeMessage } from '@/components/prelaunch/WelcomeMessage';
import { InviteLinkCard } from '@/components/prelaunch/InviteLinkCard';
import { InviteProgressBar } from '@/components/prelaunch/InviteProgressBar';
import { SocialShareButtons } from '@/components/prelaunch/SocialShareButtons';

// --- WelcomeMessage ---
describe('WelcomeMessage', () => {
  it('renders "예약되었습니다!" title', () => {
    render(<WelcomeMessage queuePosition={42} />);
    expect(screen.getByText('예약되었습니다!')).toBeInTheDocument();
  });

  it('renders queue position number', () => {
    render(<WelcomeMessage queuePosition={42} />);
    expect(screen.getByText(/42번/)).toBeInTheDocument();
  });

  it('renders "첫 500명 중" text', () => {
    render(<WelcomeMessage queuePosition={1} />);
    expect(screen.getByText(/첫 500명 중/)).toBeInTheDocument();
  });

  it('renders different queue positions', () => {
    render(<WelcomeMessage queuePosition={100} />);
    expect(screen.getByText(/100번/)).toBeInTheDocument();
  });
});

// --- InviteLinkCard ---
describe('InviteLinkCard', () => {
  const mockWriteText = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { clipboard: { writeText: mockWriteText } },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'window', {
      value: { location: { origin: 'https://workside.app' } },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders invite link containing inviteCode', () => {
    render(<InviteLinkCard inviteCode="ABC123" />);
    expect(screen.getByText(/ABC123/)).toBeInTheDocument();
  });

  it('renders copy button', () => {
    render(<InviteLinkCard inviteCode="ABC123" />);
    expect(screen.getByRole('button', { name: /복사/ })).toBeInTheDocument();
  });

  it('calls clipboard writeText on copy button click', async () => {
    render(<InviteLinkCard inviteCode="ABC123" />);
    const copyBtn = screen.getByRole('button', { name: /복사/ });
    await act(async () => {
      fireEvent.click(copyBtn);
    });
    expect(mockWriteText).toHaveBeenCalledWith(
      expect.stringContaining('ABC123')
    );
  });

  it('shows toast message after copy', async () => {
    render(<InviteLinkCard inviteCode="ABC123" />);
    const copyBtn = screen.getByRole('button', { name: /복사/ });
    await act(async () => {
      fireEvent.click(copyBtn);
    });
    expect(screen.getByText(/링크가 복사되었습니다/)).toBeInTheDocument();
  });
});

// --- InviteProgressBar ---
describe('InviteProgressBar', () => {
  it('renders 0/5 by default', () => {
    render(<InviteProgressBar current={0} total={5} />);
    expect(screen.getByText(/0\/5/)).toBeInTheDocument();
  });

  it('renders 3/5 text', () => {
    render(<InviteProgressBar current={3} total={5} />);
    expect(screen.getByText(/3\/5/)).toBeInTheDocument();
  });

  it('renders early adopter badge hint text', () => {
    render(<InviteProgressBar current={0} total={5} />);
    expect(screen.getByText(/얼리어답터 배지/)).toBeInTheDocument();
  });

  it('progress bar has 0% width for 0/5', () => {
    render(<InviteProgressBar current={0} total={5} />);
    const bar = document.querySelector('[data-testid="progress-fill"]');
    expect(bar).toHaveStyle({ width: '0%' });
  });

  it('progress bar has 60% width for 3/5', () => {
    render(<InviteProgressBar current={3} total={5} />);
    const bar = document.querySelector('[data-testid="progress-fill"]');
    expect(bar).toHaveStyle({ width: '60%' });
  });

  it('applies completion style when 5/5', () => {
    render(<InviteProgressBar current={5} total={5} />);
    const bar = document.querySelector('[data-testid="progress-fill"]');
    expect(bar?.className).toMatch(/green|success|complete/i);
  });
});

// --- SocialShareButtons ---
describe('SocialShareButtons', () => {
  it('renders 3 share buttons', () => {
    render(<SocialShareButtons inviteCode="ABC123" />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });

  it('renders KakaoTalk share button', () => {
    render(<SocialShareButtons inviteCode="ABC123" />);
    expect(screen.getByText(/카카오/i)).toBeInTheDocument();
  });

  it('renders Twitter/X share button', () => {
    render(<SocialShareButtons inviteCode="ABC123" />);
    expect(screen.getByText(/트위터|X/i)).toBeInTheDocument();
  });

  it('renders link copy button', () => {
    render(<SocialShareButtons inviteCode="ABC123" />);
    expect(screen.getByText(/링크 복사/i)).toBeInTheDocument();
  });

  it('calls onClick handler when KakaoTalk button clicked', () => {
    const onKakao = vi.fn();
    render(<SocialShareButtons inviteCode="ABC123" onKakaoClick={onKakao} />);
    fireEvent.click(screen.getByText(/카카오/i));
    expect(onKakao).toHaveBeenCalledOnce();
  });

  it('calls onClick handler when Twitter button clicked', () => {
    const onTwitter = vi.fn();
    render(<SocialShareButtons inviteCode="ABC123" onTwitterClick={onTwitter} />);
    fireEvent.click(screen.getByText(/트위터|X/i));
    expect(onTwitter).toHaveBeenCalledOnce();
  });
});
