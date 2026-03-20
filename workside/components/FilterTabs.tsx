// @TASK P3-S1-T1 - FilterTabs 재사용 컴포넌트
// @SPEC docs/planning/feed-page.md#filter-tabs
'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface FilterTabsProps {
  tabs: { label: string; value: string; badge?: number }[];
  activeTab: string;
  onChange: (value: string) => void;
}

export function FilterTabs({ tabs, activeTab, onChange }: FilterTabsProps) {
  return (
    <div role="tablist" className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-0.5">
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={cn(
              'relative flex items-center gap-1.5 whitespace-nowrap px-4 py-2 text-sm font-medium rounded-full transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              isActive
                ? 'bg-primary text-black'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            )}
          >
            {tab.label}
            {tab.badge != null && tab.badge > 0 && (
              <span
                className={cn(
                  'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-semibold rounded-full',
                  isActive ? 'bg-black/20 text-black' : 'bg-white/20 text-text-primary'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
