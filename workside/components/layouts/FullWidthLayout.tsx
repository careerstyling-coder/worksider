// @TASK P1-S0-T2 - FullWidthLayout: max-width 제한 + 중앙 정렬 레이아웃
import React from 'react';
import { cn } from '@/lib/utils/cn';

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full',
} as const;

export interface FullWidthLayoutProps {
  children: React.ReactNode;
  maxWidth?: keyof typeof maxWidthClasses;
}

export function FullWidthLayout({ children, maxWidth = 'md' }: FullWidthLayoutProps) {
  return (
    <div
      className={cn(
        'w-full mx-auto px-4 sm:px-6 lg:px-8',
        maxWidthClasses[maxWidth]
      )}
    >
      {children}
    </div>
  );
}
