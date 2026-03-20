// @TASK P1-S0-T1 - Header 컴포넌트 테스트
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from '@/components/Header';

// next/link mock
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('Header', () => {
  describe('로고 렌더링', () => {
    it('Workside 로고 텍스트가 렌더링된다', () => {
      render(<Header />);
      expect(screen.getByText('Workside')).toBeInTheDocument();
    });

    it('로고는 "/" 경로로 링크된다', () => {
      render(<Header />);
      const logoLink = screen.getByRole('link', { name: /workside/i });
      expect(logoLink).toHaveAttribute('href', '/');
    });
  });

  describe('비로그인 상태 (showAuthButtons=true)', () => {
    it('로그인 버튼이 표시된다', () => {
      render(<Header showAuthButtons={true} />);
      expect(screen.getByRole('link', { name: /로그인/i })).toBeInTheDocument();
    });

    it('가입 버튼이 표시된다', () => {
      render(<Header showAuthButtons={true} />);
      expect(screen.getByRole('link', { name: /가입/i })).toBeInTheDocument();
    });

    it('showAuthButtons 기본값은 true이다', () => {
      render(<Header />);
      expect(screen.getByRole('link', { name: /로그인/i })).toBeInTheDocument();
    });
  });

  describe('로그인 상태 (showAuthButtons=false)', () => {
    it('로그인/가입 버튼이 숨겨진다', () => {
      render(<Header showAuthButtons={false} />);
      expect(screen.queryByRole('link', { name: /로그인/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /가입/i })).not.toBeInTheDocument();
    });

    it('사용자 닉네임 영역이 표시된다', () => {
      render(<Header showAuthButtons={false} />);
      expect(screen.getByTestId('user-menu')).toBeInTheDocument();
    });

    it('드롭다운 버튼 클릭 시 메뉴가 열린다', () => {
      render(<Header showAuthButtons={false} />);
      const userMenuButton = screen.getByTestId('user-menu-button');
      fireEvent.click(userMenuButton);
      expect(screen.getAllByRole('link', { name: /내 DNA/i }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('link', { name: /피드/i }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('button', { name: /로그아웃/i }).length).toBeGreaterThan(0);
    });
  });

  describe('activeRoute', () => {
    it('activeRoute prop을 받는다', () => {
      render(<Header activeRoute="/feed" />);
      // 렌더링이 오류 없이 완료되면 됨
      expect(screen.getByText('Workside')).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('header 태그를 사용한다', () => {
      render(<Header />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('nav 태그를 포함한다', () => {
      render(<Header />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });
});
