import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variants = {
  primary: 'btn-western',
  secondary: 'btn-western bg-leather-800/50 hover:bg-leather-700/50',
  gold: 'btn-western-gold',
  danger: 'btn-western-danger',
  ghost: 'px-4 py-2 text-parchment-300 hover:text-parchment-100 hover:bg-leather-800/50 transition-colors rounded-western font-heading text-sm',
  outline: 'px-4 py-2 border border-gold-400/50 text-gold-400 hover:bg-gold-400/10 hover:border-gold-400 transition-colors rounded-western font-heading text-sm',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: '',
  lg: 'px-8 py-4 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          variants[variant],
          size !== 'md' && sizes[size],
          'inline-flex items-center justify-center gap-2',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
