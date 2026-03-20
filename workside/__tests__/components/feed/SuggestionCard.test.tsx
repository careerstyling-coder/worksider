// @TASK P3-S1-T1 - SuggestionCard 컴포넌트 테스트
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SuggestionCard } from '@/components/SuggestionCard';

const SUGGESTION = {
  id: 's1',
  title: '점심 식사 시간을 1시간으로 늘려주세요',
  user_id: 'user-abc',
  shout_out_count: 7,
  status: 'open',
};

describe('SuggestionCard', () => {
  it('renders suggestion title', () => {
    render(<SuggestionCard suggestion={SUGGESTION} />);
    expect(screen.getByText(SUGGESTION.title)).toBeInTheDocument();
  });

  it('renders shout_out_count', () => {
    render(<SuggestionCard suggestion={SUGGESTION} />);
    expect(screen.getByText(/7/)).toBeInTheDocument();
  });

  it('renders ShoutOut button', () => {
    render(<SuggestionCard suggestion={SUGGESTION} />);
    const btn = screen.getByRole('button', { name: /shout.?out|응원|공감/i });
    expect(btn).toBeInTheDocument();
  });

  it('calls onShoutOut with suggestion id on button click', () => {
    const onShoutOut = vi.fn();
    render(<SuggestionCard suggestion={SUGGESTION} onShoutOut={onShoutOut} />);
    fireEvent.click(screen.getByRole('button', { name: /shout.?out|응원|공감/i }));
    expect(onShoutOut).toHaveBeenCalledWith('s1');
  });

  it('does not throw when onShoutOut is not provided', () => {
    render(<SuggestionCard suggestion={SUGGESTION} />);
    expect(() =>
      fireEvent.click(screen.getByRole('button', { name: /shout.?out|응원|공감/i }))
    ).not.toThrow();
  });

  it('renders status badge', () => {
    render(<SuggestionCard suggestion={SUGGESTION} />);
    expect(screen.getByText(/open|검토중|진행/i)).toBeInTheDocument();
  });
});
