import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, ShieldCheck, Wallet, CircleHelp } from 'lucide-react';
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

  if (subscription?.ativa) {
    return (
      <ActiveSubscription
        planoNome={subscription.plano_nome || 'Plano Ativo'}
        diasRestantes={subscription.dias_restantes}
      />
    );
  }

  if (paymentStatus === 'paid') {
    return <PaymentSuccess />;
  }

  return (
    <div className="min-h-screen bg-leather-950 py-8 sm:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-parchment-400 hover:text-gold-500 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <h1 className="font-display text-3xl sm:text-4xl text-gold-500">Checkout Seguro</h1>
          <p className="text-parchment-400 mt-2">
            Ative sua assinatura com PIX e mantenha seu servidor em operacao sem interrupcao.
          </p>
        </motion.div>

        <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="space-y-6">
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

          <div className="space-y-6">
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

            <section className="western-card p-5 sm:p-6 space-y-4">
              <h2 className="font-heading text-lg text-parchment-100">Confianca e faturamento</h2>
              <ul className="space-y-3 text-sm text-parchment-300">
                <li className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 mt-0.5 text-green-400" />Confirmacao automatica apos pagamento aprovado.</li>
                <li className="flex items-start gap-2"><Wallet className="w-4 h-4 mt-0.5 text-gold-500" />Canal de cobranca: PIX Asaas com comprovante por e-mail.</li>
                <li className="flex items-start gap-2"><CircleHelp className="w-4 h-4 mt-0.5 text-parchment-400" />Suporte no Discord em caso de falha de conciliacao.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
