import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Search,
  Edit3,
  DollarSign,
  Warehouse,
  Tag,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
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
} from '../lib/types';
import {
  getProdutosEmpresa,
  getCategorias,
  updateProdutoPreco,
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

export function Produtos() {
  const { selectedEmpresa, addToast } = useApp();
  const [produtos, setProdutos] = useState<ProdutoEmpresa[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');

  // Edit Modal
  const [editingProduct, setEditingProduct] = useState<ProdutoEmpresa | null>(null);
  const [editPrecoVenda, setEditPrecoVenda] = useState('');
  const [editPrecoPagamento, setEditPrecoPagamento] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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

  // Filter and search
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
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-gold-500">Produtos</h1>
          <p className="text-parchment-400 mt-1">
            Catálogo e preços de {selectedEmpresa?.nome}
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <div className="flex items-center gap-3">
                <select
                  value={selectedCategoria}
                  onChange={(e) => setSelectedCategoria(e.target.value)}
                  className="select-western py-2 text-sm w-48"
                >
                  <option value="">Todas as Categorias</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-leather-500"
                  />
                  <input
                    type="text"
                    placeholder="Buscar produto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-western pl-9 py-2 text-sm w-64"
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
        <Card className="p-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-parchment-500">Legenda de Preços:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gold-500" />
              <span className="text-parchment-400">Preço de Venda (cliente)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-whiskey-600" />
              <span className="text-parchment-400">Pagamento ao Funcionário (25% padrão)</span>
            </div>
          </div>
        </Card>
      </motion.div>

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
    </motion.div>
  );
}
