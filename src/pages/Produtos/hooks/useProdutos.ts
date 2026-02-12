import { useEffect, useState, useMemo, useCallback } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import type { ProdutoEmpresa, ProdutoReferencia, TipoEmpresa } from '../../../lib/types';
import {
  getProdutosEmpresa,
  getCategorias,
  updateProdutoPreco,
  getAllProdutosReferencia,
  createProdutoReferencia,
  updateProdutoReferencia,
  deleteProdutoReferencia,
  getTiposEmpresa,
  createProdutoEmpresa,
  bulkUpdatePrecos,
} from '../../../lib/supabase';
import { emptyProdutoForm, type ProdutoRefForm, type ProdutoReferenciaWithTipo, type UseProdutosReturn } from '../types';

export function useProdutos(): UseProdutosReturn {
  const { selectedEmpresa, addToast } = useApp();
  const { isAdmin, isSuperadmin } = useAuth();

  // Main data
  const [produtos, setProdutos] = useState<ProdutoEmpresa[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');

  // Edit Price Modal
  const [editingProduct, setEditingProduct] = useState<ProdutoEmpresa | null>(null);
  const [editPrecoVenda, setEditPrecoVenda] = useState('');
  const [editPrecoPagamento, setEditPrecoPagamento] = useState('');

  // Admin CRUD
  const [produtosReferencia, setProdutosReferencia] = useState<ProdutoReferenciaWithTipo[]>([]);
  const [tiposEmpresa, setTiposEmpresa] = useState<TipoEmpresa[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditRefModal, setShowEditRefModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProdutoRef, setSelectedProdutoRef] = useState<ProdutoReferencia | null>(null);
  const [produtoForm, setProdutoForm] = useState<ProdutoRefForm>(emptyProdutoForm);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);

  // Load main data
  const loadData = useCallback(async () => {
    if (!selectedEmpresa) return;

    try {
      setIsLoading(true);
      const [produtosData, categoriasData] = await Promise.all([
        getProdutosEmpresa(selectedEmpresa.id),
        getCategorias(selectedEmpresa.id),
      ]);

      setProdutos(produtosData);
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Error loading produtos:', error);
      addToast({
        type: 'error',
        title: 'Erro ao carregar produtos',
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedEmpresa, addToast]);

  // Load admin data
  const loadAdminData = useCallback(async () => {
    if (!isSuperadmin) return;
    try {
      const baseRedmId = selectedEmpresa?.tipo_empresa?.base_redm_id;
      const [produtosRefData, tiposData] = await Promise.all([
        getAllProdutosReferencia(),
        getTiposEmpresa(baseRedmId),
      ]);
      setProdutosReferencia(produtosRefData);
      setTiposEmpresa(tiposData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  }, [isSuperadmin, selectedEmpresa]);

  // Load tipos for non-superadmin
  const loadAdminTiposEmpresa = useCallback(async () => {
    if (!isAdmin || isSuperadmin) return;
    try {
      const baseRedmId = selectedEmpresa?.tipo_empresa?.base_redm_id;
      const tiposData = await getTiposEmpresa(baseRedmId);
      setTiposEmpresa(tiposData);
    } catch (error) {
      console.error('Error loading tipos empresa for admin:', error);
    }
  }, [isAdmin, isSuperadmin, selectedEmpresa]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (isSuperadmin) {
      loadAdminData();
    }
  }, [isSuperadmin, loadAdminData]);

  useEffect(() => {
    if (isAdmin && !isSuperadmin) {
      loadAdminTiposEmpresa();
    }
  }, [isAdmin, isSuperadmin, loadAdminTiposEmpresa]);

  // Filtered products
  const filteredProdutos = useMemo(() => {
    let result = produtos;

    if (selectedCategoria) {
      result = result.filter(
        (p) => p.produto_referencia?.categoria === selectedCategoria
      );
    }

    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.produto_referencia?.nome
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          p.produto_referencia?.codigo
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [produtos, selectedCategoria, searchQuery]);

  // Stats
  const totalEstoque = produtos.reduce((sum, p) => sum + p.estoque_atual, 0);
  const valorTotalEstoque = produtos.reduce(
    (sum, p) => sum + p.estoque_atual * p.preco_venda,
    0
  );

  // Utility functions
  function slugify(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
  }

  // Edit Modal handlers
  function openEditModal(produto: ProdutoEmpresa) {
    setEditingProduct(produto);
    setEditPrecoVenda(produto.preco_venda.toString());
    setEditPrecoPagamento(produto.preco_pagamento_funcionario.toString());
  }

  function closeEditModal() {
    setEditingProduct(null);
  }

  async function handleSavePrice() {
    if (!editingProduct) return;

    const precoVenda = parseFloat(editPrecoVenda);
    const precoPagamento = parseFloat(editPrecoPagamento);

    if (isNaN(precoVenda) || isNaN(precoPagamento)) {
      addToast({
        type: 'error',
        title: 'Valores inválidos',
        message: 'Insira valores numéricos válidos.',
      });
      return;
    }

    try {
      setIsSaving(true);
      await updateProdutoPreco(editingProduct.id, precoVenda, precoPagamento);

      setProdutos((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? { ...p, preco_venda: precoVenda, preco_pagamento_funcionario: precoPagamento }
            : p
        )
      );

      addToast({
        type: 'success',
        title: 'Preço atualizado',
        message: `${editingProduct.produto_referencia?.nome} atualizado com sucesso.`,
      });

      setEditingProduct(null);
    } catch (error) {
      console.error('Error updating price:', error);
      addToast({
        type: 'error',
        title: 'Erro ao atualizar preço',
      });
    } finally {
      setIsSaving(false);
    }
  }

  // Admin modal handlers
  function openCreateModal() {
    const defaultTipoId = (!isSuperadmin && selectedEmpresa?.tipo_empresa_id)
      ? selectedEmpresa.tipo_empresa_id
      : (tiposEmpresa[0]?.id || 0);
    setProdutoForm({ ...emptyProdutoForm, tipo_empresa_id: defaultTipoId });
    setShowCreateModal(true);
    setAdminError(null);
  }

  function closeCreateModal() {
    setShowCreateModal(false);
  }

  function openEditRefModal(produto: ProdutoReferencia) {
    setSelectedProdutoRef(produto);
    setProdutoForm({
      tipo_empresa_id: produto.tipo_empresa_id,
      codigo: produto.codigo,
      nome: produto.nome,
      categoria: produto.categoria || '',
      preco_minimo: produto.preco_minimo,
      preco_maximo: produto.preco_maximo,
      unidade: produto.unidade || 'un',
      ativo: produto.ativo,
    });
    setShowEditRefModal(true);
    setAdminError(null);
  }

  function closeEditRefModal() {
    setShowEditRefModal(false);
  }

  function openDeleteModal(produto: ProdutoReferencia) {
    setSelectedProdutoRef(produto);
    setShowDeleteModal(true);
  }

  function closeDeleteModal() {
    setShowDeleteModal(false);
    setSelectedProdutoRef(null);
  }

  // Admin CRUD operations
  async function handleCreateProduto() {
    if (!produtoForm.nome.trim()) {
      setAdminError('Nome é obrigatório');
      return;
    }
    if (isSuperadmin && !produtoForm.codigo.trim()) {
      setAdminError('Código é obrigatório');
      return;
    }

    try {
      setIsSaving(true);
      setAdminError(null);

      const guildIdToUse = isSuperadmin ? undefined : (selectedEmpresa?.guild_id ?? undefined);
      const codigo = isSuperadmin ? produtoForm.codigo.trim() : slugify(produtoForm.nome.trim());

      const precoMinimo = typeof produtoForm.preco_minimo === 'string'
        ? parseFloat((produtoForm.preco_minimo as string).replace(',', '.'))
        : produtoForm.preco_minimo;
      const precoMaximo = typeof produtoForm.preco_maximo === 'string'
        ? parseFloat((produtoForm.preco_maximo as string).replace(',', '.'))
        : produtoForm.preco_maximo;

      const newProdRef = await createProdutoReferencia({
        tipo_empresa_id: produtoForm.tipo_empresa_id,
        codigo,
        nome: produtoForm.nome.trim(),
        categoria: produtoForm.categoria.trim() || null as unknown as string,
        preco_minimo: precoMinimo,
        preco_maximo: precoMaximo,
        unidade: isSuperadmin ? (produtoForm.unidade || 'un') : 'un',
        ativo: isSuperadmin ? produtoForm.ativo : true,
        guild_id: guildIdToUse,
      });

      if (!isSuperadmin && selectedEmpresa) {
        const precoVenda = precoMinimo;
        const precoPagamento = Math.round(precoVenda * 0.25 * 100) / 100;
        await createProdutoEmpresa(selectedEmpresa.id, newProdRef.id, precoVenda, precoPagamento);
      }

      setAdminSuccess('Produto criado com sucesso!');
      setShowCreateModal(false);
      if (isSuperadmin) loadAdminData();
      loadData();
      setTimeout(() => setAdminSuccess(null), 3000);
    } catch (err: unknown) {
      console.error('Error creating product:', err);
      const errorObj = err as { code?: string };
      if (errorObj.code === '23505') {
        setAdminError('Já existe um produto com este código');
      } else {
        setAdminError('Erro ao criar produto');
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdateRef() {
    if (!selectedProdutoRef) return;

    if (!produtoForm.codigo.trim() || !produtoForm.nome.trim()) {
      setAdminError('Código e nome são obrigatórios');
      return;
    }

    try {
      setIsSaving(true);
      setAdminError(null);
      await updateProdutoReferencia(selectedProdutoRef.id, {
        tipo_empresa_id: produtoForm.tipo_empresa_id,
        codigo: produtoForm.codigo.trim(),
        nome: produtoForm.nome.trim(),
        categoria: produtoForm.categoria.trim() || undefined,
        preco_minimo: produtoForm.preco_minimo,
        preco_maximo: produtoForm.preco_maximo,
        unidade: produtoForm.unidade || 'un',
        ativo: produtoForm.ativo,
      });

      setAdminSuccess('Produto atualizado com sucesso!');
      setShowEditRefModal(false);
      loadAdminData();
      loadData();
      setTimeout(() => setAdminSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating product:', err);
      setAdminError('Erro ao atualizar produto');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteProduto() {
    if (!selectedProdutoRef) return;

    try {
      setIsSaving(true);
      await deleteProdutoReferencia(selectedProdutoRef.id);

      setAdminSuccess('Produto excluído com sucesso!');
      setShowDeleteModal(false);
      setSelectedProdutoRef(null);
      loadAdminData();
      loadData();
      setTimeout(() => setAdminSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting product:', err);
      addToast({ type: 'error', title: 'Erro ao excluir', message: 'Verifique se não há produtos vinculados' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleBulkPrecos(mode: 'min' | 'medio' | 'max') {
    if (!selectedEmpresa) return;
    const labels = { min: 'Mínimo', medio: 'Médio', max: 'Máximo' };
    try {
      setIsSaving(true);
      const count = await bulkUpdatePrecos(selectedEmpresa.id, mode);
      addToast({
        type: 'success',
        title: `Preços configurados: ${labels[mode]}`,
        message: `${count} produtos atualizados com sucesso.`,
      });
      loadData();
    } catch (error) {
      console.error('Error bulk updating prices:', error);
      addToast({
        type: 'error',
        title: 'Erro ao configurar preços',
      });
    } finally {
      setIsSaving(false);
    }
  }

  return {
    produtos,
    categorias,
    produtosReferencia,
    tiposEmpresa,
    filteredProdutos,
    totalEstoque,
    valorTotalEstoque,
    isLoading,
    isSaving,
    searchQuery,
    setSearchQuery,
    selectedCategoria,
    setSelectedCategoria,
    editingProduct,
    editPrecoVenda,
    editPrecoPagamento,
    setEditPrecoVenda,
    setEditPrecoPagamento,
    openEditModal,
    closeEditModal,
    handleSavePrice,
    showCreateModal,
    showEditRefModal,
    showDeleteModal,
    selectedProdutoRef,
    produtoForm,
    adminError,
    adminSuccess,
    openCreateModal,
    closeCreateModal,
    openEditRefModal,
    closeEditRefModal,
    openDeleteModal,
    closeDeleteModal,
    setProdutoForm,
    setAdminError,
    handleCreateProduto,
    handleUpdateRef,
    handleDeleteProduto,
    handleBulkPrecos,
    slugify,
    loadData,
  };
}
