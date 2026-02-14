import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface MetricTileProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
}

export function MetricTile({ icon, label, value, hint, className }: MetricTileProps) {
  return (
    <div className={cn('western-card p-4 sm:p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="p-2 rounded-western bg-leather-800/50 text-gold-500">{icon}</div>
        {hint && <span className="text-[11px] text-parchment-500">{hint}</span>}
      </div>
      <p className="mt-4 font-display text-2xl text-gold-500 truncate">{value}</p>
      <p className="mt-1 text-xs text-parchment-500 uppercase tracking-wider">{label}</p>
    </div>
  );
}
