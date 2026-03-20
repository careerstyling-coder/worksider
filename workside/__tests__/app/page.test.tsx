// @TASK P2-S1-T1 - 랜딩 페이지 테스트
// @SPEC docs/planning/03-user-flow.md#landing

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Home from '@/app/page';

// next/link mock
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// next/image mock
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

// Header/Footer mock
vi.mock('@/components/Header', () => ({
  default: () => <header data-testid="header">Header</header>,
}));

vi.mock('@/components/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

describe('Landing Page (app/page.tsx)', () => {
  describe('레이아웃', () => {
    it('Header 컴포넌트를 렌더링한다', () => {
      render(<Home />);
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('Footer 컴포넌트를 렌더링한다', () => {
      render(<Home />);
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  describe('HeroSection', () => {
    it('메인 제목이 렌더링된다', () => {
      render(<Home />);
      expect(
        screen.getByText('당신의 Work Style DNA를 발견하세요')
      ).toBeInTheDocument();
    });

    it('부제목이 렌더링된다', () => {
      render(<Home />);
      expect(
        screen.getByText(/3분 진단으로 나만의 업무 성향을 파악/)
      ).toBeInTheDocument();
    });

    it('CTA 버튼이 렌더링된다', () => {
      render(<Home />);
      const ctaLinks = screen.getAllByRole('link', { name: /무료 진단 시작/i });
      expect(ctaLinks.length).toBeGreaterThanOrEqual(1);
    });

    it('CTA 버튼이 /diagnosis로 링크된다', () => {
      render(<Home />);
      const ctaLinks = screen.getAllByRole('link', { name: /무료 진단 시작/i });
      expect(ctaLinks[0]).toHaveAttribute('href', '/diagnosis');
    });

    it('HeroSection data-testid가 존재한다', () => {
      render(<Home />);
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    });
  });

  describe('FeatureCards', () => {
    it('FeatureCards 섹션이 존재한다', () => {
      render(<Home />);
      expect(screen.getByTestId('feature-cards')).toBeInTheDocument();
    });

    it('DNA 진단 카드가 렌더링된다', () => {
      render(<Home />);
      expect(screen.getByText(/DNA 진단/)).toBeInTheDocument();
    });

    it('공유 & 비교 카드가 렌더링된다', () => {
      render(<Home />);
      expect(screen.getByText(/공유.*비교|비교.*공유/)).toBeInTheDocument();
    });

    it('정기 질문 카드가 렌더링된다', () => {
      render(<Home />);
      expect(screen.getByText(/정기 질문/)).toBeInTheDocument();
    });

    it('3개의 기능 카드가 렌더링된다', () => {
      render(<Home />);
      const cards = screen.getAllByTestId(/feature-card-/);
      expect(cards).toHaveLength(3);
    });
  });

  describe('TestimonialCarousel', () => {
    it('TestimonialCarousel 섹션이 존재한다', () => {
      render(<Home />);
      expect(screen.getByTestId('testimonial-section')).toBeInTheDocument();
    });

    it('3개 이상의 사용자 후기가 렌더링된다', () => {
      render(<Home />);
      const testimonials = screen.getAllByTestId(/testimonial-card-/);
      expect(testimonials.length).toBeGreaterThanOrEqual(3);
    });

    it('후기 카드에 이름이 표시된다', () => {
      render(<Home />);
      const testimonials = screen.getAllByTestId(/testimonial-card-/);
      testimonials.forEach((card) => {
        expect(card.querySelector('[data-testid="testimonial-name"]')).not.toBeNull();
      });
    });
  });

  describe('CTASection', () => {
    it('CTASection이 존재한다', () => {
      render(<Home />);
      expect(screen.getByTestId('cta-section')).toBeInTheDocument();
    });

    it('"지금 바로 시작하세요" 텍스트가 렌더링된다', () => {
      render(<Home />);
      expect(screen.getByText(/지금 바로 시작하세요/)).toBeInTheDocument();
    });

    it('CTASection에도 /diagnosis 링크가 있다', () => {
      render(<Home />);
      const ctaLinks = screen.getAllByRole('link', { name: /무료 진단 시작/i });
      // HeroSection + CTASection = 2개
      expect(ctaLinks.length).toBeGreaterThanOrEqual(2);
      ctaLinks.forEach((link) => {
        expect(link).toHaveAttribute('href', '/diagnosis');
      });
    });
  });
});
