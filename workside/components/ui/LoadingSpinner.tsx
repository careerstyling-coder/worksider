// @TASK P1-S0-T3 - LoadingSpinner UI 컴포넌트
'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  label?: string;
}

const sizeClasses = {
  small: 'w-4 h-4 border-2',
  medium: 'w-8 h-8 border-2',
  large: 'w-12 h-12 border-[3px]',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  className,
  label = '로딩 중...',
}) => {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn('inline-flex items-center justify-center', className)}
    >
      <div
        className={cn(
          'rounded-full border-border border-t-primary animate-spin',
          sizeClasses[size]
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};
