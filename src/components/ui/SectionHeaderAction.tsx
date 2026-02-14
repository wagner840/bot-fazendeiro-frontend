import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface SectionHeaderActionProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeaderAction({
  title,
  subtitle,
  action,
  className,
}: SectionHeaderActionProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',
        className
      )}
    >
      <div>
        <h1 className="font-display text-2xl sm:text-3xl text-gold-500">{title}</h1>
        {subtitle && <p className="mt-1 text-sm sm:text-base text-parchment-400">{subtitle}</p>}
      </div>
      {action && <div className="w-full sm:w-auto">{action}</div>}
    </div>
  );
}
