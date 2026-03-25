// @TASK P3-S4-T1 - 예약자 대시보드 UI 테스트
// @SPEC specs/screens/prelaunch/my-reservation

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueuePosition } from '@/components/prelaunch/QueuePosition';
import { RewardStatus } from '@/components/prelaunch/RewardStatus';

// --- QueuePosition ---
describe('QueuePosition', () => {
  it('renders data-testid="queue-position"', () => {
    render(<QueuePosition position={42} />);
    expect(screen.getByTestId('queue-position')).toBeInTheDocument();
  });

  it('renders position number as large text', () => {
    render(<QueuePosition position={42} />);
    const el = screen.getByTestId('queue-position');
    expect(el).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders different position values', () => {
    render(<QueuePosition position={123} />);
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('renders position 1 correctly', () => {
    render(<QueuePosition position={1} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('has text-5xl or larger class on the number element', () => {
    render(<QueuePosition position={42} />);
    // 큰 숫자 요소가 존재하고 data-testid 안에 있음
    const container = screen.getByTestId('queue-position');
    expect(container.querySelector('.text-5xl, .text-6xl, .text-7xl, .text-8xl')).not.toBeNull();
  });
});

// --- RewardStatus ---
describe('RewardStatus', () => {
  const lockedRewards = [
    { type: 'early_adopter_badge', status: 'locked' },
    { type: 'priority_access', status: 'locked' },
  ];

  const unlockedRewards = [
    { type: 'early_adopter_badge', status: 'unlocked', unlocked_at: '2024-01-01T00:00:00Z' },
    { type: 'priority_access', status: 'unlocked', unlocked_at: '2024-01-02T00:00:00Z' },
  ];

  const mixedRewards = [
    { type: 'early_adopter_badge', status: 'unlocked', unlocked_at: '2024-01-01T00:00:00Z' },
    { type: 'priority_access', status: 'locked' },
  ];

  it('renders data-testid="reward-status"', () => {
    render(<RewardStatus rewards={lockedRewards} />);
    expect(screen.getByTestId('reward-status')).toBeInTheDocument();
  });

  it('renders "얼리어답터 배지" label', () => {
    render(<RewardStatus rewards={lockedRewards} />);
    expect(screen.getByText(/얼리어답터 배지/)).toBeInTheDocument();
  });

  it('renders "풀 진단 우선 접근" label', () => {
    render(<RewardStatus rewards={lockedRewards} />);
    expect(screen.getByText(/풀 진단 우선 접근/)).toBeInTheDocument();
  });

  it('applies locked/inactive style when status is locked', () => {
    render(<RewardStatus rewards={lockedRewards} />);
    const container = screen.getByTestId('reward-status');
    // locked 상태의 아이템들이 존재함
    const lockedItems = container.querySelectorAll('[data-status="locked"]');
    expect(lockedItems.length).toBe(2);
  });

  it('applies unlocked/active style when status is unlocked', () => {
    render(<RewardStatus rewards={unlockedRewards} />);
    const container = screen.getByTestId('reward-status');
    const unlockedItems = container.querySelectorAll('[data-status="unlocked"]');
    expect(unlockedItems.length).toBe(2);
  });

  it('handles mixed locked and unlocked states', () => {
    render(<RewardStatus rewards={mixedRewards} />);
    const container = screen.getByTestId('reward-status');
    expect(container.querySelectorAll('[data-status="unlocked"]').length).toBe(1);
    expect(container.querySelectorAll('[data-status="locked"]').length).toBe(1);
  });

  it('shows unlock indicator for unlocked rewards', () => {
    render(<RewardStatus rewards={unlockedRewards} />);
    // 잠금 해제된 항목에 시각적 표시가 있어야 함
    const container = screen.getByTestId('reward-status');
    const unlockedItems = container.querySelectorAll('[data-status="unlocked"]');
    expect(unlockedItems.length).toBeGreaterThan(0);
  });

  it('renders empty array without error', () => {
    render(<RewardStatus rewards={[]} />);
    expect(screen.getByTestId('reward-status')).toBeInTheDocument();
  });
});

// --- MyReservationPage 통합 ---
describe('MyReservationPage integration', () => {
  it('renders QueuePosition with mock data', async () => {
    // 동적 import로 페이지 컴포넌트 테스트
    const { default: Page } = await import('@/app/prelaunch/my-reservation/page');
    render(<Page />);
    expect(screen.getByTestId('queue-position')).toBeInTheDocument();
  });

  it('renders RewardStatus section', async () => {
    const { default: Page } = await import('@/app/prelaunch/my-reservation/page');
    render(<Page />);
    expect(screen.getByTestId('reward-status')).toBeInTheDocument();
  });

  it('renders InviteProgressBar', async () => {
    const { default: Page } = await import('@/app/prelaunch/my-reservation/page');
    render(<Page />);
    // InviteProgressBar 렌더링 확인 (친구 초대 현황 텍스트)
    expect(screen.getByText(/친구 초대 현황/)).toBeInTheDocument();
  });

  it('renders InviteLinkCard', async () => {
    const { default: Page } = await import('@/app/prelaunch/my-reservation/page');
    render(<Page />);
    // InviteLinkCard는 복사 버튼을 렌더링함 (SocialShareButtons의 링크 복사 버튼도 있으므로 getAllByRole 사용)
    const copyButtons = screen.getAllByRole('button', { name: /복사/ });
    expect(copyButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders SocialShareButtons', async () => {
    const { default: Page } = await import('@/app/prelaunch/my-reservation/page');
    render(<Page />);
    expect(screen.getByText(/카카오/i)).toBeInTheDocument();
  });
});
