// @TASK P1-S0-T2 - SidebarLayout: 좌측 사이드바 + 메인 콘텐츠 레이아웃
'use client';

import React, { useState } from 'react';
import { PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface SidebarLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export function SidebarLayout({ sidebar, children }: SidebarLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex">
      {/* 모바일 오버레이 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 사이드바 영역 */}
      <aside
        aria-label="Sidebar"
        className={cn(
          // 모바일: fixed + transition
          'fixed top-0 left-0 z-30 h-full w-[250px]',
          'bg-bg-page border-r border-border',
          'transition-transform duration-300 ease-in-out',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          // 데스크톱: static + 항상 표시
          'lg:translate-x-0 lg:static lg:h-screen lg:shrink-0'
        )}
      >
        {sidebar}
      </aside>

      {/* 메인 영역 */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* 모바일 상단 바 */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-bg-page lg:hidden">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar"
            className={cn(
              'p-2 rounded-lg text-text-secondary',
              'hover:text-text-primary hover:bg-bg-hover',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              'transition-colors duration-200'
            )}
          >
            <PanelLeft size={20} aria-hidden="true" />
          </button>
        </div>

        {/* 실제 콘텐츠 */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
