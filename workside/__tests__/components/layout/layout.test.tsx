// @TASK P2-S0-T1 - 공통 레이아웃 컴포넌트 테스트
// @SPEC docs/planning/prelaunch/layout

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SingleColumnLayout from '@/components/layout/SingleColumnLayout';

// next/link mock
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('Header (layout)', () => {
  it('"Workside" 텍스트가 렌더링된다', () => {
    render(<Header />);
    expect(screen.getByText('Workside')).toBeInTheDocument();
  });

  it('header 시맨틱 태그를 사용한다', () => {
    render(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('로고는 "/" 경로로 링크된다', () => {
    render(<Header />);
    const logoLink = screen.getByRole('link', { name: /workside/i });
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('반응형 클래스(max-w)가 적용된다', () => {
    const { container } = render(<Header />);
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
    // inner container에 max-w 적용 확인
    const inner = container.querySelector('[class*="max-w"]');
    expect(inner).toBeInTheDocument();
  });
});

describe('Footer (layout)', () => {
  it('"© 2026 Workside" 텍스트가 렌더링된다', () => {
    render(<Footer />);
    expect(screen.getByText(/2026 Workside/i)).toBeInTheDocument();
  });

  it('footer 시맨틱 태그를 사용한다', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('반응형 클래스(max-w)가 적용된다', () => {
    const { container } = render(<Footer />);
    const inner = container.querySelector('[class*="max-w"]');
    expect(inner).toBeInTheDocument();
  });
});

describe('SingleColumnLayout', () => {
  it('children을 올바르게 렌더링한다', () => {
    render(
      <SingleColumnLayout>
        <div>테스트 콘텐츠</div>
      </SingleColumnLayout>
    );
    expect(screen.getByText('테스트 콘텐츠')).toBeInTheDocument();
  });

  it('Header가 포함된다', () => {
    render(
      <SingleColumnLayout>
        <div>콘텐츠</div>
      </SingleColumnLayout>
    );
    expect(screen.getByText('Workside')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('Footer가 포함된다', () => {
    render(
      <SingleColumnLayout>
        <div>콘텐츠</div>
      </SingleColumnLayout>
    );
    expect(screen.getByText(/2026 Workside/i)).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('max-w-screen-xl (1280px) 제한이 적용된다', () => {
    const { container } = render(
      <SingleColumnLayout>
        <div>콘텐츠</div>
      </SingleColumnLayout>
    );
    const maxWEl = container.querySelector('[class*="max-w-screen-xl"]');
    expect(maxWEl).toBeInTheDocument();
  });

  it('mx-auto 센터 정렬이 적용된다', () => {
    const { container } = render(
      <SingleColumnLayout>
        <div>콘텐츠</div>
      </SingleColumnLayout>
    );
    const centeredEl = container.querySelector('[class*="mx-auto"]');
    expect(centeredEl).toBeInTheDocument();
  });

  it('모바일 패딩 클래스가 적용된다', () => {
    const { container } = render(
      <SingleColumnLayout>
        <div>콘텐츠</div>
      </SingleColumnLayout>
    );
    const paddedEl = container.querySelector('[class*="px-4"]');
    expect(paddedEl).toBeInTheDocument();
  });
});
