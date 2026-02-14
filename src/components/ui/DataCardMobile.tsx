import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface DataCardMobileProps {
  title: string;
  subtitle?: string;
  meta?: string;
  rightTop?: ReactNode;
  rightBottom?: ReactNode;
  footer?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function DataCardMobile({
  title,
  subtitle,
  meta,
  rightTop,
  rightBottom,
  footer,
  onClick,
  className,
}: DataCardMobileProps) {
  return (
    <article
      onClick={onClick}
      className={cn(
        'p-4 transition-colors hover:bg-leather-800/30',
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-heading text-sm text-parchment-100 truncate">{title}</p>
          {subtitle && <p className="text-xs text-parchment-500 truncate">{subtitle}</p>}
          {meta && <p className="mt-1 text-[11px] text-parchment-600 truncate">{meta}</p>}
        </div>
        <div className="text-right shrink-0">
          {rightTop}
          {rightBottom && <div className="mt-1">{rightBottom}</div>}
        </div>
      </div>
      {footer && <div className="mt-3 pt-3 border-t border-leather-800/50">{footer}</div>}
    </article>
  );
}
