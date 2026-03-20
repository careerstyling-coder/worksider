// @TASK P1-S0-T3 - PersonaBadge UI 컴포넌트
'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface PersonaBadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}

const variantClasses = {
  primary: 'bg-primary/20 text-primary border-primary/30',
  secondary: 'bg-bg-page text-text-secondary border-border',
  outline: 'bg-transparent text-text-secondary border-white/30',
};

export const PersonaBadge: React.FC<PersonaBadgeProps> = ({
  label,
  variant = 'primary',
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
        'transition-colors duration-150',
        variantClasses[variant],
        className
      )}
    >
      {label}
    </span>
  );
};
