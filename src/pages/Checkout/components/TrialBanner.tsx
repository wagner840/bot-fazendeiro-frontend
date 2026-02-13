import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const BOT_INVITE_URL =
  'https://discord.com/oauth2/authorize?client_id=1462678665690349621&permissions=8&scope=bot%20applications.commands';

export function TrialBanner() {
  const { activateTrial, userFrontend, user, subscription } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hide if already has active subscription or is a trial that's still active
  if (subscription?.ativa) return null;

  // Hide if user already used trial (tipo === 'trial' means it was used before)
  const alreadyUsedTrial = subscription?.tipo === 'trial';

  const discordId =
    userFrontend?.discord_id ||
    user?.user_metadata?.provider_id ||
    user?.identities?.find((i: { provider: string }) => i.provider === 'discord')?.id;

  const handleActivateTrial = async () => {
    const guildId = userFrontend?.guild_id;

    if (!guildId || guildId === 'pending_activation') {
      // No guild selected — redirect to bot install first
      window.open(BOT_INVITE_URL, '_blank');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await activateTrial(guildId);

    if (result.success) {
      // Trial activated — redirect to bot install page
      window.open(BOT_INVITE_URL, '_blank');
      // Reload to refresh subscription state
      window.location.href = '/dashboard';
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  if (alreadyUsedTrial) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-leather-800/40 border border-leather-700/50 rounded-western p-4 mb-6"
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-parchment-500 flex-shrink-0" />
          <p className="text-parchment-400 text-sm">
            Período de teste já utilizado. Escolha um plano abaixo para continuar.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-gold-500/10 to-whiskey-500/10 border border-gold-500/30 rounded-western p-5 sm:p-6 mb-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gold-500/20 flex-shrink-0">
            <Sparkles className="w-5 h-5 text-gold-400" />
          </div>
          <div>
            <h3 className="font-heading text-parchment-100 text-base">
              Teste Grátis por 3 Dias
            </h3>
            <p className="text-parchment-400 text-sm mt-0.5">
              Experimente todas as funcionalidades sem compromisso
            </p>
          </div>
        </div>

        <button
          onClick={handleActivateTrial}
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-gold-500 to-whiskey-500 text-leather-950 font-heading rounded-western hover:from-gold-400 hover:to-whiskey-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Ativando...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Ativar Teste Grátis
              <ExternalLink className="w-3 h-3" />
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="text-rust-400 text-sm mt-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      )}

      <div className="mt-3 flex items-center gap-4 text-xs text-parchment-500">
        <span>✓ Sem cartão de crédito</span>
        <span>✓ Sem compromisso</span>
        <span>✓ Acesso completo</span>
      </div>
    </motion.div>
  );
}
