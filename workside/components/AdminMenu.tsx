// @TASK P1-S0-T2 - AdminMenu 관리자 사이드바 메뉴
// @SPEC docs/planning/03-user-flow.md#admin-layout
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BarChart3, MessageCircle, Users, Settings, X, Menu } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: BarChart3 },
  { label: 'Questions', href: '/admin/questions', icon: MessageCircle },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

const DEMO_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/demo/phase-5/admin-dashboard', icon: BarChart3 },
  { label: 'Questions', href: '/demo/phase-5/admin-questions', icon: MessageCircle },
];

export interface AdminMenuProps {
  activeRoute?: string;
  basePath?: string;
}

export function AdminMenu({ activeRoute = '/admin', basePath }: AdminMenuProps) {
  const NAV_ITEMS = basePath ? DEMO_NAV_ITEMS : DEFAULT_NAV_ITEMS;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 모바일 토글 버튼 */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        className={cn(
          'fixed top-4 left-4 z-50 p-2 rounded-lg',
          'bg-bg-page border border-border text-text-primary',
          'hover:bg-bg-page transition-colors duration-200',
          'lg:hidden'
        )}
      >
        {isOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>

      {/* 모바일 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 사이드바 네비게이션 */}
      <nav
        aria-label="Admin navigation"
        className={cn(
          'fixed top-0 left-0 z-40 h-full w-[250px]',
          'bg-bg-page border-r border-border',
          'flex flex-col pt-16 pb-6',
          'transition-transform duration-300 ease-in-out',
          // 모바일: isOpen 상태에 따라 슬라이드
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // 데스크톱: 항상 표시
          'lg:translate-x-0 lg:static lg:h-auto lg:w-full lg:pt-6'
        )}
      >
        <ul className="flex flex-col gap-1 px-3">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = activeRoute === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                    'text-sm font-medium transition-all duration-200',
                    'min-h-[44px]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    isActive
                      ? 'bg-primary-light text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                  )}
                >
                  <Icon
                    size={18}
                    aria-hidden="true"
                    className={cn(
                      'shrink-0',
                      isActive ? 'text-primary' : 'text-text-secondary'
                    )}
                  />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
