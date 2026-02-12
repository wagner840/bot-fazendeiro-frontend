import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  hint?: string;
  action?: {
    label: string;
    to?: string;
    onClick?: () => void;
  };
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon,
  title,
  description,
  hint,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-6' : 'py-12',
        className
      )}
    >
      <div className={cn('text-leather-600 mb-4', compact ? 'w-12 h-12' : 'w-16 h-16')}>
        {icon}
      </div>

      <p className="font-heading text-lg text-parchment-300 mb-1">{title}</p>

      {description && (
        <p className="text-sm text-parchment-500 max-w-sm mb-3">{description}</p>
      )}

      {hint && (
        <p className="text-xs text-parchment-600 max-w-xs mb-4 font-mono bg-leather-800/50 px-3 py-1.5 rounded-western border border-leather-700/30">
          {hint}
        </p>
      )}

      {action && (
        action.to ? (
          <Link
            to={action.to}
            className="btn-western-gold text-sm px-4 py-2"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="btn-western-gold text-sm px-4 py-2"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
