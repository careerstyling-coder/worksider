// @TASK P1-S0-T1 - Footer 컴포넌트 테스트
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Footer from '@/components/Footer';

// next/link mock
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('Footer', () => {
  describe('렌더링', () => {
    it('footer 태그로 렌더링된다', () => {
      render(<Footer />);
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('저작권 문구가 표시된다', () => {
      render(<Footer />);
      expect(screen.getByText(/2026 Workside/i)).toBeInTheDocument();
    });
  });

  describe('showLinks=true (기본값)', () => {
    it('About 섹션이 표시된다', () => {
      render(<Footer showLinks={true} />);
      expect(screen.getByText(/About/i)).toBeInTheDocument();
    });

    it('Legal 섹션이 표시된다', () => {
      render(<Footer showLinks={true} />);
      expect(screen.getByText(/Legal/i)).toBeInTheDocument();
    });

    it('개인정보처리방침 링크가 있다', () => {
      render(<Footer showLinks={true} />);
      expect(screen.getByRole('link', { name: /개인정보처리방침/i })).toBeInTheDocument();
    });

    it('이용약관 링크가 있다', () => {
      render(<Footer showLinks={true} />);
      expect(screen.getByRole('link', { name: /이용약관/i })).toBeInTheDocument();
    });

    it('문의 링크가 있다', () => {
      render(<Footer showLinks={true} />);
      expect(screen.getByRole('link', { name: /문의/i })).toBeInTheDocument();
    });

    it('showLinks 기본값은 true이다', () => {
      render(<Footer />);
      expect(screen.getByRole('link', { name: /개인정보처리방침/i })).toBeInTheDocument();
    });
  });

  describe('Social 섹션', () => {
    it('소셜 링크 영역이 표시된다', () => {
      render(<Footer />);
      expect(screen.getByTestId('social-links')).toBeInTheDocument();
    });

    it('Twitter 링크가 있다', () => {
      render(<Footer />);
      expect(screen.getByRole('link', { name: /twitter/i })).toBeInTheDocument();
    });

    it('LinkedIn 링크가 있다', () => {
      render(<Footer />);
      expect(screen.getByRole('link', { name: /linkedin/i })).toBeInTheDocument();
    });
  });

  describe('showLinks=false', () => {
    it('링크들이 표시되지 않는다', () => {
      render(<Footer showLinks={false} />);
      expect(screen.queryByRole('link', { name: /개인정보처리방침/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /이용약관/i })).not.toBeInTheDocument();
    });

    it('저작권 문구는 여전히 표시된다', () => {
      render(<Footer showLinks={false} />);
      expect(screen.getByText(/2026 Workside/i)).toBeInTheDocument();
    });
  });
});
