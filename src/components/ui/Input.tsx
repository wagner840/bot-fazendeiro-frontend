import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-heading text-parchment-300">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-leather-500">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'input-western',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-rust-600/50 focus:border-rust-500 focus:ring-rust-500/30',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-leather-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-rust-400">{error}</p>}
        {hint && !error && <p className="text-xs text-parchment-500">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-heading text-parchment-300">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'input-western min-h-[100px] resize-y',
            error && 'border-rust-600/50 focus:border-rust-500 focus:ring-rust-500/30',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-rust-400">{error}</p>}
        {hint && !error && <p className="text-xs text-parchment-500">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
