// @TASK P1-S0-T2 - FullWidthLayout 테스트
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FullWidthLayout } from '@/components/layouts/FullWidthLayout';

describe('FullWidthLayout', () => {
  it('renders children', () => {
    render(
      <FullWidthLayout>
        <div>Content</div>
      </FullWidthLayout>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies default md max-width', () => {
    const { container } = render(
      <FullWidthLayout>
        <div>Content</div>
      </FullWidthLayout>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toMatch(/max-w-/);
  });

  it('applies sm max-width when specified', () => {
    const { container } = render(
      <FullWidthLayout maxWidth="sm">
        <div>Content</div>
      </FullWidthLayout>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toMatch(/max-w-sm/);
  });

  it('applies lg max-width when specified', () => {
    const { container } = render(
      <FullWidthLayout maxWidth="lg">
        <div>Content</div>
      </FullWidthLayout>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toMatch(/max-w-lg/);
  });

  it('applies xl max-width when specified', () => {
    const { container } = render(
      <FullWidthLayout maxWidth="xl">
        <div>Content</div>
      </FullWidthLayout>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toMatch(/max-w-xl/);
  });

  it('applies full width when maxWidth is full', () => {
    const { container } = render(
      <FullWidthLayout maxWidth="full">
        <div>Content</div>
      </FullWidthLayout>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toMatch(/max-w-full/);
  });

  it('applies horizontal padding', () => {
    const { container } = render(
      <FullWidthLayout>
        <div>Content</div>
      </FullWidthLayout>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toMatch(/px-/);
  });

  it('applies mx-auto for centering', () => {
    const { container } = render(
      <FullWidthLayout>
        <div>Content</div>
      </FullWidthLayout>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toMatch(/mx-auto/);
  });
});
