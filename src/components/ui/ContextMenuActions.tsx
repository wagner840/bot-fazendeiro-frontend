import { useEffect, useRef, useState, type ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MenuAction {
  id: string;
  label: string;
  icon?: ReactNode;
  tone?: 'default' | 'danger';
  onClick: () => void;
}

interface ContextMenuActionsProps {
  actions: MenuAction[];
  buttonLabel?: string;
  align?: 'left' | 'right';
}

export function ContextMenuActions({
  actions,
  buttonLabel = 'Abrir acoes',
  align = 'right',
}: ContextMenuActionsProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={buttonLabel}
        className="p-2 rounded-western text-parchment-400 hover:text-gold-400 hover:bg-leather-800/50 transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div
          className={cn(
            'absolute top-full mt-1 min-w-[170px] z-20 western-card p-1',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => {
                action.onClick();
                setOpen(false);
              }}
              className={cn(
                'w-full text-left px-3 py-2 rounded-western text-sm flex items-center gap-2 transition-colors',
                action.tone === 'danger'
                  ? 'text-rust-400 hover:bg-rust-900/20'
                  : 'text-parchment-300 hover:bg-leather-800/50'
              )}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
