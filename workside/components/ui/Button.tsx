// @TASK P1-S0-T3 - Button UI 컴포넌트
'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-hover active:bg-primary/80 shadow-sm',
  secondary:
    'bg-white text-text-primary border border-border hover:bg-bg-page active:bg-bg-active',
  danger:
    'bg-error text-white hover:bg-error/90 active:bg-error/80',
  outline:
    'border border-border text-text-primary hover:bg-bg-page bg-transparent',
  ghost:
    'text-text-secondary hover:text-text-primary hover:bg-bg-page bg-transparent',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'text-sm px-3 py-1.5 min-h-[36px]',
  md: 'text-sm px-4 py-2 min-h-[44px]',
  lg: 'text-lg px-6 py-3 min-h-[52px]',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      className,
      onClick,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        onClick={disabled || loading ? undefined : onClick}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && (
          <Loader2 className="animate-spin shrink-0" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} aria-hidden="true" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
