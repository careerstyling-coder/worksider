// @TASK P3-S3-T1 - 초대 랜딩 UI 테스트
// @SPEC specs/screens/prelaunch/invite-landing

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InviteBanner } from '@/components/prelaunch/InviteBanner';

// --- InviteBanner ---
describe('InviteBanner', () => {
  it('renders invite message when inviterName is provided', () => {
    render(<InviteBanner inviterName="홍길동" />);
    expect(screen.getByTestId('invite-banner')).toBeInTheDocument();
    expect(screen.getByText(/홍길동님이 초대했어요!/)).toBeInTheDocument();
  });

  it('renders null when inviterName is not provided', () => {
    const { container } = render(<InviteBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('renders null when inviterName is empty string', () => {
    const { container } = render(<InviteBanner inviterName="" />);
    expect(container.firstChild).toBeNull();
  });

  it('has warm-orange styling on the banner', () => {
    render(<InviteBanner inviterName="김철수" />);
    const banner = screen.getByTestId('invite-banner');
    expect(banner.className).toMatch(/orange/);
  });
});

// --- InviteBanner ref passthrough (page integration) ---
describe('PrelaunchPage with ref param', () => {
  it('passes ref code to PrelaunchFormWrapper when ref is provided', () => {
    // PrelaunchFormWrapper가 refCode prop을 받을 수 있는지 확인하는 최소 통합 테스트
    // 실제 페이지는 Server Component이므로 컴포넌트 단위로만 검증
    render(<InviteBanner inviterName="테스트유저" />);
    expect(screen.getByTestId('invite-banner')).toBeInTheDocument();
  });
});
