// @TASK P4-S5-T1 - 관리자 예약 탭 UI (SCR-5) 테스트
// @SPEC specs/screens/prelaunch/scr-5-admin-prelaunch.md

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// ---- 컴포넌트 임포트 ----
import { StatCards } from '@/components/admin/StatCards';
import { DailyChart } from '@/components/admin/DailyChart';
import { IndustryChart } from '@/components/admin/IndustryChart';
import { ExperienceChart } from '@/components/admin/ExperienceChart';
import { TopInvitersTable } from '@/components/admin/TopInvitersTable';
import { FilterButtons } from '@/components/admin/FilterButtons';

// ---- Mock 데이터 ----
const mockStats = [
  { label: '총 예약', value: 1240 },
  { label: '초대 전환율', value: '38%', change: '+5%' },
  { label: '배지 획득', value: 320 },
  { label: '평균 초대 수', value: 2.4 },
];

const mockDailyData = [
  { date: '03-19', count: 45 },
  { date: '03-20', count: 62 },
  { date: '03-21', count: 38 },
  { date: '03-22', count: 71 },
  { date: '03-23', count: 55 },
  { date: '03-24', count: 88 },
  { date: '03-25', count: 94 },
];

const mockIndustryData = [
  { industry: 'IT/소프트웨어', count: 420 },
  { industry: '금융', count: 280 },
  { industry: '마케팅', count: 210 },
  { industry: '디자인', count: 180 },
  { industry: '기타', count: 150 },
];

const mockExperienceData = [
  { range: '1-3년', count: 380, percentage: 31 },
  { range: '4-7년', count: 420, percentage: 34 },
  { range: '8-12년', count: 290, percentage: 23 },
  { range: '13년+', count: 150, percentage: 12 },
];

const mockInviters = [
  { rank: 1, email: 'top1@example.com', successful_invites: 24, conversion_rate: 0.8 },
  { rank: 2, email: 'top2@example.com', successful_invites: 18, conversion_rate: 0.72 },
  { rank: 3, email: 'top3@example.com', successful_invites: 15, conversion_rate: 0.65 },
  { rank: 4, email: 'top4@example.com', successful_invites: 12, conversion_rate: 0.6 },
  { rank: 5, email: 'top5@example.com', successful_invites: 10, conversion_rate: 0.55 },
];

// ====================================================
// StatCards
// ====================================================
describe('StatCards', () => {
  it('data-testid="stat-cards"가 존재한다', () => {
    render(<StatCards stats={mockStats} />);
    expect(screen.getByTestId('stat-cards')).toBeInTheDocument();
  });

  it('4개의 카드를 렌더링한다', () => {
    render(<StatCards stats={mockStats} />);
    expect(screen.getByText('총 예약')).toBeInTheDocument();
    expect(screen.getByText('초대 전환율')).toBeInTheDocument();
    expect(screen.getByText('배지 획득')).toBeInTheDocument();
    expect(screen.getByText('평균 초대 수')).toBeInTheDocument();
  });

  it('각 카드의 값을 표시한다', () => {
    render(<StatCards stats={mockStats} />);
    expect(screen.getByText('1240')).toBeInTheDocument();
    expect(screen.getByText('38%')).toBeInTheDocument();
  });

  it('change 값이 있으면 표시한다', () => {
    render(<StatCards stats={mockStats} />);
    expect(screen.getByText('+5%')).toBeInTheDocument();
  });
});

// ====================================================
// DailyChart
// ====================================================
describe('DailyChart', () => {
  it('data-testid="daily-chart"가 존재한다', () => {
    render(<DailyChart data={mockDailyData} />);
    expect(screen.getByTestId('daily-chart')).toBeInTheDocument();
  });

  it('날짜 레이블을 표시한다', () => {
    render(<DailyChart data={mockDailyData} />);
    expect(screen.getByText('03-19')).toBeInTheDocument();
    expect(screen.getByText('03-25')).toBeInTheDocument();
  });
});

