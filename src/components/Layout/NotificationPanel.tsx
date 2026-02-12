import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Bell,
  DollarSign,
  Gift,
  Settings,
  ClipboardList,
  PackageCheck,
  Truck,
} from 'lucide-react';
import type { ActivityItem, ActivityType } from '../../lib/types';
import { cn } from '../../lib/utils';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ActivityItem[];
  isLoading: boolean;
}

const ACTIVITY_CONFIG: Record<
  ActivityType,
  { icon: typeof DollarSign; color: string; bg: string }
> = {
  payment_estoque: {
    icon: DollarSign,
    color: 'text-gold-400',
    bg: 'bg-gold-500/15',
  },
  payment_bonus: {
    icon: Gift,
    color: 'text-green-400',
    bg: 'bg-green-500/15',
  },
  payment_ajuste: {
    icon: Settings,
    color: 'text-parchment-300',
    bg: 'bg-parchment-500/10',
  },
  order_created: {
    icon: ClipboardList,
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
  },
  order_in_progress: {
    icon: Truck,
    color: 'text-gold-400',
    bg: 'bg-gold-500/15',
  },
  order_delivered: {
    icon: PackageCheck,
    color: 'text-green-400',
    bg: 'bg-green-500/15',
  },
};

function relativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;
  if (hours < 24) return `há ${hours}h`;
  if (days === 1) return 'ontem';
  if (days < 7) return `há ${days} dias`;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(timestamp));
}

interface TemporalGroup {
  label: string;
  items: ActivityItem[];
}

function groupByTime(activities: ActivityItem[]): TemporalGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86_400_000);
  const weekAgo = new Date(today.getTime() - 7 * 86_400_000);

  const groups: Record<string, ActivityItem[]> = {
    Hoje: [],
    Ontem: [],
    'Esta Semana': [],
    'Mais Antigo': [],
  };

  for (const item of activities) {
    const d = new Date(item.timestamp);
    if (d >= today) groups['Hoje'].push(item);
    else if (d >= yesterday) groups['Ontem'].push(item);
    else if (d >= weekAgo) groups['Esta Semana'].push(item);
    else groups['Mais Antigo'].push(item);
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

function SkeletonItem() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-leather-700/50 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-leather-700/50 rounded w-3/4" />
        <div className="h-3 bg-leather-700/30 rounded w-1/2" />
      </div>
    </div>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const config = ACTIVITY_CONFIG[item.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 px-4 py-3 hover:bg-leather-800/30 transition-colors"
    >
      <div
        className={cn(
          'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
          config.bg
        )}
      >
        <Icon size={16} className={config.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-parchment-200 leading-snug">
          {item.description}
        </p>
        <p className="text-xs text-parchment-500 mt-0.5">
          {relativeTime(item.timestamp)}
        </p>
      </div>
    </motion.div>
  );
}

export function NotificationPanel({
  isOpen,
  onClose,
  activities,
  isLoading,
}: NotificationPanelProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const panelRef = useFocusTrap(isOpen);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const groups = groupByTime(activities);

  // Portal to document.body to escape header's backdrop-filter containing block
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ x: isMobile ? '100%' : 400 }}
            animate={{ x: 0 }}
            exit={{ x: isMobile ? '100%' : 400 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed top-0 right-0 z-[101] h-full bg-leather-900 border-l border-leather-700/50 flex flex-col shadow-2xl',
              isMobile ? 'w-full' : 'w-[400px]'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-leather-700/50">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-gold-500" />
                <h2 className="font-heading text-lg text-parchment-100">
                  Atividade
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-western hover:bg-leather-800/50 transition-colors text-parchment-400 hover:text-parchment-200"
                aria-label="Fechar notificações"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading && activities.length === 0 ? (
                <div className="py-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonItem key={i} />
                  ))}
                </div>
              ) : activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-leather-800/50 flex items-center justify-center mb-4">
                    <Bell size={28} className="text-leather-600" />
                  </div>
                  <p className="text-parchment-400 font-heading text-lg mb-1">
                    Nenhuma atividade
                  </p>
                  <p className="text-parchment-600 text-sm">
                    Atividades da empresa aparecerão aqui
                  </p>
                </div>
              ) : (
                groups.map((group) => (
                  <div key={group.label}>
                    <div className="px-4 py-2 sticky top-0 bg-leather-900/95 backdrop-blur-sm border-b border-leather-800/50">
                      <p className="text-xs text-parchment-500 uppercase tracking-wider font-heading">
                        {group.label}
                      </p>
                    </div>
                    {group.items.map((item) => (
                      <ActivityRow key={item.id} item={item} />
                    ))}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
