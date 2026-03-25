// @TASK P4-S5-T1 - 기간 필터 버튼 컴포넌트
'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface FilterButtonsProps {
  selected: string;
  onSelect: (period: string) => void;
}

const FILTER_OPTIONS = [
  { value: 'today', label: '오늘' },
  { value: 'this_week', label: '이번주' },
  { value: 'this_month', label: '이번달' },
];

export function FilterButtons({ selected, onSelect }: FilterButtonsProps) {
  return (
    <div
      data-testid="filter-buttons"
      className="flex gap-2"
      role="group"
      aria-label="기간 필터"
    >
      {FILTER_OPTIONS.map((option) => {
        const isSelected = selected === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            aria-pressed={isSelected}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
              isSelected
                ? 'bg-accent-neon text-black'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