// ====================================================
// IndustryChart
// ====================================================
describe('IndustryChart', () => {
  it('data-testid="industry-chart"가 존재한다', () => {
    render(<IndustryChart data={mockIndustryData} />);
    expect(screen.getByTestId('industry-chart')).toBeInTheDocument();
  });

  it('직군 이름을 표시한다', () => {
    render(<IndustryChart data={mockIndustryData} />);
    expect(screen.getByText('IT/소프트웨어')).toBeInTheDocument();
    expect(screen.getByText('금융')).toBeInTheDocument();
  });
});

// ====================================================
// ExperienceChart
// ====================================================
describe('ExperienceChart', () => {
  it('data-testid="experience-chart"가 존재한다', () => {
    render(<ExperienceChart data={mockExperienceData} />);
    expect(screen.getByTestId('experience-chart')).toBeInTheDocument();
  });

  it('연차 범위를 표시한다', () => {
    render(<ExperienceChart data={mockExperienceData} />);
    expect(screen.getByText('1-3년')).toBeInTheDocument();
    expect(screen.getByText('4-7년')).toBeInTheDocument();
  });

  it('퍼센트 값을 표시한다', () => {
    render(<ExperienceChart data={mockExperienceData} />);
    expect(screen.getByText('31%')).toBeInTheDocument();
  });
});

// ====================================================
// TopInvitersTable
// ====================================================
describe('TopInvitersTable', () => {
  it('data-testid="top-inviters-table"가 존재한다', () => {
    render(<TopInvitersTable inviters={mockInviters} />);
    expect(screen.getByTestId('top-inviters-table')).toBeInTheDocument();
  });

  it('인비터 목록을 렌더링한다', () => {
    render(<TopInvitersTable inviters={mockInviters} />);
    expect(screen.getByText('top1@example.com')).toBeInTheDocument();
    expect(screen.getByText('top5@example.com')).toBeInTheDocument();
  });

  it('초대 수와 전환율을 표시한다', () => {
    render(<TopInvitersTable inviters={mockInviters} />);
    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('최대 10행까지만 렌더링한다', () => {
    const manyInviters = Array.from({ length: 15 }, (_, i) => ({
      rank: i + 1,
      email: `user${i + 1}@example.com`,
      successful_invites: 10 - i,
      conversion_rate: 0.5,
    }));
    render(<TopInvitersTable inviters={manyInviters} />);
    const rows = screen.getAllByRole('row');
    // header row + 10 data rows
    expect(rows.length).toBeLessThanOrEqual(11);
  });
});

// ====================================================
// FilterButtons
// ====================================================
describe('FilterButtons', () => {
  it('data-testid="filter-buttons"가 존재한다', () => {
    render(<FilterButtons selected="today" onSelect={() => {}} />);
    expect(screen.getByTestId('filter-buttons')).toBeInTheDocument();
  });

  it('세 가지 필터 옵션을 표시한다', () => {
    render(<FilterButtons selected="today" onSelect={() => {}} />);
    expect(screen.getByText('오늘')).toBeInTheDocument();
    expect(screen.getByText('이번주')).toBeInTheDocument();
    expect(screen.getByText('이번달')).toBeInTheDocument();
  });

  it('선택된 필터가 활성 스타일을 가진다', () => {
    render(<FilterButtons selected="this_week" onSelect={() => {}} />);
    const weekButton = screen.getByText('이번주').closest('button');
    expect(weekButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('버튼 클릭 시 onSelect 콜백이 호출된다', () => {
    const onSelect = vi.fn();
    render(<FilterButtons selected="today" onSelect={onSelect} />);
    fireEvent.click(screen.getByText('이번주'));
    expect(onSelect).toHaveBeenCalledWith('this_week');
  });

  it('오늘 버튼 클릭 시 today를 전달한다', () => {
    const onSelect = vi.fn();
    render(<FilterButtons selected="this_week" onSelect={onSelect} />);
    fireEvent.click(screen.getByText('오늘'));
    expect(onSelect).toHaveBeenCalledWith('today');
  });
});
