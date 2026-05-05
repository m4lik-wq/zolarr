import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-2xl border bg-[var(--color-bg-elevated)] px-4 py-2 text-base',
        'placeholder:text-[var(--color-text-muted)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-colors',
        error
          ? 'border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]'
          : 'border-[var(--color-border)]',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
