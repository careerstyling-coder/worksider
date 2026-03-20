// @TASK P3-S1-T1 - QuestionCard 컴포넌트 테스트
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuestionCard } from '@/components/QuestionCard';

const QUESTION_ACTIVE = {
  id: 'q1',
  title: '우리 팀의 가장 큰 병목은 무엇인가요?',
  status: 'active',
  participant_count: 12,
  deadline: '2026-03-20',
  is_featured: false,
};

const QUESTION_FEATURED = {
  id: 'q2',
  title: '이번 분기 핵심 목표는?',
  status: 'active',
  participant_count: 30,
  is_featured: true,
};

const QUESTION_CLOSED = {
  id: 'q3',
  title: '지난 회고 결과는?',
  status: 'closed',
  participant_count: 20,
};

describe('QuestionCard', () => {
  it('renders question title', () => {
    render(<QuestionCard question={QUESTION_ACTIVE} />);
    expect(screen.getByText(QUESTION_ACTIVE.title)).toBeInTheDocument();
  });

  it('renders participant count', () => {
    render(<QuestionCard question={QUESTION_ACTIVE} />);
    expect(screen.getByText(/12/)).toBeInTheDocument();
  });

  it('renders deadline when provided', () => {
    render(<QuestionCard question={QUESTION_ACTIVE} />);
    expect(screen.getByText(/2026-03-20/)).toBeInTheDocument();
  });

  it('renders featured badge when is_featured=true', () => {
    render(<QuestionCard question={QUESTION_FEATURED} />);
    expect(screen.getByText(/featured|주요|Featured/i)).toBeInTheDocument();
  });

  it('does not render featured badge when is_featured=false', () => {
    render(<QuestionCard question={QUESTION_ACTIVE} />);
    expect(screen.queryByText(/featured|주요|Featured/i)).not.toBeInTheDocument();
  });

  it('renders closed status badge', () => {
    render(<QuestionCard question={QUESTION_CLOSED} />);
    expect(screen.getByText(/마감|closed/i)).toBeInTheDocument();
  });

  it('renders active status badge', () => {
    render(<QuestionCard question={QUESTION_ACTIVE} />);
    expect(screen.getByText(/진행중|active/i)).toBeInTheDocument();
  });

  it('shows user response when provided', () => {
    render(
      <QuestionCard
        question={QUESTION_ACTIVE}
        userResponse={{ selected_option: '옵션 A' }}
      />
    );
    expect(screen.getByText(/옵션 A/)).toBeInTheDocument();
  });

  it('does not show response section when userResponse is null', () => {
    render(<QuestionCard question={QUESTION_ACTIVE} userResponse={null} />);
    expect(screen.queryByText(/내 답변/)).not.toBeInTheDocument();
  });
});
