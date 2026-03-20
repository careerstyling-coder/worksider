import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InputField } from '@/components/ui/InputField';

describe('InputField', () => {
  it('renders input element', () => {
    render(<InputField placeholder="Enter text" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<InputField label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders error message when provided', () => {
    render(<InputField error="Required field" />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('applies aria-invalid when error is set', () => {
    render(<InputField error="Error" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders helperText', () => {
    render(<InputField helperText="Enter your email" />);
    expect(screen.getByText('Enter your email')).toBeInTheDocument();
  });

  it('fires onChange', () => {
    const handler = vi.fn();
    render(<InputField onChange={handler} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('renders password type input', () => {
    const { container } = render(<InputField type="password" />);
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
  });

  it('label is associated with input via htmlFor', () => {
    render(<InputField label="Username" id="username" />);
    const label = screen.getByText('Username');
    const input = screen.getByRole('textbox');
    expect(label).toHaveAttribute('for', input.id);
  });
});
