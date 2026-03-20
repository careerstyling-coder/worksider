import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '@/components/ui/Modal';

describe('Modal', () => {
  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
        Content
      </Modal>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        Content
      </Modal>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders title', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="My Modal">
        Content
      </Modal>
    );
    expect(screen.getByText('My Modal')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Modal">
        <p>Modal body text</p>
      </Modal>
    );
    expect(screen.getByText('Modal body text')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Modal">
        Content
      </Modal>
    );
    fireEvent.click(screen.getByLabelText('닫기'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders action buttons', () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        title="Modal"
        actions={[
          { label: '확인', onClick: vi.fn() },
          { label: '취소', onClick: vi.fn(), variant: 'secondary' },
        ]}
      >
        Content
      </Modal>
    );
    expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  });

  it('calls action onClick', () => {
    const action = vi.fn();
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        title="Modal"
        actions={[{ label: '저장', onClick: action }]}
      >
        Content
      </Modal>
    );
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('has aria-modal attribute', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Modal">
        Content
      </Modal>
    );
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });
});
