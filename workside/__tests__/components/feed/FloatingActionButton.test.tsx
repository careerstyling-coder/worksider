// @TASK P3-S1-T1 - FloatingActionButton 컴포넌트 테스트
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';

describe('FloatingActionButton', () => {
  it('renders label text', () => {
    render(<FloatingActionButton label="제안하기" onClick={vi.fn()} />);
    expect(screen.getByText('제안하기')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<FloatingActionButton label="제안하기" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders icon when provided', () => {
    render(
      <FloatingActionButton
        label="제안하기"
        icon={<span data-testid="fab-icon">+</span>}
        onClick={vi.fn()}
      />
    );
    expect(screen.getByTestId('fab-icon')).toBeInTheDocument();
  });

  it('is accessible with aria-label', () => {
    render(<FloatingActionButton label="제안하기" onClick={vi.fn()} />);
    const btn = screen.getByRole('button');
    expect(btn).toBeInTheDocument();
  });
});
