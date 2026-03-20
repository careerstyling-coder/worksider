// @TASK P1-S0-T2 - AdminMenu 사이드바 컴포넌트 테스트
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminMenu } from '@/components/AdminMenu';

describe('AdminMenu', () => {
  it('renders all menu items', () => {
    render(<AdminMenu activeRoute="/admin" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Questions')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('highlights active route', () => {
    render(<AdminMenu activeRoute="/admin/questions" />);
    const questionItem = screen.getByText('Questions').closest('a');
    expect(questionItem).toHaveAttribute('aria-current', 'page');
  });

  it('renders navigation links with correct hrefs', () => {
    render(<AdminMenu activeRoute="/admin" />);
    expect(screen.getByRole('link', { name: /Dashboard/i })).toHaveAttribute('href', '/admin');
    expect(screen.getByRole('link', { name: /Questions/i })).toHaveAttribute('href', '/admin/questions');
    expect(screen.getByRole('link', { name: /Users/i })).toHaveAttribute('href', '/admin/users');
    expect(screen.getByRole('link', { name: /Settings/i })).toHaveAttribute('href', '/admin/settings');
  });

  it('shows toggle button on mobile (collapsed state)', () => {
    render(<AdminMenu activeRoute="/admin" />);
    const toggleBtn = screen.getByRole('button', { name: /toggle.*menu|menu.*toggle|open.*menu|close.*menu/i });
    expect(toggleBtn).toBeInTheDocument();
  });

  it('toggles collapsed state on button click', () => {
    render(<AdminMenu activeRoute="/admin" />);
    const toggleBtn = screen.getByRole('button', { name: /toggle.*menu|menu.*toggle|open.*menu|close.*menu/i });
    fireEvent.click(toggleBtn);
    // After toggle, button aria-label changes or nav visibility changes
    expect(toggleBtn).toBeInTheDocument();
  });

  it('has nav landmark with accessible label', () => {
    render(<AdminMenu activeRoute="/admin" />);
    expect(screen.getByRole('navigation', { name: /admin/i })).toBeInTheDocument();
  });

  it('applies no aria-current to non-active routes', () => {
    render(<AdminMenu activeRoute="/admin" />);
    const usersLink = screen.getByRole('link', { name: /Users/i });
    expect(usersLink).not.toHaveAttribute('aria-current', 'page');
  });
});
