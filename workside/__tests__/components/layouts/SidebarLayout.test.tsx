// @TASK P1-S0-T2 - SidebarLayout 테스트
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';

describe('SidebarLayout', () => {
  it('renders sidebar content', () => {
    render(
      <SidebarLayout sidebar={<div>Sidebar Content</div>}>
        <div>Main Content</div>
      </SidebarLayout>
    );
    expect(screen.getByText('Sidebar Content')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <SidebarLayout sidebar={<div>Sidebar</div>}>
        <div>Main Content</div>
      </SidebarLayout>
    );
    expect(screen.getByText('Main Content')).toBeInTheDocument();
  });

  it('has a sidebar region', () => {
    render(
      <SidebarLayout sidebar={<div>Sidebar</div>}>
        <div>Main</div>
      </SidebarLayout>
    );
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toBeInTheDocument();
  });

  it('has a main region', () => {
    render(
      <SidebarLayout sidebar={<div>Sidebar</div>}>
        <div>Main</div>
      </SidebarLayout>
    );
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });

  it('renders mobile menu toggle button', () => {
    render(
      <SidebarLayout sidebar={<div>Sidebar</div>}>
        <div>Main</div>
      </SidebarLayout>
    );
    const toggleBtn = screen.getByRole('button', { name: /open.*sidebar|toggle.*sidebar|sidebar.*menu/i });
    expect(toggleBtn).toBeInTheDocument();
  });
});
