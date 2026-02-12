import { motion } from 'framer-motion';
import { CheckCircle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-leather-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-leather-900 border border-gold-500/50 rounded-western p-8 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="font-display text-3xl text-gold-500 mb-4">Pagamento Confirmado!</h2>
        <p className="text-parchment-300 mb-8">
          Sua assinatura foi ativada com sucesso. Agora você tem acesso completo ao Bot Fazendeiro!
        </p>
        <div className="flex flex-col gap-3">
          <a
            href="https://discord.com/oauth2/authorize?client_id=1462678665690349621&permissions=8&integration_type=0&scope=bot"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-[#5865F2] text-white font-heading rounded-western hover:bg-[#4752C4] transition-colors flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            Adicionar Bot ao Servidor
          </a>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 bg-gold-500 text-leather-950 font-heading rounded-western hover:bg-gold-400 transition-colors"
          >
            Acessar o Painel
          </button>
        </div>
      </motion.div>
    </div>
  );
}
