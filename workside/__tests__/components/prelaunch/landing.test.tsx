// @TASK P2-S1-T1 - 랜딩 페이지 UI 테스트
// @SPEC specs/screens/prelaunch/landing

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeroSection } from '@/components/prelaunch/HeroSection';
import { DNAIntroSection } from '@/components/prelaunch/DNAIntroSection';
import { ReservationForm } from '@/components/prelaunch/ReservationForm';

// --- HeroSection ---
describe('HeroSection', () => {
  it('renders title "당신의 일 스타일을 먼저"', () => {
    render(<HeroSection />);
    expect(screen.getByText('당신의 일 스타일을 먼저')).toBeInTheDocument();
  });

  it('renders subtitle about 500 people', () => {
    render(<HeroSection />);
    expect(screen.getByText(/첫 500명을 위한 특별한 기회/)).toBeInTheDocument();
  });

  it('renders scroll cta hint', () => {
    render(<HeroSection />);
    // 스크롤 유도 요소가 있어야 함 (텍스트 또는 아이콘)
    const hint = screen.getByTestId('scroll-hint');
    expect(hint).toBeInTheDocument();
  });
});

// --- DNAIntroSection ---
describe('DNAIntroSection', () => {
  it('renders Practice card', () => {
    render(<DNAIntroSection />);
    expect(screen.getByText('Practice')).toBeInTheDocument();
  });

  it('renders Communication card', () => {
    render(<DNAIntroSection />);
    expect(screen.getByText('Communication')).toBeInTheDocument();
  });

  it('renders Politics card', () => {
    render(<DNAIntroSection />);
    expect(screen.getByText('Politics')).toBeInTheDocument();
  });

  it('renders Self-leadership card', () => {
    render(<DNAIntroSection />);
    expect(screen.getByText('Self-leadership')).toBeInTheDocument();
  });

  it('renders exactly 4 DNA cards', () => {
    render(<DNAIntroSection />);
    const cards = screen.getAllByTestId('dna-card');
    expect(cards).toHaveLength(4);
  });
});

// --- ReservationForm ---
describe('ReservationForm', () => {
  it('renders email input', () => {
    render(<ReservationForm onSubmit={vi.fn()} />);
    expect(screen.getByRole('textbox', { name: /이메일/i })).toBeInTheDocument();
  });

  it('renders industry select', () => {
    render(<ReservationForm onSubmit={vi.fn()} />);
    expect(screen.getByRole('combobox', { name: /직군/i })).toBeInTheDocument();
  });

  it('renders experience_years select', () => {
    render(<ReservationForm onSubmit={vi.fn()} />);
    expect(screen.getByRole('combobox', { name: /연차/i })).toBeInTheDocument();
  });

  it('renders submit button "지금 예약하기"', () => {
    render(<ReservationForm onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: /지금 예약하기/ })).toBeInTheDocument();
  });

  it('does not call onSubmit when fields are empty', async () => {
    const onSubmit = vi.fn();
    render(<ReservationForm onSubmit={onSubmit} />);
    const btn = screen.getByRole('button', { name: /지금 예약하기/ });
    fireEvent.click(btn);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with form data when all fields are filled', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ReservationForm onSubmit={onSubmit} />);

    await user.type(screen.getByRole('textbox', { name: /이메일/i }), 'test@example.com');
    await user.selectOptions(screen.getByRole('combobox', { name: /직군/i }), '개발');
    await user.selectOptions(screen.getByRole('combobox', { name: /연차/i }), '1-3년');
    await user.click(screen.getByRole('button', { name: /지금 예약하기/ }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      industry: '개발',
      experience_years: '1-3년',
    });
  });

  it('disables submit button in loading state', () => {
    render(<ReservationForm onSubmit={vi.fn()} status="loading" />);
    expect(screen.getByRole('button', { name: /지금 예약하기/ })).toBeDisabled();
  });

  it('shows error message in error state', () => {
    render(<ReservationForm onSubmit={vi.fn()} status="error" errorMessage="이미 등록된 이메일입니다." />);
    expect(screen.getByText('이미 등록된 이메일입니다.')).toBeInTheDocument();
  });

  it('shows success state', () => {
    render(<ReservationForm onSubmit={vi.fn()} status="success" />);
    expect(screen.getByText(/예약이 완료되었습니다/i)).toBeInTheDocument();
  });
});
