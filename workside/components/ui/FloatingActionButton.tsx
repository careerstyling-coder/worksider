// @TASK P3-S1-T1 - FloatingActionButton UI 컴포넌트
'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface FABProps {
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}

export function FloatingActionButton({ icon, label, onClick, className }: FABProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'inline-flex items-center gap-2 px-5 py-3.5',
        'bg-primary text-black font-semibold text-sm rounded-full',
        'shadow-lg shadow-primary/20',
        'hover:bg-[#b8ef00] active:bg-[#a8df00] active:scale-95',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        className
      )}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
