import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, AlertCircle, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export function TrialBanner() {
  const { activateTrial, userFrontend, subscription } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (subscription?.ativa) return null;

  const alreadyUsedTrial = subscription?.tipo === 'trial';

  const handleActivateTrial = async () => {
    const guildId = userFrontend?.guild_id;

    if (!guildId || guildId === 'pending_activation') {
      setError('Nao foi possivel identificar um servidor valido para ativar o trial. Selecione um servidor no painel e tente novamente.');
      return;
    }

    setLoading(true);
    setError(null);
    setInfo(null);

    const result = await activateTrial(guildId);

    if (result.success) {
      setInfo(result.message || 'Intencao de trial registrada. Adicione o bot ao servidor para concluir a ativacao.');
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
        className="bg-leather-800/40 border border-leather-700/50 rounded-western p-4"
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-parchment-500 flex-shrink-0" />
          <p className="text-parchment-400 text-sm">
            Periodo de teste ja utilizado. Escolha um plano abaixo para continuar.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-gold-500/10 to-whiskey-500/10 border border-gold-500/30 rounded-western p-5 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gold-500/20 flex-shrink-0">
            <Sparkles className="w-5 h-5 text-gold-400" />
          </div>
          <div>
            <h3 className="font-heading text-parchment-100 text-base">Teste gratis por 3 dias</h3>
            <p className="text-parchment-400 text-sm mt-0.5">Experimente todas as funcionalidades sem compromisso</p>
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
              Ativar teste gratis
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

      {info && (
        <p className="text-emerald-400 text-sm mt-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {info}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-parchment-500">
        <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-400" />Sem cartao de credito</span>
        <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-400" />Sem compromisso</span>
        <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-400" />Acesso completo</span>
      </div>

      <p className="mt-2 text-xs text-parchment-500">
        Apos clicar, adicione o bot no servidor Discord para finalizar a ativacao automatica do trial.
      </p>
    </motion.div>
  );
}
