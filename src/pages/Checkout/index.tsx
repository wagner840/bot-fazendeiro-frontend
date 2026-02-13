import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePageTitle } from '../../hooks/usePageTitle';

import { useCheckout } from './hooks/useCheckout';
import { TrialBanner } from './components/TrialBanner';
import { ActiveSubscription } from './components/ActiveSubscription';
import { PaymentSuccess } from './components/PaymentSuccess';
import { PlanSelection } from './components/PlanSelection';
import { PixPayment } from './components/PixPayment';

export function Checkout() {
  usePageTitle('Checkout');
  const navigate = useNavigate();
  const { session, loading: authLoading, subscription } = useAuth();

  const {
    planos,
    selectedPlano,
    setSelectedPlano,
    pixData,
    setPixData,
    loading,
    generatingPix,
    cpf,
    setCpf,
    email,
    setEmail,
    timeLeft,
    formatTime,
    paymentStatus,
    setPaymentStatus,
    copied,
    copyToClipboard,
    generatePix,
  } = useCheckout();

  useEffect(() => {
    if (!authLoading && !session) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    }
  }, [session, authLoading, navigate]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-leather-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
      </div>
    );
  }

  // Active Subscription
  if (subscription?.ativa) {
    return (
      <ActiveSubscription
        planoNome={subscription.plano_nome || 'Plano Ativo'}
        diasRestantes={subscription.dias_restantes}
      />
    );
  }

  // Payment success
  if (paymentStatus === 'paid') {
    return <PaymentSuccess />;
  }

  return (
    <div className="min-h-screen bg-leather-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-parchment-400 hover:text-gold-500 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <h1 className="font-display text-4xl text-gold-500">Checkout</h1>
          <p className="text-parchment-400 mt-2">
            Complete seu pagamento via PIX para ativar sua assinatura
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Trial + Plan Selection */}
          <div>
            <TrialBanner />
            <PlanSelection
            planos={planos}
            selectedPlano={selectedPlano}
            setSelectedPlano={(plano) => {
              setSelectedPlano(plano);
              setPixData(null);
            }}
            pixData={pixData}
            cpf={cpf}
            setCpf={setCpf}
            email={email}
            setEmail={setEmail}
            generatingPix={generatingPix}
            generatePix={generatePix}
          />
          </div>

          {/* PIX Payment */}
          <PixPayment
            pixData={pixData}
            paymentStatus={paymentStatus}
            setPaymentStatus={setPaymentStatus}
            setPixData={setPixData}
            timeLeft={timeLeft}
            formatTime={formatTime}
            copied={copied}
            copyToClipboard={copyToClipboard}
          />
        </div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center text-parchment-500 text-sm"
        >
          <p>
            Pagamentos via PIX são confirmados instantaneamente.
            <br />
            Após a confirmação, você terá acesso imediato ao bot e painel.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Checkout;
