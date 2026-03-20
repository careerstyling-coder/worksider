'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { Users, Clock, Star, FileText, ClipboardList } from 'lucide-react';

export interface QuestionCardProps {
  question: {
    id: string;
    title: string;
    status: string;
    participant_count: number;
    deadline?: string;
    is_featured?: boolean;
    survey_type?: 'simple' | 'formal';
  };
  userResponse?: { selected_option: string } | null;
}

const STATUS_LABEL: Record<string, string> = {
  active: '진행중',
  closed: '마감',
  draft: '준비중',
};

const STATUS_STYLE: Record<string, string> = {
  active: 'bg-green-50 text-green-700',
  closed: 'bg-gray-100 text-text-tertiary',
  draft: 'bg-yellow-50 text-yellow-700',
};

export function QuestionCard({ question, userResponse }: QuestionCardProps) {
  const statusLabel = STATUS_LABEL[question.status] ?? question.status;
  const statusStyle = STATUS_STYLE[question.status] ?? 'bg-gray-100 text-text-secondary';
  const isFormal = question.survey_type === 'formal';

  return (
    <Link href={`/question/${question.id}`}>
      <article
        className={cn(
          'rounded-lg border p-5 transition-all duration-200 hover:shadow-md',
          isFormal
            ? 'bg-purple-50/50 border-purple-200 hover:border-purple-300'
            : question.is_featured
            ? 'bg-primary-light border-primary/30 hover:border-primary'
            : 'bg-white border-border hover:border-primary/40'
        )}
      >
        {/* 헤더 행 */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* 유형 배지 */}
            {isFormal ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                <ClipboardList size={10} />
                정식 설문
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                <FileText size={10} />
                단순 질문
              </span>
            )}
            {question.is_featured && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700">
                <Star size={10} />
                Featured
              </span>
            )}
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', statusStyle)}>
              {statusLabel}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-text-tertiary shrink-0">
            <Users size={12} />
            <span>{question.participant_count}명</span>
          </div>
        </div>

        {/* 제목 */}
        <h3 className="text-[15px] font-semibold text-text-primary leading-snug mb-2">
          {question.title}
        </h3>

        {/* 마감일 */}
        {question.deadline && (
          <div className="flex items-center gap-1 text-xs text-text-tertiary">
            <Clock size={12} />
            <span>마감 {question.deadline}</span>
          </div>
        )}

        {/* 내 답변 */}
        {userResponse && (
          <div className="mt-3 pt-3 border-t border-divider">
            <p className="text-xs text-text-tertiary mb-0.5">내 답변</p>
            <p className="text-sm text-primary font-medium">{userResponse.selected_option}</p>
          </div>
        )}
      </article>
    </Link>
  );
}
