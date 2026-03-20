// @TASK P3-S1-T1 - FilterTabs 컴포넌트 테스트
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterTabs } from '@/components/FilterTabs';

const TABS = [
  { label: '전체', value: 'all' },
  { label: '진행중', value: 'active', badge: 3 },
  { label: '마감', value: 'closed' },
  { label: '내 참여', value: 'mine' },
];

describe('FilterTabs', () => {
  it('renders all tab labels', () => {
    render(<FilterTabs tabs={TABS} activeTab="all" onChange={vi.fn()} />);
    expect(screen.getByText('전체')).toBeInTheDocument();
    expect(screen.getByText('진행중')).toBeInTheDocument();
    expect(screen.getByText('마감')).toBeInTheDocument();
    expect(screen.getByText('내 참여')).toBeInTheDocument();
  });

  it('renders badge count when provided', () => {
    render(<FilterTabs tabs={TABS} activeTab="all" onChange={vi.fn()} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('marks the active tab', () => {
    render(<FilterTabs tabs={TABS} activeTab="active" onChange={vi.fn()} />);
    const activeTab = screen.getByRole('tab', { name: /진행중/ });
    expect(activeTab).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onChange with tab value on click', () => {
    const onChange = vi.fn();
    render(<FilterTabs tabs={TABS} activeTab="all" onChange={onChange} />);
    fireEvent.click(screen.getByRole('tab', { name: /마감/ }));
    expect(onChange).toHaveBeenCalledWith('closed');
  });

  it('has correct role attributes for accessibility', () => {
    render(<FilterTabs tabs={TABS} activeTab="all" onChange={vi.fn()} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(4);
  });
});
