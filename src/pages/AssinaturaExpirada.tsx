import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, CreditCard, LogOut, ChevronDown, Check, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export function AssinaturaExpirada() {
  const { signOut, userFrontend, userFrontends, switchGuild, hasActiveSubscription, isTrialExpired, subscription, activateTrial } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [trialLoading, setTrialLoading] = useState(false);
  const [trialError, setTrialError] = useState<string | null>(null);

  // If user switched to an active sub, prompt to go back
  if (hasActiveSubscription) {
      return (
        <div className="min-h-screen bg-leather-950 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full bg-leather-900 border border-green-700/50 rounded-western p-8 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="font-display text-3xl text-green-500 mb-4">Assinatura Ativa!</h2>
            <p className="text-parchment-300 mb-6">
                O servidor selecionado possui uma assinatura válida.
            </p>
            <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 bg-green-600 text-leather-950 font-heading rounded-western hover:bg-green-500 transition-colors"
            >
                Acessar Painel
            </button>
          </motion.div>
        </div>
      );
  }

  const handleActivateTrial = async () => {
    if (!userFrontend?.guild_id) return;
    setTrialLoading(true);
    setTrialError(null);

    const result = await activateTrial(userFrontend.guild_id);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setTrialError(result.message);
    }
    setTrialLoading(false);
  };

  // Check if this is an expired trial specifically
  const isTrialCase = isTrialExpired;
  // Check if guild never had a subscription (can activate trial)
  const canActivateTrial = !subscription || (!subscription.ativa && subscription.tipo !== 'trial');

  return (
    <div className="min-h-screen bg-leather-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-leather-900 border border-rust-700/50 rounded-western p-8 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-rust-500/20 flex items-center justify-center mx-auto mb-6">
          {isTrialCase ? (
            <Clock className="w-10 h-10 text-rust-500" />
          ) : (
            <AlertTriangle className="w-10 h-10 text-rust-500" />
          )}
        </div>

        <h2 className="font-display text-3xl text-rust-500 mb-4">
          {isTrialCase ? 'Período de Teste Expirado' : 'Assinatura Expirada'}
        </h2>

        <p className="text-parchment-300 mb-6">
          {isTrialCase
            ? 'Seu período de teste gratuito de 3 dias acabou. Gostou do Bot Fazendeiro? Assine agora para continuar usando!'
            : 'Sua assinatura do Bot Fazendeiro expirou ou ainda não foi ativada. Para continuar usando o bot e acessar o painel, renove sua assinatura.'}
        </p>

        <div className="mb-8 bg-leather-800/50 p-4 rounded-western border border-leather-700/50">
            <p className="text-parchment-500 text-sm mb-2">Servidor Selecionado:</p>

            <div className="relative">
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-leather-800 rounded-western border border-leather-600 hover:border-leather-500 transition-colors"
                >
                    <span className="text-parchment-200 font-medium truncate">
                        {userFrontend?.guild_id || "Carregando..."}
                    </span>
                    <ChevronDown size={18} className={`text-parchment-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showDropdown && userFrontends.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-leather-800 border border-leather-600 rounded-western z-10 max-h-60 overflow-y-auto shadow-xl">
                        {userFrontends.map(uf => (
                            <button
                                key={uf.id}
                                onClick={() => {
                                    if (uf.guild_id) switchGuild(uf.guild_id);
                                    setShowDropdown(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-leather-700 text-parchment-300 border-b border-leather-700/50 last:border-0 flex items-center justify-between"
                            >
                                <span>{uf.guild_id}</span>
                                {uf.id === userFrontend?.id && <Check size={16} className="text-gold-500" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        <div className="space-y-4">
          {/* Show trial button only if guild never had trial */}
          {canActivateTrial && (
            <>
              <button
                onClick={handleActivateTrial}
                disabled={trialLoading}
                className="w-full py-3 bg-gradient-to-r from-gold-500 to-whiskey-500 text-leather-950 font-heading rounded-western hover:from-gold-400 hover:to-whiskey-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {trialLoading ? (
                  <div className="w-5 h-5 border-2 border-leather-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                {trialLoading ? 'Ativando...' : 'Testar Grátis por 3 Dias'}
              </button>
              <div className="relative flex items-center justify-center">
                <div className="border-t border-leather-700 w-full absolute" />
                <span className="bg-leather-900 px-4 text-parchment-600 text-xs relative">ou</span>
              </div>
            </>
          )}

          {trialError && (
            <p className="text-rust-400 text-sm">{trialError}</p>
          )}

          <Link
            to="/checkout"
            className="w-full py-3 bg-gold-500 text-leather-950 font-heading rounded-western hover:bg-gold-400 transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            {isTrialCase ? 'Assinar Agora' : 'Renovar Assinatura'}
          </Link>

          <button
            onClick={async () => {
              await signOut();
              navigate('/login', { replace: true });
            }}
            className="w-full py-3 bg-leather-800 text-parchment-300 font-heading rounded-western border border-leather-600 hover:border-leather-500 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>

        <p className="mt-8 text-parchment-600 text-xs">
          Pagamentos via PIX são confirmados instantaneamente.
          <br />
          Dúvidas? Entre em contato pelo Discord.
        </p>
      </motion.div>
    </div>
  );
}

export default AssinaturaExpirada;
