import { motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import type { Toast as ToastType } from '../../lib/types';
import { cn } from '../../lib/utils';

interface ToastProps {
  toast: ToastType;
  onClose: () => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: 'border-green-600/50 bg-green-900/20',
  error: 'border-rust-600/50 bg-rust-900/20',
  info: 'border-gold-600/50 bg-gold-900/20',
  warning: 'border-whiskey-600/50 bg-whiskey-900/20',
};

const iconColors = {
  success: 'text-green-400',
  error: 'text-rust-400',
  info: 'text-gold-400',
  warning: 'text-whiskey-400',
};

export function Toast({ toast, onClose }: ToastProps) {
  const Icon = icons[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'western-card px-4 py-3 min-w-[300px] max-w-sm border-l-4',
        colors[toast.type]
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconColors[toast.type])} />
        <div className="flex-1 min-w-0">
          <p className="font-heading text-sm font-semibold text-parchment-100">
            {toast.title}
          </p>
          {toast.message && (
            <p className="text-sm text-parchment-400 mt-1">{toast.message}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-leather-700/50 transition-colors"
        >
          <X size={14} className="text-parchment-500" />
        </button>
      </div>
    </motion.div>
  );
}
