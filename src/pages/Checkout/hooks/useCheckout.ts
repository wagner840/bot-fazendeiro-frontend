import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import type { Plano, PixData, PaymentStatus, UseCheckoutReturn } from '../types';

export function useCheckout(): UseCheckoutReturn {
  const [searchParams] = useSearchParams();
  const { user, userFrontend } = useAuth();

  // Data state
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [selectedPlano, setSelectedPlano] = useState<Plano | null>(null);
  const [pixData, setPixData] = useState<PixData | null>(null);

  // Loading state
  const [loading, setLoading] = useState(true);
  const [generatingPix, setGeneratingPix] = useState(false);

  // Form state
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');

  // Timer state
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes

  // Payment status
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');

  // Copy state
  const [copied, setCopied] = useState(false);

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
        const found = data.find((p) => p.nome.toLowerCase() === planoParam.toLowerCase());
        if (found) setSelectedPlano(found);
      } else if (data && data.length > 0) {
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

  // Generate PIX
  const generatePix = useCallback(async () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    if (!selectedPlano) {
      console.error('Debug: No plan selected');
      return;
    }

    if (!user) {
      console.error('Debug: No user found');
      alert('Erro: Usuário não autenticado. Por favor, faça login novamente.');
      return;
    }

    // Get Discord ID from userFrontend or Session Metadata
    const discordId =
      userFrontend?.discord_id ||
      user.user_metadata?.provider_id ||
      user.identities?.find((i: { provider: string }) => i.provider === 'discord')?.id;

    if (!discordId) {
      alert('Erro: ID do Discord não encontrado. Tente logar novamente.');
      return;
    }

    setGeneratingPix(true);

    try {
      const response = await fetch(`${apiUrl}/api/pix/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guild_id: userFrontend?.guild_id || 'pending_activation',
          plano_id: selectedPlano.id,
          pagador_discord_id: discordId,
          cpf_cnpj: cpf.replace(/\D/g, ''),
          email: email,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Debug: API Error:', error);
        throw new Error(error.error || 'Erro ao gerar PIX');
      }

      const data = await response.json();

      setPixData({
        qrcode: data.qrcode,
        copiaCola: data.copia_cola,
        expiracao: new Date(data.expiracao),
        paymentId: data.payment_id,
      });

      setTimeLeft(900);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Error generating PIX:', error);
      alert(`Erro ao gerar QR Code PIX: ${errorMessage}`);
    } finally {
      setGeneratingPix(false);
    }
  }, [selectedPlano, user, userFrontend, cpf, email]);

  // Copy to clipboard
  const copyToClipboard = useCallback(() => {
    if (!pixData) return;
    navigator.clipboard.writeText(pixData.copiaCola);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [pixData]);

  // Format time
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    // Data
    planos,
    selectedPlano,
    setSelectedPlano,
    pixData,
    setPixData,

    // Loading states
    loading,
    generatingPix,

    // Form
    cpf,
    setCpf,
    email,
    setEmail,

    // Timer
    timeLeft,
    formatTime,

    // Payment status
    paymentStatus,
    setPaymentStatus,

    // Copy
    copied,
    copyToClipboard,

    // Actions
    generatePix,
  };
}
