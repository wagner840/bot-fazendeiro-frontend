import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { useApp } from '../../../context/AppContext';
import type { PaymentStatus, PixData, Plano, UseCheckoutReturn } from '../types';

export function useCheckout(): UseCheckoutReturn {
  const [searchParams] = useSearchParams();
  const { user, userFrontend, session } = useAuth();
  const { addToast } = useApp();

  const [planos, setPlanos] = useState<Plano[]>([]);
  const [selectedPlano, setSelectedPlano] = useState<Plano | null>(null);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPix, setGeneratingPix] = useState(false);
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [timeLeft, setTimeLeft] = useState(900);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPlanos = async () => {
      const { data, error } = await supabase.from('planos').select('*').eq('ativo', true).order('preco');

      if (error) {
        console.error('Error fetching planos:', error);
        addToast({
          type: 'error',
          title: 'Falha ao carregar planos',
          message: 'Tente novamente em instantes.',
        });
        setLoading(false);
        return;
      }

      setPlanos(data || []);
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
  }, [searchParams, addToast]);

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

  useEffect(() => {
    if (!pixData || paymentStatus !== 'pending' || !session?.access_token) return;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const checkStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/pix/status/${pixData.paymentId}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!response.ok) return;
        const data = await response.json();
        if (data?.status === 'pago') setPaymentStatus('paid');
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    };

    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [pixData, paymentStatus, session?.access_token]);

  const generatePix = useCallback(async () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    if (!selectedPlano) return;
    if (!user || !session?.access_token) {
      addToast({
        type: 'error',
        title: 'Sessão inválida',
        message: 'Faça login novamente para continuar.',
      });
      return;
    }

    const discordId =
      userFrontend?.discord_id ||
      user.user_metadata?.provider_id ||
      user.identities?.find((i: { provider: string }) => i.provider === 'discord')?.id;
    if (!discordId) {
      addToast({
        type: 'error',
        title: 'Discord não encontrado',
        message: 'Não foi possível identificar seu usuário Discord.',
      });
      return;
    }

    setGeneratingPix(true);
    try {
      const response = await fetch(`${apiUrl}/api/pix/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          guild_id: userFrontend?.guild_id || 'pending_activation',
          plano_id: selectedPlano.id,
          cpf_cnpj: cpf.replace(/\D/g, ''),
          email,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Erro ao gerar PIX' }));
        throw new Error(error.detail || error.error || 'Erro ao gerar PIX');
      }

      const data = await response.json();
      setPixData({
        qrcode: data.qrcode,
        copiaCola: data.copia_cola,
        expiracao: new Date(data.expiracao),
        paymentId: String(data.payment_id),
      });
      setTimeLeft(900);
      setPaymentStatus('pending');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      addToast({
        type: 'error',
        title: 'Erro ao gerar QR Code PIX',
        message: errorMessage,
      });
    } finally {
      setGeneratingPix(false);
    }
  }, [selectedPlano, user, userFrontend, cpf, email, session?.access_token, addToast]);

  const copyToClipboard = useCallback(() => {
    if (!pixData) return;
    navigator.clipboard.writeText(pixData.copiaCola);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [pixData]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
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
  };
}

