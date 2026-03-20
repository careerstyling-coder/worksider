// @TASK P1-S0-T3 - Modal UI 컴포넌트
'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from './Button';

export interface ModalAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: ModalAction[];
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-hidden="false"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          'relative z-10 w-full max-w-md mx-4',
          'bg-bg-page border border-border rounded-2xl shadow-2xl',
          'animate-in fade-in zoom-in-95 duration-200'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 id="modal-title" className="text-lg font-semibold text-text-primary">
            {title}
          </h2>
          <button
            aria-label="닫기"
            onClick={onClose}
            className={cn(
              'p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover',
              'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
            )}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 text-text-secondary">{children}</div>

        {/* Actions */}
        {actions && actions.length > 0 && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant ?? 'primary'}
                size="md"
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
