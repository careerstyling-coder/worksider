// @TASK P1-S0-T3 - InputField UI 컴포넌트
'use client';

import React, { useId } from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, helperText, className, id: idProp, ...props }, ref) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          className={cn(
            'w-full px-3 py-2 rounded-lg bg-white border text-text-primary placeholder:text-text-tertiary',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
            'transition-all duration-200 min-h-[44px]',
            error
              ? 'border-error focus:ring-error'
              : 'border-border hover:border-text-tertiary',
            className
          )}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="text-sm text-error">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="text-sm text-text-secondary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';
