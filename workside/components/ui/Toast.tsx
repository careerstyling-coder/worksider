// @TASK P1-S0-T3 - Toast UI 컴포넌트
'use client';

import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    classes: 'border-green-500/30 bg-green-500/10 text-green-400',
    iconClass: 'text-green-400',
  },
  error: {
    icon: XCircle,
    classes: 'border-red-500/30 bg-red-500/10 text-error',
    iconClass: 'text-error',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
    iconClass: 'text-yellow-400',
  },
  info: {
    icon: Info,
    classes: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    iconClass: 'text-blue-400',
  },
};

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const { icon: Icon, classes, iconClass } = typeConfig[type];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-xl border',
        'shadow-lg max-w-sm w-full',
        classes
      )}
    >
      <Icon size={18} className={cn('shrink-0 mt-0.5', iconClass)} aria-hidden="true" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        aria-label="알림 닫기"
        onClick={onClose}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
};
