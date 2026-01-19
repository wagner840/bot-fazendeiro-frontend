import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import type { EncomendaStatus } from '../../lib/types';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'gold' | 'success' | 'warning' | 'danger';
  className?: string;
}

const variants = {
  default: 'badge-western',
  gold: 'badge-western bg-gold-900/50 text-gold-300 border-gold-600/50',
  success: 'badge-western bg-green-900/50 text-green-300 border-green-600/50',
  warning: 'badge-western bg-whiskey-900/50 text-whiskey-300 border-whiskey-600/50',
  danger: 'badge-western bg-rust-900/50 text-rust-300 border-rust-600/50',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return <span className={cn(variants[variant], className)}>{children}</span>;
}

// Status Stamp component
interface StatusStampProps {
  status: EncomendaStatus;
  className?: string;
}

const statusConfig: Record<EncomendaStatus, { label: string; class: string }> = {
  pendente: { label: 'Pendente', class: 'stamp-pending' },
  em_andamento: { label: 'Em Andamento', class: 'stamp-progress' },
  entregue: { label: 'Entregue', class: 'stamp-delivered' },
};

export function StatusStamp({ status, className }: StatusStampProps) {
  const config = statusConfig[status];

  return (
    <span className={cn('stamp', config.class, className)}>
      {config.label}
    </span>
  );
}

// Progress Bar
interface ProgressProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  className?: string;
}

export function Progress({ value, max = 100, showLabel, className }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('space-y-1', className)}>
      <div className="progress-western">
        <div
          className="progress-western-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-parchment-500 text-right">
          {Math.round(percentage)}%
        </p>
      )}
    </div>
  );
}

// Avatar component
interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const avatarSizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
};

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-leather-700 to-leather-800 flex items-center justify-center font-heading font-semibold text-gold-500 border border-leather-600/50',
        avatarSizes[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
