// @TASK P1-S0-T3 - StatCard UI 컴포넌트
'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
  };
  className?: string;
}

const trendConfig = {
  up: {
    icon: TrendingUp,
    classes: 'text-green-400',
    label: '상승',
  },
  down: {
    icon: TrendingDown,
    classes: 'text-error',
    label: '하락',
  },
  neutral: {
    icon: Minus,
    classes: 'text-text-tertiary',
    label: '변동없음',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
}) => {
  return (
    <div
      className={cn(
        'p-5 rounded-2xl border border-border bg-bg-page',
        'hover:border-border transition-colors duration-200',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        {icon && (
          <div className="p-2 rounded-lg bg-white text-text-secondary">
            {icon}
          </div>
        )}
      </div>

      <p className="text-2xl font-bold text-text-primary mb-1">{value}</p>

      <div className="flex items-center gap-2">
        {trend && (() => {
          const { icon: TrendIcon, classes, label } = trendConfig[trend.direction];
          return (
            <span
              className={cn('flex items-center gap-1 text-xs font-medium', classes)}
              aria-label={`${label} ${trend.percentage}%`}
            >
              <TrendIcon size={12} aria-hidden="true" />
              {trend.percentage}%
            </span>
          );
        })()}
        {subtitle && (
          <p className="text-xs text-text-tertiary">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
