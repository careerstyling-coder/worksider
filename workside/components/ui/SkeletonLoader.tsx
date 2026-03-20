// @TASK P1-S0-T3 - SkeletonLoader UI 컴포넌트
'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface SkeletonLoaderProps {
  variant?: 'card' | 'list' | 'grid' | 'chart';
  className?: string;
}

const Bone: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <div
    className={cn(
      'bg-bg-page rounded animate-pulse',
      className
    )}
    style={style}
    aria-hidden="true"
  />
);

const CardSkeleton: React.FC = () => (
  <div className="p-4 rounded-2xl border border-border bg-white space-y-3">
    <Bone className="h-4 w-2/3" />
    <Bone className="h-8 w-1/2" />
    <Bone className="h-3 w-full" />
    <Bone className="h-3 w-3/4" />
  </div>
);

const ListSkeleton: React.FC = () => (
  <div className="space-y-3">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border">
        <Bone className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Bone className="h-4 w-1/2" />
          <Bone className="h-3 w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

const GridSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

const ChartSkeleton: React.FC = () => (
  <div className="p-4 rounded-2xl border border-border bg-white">
    <Bone className="h-4 w-1/3 mb-4" />
    <div className="flex items-end gap-2 h-32">
      {Array.from({ length: 8 }).map((_, i) => (
        <Bone
          key={i}
          className="flex-1 rounded-t"
          style={{ height: `${Math.random() * 60 + 30}%` }}
        />
      ))}
    </div>
  </div>
);

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'card',
  className,
}) => {
  const components = {
    card: CardSkeleton,
    list: ListSkeleton,
    grid: GridSkeleton,
    chart: ChartSkeleton,
  };

  const Component = components[variant];

  return (
    <div
      role="status"
      aria-label="로딩 중..."
      className={className}
    >
      <Component />
      <span className="sr-only">로딩 중...</span>
    </div>
  );
};
