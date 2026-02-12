import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ActiveSubscriptionProps {
  planoNome: string;
  diasRestantes: number;
}

export function ActiveSubscription({ planoNome, diasRestantes }: ActiveSubscriptionProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-leather-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-leather-900 border border-emerald-500/50 rounded-western p-8 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="font-display text-3xl text-emerald-500 mb-2">Assinatura Ativa</h2>
        <p className="text-parchment-300 mb-6">
          Você já possui uma assinatura ativa do plano:
          <br />
          <span className="text-gold-500 font-bold text-lg">{planoNome}</span>
        </p>

        <div className="bg-leather-800 rounded-western p-4 mb-8 border border-leather-700">
          <p className="text-parchment-400 text-sm">Tempo restante</p>
          <p className="text-2xl font-mono text-parchment-100">{diasRestantes} dias</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 bg-gold-500 text-leather-950 font-heading rounded-western hover:bg-gold-400 transition-colors"
          >
            Ir para o Dashboard
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-leather-800 text-parchment-300 font-heading rounded-western hover:bg-leather-700 transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </motion.div>
    </div>
  );
}
