import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Search,
  Edit3,
  DollarSign,
  Warehouse,
  Tag,
  Check,
  Plus,
  Trash2,
  X,
  AlertTriangle,
  Settings,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  Button,
  Input,
  Modal,
  ModalFooter,
  Badge,
} from '../components/ui';
import {
  formatCurrency,
  type ProdutoEmpresa,
  type ProdutoReferencia,
  type TipoEmpresa,
} from '../lib/types';
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
} from '../lib/supabase';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Form para criar/editar produto de referência
interface ProdutoRefForm {
  tipo_empresa_id: number;
  codigo: string;
  nome: string;
  categoria: string;
  preco_minimo: number;
  preco_maximo: number;
  unidade: string;
  ativo: boolean;
}

const emptyProdutoForm: ProdutoRefForm = {
  tipo_empresa_id: 0,
  codigo: '',
  nome: '',
  categoria: '',
  preco_minimo: 0,
  preco_maximo: 0,
  unidade: 'un',
  ativo: true,
};

export function Produtos() {
  const { selectedEmpresa, addToast } = useApp();
  const { isAdmin, isSuperadmin } = useAuth();
  const [produtos, setProdutos] = useState<ProdutoEmpresa[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');

  // Edit Price Modal (existing)
  const [editingProduct, setEditingProduct] = useState<ProdutoEmpresa | null>(null);
  const [editPrecoVenda, setEditPrecoVenda] = useState('');
  const [editPrecoPagamento, setEditPrecoPagamento] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Admin CRUD - Produtos Referência
  const [produtosReferencia, setProdutosReferencia] = useState<(ProdutoReferencia & { tipo_empresa?: TipoEmpresa })[]>([]);
  const [tiposEmpresa, setTiposEmpresa] = useState<TipoEmpresa[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditRefModal, setShowEditRefModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProdutoRef, setSelectedProdutoRef] = useState<ProdutoReferencia | null>(null);
  const [produtoForm, setProdutoForm] = useState<ProdutoRefForm>(emptyProdutoForm);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedEmpresa]);

  async function loadData() {
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
  }

  function openEditModal(produto: ProdutoEmpresa) {
    setEditingProduct(produto);
    setEditPrecoVenda(produto.preco_venda.toString());
    setEditPrecoPagamento(produto.preco_pagamento_funcionario.toString());
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

      // Update local state
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

  // ============ ADMIN CRUD FUNCTIONS ============

  async function loadAdminData() {
    if (!isSuperadmin) return;
    try {
      // Filter by current base/server context if available
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
  }

  useEffect(() => {
    if (isSuperadmin) {
      loadAdminData();
    }
  }, [isSuperadmin, selectedEmpresa]);

  async function loadAdminTiposEmpresa() {
    if (!isAdmin || isSuperadmin) return; // superadmin uses loadAdminData
    try {
      const baseRedmId = selectedEmpresa?.tipo_empresa?.base_redm_id;
      const tiposData = await getTiposEmpresa(baseRedmId);
      setTiposEmpresa(tiposData);
    } catch (error) {
      console.error('Error loading tipos empresa for admin:', error);
    }
  }

  useEffect(() => {
    if (isAdmin && !isSuperadmin) {
      loadAdminTiposEmpresa();
    }
  }, [isAdmin, isSuperadmin, selectedEmpresa]);

  function openCreateModal() {
    const defaultTipoId = (!isSuperadmin && selectedEmpresa?.tipo_empresa_id)
      ? selectedEmpresa.tipo_empresa_id
      : (tiposEmpresa[0]?.id || 0);
    setProdutoForm({ ...emptyProdutoForm, tipo_empresa_id: defaultTipoId });
    setShowCreateModal(true);
    setAdminError(null);
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

  function openDeleteModal(produto: ProdutoReferencia) {
    setSelectedProdutoRef(produto);
    setShowDeleteModal(true);
  }

  function slugify(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
  }

  async function handleCreateProduto() {
    if (!produtoForm.nome.trim()) {
      setAdminError('Nome é obrigatório');
      return;
    }
    // Superadmin requires codigo; for regular admin it's auto-generated
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

      // Non-superadmin: auto-create produtos_empresa entry
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

  // Quick Price Buttons
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
  }  // Filter and search
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

  const columns = [
    {
      key: 'codigo',
      header: 'Código',
      sortable: true,
      render: (p: ProdutoEmpresa) => (
        <span className="font-mono text-sm text-gold-500">
          {p.produto_referencia?.codigo}
        </span>
      ),
    },
    {
      key: 'nome',
      header: 'Produto',
      sortable: true,
      render: (p: ProdutoEmpresa) => (
        <div>
          <p className="font-heading text-parchment-100">
            {p.produto_referencia?.nome}
          </p>
          <p className="text-xs text-parchment-500">
            {p.produto_referencia?.categoria}
          </p>
        </div>
      ),
    },
    {
      key: 'preco_venda',
      header: 'Preço Venda',
      sortable: true,
      render: (p: ProdutoEmpresa) => (
        <span className="font-heading text-gold-500">
          {formatCurrency(p.preco_venda)}
        </span>
      ),
    },
    {
      key: 'preco_pagamento_funcionario',
      header: 'Pgto. Funcionário',
      sortable: true,
      render: (p: ProdutoEmpresa) => (
        <span className="text-parchment-300">
          {formatCurrency(p.preco_pagamento_funcionario)}
        </span>
      ),
    },
    {
      key: 'estoque_atual',
      header: 'Estoque',
      sortable: true,
      render: (p: ProdutoEmpresa) => (
        <Badge variant={p.estoque_atual > 0 ? 'gold' : 'danger'}>
          {p.estoque_atual} {p.produto_referencia?.unidade || 'un.'}
        </Badge>
      ),
    },
    {
      key: 'margem',
      header: 'Margem',
      render: (p: ProdutoEmpresa) => {
        const margem = p.preco_venda - p.preco_pagamento_funcionario;
        const percentual = ((margem / p.preco_venda) * 100).toFixed(0);
        return (
          <span className="text-sm text-parchment-400">
            {formatCurrency(margem)} ({percentual}%)
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      width: '80px',
      render: (p: ProdutoEmpresa) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openEditModal(p)}
          leftIcon={<Edit3 size={14} />}
        >
          Editar
        </Button>
      ),
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-gold-500">Produtos</h1>
          <p className="text-parchment-400 mt-1 text-sm sm:text-base">
            Catálogo e preços de {selectedEmpresa?.nome}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openCreateModal} leftIcon={<Plus size={16} />} className="w-full sm:w-auto">
            Novo Produto
          </Button>
        )}
      </motion.div>

      {/* Quick Price Buttons */}
      {isAdmin && (
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-xs sm:text-sm text-parchment-500 flex items-center gap-1">
            <Settings size={14} />
            Config. Rápida de Preços:
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleBulkPrecos('min')}
              isLoading={isSaving}
              className="flex-1 sm:flex-none"
            >
              Config. Mínimo
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleBulkPrecos('medio')}
              isLoading={isSaving}
              className="flex-1 sm:flex-none"
            >
              Config. Médio
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleBulkPrecos('max')}
              isLoading={isSaving}
              className="flex-1 sm:flex-none"
            >
              Config. Máximo
            </Button>
          </div>
        </motion.div>
      )}

      {/* Admin Alerts */}
      <AnimatePresence>
        {adminError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-rust-900/30 border border-rust-700 rounded-western text-rust-400 flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5" />
            {adminError}
            <button onClick={() => setAdminError(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {adminSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-green-900/30 border border-green-700 rounded-western text-green-400 flex items-center gap-3"
          >
            <Check className="w-5 h-5" />
            {adminSuccess}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-western bg-leather-800/50">
              <Package className="w-6 h-6 text-gold-500" />
            </div>
            <div>
              <p className="text-2xl font-display text-gold-500">
                {produtos.length}
              </p>
              <p className="text-xs text-parchment-500 uppercase tracking-wider">
                Produtos Ativos
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-western bg-leather-800/50">
              <Tag className="w-6 h-6 text-gold-500" />
            </div>
            <div>
              <p className="text-2xl font-display text-gold-500">
                {categorias.length}
              </p>
              <p className="text-xs text-parchment-500 uppercase tracking-wider">
                Categorias
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-western bg-leather-800/50">
              <Warehouse className="w-6 h-6 text-gold-500" />
            </div>
            <div>
              <p className="text-2xl font-display text-gold-500">
                {totalEstoque.toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-parchment-500 uppercase tracking-wider">
                Itens em Estoque
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-western bg-leather-800/50">
              <DollarSign className="w-6 h-6 text-gold-500" />
            </div>
            <div>
              <p className="text-2xl font-display text-gold-500">
                {formatCurrency(valorTotalEstoque)}
              </p>
              <p className="text-xs text-parchment-500 uppercase tracking-wider">
                Valor Total
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Main Content */}
      <motion.div variants={item}>
        <Card>
          <CardHeader
            action={
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <select
                  value={selectedCategoria}
                  onChange={(e) => setSelectedCategoria(e.target.value)}
                  className="select-western py-2 text-sm w-full sm:w-48"
                >
                  <option value="">Todas as Categorias</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <div className="relative flex-1 sm:flex-none">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-leather-500"
                  />
                  <input
                    type="text"
                    placeholder="Buscar produto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-western pl-9 py-2 text-sm w-full sm:w-64"
                  />
                </div>
              </div>
            }
          >
            <h2 className="font-heading text-lg text-parchment-100">
              Catálogo de Produtos
            </h2>
          </CardHeader>

          <CardContent className="p-0">
            <Table
              data={filteredProdutos}
              columns={columns}
              keyExtractor={(p) => p.id}
              isLoading={isLoading}
              emptyMessage="Nenhum produto encontrado"
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Pricing Reference */}
      <motion.div variants={item}>
        <Card className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <span className="text-parchment-500">Legenda de Preços:</span>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gold-500 flex-shrink-0" />
                <span className="text-parchment-400">Preço de Venda (cliente)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-whiskey-600 flex-shrink-0" />
                <span className="text-parchment-400">Pagamento ao Funcionário (25% padrão)</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Admin Section - Produtos de Referência */}
      {isSuperadmin && produtosReferencia.length > 0 && (
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-gold-500" />
                  <h2 className="font-heading text-lg text-parchment-100">
                    Produtos de Referência (Admin)
                  </h2>
                  <Badge variant="gold">{produtosReferencia.length}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-72">
                <table className="w-full">
                  <thead className="sticky top-0 bg-leather-900">
                    <tr className="border-b border-leather-700/50">
                      <th className="text-left px-4 py-2 text-xs text-parchment-500 uppercase">Tipo</th>
                      <th className="text-left px-4 py-2 text-xs text-parchment-500 uppercase">Código</th>
                      <th className="text-left px-4 py-2 text-xs text-parchment-500 uppercase">Nome</th>
                      <th className="text-left px-4 py-2 text-xs text-parchment-500 uppercase">Categoria</th>
                      <th className="text-left px-4 py-2 text-xs text-parchment-500 uppercase">Preço Mín/Máx</th>
                      <th className="text-left px-4 py-2 text-xs text-parchment-500 uppercase">Status</th>
                      <th className="text-right px-4 py-2 text-xs text-parchment-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtosReferencia.map((pr) => (
                      <tr key={pr.id} className="border-b border-leather-800/50 hover:bg-leather-800/30">
                        <td className="px-4 py-2">
                          <span className="text-lg" title={pr.tipo_empresa?.nome}>{pr.tipo_empresa?.icone || '📦'}</span>
                        </td>
                        <td className="px-4 py-2">
                          <span className="font-mono text-xs text-gold-500">{pr.codigo}</span>
                        </td>
                        <td className="px-4 py-2 text-parchment-200 text-sm">{pr.nome}</td>
                        <td className="px-4 py-2 text-parchment-400 text-sm">{pr.categoria || '-'}</td>
                        <td className="px-4 py-2 text-parchment-300 text-sm">
                          {formatCurrency(pr.preco_minimo)} - {formatCurrency(pr.preco_maximo)}
                        </td>
                        <td className="px-4 py-2">
                          <Badge variant={pr.ativo ? 'gold' : 'danger'} className="text-xs">
                            {pr.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditRefModal(pr)}
                              className="p-1.5 text-parchment-400 hover:text-gold-400 transition-colors"
                              title="Editar"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(pr)}
                              className="p-1.5 text-parchment-400 hover:text-rust-400 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Edit Price Modal */}
      <Modal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        title="Editar Preços"
        size="md"
      >
        {editingProduct && (
          <div className="space-y-6">
            {/* Product Info */}
            <div className="p-4 bg-leather-800/30 rounded-western">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-western bg-leather-700/50">
                  <Package className="w-6 h-6 text-gold-500" />
                </div>
                <div>
                  <p className="font-heading text-lg text-parchment-100">
                    {editingProduct.produto_referencia?.nome}
                  </p>
                  <p className="text-sm text-parchment-500">
                    Código: {editingProduct.produto_referencia?.codigo} •{' '}
                    {editingProduct.produto_referencia?.categoria}
                  </p>
                </div>
              </div>
            </div>

            {/* Reference Prices */}
            <div className="p-4 bg-leather-800/20 rounded-western border border-leather-700/30">
              <p className="text-xs text-parchment-500 uppercase tracking-wider mb-2">
                Preços de Referência (Downtown)
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-parchment-400">Mínimo:</span>
                <span className="font-heading text-parchment-300">
                  {formatCurrency(editingProduct.produto_referencia?.preco_minimo || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-parchment-400">Máximo:</span>
                <span className="font-heading text-parchment-300">
                  {formatCurrency(editingProduct.produto_referencia?.preco_maximo || 0)}
                </span>
              </div>
            </div>

            {/* Price Inputs */}
            <div className="space-y-4">
              <Input
                label="Preço de Venda (R$)"
                type="number"
                step="0.01"
                min="0"
                value={editPrecoVenda}
                onChange={(e) => setEditPrecoVenda(e.target.value)}
                hint="Preço cobrado do cliente"
              />

              <Input
                label="Pagamento ao Funcionário (R$)"
                type="number"
                step="0.01"
                min="0"
                value={editPrecoPagamento}
                onChange={(e) => setEditPrecoPagamento(e.target.value)}
                hint="Valor pago ao funcionário por unidade produzida"
              />

              {/* Margin Preview */}
              {editPrecoVenda && editPrecoPagamento && (
                <div className="p-3 bg-gold-900/20 rounded-western border border-gold-600/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-parchment-400">Margem:</span>
                    <span className="font-heading text-gold-400">
                      {formatCurrency(
                        parseFloat(editPrecoVenda) - parseFloat(editPrecoPagamento)
                      )}{' '}
                      (
                      {(
                        ((parseFloat(editPrecoVenda) - parseFloat(editPrecoPagamento)) /
                          parseFloat(editPrecoVenda)) *
                        100
                      ).toFixed(0)}
                      %)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <ModalFooter>
              <Button variant="secondary" onClick={() => setEditingProduct(null)}>
                Cancelar
              </Button>
              <Button
                variant="gold"
                onClick={handleSavePrice}
                isLoading={isSaving}
                leftIcon={<Check size={16} />}
              >
                Salvar
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>

      {/* Admin Create Product Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={isSuperadmin ? "Novo Produto de Referência" : "Novo Produto"} size={isSuperadmin ? "lg" : "md"}>
        <div className="space-y-4">
          {isSuperadmin ? (
            <>
              {/* Full form for superadmin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-parchment-400 mb-1">Tipo de Empresa *</label>
                  <select
                    value={produtoForm.tipo_empresa_id}
                    onChange={(e) => setProdutoForm({ ...produtoForm, tipo_empresa_id: Number(e.target.value) })}
                    className="input-western w-full"
                  >
                    {tiposEmpresa.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.icone} {tipo.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-parchment-400 mb-1">Código *</label>
                  <Input
                    value={produtoForm.codigo}
                    onChange={(e) => setProdutoForm({ ...produtoForm, codigo: e.target.value })}
                    placeholder="Ex: CARNE_BOVINA"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-parchment-400 mb-1">Nome *</label>
                  <Input
                    value={produtoForm.nome}
                    onChange={(e) => setProdutoForm({ ...produtoForm, nome: e.target.value })}
                    placeholder="Ex: Carne Bovina"
                  />
                </div>
                <div>
                  <label className="block text-sm text-parchment-400 mb-1">Categoria</label>
                  <Input
                    value={produtoForm.categoria}
                    onChange={(e) => setProdutoForm({ ...produtoForm, categoria: e.target.value })}
                    placeholder="Ex: Carnes"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-parchment-400 mb-1">Preço Mínimo *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={produtoForm.preco_minimo}
                    onChange={(e) => setProdutoForm({ ...produtoForm, preco_minimo: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-parchment-400 mb-1">Preço Máximo *</label>
                  <Input
                    type="text"
                    placeholder="0,00"
                    value={produtoForm.preco_maximo}
                    onChange={(e) => setProdutoForm({ ...produtoForm, preco_maximo: e.target.value as unknown as number })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-parchment-400 mb-1">Unidade</label>
                  <Input
                    value={produtoForm.unidade}
                    onChange={(e) => setProdutoForm({ ...produtoForm, unidade: e.target.value })}
                    placeholder="un"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativo-create"
                  checked={produtoForm.ativo}
                  onChange={(e) => setProdutoForm({ ...produtoForm, ativo: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="ativo-create" className="text-sm text-parchment-400">
                  Produto ativo
                </label>
              </div>
            </>
          ) : (
            <>
              {/* Simplified form for regular admin */}
              <div>
                <label className="block text-sm text-parchment-400 mb-1">Nome do Produto *</label>
                <Input
                  value={produtoForm.nome}
                  onChange={(e) => setProdutoForm({ ...produtoForm, nome: e.target.value })}
                  placeholder="Ex: Carne Bovina"
                />
                <p className="text-xs text-parchment-600 mt-1">
                  Código gerado automaticamente: {produtoForm.nome.trim() ? slugify(produtoForm.nome.trim()) : '—'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-parchment-400 mb-1">Preço Mínimo *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={produtoForm.preco_minimo}
                    onChange={(e) => setProdutoForm({ ...produtoForm, preco_minimo: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-parchment-400 mb-1">Preço Máximo *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={produtoForm.preco_maximo}
                    onChange={(e) => setProdutoForm({ ...produtoForm, preco_maximo: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-parchment-400 mb-1">Categoria</label>
                <Input
                  value={produtoForm.categoria}
                  onChange={(e) => setProdutoForm({ ...produtoForm, categoria: e.target.value })}
                  placeholder="Ex: Carnes (opcional)"
                />
              </div>

              <div className="p-3 bg-leather-800/20 rounded-western border border-leather-700/30 text-xs text-parchment-500">
                O produto será adicionado ao catálogo com preço de venda = preço mínimo e pagamento = 25%.
              </div>
            </>
          )}

          {adminError && (
            <div className="p-3 bg-rust-900/30 border border-rust-700 rounded-western text-rust-400 text-sm">
              {adminError}
            </div>
          )}

          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateProduto} isLoading={isSaving} leftIcon={<Plus size={16} />}>
              Criar Produto
            </Button>
          </ModalFooter>
        </div>
      </Modal>

      {/* Admin Edit Product Modal */}
      <Modal isOpen={showEditRefModal} onClose={() => setShowEditRefModal(false)} title="Editar Produto de Referência" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-parchment-400 mb-1">Tipo de Empresa *</label>
              <select
                value={produtoForm.tipo_empresa_id}
                onChange={(e) => setProdutoForm({ ...produtoForm, tipo_empresa_id: Number(e.target.value) })}
                className="input-western w-full"
              >
                {tiposEmpresa.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.icone} {tipo.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-parchment-400 mb-1">Código *</label>
              <Input
                value={produtoForm.codigo}
                onChange={(e) => setProdutoForm({ ...produtoForm, codigo: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-parchment-400 mb-1">Nome *</label>
              <Input
                value={produtoForm.nome}
                onChange={(e) => setProdutoForm({ ...produtoForm, nome: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-parchment-400 mb-1">Categoria</label>
              <Input
                value={produtoForm.categoria}
                onChange={(e) => setProdutoForm({ ...produtoForm, categoria: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-parchment-400 mb-1">Preço Mínimo *</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={produtoForm.preco_minimo}
                onChange={(e) => setProdutoForm({ ...produtoForm, preco_minimo: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm text-parchment-400 mb-1">Preço Máximo *</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={produtoForm.preco_maximo}
                onChange={(e) => setProdutoForm({ ...produtoForm, preco_maximo: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm text-parchment-400 mb-1">Unidade</label>
              <Input
                value={produtoForm.unidade}
                onChange={(e) => setProdutoForm({ ...produtoForm, unidade: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ativo-edit"
              checked={produtoForm.ativo}
              onChange={(e) => setProdutoForm({ ...produtoForm, ativo: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="ativo-edit" className="text-sm text-parchment-400">
              Produto ativo
            </label>
          </div>

          {adminError && (
            <div className="p-3 bg-rust-900/30 border border-rust-700 rounded-western text-rust-400 text-sm">
              {adminError}
            </div>
          )}

          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowEditRefModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateRef} isLoading={isSaving} leftIcon={<Check size={16} />}>
              Salvar Alterações
            </Button>
          </ModalFooter>
        </div>
      </Modal>

      {/* Admin Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-rust-900/30 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-rust-500" />
          </div>

          <h2 className="font-heading text-xl text-parchment-100 mb-2">
            Excluir Produto?
          </h2>

          <p className="text-parchment-400 mb-6">
            Tem certeza que deseja excluir o produto{' '}
            <span className="text-gold-500 font-mono">{selectedProdutoRef?.nome}</span>?
            <br />
            Esta ação não pode ser desfeita.
          </p>

          <div className="flex justify-center gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteProduto}
              isLoading={isSaving}
              className="bg-rust-600 hover:bg-rust-700"
              leftIcon={<Trash2 size={16} />}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
