import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, CreditCard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AssinaturaExpirada() {
  const { signOut, userFrontend } = useAuth();

  return (
    <div className="min-h-screen bg-leather-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-leather-900 border border-rust-700/50 rounded-western p-8 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-rust-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-rust-500" />
        </div>

        <h2 className="font-display text-3xl text-rust-500 mb-4">
          Assinatura Expirada
        </h2>

        <p className="text-parchment-300 mb-6">
          Sua assinatura do Bot Fazendeiro expirou ou ainda não foi ativada.
          Para continuar usando o bot e acessar o painel, renove sua assinatura.
        </p>

        {userFrontend?.guild_id && (
          <p className="text-parchment-500 text-sm mb-8">
            Servidor: <span className="text-parchment-300">{userFrontend.guild_id}</span>
          </p>
        )}

        <div className="space-y-4">
          <Link
            to="/checkout"
            className="w-full py-3 bg-gold-500 text-leather-950 font-heading rounded-western hover:bg-gold-400 transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            Renovar Assinatura
          </Link>

          <button
            onClick={signOut}
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
