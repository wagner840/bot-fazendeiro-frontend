import { useEffect, useState, useMemo, useCallback } from 'react';
import { useApp } from '../../../context/AppContext';
import { formatCurrency, type HistoricoPagamento } from '../../../lib/types';
import {
  getHistoricoPagamentosEmpresa,
  getAuditoriaFuncionarios,
  zerarEstoqueComPagamento,
  type AuditoriaFuncionario,
} from '../../../lib/supabase';
import { filterBySearch } from '../../../lib/utils';
import type { AuditoriaStats, UseAuditoriaReturn } from '../types';

export function useAuditoria(): UseAuditoriaReturn {
  const { selectedEmpresa, addToast } = useApp();

  // Data state
  const [historico, setHistorico] = useState<HistoricoPagamento[]>([]);
  const [auditoriaFuncionarios, setAuditoriaFuncionarios] = useState<AuditoriaFuncionario[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'resumo' | 'historico'>('resumo');
  const [filterFuncionario, setFilterFuncionario] = useState<number | null>(null);
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [filterDateStart, setFilterDateStart] = useState<string>('');
  const [filterDateEnd, setFilterDateEnd] = useState<string>('');

  // Details modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedFuncionarioId, setSelectedFuncionarioId] = useState<number | null>(null);
  const [funcionarioHistorico, setFuncionarioHistorico] = useState<HistoricoPagamento[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Pagar modal state
  const [showPagarModal, setShowPagarModal] = useState(false);
  const [pagarFuncionarioId, setPagarFuncionarioId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    if (!selectedEmpresa) return;

    try {
      setIsLoading(true);
      const [historicoRes, auditoriaRes] = await Promise.all([
        getHistoricoPagamentosEmpresa(selectedEmpresa.id),
        getAuditoriaFuncionarios(selectedEmpresa.id),
      ]);

      setHistorico(historicoRes);
      setAuditoriaFuncionarios(auditoriaRes);
    } catch (error) {
      console.error('Error loading auditoria:', error);
      addToast({
        type: 'error',
        title: 'Erro ao carregar auditoria',
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedEmpresa, addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Stats calculations
  const stats = useMemo<AuditoriaStats>(() => {
    const totalPagoHistorico = historico.reduce((sum, h) => sum + (h.valor || 0), 0);
    const saldoTotal = auditoriaFuncionarios.reduce((sum, f) => sum + f.saldo_atual, 0);
    const estoqueTotal = auditoriaFuncionarios.reduce((sum, f) => sum + f.estoque_valor, 0);
    const funcionariosAtivos = auditoriaFuncionarios.length;

    return { totalPagoHistorico, saldoTotal, estoqueTotal, funcionariosAtivos };
  }, [historico, auditoriaFuncionarios]);

  // Filtered historico
  const filteredHistorico = useMemo(() => {
    let filtered = historico;

    if (filterFuncionario) {
      filtered = filtered.filter((h) => h.funcionario_id === filterFuncionario);
    }

    if (filterTipo) {
      filtered = filtered.filter((h) => h.tipo === filterTipo);
    }

    if (filterDateStart) {
      const start = new Date(filterDateStart);
      filtered = filtered.filter((h) => new Date(h.data_pagamento) >= start);
    }
    if (filterDateEnd) {
      const end = new Date(filterDateEnd);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((h) => new Date(h.data_pagamento) <= end);
    }

    if (searchQuery) {
      filtered = filtered.filter((h) => {
        const funcNome = (h.funcionario as { nome?: string })?.nome || '';
        return (
          funcNome.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.tipo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (h.descricao || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    return filtered;
  }, [historico, filterFuncionario, filterTipo, filterDateStart, filterDateEnd, searchQuery]);

  // Filtered resumo
  const filteredResumo = useMemo(() => {
    return filterBySearch(auditoriaFuncionarios, searchQuery, ['nome', 'discord_id']);
  }, [auditoriaFuncionarios, searchQuery]);

  // Get unique tipos for filter dropdown
  const tiposUnicos = useMemo(() => {
    const tipos = new Set(historico.map((h) => h.tipo));
    return Array.from(tipos);
  }, [historico]);

  // Details modal handlers
  const openDetailsModal = useCallback(
    (funcionarioId: number) => {
      setSelectedFuncionarioId(funcionarioId);
      setShowDetailsModal(true);
      setLoadingDetails(true);

      try {
        const funcHistorico = historico.filter((h) => h.funcionario_id === funcionarioId);
        setFuncionarioHistorico(funcHistorico);
      } finally {
        setLoadingDetails(false);
      }
    },
    [historico]
  );

  const closeDetailsModal = useCallback(() => {
    setShowDetailsModal(false);
    setSelectedFuncionarioId(null);
    setFuncionarioHistorico([]);
  }, []);

  // Pagar modal handlers
  const openPagarModal = useCallback((funcionarioId: number) => {
    setPagarFuncionarioId(funcionarioId);
    setShowPagarModal(true);
  }, []);

  const closePagarModal = useCallback(() => {
    setShowPagarModal(false);
    setPagarFuncionarioId(null);
  }, []);

  const handlePagarEstoque = useCallback(async () => {
    if (!selectedEmpresa || !pagarFuncionarioId) return;

    try {
      setIsSaving(true);
      const { valorPago } = await zerarEstoqueComPagamento(pagarFuncionarioId, selectedEmpresa.id);

      if (valorPago > 0) {
        addToast({
          type: 'success',
          title: 'Pagamento registrado!',
          message: `Valor: ${formatCurrency(valorPago)}`,
        });
      } else {
        addToast({ type: 'info', title: 'Nenhum valor a pagar (estoque vazio)' });
      }
      closePagarModal();
      await loadData();
    } catch (error) {
      console.error('Error paying stock:', error);
      addToast({ type: 'error', title: 'Erro ao registrar pagamento' });
    } finally {
      setIsSaving(false);
    }
  }, [selectedEmpresa, pagarFuncionarioId, addToast, closePagarModal, loadData]);

  // Helper to get funcionario name
  const getFuncionarioNome = useCallback(
    (id: number | null): string => {
      if (!id) return '';
      const func = auditoriaFuncionarios.find((f) => f.funcionario_id === id);
      return func?.nome || '';
    },
    [auditoriaFuncionarios]
  );

  return {
    // Data
    historico,
    auditoriaFuncionarios,
    filteredHistorico,
    filteredResumo,
    stats,
    tiposUnicos,

    // Loading states
    isLoading,
    isSaving,
    loadingDetails,

    // Filters
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filterFuncionario,
    setFilterFuncionario,
    filterTipo,
    setFilterTipo,
    filterDateStart,
    setFilterDateStart,
    filterDateEnd,
    setFilterDateEnd,

    // Details modal
    showDetailsModal,
    selectedFuncionarioId,
    funcionarioHistorico,
    openDetailsModal,
    closeDetailsModal,

    // Pagar modal
    showPagarModal,
    pagarFuncionarioId,
    openPagarModal,
    closePagarModal,
    handlePagarEstoque,

    // Helpers
    getFuncionarioNome,
  };
}
