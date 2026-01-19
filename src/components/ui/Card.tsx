import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  withCorners?: boolean;
}

export function Card({ children, className, withCorners = false }: CardProps) {
  return (
    <div className={cn('western-card', className)}>
      {withCorners && (
        <>
          <div className="ornate-corner top-left" />
          <div className="ornate-corner top-right" />
          <div className="ornate-corner bottom-left" />
          <div className="ornate-corner bottom-right" />
        </>
      )}
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function CardHeader({ children, className, action }: CardHeaderProps) {
  return (
    <div className={cn('card-header-western', className)}>
      <div>{children}</div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn('p-6', className)}>{children}</div>;
}

interface StatCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ icon, value, label, trend, className }: StatCardProps) {
  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-start justify-between">
        <div className="p-3 rounded-western bg-leather-800/50 text-gold-500">
          {icon}
        </div>
        {trend && (
          <span
            className={cn(
              'text-xs font-heading px-2 py-1 rounded-full',
              trend.isPositive
                ? 'bg-green-900/30 text-green-400'
                : 'bg-rust-900/30 text-rust-400'
            )}
          >
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="stat-card-value">{value}</p>
        <p className="stat-card-label">{label}</p>
      </div>
    </Card>
  );
}
