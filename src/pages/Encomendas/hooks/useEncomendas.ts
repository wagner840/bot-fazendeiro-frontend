import { useEffect, useState, useMemo, useCallback } from 'react';
import { useApp } from '../../../context/AppContext';
import type { Encomenda, EncomendaStatus, ProdutoEmpresa } from '../../../lib/types';
import { STATUS_LABELS } from '../../../lib/types';
import {
  getEncomendas,
  updateEncomendaStatus,
  createEncomenda,
  updateEncomenda,
  deleteEncomenda,
  getProdutosEmpresa,
} from '../../../lib/supabase';
import { emptyEncomendaForm, type EncomendaForm, type UseEncomendasReturn } from '../types';

export function useEncomendas(): UseEncomendasReturn {
  const { selectedEmpresa, addToast } = useApp();

  // Main data
  const [encomendas, setEncomendas] = useState<Encomenda[]>([]);
  const [produtos, setProdutos] = useState<ProdutoEmpresa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EncomendaStatus | ''>('');

  // Details Modal
  const [selectedEncomenda, setSelectedEncomenda] = useState<Encomenda | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Admin CRUD
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [encomendaForm, setEncomendaForm] = useState<EncomendaForm>(emptyEncomendaForm);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);

  // Load data
  const loadEncomendas = useCallback(async () => {
    if (!selectedEmpresa) return;

    try {
      setIsLoading(true);
      const [encData, prodData] = await Promise.all([
        getEncomendas(selectedEmpresa.id),
        getProdutosEmpresa(selectedEmpresa.id),
      ]);
      setEncomendas(encData);
      setProdutos(prodData);
    } catch (error) {
      console.error('Error loading encomendas:', error);
      addToast({
        type: 'error',
        title: 'Erro ao carregar encomendas',
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedEmpresa, addToast]);

  useEffect(() => {
    loadEncomendas();
  }, [loadEncomendas]);

  // Status update
  async function handleUpdateStatus(id: number, newStatus: EncomendaStatus) {
    try {
      const dataEntrega = newStatus === 'entregue' ? new Date().toISOString() : undefined;
      await updateEncomendaStatus(id, newStatus, dataEntrega);

      setEncomendas((prev) =>
        prev.map((e) =>
          e.id === id
            ? { ...e, status: newStatus, data_entrega: dataEntrega || e.data_entrega }
            : e
        )
      );

      addToast({
        type: 'success',
        title: 'Status atualizado',
        message: `Encomenda #${id} agora está ${STATUS_LABELS[newStatus].toLowerCase()}.`,
      });

      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error updating status:', error);
      addToast({
        type: 'error',
        title: 'Erro ao atualizar status',
      });
    }
  }

  // Filtered data
  const filteredEncomendas = useMemo(() => {
    let result = encomendas;

    if (statusFilter) {
      result = result.filter((e) => e.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.comprador.toLowerCase().includes(query) ||
          e.id.toString().includes(query)
      );
    }

    return result;
  }, [encomendas, statusFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const pendentes = encomendas.filter((e) => e.status === 'pendente').length;
    const emAndamento = encomendas.filter((e) => e.status === 'em_andamento').length;
    const entregues = encomendas.filter((e) => e.status === 'entregue').length;
    const valorTotal = encomendas
      .filter((e) => e.status === 'entregue')
      .reduce((sum, e) => sum + e.valor_total, 0);

    return { pendentes, emAndamento, entregues, valorTotal };
  }, [encomendas]);

  // Modal handlers
  function openDetailsModal(encomenda: Encomenda) {
    setSelectedEncomenda(encomenda);
    setShowDetailsModal(true);
  }

  function closeDetailsModal() {
    setShowDetailsModal(false);
  }

  function openCreateModal() {
    setEncomendaForm(emptyEncomendaForm);
    setShowCreateModal(true);
    setAdminError(null);
  }

  function closeCreateModal() {
    setShowCreateModal(false);
  }

  function openEditModal(encomenda: Encomenda) {
    setSelectedEncomenda(encomenda);
    setEncomendaForm({
      comprador: encomenda.comprador,
      valor_total: encomenda.valor_total,
      status: encomenda.status,
      itens: (encomenda.itens_json || []).map((item) => ({
        codigo: item.codigo,
        nome: item.nome,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
      })),
    });
    setShowEditModal(true);
    setAdminError(null);
  }

  function closeEditModal() {
    setShowEditModal(false);
  }

  function openDeleteModal(encomenda: Encomenda) {
    setSelectedEncomenda(encomenda);
    setShowDeleteModal(true);
  }

  function closeDeleteModal() {
    setShowDeleteModal(false);
    setSelectedEncomenda(null);
  }

  // CRUD operations
  async function handleCreateEncomenda() {
    if (!encomendaForm.comprador.trim()) {
      setAdminError('Nome do comprador é obrigatório');
      return;
    }

    if (encomendaForm.itens.length === 0) {
      setAdminError('Adicione pelo menos um produto');
      return;
    }

    if (!selectedEmpresa) return;

    try {
      setIsSaving(true);
      setAdminError(null);

      const itensJson = encomendaForm.itens.map((item) => ({
        codigo: item.codigo,
        nome: item.nome,
        quantidade: item.quantidade,
        quantidade_entregue: 0,
        valor_unitario: item.valor_unitario,
      }));

      const valorTotal = itensJson.reduce(
        (sum, item) => sum + item.quantidade * item.valor_unitario,
        0
      );

      await createEncomenda({
        empresa_id: selectedEmpresa.id,
        comprador: encomendaForm.comprador.trim(),
        valor_total: valorTotal,
        status: encomendaForm.status,
        itens_json: itensJson,
      });

      setAdminSuccess('Encomenda criada com sucesso!');
      setShowCreateModal(false);
      loadEncomendas();
      setTimeout(() => setAdminSuccess(null), 3000);
    } catch (err) {
      console.error('Error creating encomenda:', err);
      setAdminError('Erro ao criar encomenda');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdateEncomenda() {
    if (!selectedEncomenda) return;

    if (!encomendaForm.comprador.trim()) {
      setAdminError('Nome do comprador é obrigatório');
      return;
    }

    try {
      setIsSaving(true);
      setAdminError(null);

      const itensJson = encomendaForm.itens.map((item) => ({
        codigo: item.codigo,
        nome: item.nome,
        quantidade: item.quantidade,
        quantidade_entregue: 0,
        valor_unitario: item.valor_unitario,
      }));

      const valorTotal = itensJson.length > 0
        ? itensJson.reduce((sum, item) => sum + item.quantidade * item.valor_unitario, 0)
        : encomendaForm.valor_total;

      const updateData: Partial<Encomenda> = {
        comprador: encomendaForm.comprador.trim(),
        valor_total: valorTotal,
        status: encomendaForm.status,
        itens_json: itensJson,
      };

      if (encomendaForm.status === 'entregue' && selectedEncomenda.status !== 'entregue') {
        updateData.data_entrega = new Date().toISOString();
      }

      await updateEncomenda(selectedEncomenda.id, updateData);

      setAdminSuccess('Encomenda atualizada com sucesso!');
      setShowEditModal(false);
      loadEncomendas();
      setTimeout(() => setAdminSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating encomenda:', err);
      setAdminError('Erro ao atualizar encomenda');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteEncomenda() {
    if (!selectedEncomenda) return;

    try {
      setIsSaving(true);
      await deleteEncomenda(selectedEncomenda.id);

      setAdminSuccess('Encomenda excluída com sucesso!');
      setShowDeleteModal(false);
      setSelectedEncomenda(null);
      loadEncomendas();
      setTimeout(() => setAdminSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting encomenda:', err);
      addToast({ type: 'error', title: 'Erro ao excluir encomenda' });
    } finally {
      setIsSaving(false);
    }
  }

  return {
    encomendas,
    filteredEncomendas,
    produtos,
    stats,
    isLoading,
    isSaving,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    selectedEncomenda,
    showDetailsModal,
    openDetailsModal,
    closeDetailsModal,
    handleUpdateStatus,
    showCreateModal,
    showEditModal,
    showDeleteModal,
    encomendaForm,
    adminError,
    adminSuccess,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    setEncomendaForm,
    setAdminError,
    handleCreateEncomenda,
    handleUpdateEncomenda,
    handleDeleteEncomenda,
    loadEncomendas,
  };
}
