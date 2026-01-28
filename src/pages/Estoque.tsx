import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Warehouse,
  Search,
  Package,
  Users,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Edit3,
  Trash2,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  Button,
  Modal,
  ModalFooter,
  Badge,
} from '../components/ui';
import {
  formatCurrency,
  type Funcionario,
  type ProdutoEmpresa,
} from '../lib/types';
import {
  getFuncionarios,
  getProdutosEmpresa,
  getEstoqueGlobal,
  ajustarEstoque,
  zerarEstoqueComPagamento,
  type EstoqueGlobalItem,
} from '../lib/supabase';
import { filterBySearch } from '../lib/utils';

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

interface EstoqueAgregado {
  produto_codigo: string;
  quantidade_total: number;
  valor_unitario: number;
  valor_total: number;
  funcionarios: {
    funcionario_id: number;
    funcionario_nome: string;
    quantidade: number;
    valor: number;
  }[];
}

export function Estoque() {
  const { selectedEmpresa, addToast } = useApp();
  const { isAdmin, userFrontend } = useAuth();

  const [estoqueData, setEstoqueData] = useState<EstoqueGlobalItem[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [produtos, setProdutos] = useState<ProdutoEmpresa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'global' | 'funcionario'>('global');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedFuncionarioFilter, setSelectedFuncionarioFilter] = useState<number | null>(null);

  // Modal states
  const [showAjustarModal, setShowAjustarModal] = useState(false);
  const [showZerarModal, setShowZerarModal] = useState(false);
  const [ajustarForm, setAjustarForm] = useState({
    funcionario_id: 0,
    produto_codigo: '',
    quantidade: 0,
  });
  const [zerarFuncionarioId, setZerarFuncionarioId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // For funcionario view - get their funcionario_id
  const [myFuncionarioId, setMyFuncionarioId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedEmpresa]);

  useEffect(() => {
    // For non-admin users, find their funcionario_id
    if (!isAdmin && userFrontend && funcionarios.length > 0) {
      const myFunc = funcionarios.find(f => f.discord_id === userFrontend.discord_id);
      if (myFunc) {
        setMyFuncionarioId(myFunc.id);
        setActiveTab('funcionario');
      }
    }
  }, [isAdmin, userFrontend, funcionarios]);

  async function loadData() {
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
  }

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

    // For non-admins, only show their own stock
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

  // Open ajustar modal with prefilled data
  function openAjustarModal(funcionarioId?: number, produtoCodigo?: string, quantidade?: number) {
    setAjustarForm({
      funcionario_id: funcionarioId || 0,
      produto_codigo: produtoCodigo || '',
      quantidade: quantidade || 0,
    });
    setShowAjustarModal(true);
  }

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

  // Columns for funcionario view
  const funcionarioColumns = [
    {
      key: 'funcionario_nome',
      header: 'Funcionario',
      sortable: true,
      render: (row: EstoqueGlobalItem) => (
        <span className="font-heading text-parchment-100">{row.funcionario_nome}</span>
      ),
    },
    {
      key: 'produto_codigo',
      header: 'Produto',
      sortable: true,
      render: (row: EstoqueGlobalItem) => (
        <span className="text-parchment-300">{row.produto_codigo}</span>
      ),
    },
    {
      key: 'quantidade',
      header: 'Quantidade',
      sortable: true,
      render: (row: EstoqueGlobalItem) => (
        <Badge variant="gold">{row.quantidade} un.</Badge>
      ),
    },
    {
      key: 'valor',
      header: 'Valor',
      render: (row: EstoqueGlobalItem) => (
        <span className="font-heading text-gold-500">
          {formatCurrency(row.quantidade * row.preco_pagamento_funcionario)}
        </span>
      ),
    },
    ...(isAdmin
      ? [
          {
            key: 'actions',
            header: '',
            width: '120px',
            render: (row: EstoqueGlobalItem) => (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openAjustarModal(row.funcionario_id, row.produto_codigo, row.quantidade)}
                  leftIcon={<Edit3 size={14} />}
                >
                  Ajustar
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  // Get funcionarios with stock for zerar action
  const funcionariosComEstoque = useMemo(() => {
    const ids = new Set(estoqueData.map(item => item.funcionario_id));
    return funcionarios.filter(f => ids.has(f.id));
  }, [estoqueData, funcionarios]);

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
          <h1 className="font-display text-2xl sm:text-3xl text-gold-500">Estoque</h1>
          <p className="text-parchment-400 mt-1 text-sm sm:text-base">
            {isAdmin
              ? `Gerencie o estoque de ${selectedEmpresa?.nome}`
              : 'Visualize seu estoque'}
          </p>
        </div>
        {isAdmin && (
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => openAjustarModal()}
            className="w-full sm:w-auto"
          >
            Ajustar Estoque
          </Button>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-western bg-leather-800/50">
              <Package className="w-6 h-6 text-gold-500" />
            </div>
            <div>
              <p className="text-2xl font-display text-gold-500">{stats.totalItens}</p>
              <p className="text-xs text-parchment-500 uppercase tracking-wider">
                Total de Itens
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
                {formatCurrency(stats.valorTotal)}
              </p>
              <p className="text-xs text-parchment-500 uppercase tracking-wider">
                Valor Total
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
                {stats.produtosDistintos}
              </p>
              <p className="text-xs text-parchment-500 uppercase tracking-wider">
                Produtos Distintos
              </p>
            </div>
          </div>
        </Card>

        {isAdmin && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-western bg-leather-800/50">
                <Users className="w-6 h-6 text-gold-500" />
              </div>
              <div>
                <p className="text-2xl font-display text-gold-500">
                  {stats.funcionariosComEstoque}
                </p>
                <p className="text-xs text-parchment-500 uppercase tracking-wider">
                  Funcionarios c/ Estoque
                </p>
              </div>
            </div>
          </Card>
        )}
      </motion.div>

      {/* Main Content */}
      <motion.div variants={item}>
        <Card>
          <CardHeader
            action={
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {isAdmin && activeTab === 'funcionario' && (
                  <select
                    value={selectedFuncionarioFilter || ''}
                    onChange={(e) =>
                      setSelectedFuncionarioFilter(e.target.value ? Number(e.target.value) : null)
                    }
                    className="input-western py-2 text-sm w-full sm:w-auto"
                  >
                    <option value="">Todos os funcionarios</option>
                    {funcionarios.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nome}
                      </option>
                    ))}
                  </select>
                )}
                <div className="relative flex-1 sm:flex-none">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-leather-500"
                  />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-western pl-9 py-2 text-sm w-full sm:w-64"
                  />
                </div>
              </div>
            }
          >
            {isAdmin ? (
              <div className="tabs-western">
                <button
                  className={`tab-western ${activeTab === 'global' ? 'active' : ''}`}
                  onClick={() => setActiveTab('global')}
                >
                  <Warehouse size={14} className="inline mr-2" />
                  Estoque Global
                </button>
                <button
                  className={`tab-western ${activeTab === 'funcionario' ? 'active' : ''}`}
                  onClick={() => setActiveTab('funcionario')}
                >
                  <Users size={14} className="inline mr-2" />
                  Por Funcionario
                </button>
              </div>
            ) : (
              <h2 className="font-heading text-lg text-parchment-100">Meu Estoque</h2>
            )}
          </CardHeader>

          <CardContent className="p-0">
            {activeTab === 'global' && isAdmin ? (
              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="py-12 text-center">
                    <div className="w-8 h-8 mx-auto border-2 border-leather-700 border-t-gold-500 rounded-full animate-spin" />
                  </div>
                ) : filteredAgregado.length === 0 ? (
                  <div className="empty-state py-12">
                    <p className="text-parchment-500">Nenhum item em estoque</p>
                  </div>
                ) : (
                  <table className="table-western">
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}></th>
                        <th>Produto</th>
                        <th>Qtd Total</th>
                        <th>Valor Unit.</th>
                        <th>Valor Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAgregado.map((row) => (
                        <>
                          <tr key={row.produto_codigo}>
                            <td>
                              <button
                                onClick={() => toggleRow(row.produto_codigo)}
                                className="p-1 hover:bg-leather-700/50 rounded"
                              >
                                {expandedRows.has(row.produto_codigo) ? (
                                  <ChevronDown size={16} className="text-gold-500" />
                                ) : (
                                  <ChevronRight size={16} className="text-parchment-400" />
                                )}
                              </button>
                            </td>
                            <td>
                              <span className="font-heading text-parchment-100">
                                {row.produto_codigo}
                              </span>
                            </td>
                            <td>
                              <Badge variant="gold">{row.quantidade_total} un.</Badge>
                            </td>
                            <td>
                              <span className="text-parchment-400">
                                {formatCurrency(row.valor_unitario)}
                              </span>
                            </td>
                            <td>
                              <span className="font-heading text-gold-500">
                                {formatCurrency(row.valor_total)}
                              </span>
                            </td>
                          </tr>
                          {expandedRows.has(row.produto_codigo) && (
                            <tr key={`${row.produto_codigo}-expanded`}>
                              <td colSpan={5} className="p-0">
                                <div className="bg-leather-800/30 p-4 space-y-2">
                                  <p className="text-xs text-parchment-500 uppercase tracking-wider mb-2">
                                    Detalhes por Funcionario
                                  </p>
                                  {row.funcionarios.map((f) => (
                                    <div
                                      key={f.funcionario_id}
                                      className="flex flex-col sm:flex-row sm:items-center justify-between p-2 bg-leather-900/50 rounded gap-2"
                                    >
                                      <span className="text-parchment-300 text-sm">{f.funcionario_nome}</span>
                                      <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                                        <Badge variant="default">{f.quantidade} un.</Badge>
                                        <span className="text-gold-500 text-sm">{formatCurrency(f.valor)}</span>
                                        {isAdmin && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              openAjustarModal(
                                                f.funcionario_id,
                                                row.produto_codigo,
                                                f.quantidade
                                              )
                                            }
                                            leftIcon={<Edit3 size={12} />}
                                          >
                                            Ajustar
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              <div>
                <Table
                  data={filteredFuncionario}
                  columns={funcionarioColumns}
                  keyExtractor={(row) => `${row.funcionario_id}-${row.produto_codigo}`}
                  isLoading={isLoading}
                  emptyMessage="Nenhum item em estoque"
                />

                {/* Zerar Estoque section for admins */}
                {isAdmin && funcionariosComEstoque.length > 0 && (
                  <div className="p-4 border-t border-leather-700/50">
                    <p className="text-xs text-parchment-500 uppercase tracking-wider mb-3">
                      Zerar Estoque de Funcionario
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {funcionariosComEstoque.map((f) => (
                        <Button
                          key={f.id}
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setZerarFuncionarioId(f.id);
                            setShowZerarModal(true);
                          }}
                          leftIcon={<Trash2 size={12} />}
                        >
                          Zerar {f.nome}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Ajustar Estoque Modal */}
      <Modal
        isOpen={showAjustarModal}
        onClose={() => setShowAjustarModal(false)}
        title="Ajustar Estoque"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-parchment-400 mb-1">Funcionario</label>
            <select
              value={ajustarForm.funcionario_id || ''}
              onChange={(e) =>
                setAjustarForm((prev) => ({ ...prev, funcionario_id: Number(e.target.value) }))
              }
              className="input-western w-full"
            >
              <option value="">Selecione um funcionario</option>
              {funcionarios.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-parchment-400 mb-1">Produto</label>
            <select
              value={ajustarForm.produto_codigo}
              onChange={(e) =>
                setAjustarForm((prev) => ({ ...prev, produto_codigo: e.target.value }))
              }
              className="input-western w-full"
            >
              <option value="">Selecione um produto</option>
              {produtoCodigos.map((codigo) => (
                <option key={codigo} value={codigo}>
                  {codigo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-parchment-400 mb-1">Nova Quantidade</label>
            <input
              type="number"
              min="0"
              value={ajustarForm.quantidade}
              onChange={(e) =>
                setAjustarForm((prev) => ({ ...prev, quantidade: Number(e.target.value) }))
              }
              className="input-western w-full"
              placeholder="0"
            />
            <p className="text-xs text-parchment-500 mt-1">
              Use 0 para remover o item do estoque.
            </p>
          </div>

          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowAjustarModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleAjustar} isLoading={isSaving}>
              Salvar
            </Button>
          </ModalFooter>
        </div>
      </Modal>

      {/* Zerar Estoque Modal */}
      <Modal
        isOpen={showZerarModal}
        onClose={() => setShowZerarModal(false)}
        title="Confirmar Pagamento e Zerar Estoque"
      >
        <div className="space-y-4">
          <p className="text-parchment-300">
            Tem certeza que deseja pagar e zerar o estoque de{' '}
            <strong className="text-gold-500">
              {funcionarios.find((f) => f.id === zerarFuncionarioId)?.nome}
            </strong>
            ?
          </p>
          <div className="p-3 bg-leather-800/50 rounded-western">
            <p className="text-sm text-parchment-400">
              Esta ação irá:
            </p>
            <ul className="text-sm text-parchment-300 mt-2 space-y-1 list-disc list-inside">
              <li>Calcular o valor total do estoque</li>
              <li>Registrar o pagamento no histórico</li>
              <li>Adicionar o valor ao saldo do funcionário</li>
              <li>Zerar o estoque do funcionário</li>
            </ul>
          </div>
          <p className="text-xs text-parchment-500">
            O pagamento real deve ser feito em RP (roleplay) fora do sistema.
          </p>

          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowZerarModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleZerar} isLoading={isSaving}>
              Pagar e Zerar
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </motion.div>
  );
}
