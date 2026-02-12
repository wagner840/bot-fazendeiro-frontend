import { useEffect, useState, useMemo, useCallback } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import type { Funcionario, ProdutoEmpresa } from '../../../lib/types';
import { formatCurrency } from '../../../lib/types';
import {
  getFuncionarios,
  getProdutosEmpresa,
  getEstoqueGlobal,
  ajustarEstoque,
  zerarEstoqueComPagamento,
  type EstoqueGlobalItem,
} from '../../../lib/supabase';
import { filterBySearch } from '../../../lib/utils';
import type { EstoqueAgregado, AjustarForm, UseEstoqueReturn } from '../types';

export function useEstoque(): UseEstoqueReturn {
  const { selectedEmpresa, addToast } = useApp();
  const { isAdmin, userFrontend } = useAuth();

  // Data
  const [estoqueData, setEstoqueData] = useState<EstoqueGlobalItem[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [produtos, setProdutos] = useState<ProdutoEmpresa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'global' | 'funcionario'>('global');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedFuncionarioFilter, setSelectedFuncionarioFilter] = useState<number | null>(null);
  const [myFuncionarioId, setMyFuncionarioId] = useState<number | null>(null);

  // Modal states
  const [showAjustarModal, setShowAjustarModal] = useState(false);
  const [showZerarModal, setShowZerarModal] = useState(false);
  const [ajustarForm, setAjustarForm] = useState<AjustarForm>({
    funcionario_id: 0,
    produto_codigo: '',
    quantidade: 0,
  });
  const [zerarFuncionarioId, setZerarFuncionarioId] = useState<number | null>(null);

  // Load data
  const loadData = useCallback(async () => {
    if (!selectedEmpresa) return;

    try {
      setIsLoading(true);
      const [estoqueRes, funcsRes, produtosRes] = await Promise.all([
        getEstoqueGlobal(selectedEmpresa.id),
        getFuncionarios(selectedEmpresa.id),
        getProdutosEmpresa(selectedEmpresa.id),
      ]);

      setEstoqueData(estoqueRes);
      setFuncionarios(funcsRes);
      setProdutos(produtosRes);
    } catch (error) {
      console.error('Error loading estoque:', error);
      addToast({
        type: 'error',
        title: 'Erro ao carregar estoque',
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedEmpresa, addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // For non-admin users, find their funcionario_id
  useEffect(() => {
    if (!isAdmin && userFrontend && funcionarios.length > 0) {
      const myFunc = funcionarios.find(f => f.discord_id === userFrontend.discord_id);
      if (myFunc) {
        setMyFuncionarioId(myFunc.id);
        setActiveTab('funcionario');
      }
    }
  }, [isAdmin, userFrontend, funcionarios]);

  // Aggregate estoque by product for global view
  const estoqueAgregado = useMemo((): EstoqueAgregado[] => {
    const grouped: Record<string, EstoqueAgregado> = {};

    estoqueData.forEach(item => {
      const codigo = item.produto_codigo;
      if (!grouped[codigo]) {
        grouped[codigo] = {
          produto_codigo: codigo,
          quantidade_total: 0,
          valor_unitario: item.preco_pagamento_funcionario,
          valor_total: 0,
          funcionarios: [],
        };
      }

      grouped[codigo].quantidade_total += item.quantidade;
      const valorItem = item.quantidade * item.preco_pagamento_funcionario;
      grouped[codigo].valor_total += valorItem;
      grouped[codigo].funcionarios.push({
        funcionario_id: item.funcionario_id,
        funcionario_nome: item.funcionario_nome,
        quantidade: item.quantidade,
        valor: valorItem,
      });
    });

    return Object.values(grouped).sort((a, b) => a.produto_codigo.localeCompare(b.produto_codigo));
  }, [estoqueData]);

  // Filter estoque for funcionario view
  const estoqueFuncionario = useMemo(() => {
    let filtered = estoqueData;

    if (!isAdmin && myFuncionarioId) {
      filtered = filtered.filter(item => item.funcionario_id === myFuncionarioId);
    } else if (selectedFuncionarioFilter) {
      filtered = filtered.filter(item => item.funcionario_id === selectedFuncionarioFilter);
    }

    return filtered;
  }, [estoqueData, isAdmin, myFuncionarioId, selectedFuncionarioFilter]);

  // Stats calculations
  const stats = useMemo(() => {
    const dataToUse = !isAdmin && myFuncionarioId
      ? estoqueData.filter(item => item.funcionario_id === myFuncionarioId)
      : estoqueData;

    const totalItens = dataToUse.reduce((sum, item) => sum + item.quantidade, 0);
    const valorTotal = dataToUse.reduce(
      (sum, item) => sum + item.quantidade * item.preco_pagamento_funcionario,
      0
    );
    const produtosDistintos = new Set(dataToUse.map(item => item.produto_codigo)).size;
    const funcionariosComEstoque = new Set(dataToUse.map(item => item.funcionario_id)).size;

    return { totalItens, valorTotal, produtosDistintos, funcionariosComEstoque };
  }, [estoqueData, isAdmin, myFuncionarioId]);

  // Filter by search
  const filteredAgregado = useMemo(() => {
    if (!searchQuery) return estoqueAgregado;
    return estoqueAgregado.filter(item =>
      item.produto_codigo.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [estoqueAgregado, searchQuery]);

  const filteredFuncionario = useMemo(() => {
    return filterBySearch(estoqueFuncionario, searchQuery, ['produto_codigo', 'funcionario_nome']);
  }, [estoqueFuncionario, searchQuery]);

  // Get unique product codes for dropdown
  const produtoCodigos = useMemo(() => {
    const codigos = new Set<string>();
    produtos.forEach(p => {
      if (p.produto_referencia?.codigo) {
        codigos.add(p.produto_referencia.codigo);
      }
    });
    return Array.from(codigos).sort();
  }, [produtos]);

  // Get funcionarios with stock for zerar action
  const funcionariosComEstoque = useMemo(() => {
    const ids = new Set(estoqueData.map(item => item.funcionario_id));
    return funcionarios.filter(f => ids.has(f.id));
  }, [estoqueData, funcionarios]);

  // Toggle row expansion
  function toggleRow(codigo: string) {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(codigo)) {
        newSet.delete(codigo);
      } else {
        newSet.add(codigo);
      }
      return newSet;
    });
  }

  // Open ajustar modal with prefilled data
  function openAjustarModal(funcionarioId?: number, produtoCodigo?: string, quantidade?: number) {
    setAjustarForm({
      funcionario_id: funcionarioId || 0,
      produto_codigo: produtoCodigo || '',
      quantidade: quantidade || 0,
    });
    setShowAjustarModal(true);
  }

  function closeAjustarModal() {
    setShowAjustarModal(false);
  }

  // Handle ajustar estoque
  async function handleAjustar() {
    if (!selectedEmpresa || !ajustarForm.funcionario_id || !ajustarForm.produto_codigo) {
      addToast({ type: 'error', title: 'Preencha todos os campos' });
      return;
    }

    try {
      setIsSaving(true);
      await ajustarEstoque(
        ajustarForm.funcionario_id,
        selectedEmpresa.id,
        ajustarForm.produto_codigo,
        ajustarForm.quantidade
      );

      addToast({ type: 'success', title: 'Estoque ajustado com sucesso' });
      setShowAjustarModal(false);
      setAjustarForm({ funcionario_id: 0, produto_codigo: '', quantidade: 0 });
      await loadData();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      addToast({ type: 'error', title: 'Erro ao ajustar estoque' });
    } finally {
      setIsSaving(false);
    }
  }

  // Zerar modal handlers
  function openZerarModal(funcionarioId: number) {
    setZerarFuncionarioId(funcionarioId);
    setShowZerarModal(true);
  }

  function closeZerarModal() {
    setShowZerarModal(false);
    setZerarFuncionarioId(null);
  }

  // Handle zerar estoque (with payment registration)
  async function handleZerar() {
    if (!selectedEmpresa || !zerarFuncionarioId) return;

    try {
      setIsSaving(true);
      const { valorPago } = await zerarEstoqueComPagamento(zerarFuncionarioId, selectedEmpresa.id);

      if (valorPago > 0) {
        addToast({
          type: 'success',
          title: 'Estoque zerado e pagamento registrado!',
          message: `Valor: ${formatCurrency(valorPago)}`,
        });
      } else {
        addToast({ type: 'success', title: 'Estoque zerado (sem valor a pagar)' });
      }
      setShowZerarModal(false);
      setZerarFuncionarioId(null);
      await loadData();
    } catch (error) {
      console.error('Error zeroing stock:', error);
      addToast({ type: 'error', title: 'Erro ao zerar estoque' });
    } finally {
      setIsSaving(false);
    }
  }

  return {
    estoqueData,
    funcionarios,
    produtos,
    estoqueAgregado,
    estoqueFuncionario,
    filteredAgregado,
    filteredFuncionario,
    stats,
    produtoCodigos,
    funcionariosComEstoque,
    isLoading,
    isSaving,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    expandedRows,
    toggleRow,
    selectedFuncionarioFilter,
    setSelectedFuncionarioFilter,
    myFuncionarioId,
    showAjustarModal,
    ajustarForm,
    setAjustarForm,
    openAjustarModal,
    closeAjustarModal,
    handleAjustar,
    showZerarModal,
    zerarFuncionarioId,
    openZerarModal,
    closeZerarModal,
    handleZerar,
    loadData,
  };
}
