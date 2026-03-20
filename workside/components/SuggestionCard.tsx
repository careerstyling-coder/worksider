'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { Megaphone } from 'lucide-react';

export interface SuggestionCardProps {
  suggestion: {
    id: string;
    title: string;
    background?: string;
    user_id: string;
    shout_out_count: number;
    status: string;
  };
  onShoutOut?: (id: string) => void;
}

export function SuggestionCard({ suggestion, onShoutOut }: SuggestionCardProps) {
  return (
    <article className="rounded-lg border border-border bg-white overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* 클릭 가능한 콘텐츠 영역 */}
      <Link href={`/feed/suggestion/${suggestion.id}`} className="block p-4">
        <h3 className="text-[15px] font-semibold text-text-primary leading-snug">
          {suggestion.title}
        </h3>
        {suggestion.background && (
          <p className="mt-1.5 text-sm text-text-secondary line-clamp-2">
            {suggestion.background}
          </p>
        )}
      </Link>

      {/* ShoutOut 버튼 — 별도 영역 */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-divider">
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); onShoutOut?.(suggestion.id); }}
          aria-label={`Shout out (${suggestion.shout_out_count})`}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
            'text-text-secondary hover:bg-primary-light hover:text-primary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
          )}
        >
          <Megaphone size={14} />
          <span>Shout out</span>
          <span className="font-semibold">{suggestion.shout_out_count}</span>
        </button>
      </div>
    </article>
  );
}
