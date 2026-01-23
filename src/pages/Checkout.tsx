import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, Copy, Check, Clock, ArrowLeft, Loader2, CheckCircle, Users } from 'lucide-react';
import InputMask from 'inputmask';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Plano {
  id: number;
  nome: string;
  preco: number;
  duracao_dias: number;
}

interface PixData {
  qrcode: string;
  copiaCola: string;
  expiracao: Date;
  paymentId: number;
}

export function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, userFrontend, session, loading: authLoading, subscription } = useAuth();

  useEffect(() => {
    if (!authLoading && !session) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    }
  }, [session, authLoading, navigate]);

  const [planos, setPlanos] = useState<Plano[]>([]);
  const [selectedPlano, setSelectedPlano] = useState<Plano | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPix, setGeneratingPix] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'expired'>('pending');

  useEffect(() => {
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
      InputMask({ mask: '999.999.999-99' }).mask(cpfInput);
    }
  }, []);

  // Load planos
  useEffect(() => {
    const fetchPlanos = async () => {
      const { data, error } = await supabase
        .from('planos')
        .select('*')
        .eq('ativo', true)
        .order('preco');

      if (error) {
        console.error('Error fetching planos:', error);
        return;
      }

      setPlanos(data || []);

      // Pre-select based on URL param
      const planoParam = searchParams.get('plano');
      if (planoParam && data) {
        const found = data.find(
          (p) => p.nome.toLowerCase() === planoParam.toLowerCase()
        );
        if (found) setSelectedPlano(found);
      } else if (data && data.length > 0) {
        // Default to first plan
        setSelectedPlano(data[0]);
      }

      setLoading(false);
    };

    fetchPlanos();
  }, [searchParams]);

  // Timer countdown
  useEffect(() => {
    if (!pixData || paymentStatus !== 'pending') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setPaymentStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pixData, paymentStatus]);

  // Check payment status periodically
  useEffect(() => {
    if (!pixData || paymentStatus !== 'pending') return;

    const checkStatus = async () => {
      const { data } = await supabase
        .from('pagamentos_pix')
        .select('status')
        .eq('pix_id', pixData.paymentId)
        .single();

      if (data?.status === 'pago') {
        setPaymentStatus('paid');
      }
    };

    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [pixData, paymentStatus]);

  const generatePix = async () => {
    console.log('--- Debug: generatePix Start ---');
    console.log('Selected Plan:', selectedPlano);
    console.log('User:', user);
    console.log('User Frontend:', userFrontend);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    console.log('API URL:', apiUrl);

    if (!selectedPlano) {
        console.error('Debug: No plan selected');
        return;
    }
    
    if (!user) {
        console.error('Debug: No user found');
        alert('Erro: Usuário não autenticado. Por favor, faça login novamente.');
        // Optional: Force logout or redirect
        return;
    }

    // Get Discord ID from userFrontend or Session Metadata
    const discordId = userFrontend?.discord_id || 
                     user.user_metadata?.provider_id || 
                     user.identities?.find((i: any) => i.provider === 'discord')?.id;

    console.log('Debug: Resolved Discord ID:', discordId);

    if (!discordId) {
      alert('Erro: ID do Discord não encontrado. Tente logar novamente.');
      return;
    }

    setGeneratingPix(true);

    try {
      // Call Python Backend API to create PIX charge
      console.log(`Debug: Fetching ${apiUrl}/api/pix/create`);
      const response = await fetch(`${apiUrl}/api/pix/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guild_id: userFrontend?.guild_id || 'pending_activation', // Use pending if no guild yet
          plano_id: selectedPlano.id,
          pagador_discord_id: discordId,
          cpf_cnpj: cpf.replace(/\D/g, ''),
          email: email,
        }),
      });

      console.log('Debug: Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('Debug: API Error:', error);
        throw new Error(error.error || 'Erro ao gerar PIX');
      }

      const data = await response.json();
      console.log('Debug: API Data:', data);

      setPixData({
        qrcode: data.qrcode,
        copiaCola: data.copia_cola,
        expiracao: new Date(data.expiracao),
        paymentId: data.payment_id,
      });

      setTimeLeft(900);
      setTimeLeft(900);
    } catch (error: any) {
      console.error('Error generating PIX:', error);
      alert(`Erro ao gerar QR Code PIX: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setGeneratingPix(false);
    }
  };

  const copyToClipboard = () => {
    if (!pixData) return;
    navigator.clipboard.writeText(pixData.copiaCola);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
      <div className="min-h-screen bg-leather-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-leather-900 border border-emerald-500/50 rounded-western p-8 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="font-display text-3xl text-emerald-500 mb-2">
            Assinatura Ativa
          </h2>
          <p className="text-parchment-300 mb-6">
            Você já possui uma assinatura ativa do plano:
            <br />
            <span className="text-gold-500 font-bold text-lg">
              {subscription.plano_nome}
            </span>
          </p>
          
          <div className="bg-leather-800 rounded-western p-4 mb-8 border border-leather-700">
             <p className="text-parchment-400 text-sm">Tempo restante</p>
             <p className="text-2xl font-mono text-parchment-100">
                {subscription.dias_restantes} dias
             </p>
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

  // Payment success
  if (paymentStatus === 'paid') {
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
          <h2 className="font-display text-3xl text-gold-500 mb-4">
            Pagamento Confirmado!
          </h2>
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
          {/* Plan Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-leather-900/50 border border-leather-700 rounded-western p-6"
          >
            <h2 className="font-heading text-xl text-parchment-100 mb-6">
              Selecione o Plano
            </h2>

            <div className="space-y-4">
              {planos.map((plano) => (
                <button
                  key={plano.id}
                  onClick={() => {
                    setSelectedPlano(plano);
                    setPixData(null);
                  }}
                  disabled={!!pixData}
                  className={`w-full p-4 rounded-western border text-left transition-all ${
                    selectedPlano?.id === plano.id
                      ? 'border-gold-500 bg-gold-500/10'
                      : 'border-leather-600 hover:border-leather-500'
                  } ${pixData ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-heading text-parchment-100">{plano.nome}</h3>
                      <p className="text-parchment-500 text-sm">
                        {plano.duracao_dias} dias de acesso
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-gold-500">
                      R$ {plano.preco.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {selectedPlano && !pixData && (
              <div className="mt-6 space-y-4">
                 <div>
                    <label htmlFor="email" className="block text-parchment-400 text-sm mb-2">E-mail (Para comprovante)</label>
                    <input
                      id="email"
                      type="email"
                      className="w-full bg-leather-800 border border-leather-600 rounded-western p-3 text-parchment-100 placeholder-leather-500 focus:border-gold-500 focus:outline-none transition-colors"
                      placeholder="seu@email.com"
                      onChange={(e) => setEmail(e.target.value)}
                      value={email}
                    />
                 </div>

                 <div>
                    <label htmlFor="cpf" className="block text-parchment-400 text-sm mb-2">CPF do Pagador (Obrigatório para PIX)</label>
                    <input
                      id="cpf"
                      type="text"
                      className="w-full bg-leather-800 border border-leather-600 rounded-western p-3 text-parchment-100 placeholder-leather-500 focus:border-gold-500 focus:outline-none transition-colors"
                      placeholder="000.000.000-00"
                      onChange={(e) => setCpf(e.target.value)}
                    />
                 </div>

                <button
                  onClick={generatePix}
                  disabled={generatingPix || cpf.replace(/\D/g, '').length !== 11 || !email.includes('@')}
                  className="w-full py-4 bg-gold-500 text-leather-950 font-heading rounded-western hover:bg-gold-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingPix ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Gerando PIX...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-5 h-5" />
                      Gerar QR Code PIX
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>

          {/* PIX Payment */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-leather-900/50 border border-leather-700 rounded-western p-6"
          >
            {pixData ? (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-gold-500" />
                  <span
                    className={`font-mono text-lg ${
                      timeLeft < 60 ? 'text-rust-500' : 'text-parchment-300'
                    }`}
                  >
                    {formatTime(timeLeft)}
                  </span>
                </div>

                {paymentStatus === 'expired' ? (
                  <div className="py-8">
                    <p className="text-rust-400 mb-4">PIX expirado</p>
                    <button
                      onClick={() => {
                        setPixData(null);
                        setPaymentStatus('pending');
                      }}
                      className="px-6 py-2 bg-leather-800 text-parchment-200 rounded-western hover:bg-leather-700"
                    >
                      Gerar novo QR Code
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-white p-4 rounded-lg inline-block mb-6">
                      <img
                        src={pixData.qrcode}
                        alt="QR Code PIX"
                        className="w-64 h-64"
                      />
                    </div>

                    <p className="text-parchment-400 text-sm mb-4">
                      Escaneie o QR Code ou copie o código abaixo
                    </p>

                    <div className="bg-leather-800 rounded-western p-4 mb-4">
                      <p className="text-parchment-300 text-xs font-mono break-all mb-3">
                        {pixData.copiaCola.substring(0, 60)}...
                      </p>
                      <button
                        onClick={copyToClipboard}
                        className="w-full py-2 bg-leather-700 text-parchment-200 rounded-western hover:bg-leather-600 flex items-center justify-center gap-2 transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-500" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copiar código PIX
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-parchment-500 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Aguardando pagamento...
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <QrCode className="w-16 h-16 text-leather-600 mx-auto mb-4" />
                <p className="text-parchment-500">
                  Selecione um plano e clique em "Gerar QR Code PIX"
                </p>
              </div>
            )}
          </motion.div>
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
