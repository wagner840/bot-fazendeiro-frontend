import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, AlertTriangle, Clock, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type BannerLevel = 'normal' | 'warning' | 'critical';

function getBannerLevel(diasRestantes: number): BannerLevel {
  if (diasRestantes <= 1) return 'critical';
  if (diasRestantes <= 5) return 'warning';
  return 'normal';
}

const bannerStyles: Record<BannerLevel, { bg: string; border: string; icon: string; text: string; cta: string }> = {
  normal: {
    bg: 'bg-leather-800/60',
    border: 'border-leather-700/50',
    icon: 'text-gold-500',
    text: 'text-parchment-300',
    cta: 'bg-leather-700 hover:bg-leather-600 text-parchment-200',
  },
  warning: {
    bg: 'bg-gradient-to-r from-gold-500/10 to-whiskey-500/10',
    border: 'border-gold-500/30',
    icon: 'text-gold-400',
    text: 'text-gold-300',
    cta: 'bg-gold-500 hover:bg-gold-400 text-leather-950',
  },
  critical: {
    bg: 'bg-gradient-to-r from-rust-500/15 to-rust-600/10',
    border: 'border-rust-500/40',
    icon: 'text-rust-400',
    text: 'text-rust-300',
    cta: 'bg-rust-500 hover:bg-rust-400 text-white',
  },
};

export function SubscriptionBanner() {
  const { subscription, isAdmin, isSuperadmin } = useAuth();

  // Only admins see this, superadmins skip
  if (!isAdmin || isSuperadmin) return null;
  if (!subscription?.ativa) return null;

  const dias = subscription.dias_restantes ?? 0;
  const level = getBannerLevel(dias);
  const styles = bannerStyles[level];
  const plano = subscription.plano_nome || 'Plano Ativo';

  const Icon = level === 'critical' ? AlertTriangle : level === 'warning' ? Clock : Crown;

  const message =
    level === 'critical'
      ? dias <= 0
        ? 'Sua assinatura expira hoje!'
        : 'Sua assinatura expira amanhã!'
      : level === 'warning'
        ? `Sua assinatura expira em ${dias} dias`
        : `${plano} · ${dias} dias restantes`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-western border ${styles.bg} ${styles.border} ${level === 'critical' ? 'animate-pulse-slow' : ''}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`p-2 rounded-lg bg-leather-900/50 ${styles.icon} flex-shrink-0`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-heading ${styles.text} truncate`}>
            {message}
          </p>
          {subscription.data_expiracao && level !== 'normal' && (
            <p className="text-xs text-parchment-500 mt-0.5">
              Expira em {new Date(subscription.data_expiracao).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
      </div>

      {level !== 'normal' && (
        <Link
          to="/checkout"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-heading transition-all flex-shrink-0 ${styles.cta}`}
        >
          <Zap className="w-4 h-4" />
          Renovar
          <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </motion.div>
  );
}
