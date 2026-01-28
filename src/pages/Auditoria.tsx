import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  DollarSign,
  Users,
  Package,
  History,
  Eye,
  CreditCard,
  Calendar,
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
  Avatar,
} from '../components/ui';
import {
  formatCurrency,
  formatDateTime,
  type HistoricoPagamento,
} from '../lib/types';
import {
  getHistoricoPagamentosEmpresa,
  getAuditoriaFuncionarios,
  zerarEstoqueComPagamento,
  type AuditoriaFuncionario,
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

// Payment type labels and colors
const TIPO_LABELS: Record<string, string> = {
  estoque_acumulado: 'Estoque Acumulado',
  bonus: 'Bnus',
  ajuste: 'Ajuste',
  manual: 'Manual',
};

const TIPO_VARIANTS: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'gold'> = {
  estoque_acumulado: 'gold',
  bonus: 'success',
  ajuste: 'warning',
  manual: 'default',
};

export function Auditoria() {
  const { selectedEmpresa, addToast } = useApp();
  const { isAdmin } = useAuth();

  const [historico, setHistorico] = useState<HistoricoPagamento[]>([]);
  const [auditoriaFuncionarios, setAuditoriaFuncionarios] = useState<AuditoriaFuncionario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'resumo' | 'historico'>('resumo');

  // Filters for historico tab
  const [filterFuncionario, setFilterFuncionario] = useState<number | null>(null);
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [filterDateStart, setFilterDateStart] = useState<string>('');
  const [filterDateEnd, setFilterDateEnd] = useState<string>('');

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedFuncionarioId, setSelectedFuncionarioId] = useState<number | null>(null);
  const [funcionarioHistorico, setFuncionarioHistorico] = useState<HistoricoPagamento[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [showPagarModal, setShowPagarModal] = useState(false);
  const [pagarFuncionarioId, setPagarFuncionarioId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedEmpresa]);

  async function loadData() {
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
  }

  // Stats calculations
  const stats = useMemo(() => {
    const totalPagoHistorico = historico.reduce((sum, h) => sum + (h.valor || 0), 0);
    const saldoTotal = auditoriaFuncionarios.reduce((sum, f) => sum + f.saldo_atual, 0);
    const estoqueTotal = auditoriaFuncionarios.reduce((sum, f) => sum + f.estoque_valor, 0);
    const funcionariosAtivos = auditoriaFuncionarios.length;

    return { totalPagoHistorico, saldoTotal, estoqueTotal, funcionariosAtivos };
  }, [historico, auditoriaFuncionarios]);

  // Filtered historico
  const filteredHistorico = useMemo(() => {
    let filtered = historico;

    // Filter by funcionario
    if (filterFuncionario) {
      filtered = filtered.filter(h => h.funcionario_id === filterFuncionario);
    }

    // Filter by tipo
    if (filterTipo) {
      filtered = filtered.filter(h => h.tipo === filterTipo);
    }

    // Filter by date range
    if (filterDateStart) {
      const start = new Date(filterDateStart);
      filtered = filtered.filter(h => new Date(h.data_pagamento) >= start);
    }
    if (filterDateEnd) {
      const end = new Date(filterDateEnd);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(h => new Date(h.data_pagamento) <= end);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(h => {
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
    const tipos = new Set(historico.map(h => h.tipo));
    return Array.from(tipos);
  }, [historico]);

  // Open details modal for a funcionario
  async function openDetailsModal(funcionarioId: number) {
    setSelectedFuncionarioId(funcionarioId);
    setShowDetailsModal(true);
    setLoadingDetails(true);

    try {
      const funcHistorico = historico.filter(h => h.funcionario_id === funcionarioId);
      setFuncionarioHistorico(funcHistorico);
    } finally {
      setLoadingDetails(false);
    }
  }

  // Handle pagar estoque
  async function handlePagarEstoque() {
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
      setShowPagarModal(false);
      setPagarFuncionarioId(null);
      await loadData();
    } catch (error) {
      console.error('Error paying stock:', error);
      addToast({ type: 'error', title: 'Erro ao registrar pagamento' });
    } finally {
      setIsSaving(false);
    }
  }

  // Get funcionario name by ID
  function getFuncionarioNome(id: number | null): string {
    if (!id) return '';
    const func = auditoriaFuncionarios.find(f => f.funcionario_id === id);
    return func?.nome || '';
  }

  // Columns for resumo tab
  const resumoColumns = [
    {
      key: 'nome',
      header: 'Funcionario',
      sortable: true,
      render: (row: AuditoriaFuncionario) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.nome} size="sm" />
          <div>
            <p className="font-heading text-parchment-100">{row.nome}</p>
            <p className="text-xs text-parchment-500">{row.discord_id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'total_historico',
      header: 'Total Historico',
      sortable: true,
      render: (row: AuditoriaFuncionario) => (
        <span className="font-heading text-parchment-300">
          {formatCurrency(row.total_historico)}
        </span>
      ),
    },
    {
      key: 'saldo_atual',
      header: 'Saldo Atual',
      sortable: true,
      render: (row: AuditoriaFuncionario) => (
        <span className="font-heading text-gold-500">
          {formatCurrency(row.saldo_atual)}
        </span>
      ),
    },
    {
      key: 'estoque_valor',
      header: 'Em Estoque',
      sortable: true,
      render: (row: AuditoriaFuncionario) => (
        <Badge variant={row.estoque_valor > 0 ? 'gold' : 'default'}>
          {formatCurrency(row.estoque_valor)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '200px',
      render: (row: AuditoriaFuncionario) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openDetailsModal(row.funcionario_id)}
            leftIcon={<Eye size={14} />}
          >
            Detalhes
          </Button>
          {row.estoque_valor > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setPagarFuncionarioId(row.funcionario_id);
                setShowPagarModal(true);
              }}
              leftIcon={<CreditCard size={14} />}
            >
              Pagar
            </Button>
          )}
        </div>
      ),
    },
  ];

  // Columns for historico tab
  const historicoColumns = [
    {
      key: 'data_pagamento',
      header: 'Data',
      sortable: true,
      render: (row: HistoricoPagamento) => (
        <span className="text-parchment-400">{formatDateTime(row.data_pagamento)}</span>
      ),
    },
    {
      key: 'funcionario',
      header: 'Funcionario',
      render: (row: HistoricoPagamento) => {
        const func = row.funcionario as { nome?: string } | undefined;
        return (
          <span className="font-heading text-parchment-100">{func?.nome || 'Desconhecido'}</span>
        );
      },
    },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (row: HistoricoPagamento) => (
        <Badge variant={TIPO_VARIANTS[row.tipo] || 'default'}>
          {TIPO_LABELS[row.tipo] || row.tipo}
        </Badge>
      ),
    },
    {
      key: 'valor',
      header: 'Valor',
      sortable: true,
      render: (row: HistoricoPagamento) => (
        <span className="font-heading text-gold-500">{formatCurrency(row.valor)}</span>
      ),
    },
    {
      key: 'descricao',
      header: 'Descricao',
      render: (row: HistoricoPagamento) => (
        <span className="text-parchment-400 text-sm truncate max-w-xs block">
          {row.descricao || '-'}
        </span>
      ),
    },
  ];

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-parchment-500">Acesso restrito a administradores.</p>
      </div>
    );
  }

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
          <h1 className="font-display text-3xl text-gold-500">Auditoria de Pagamentos</h1>
          <p className="text-parchment-400 mt-1">
            Acompanhe o historico financeiro de {selectedEmpresa?.nome}
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-western bg-leather-800/50">
              <History className="w-6 h-6 text-gold-500" />
            </div>
            <div>
              <p className="text-2xl font-display text-gold-500">
                {formatCurrency(stats.totalPagoHistorico)}
              </p>
              <p className="text-xs text-parchment-500 uppercase tracking-wider">
                Total Pago (Historico)
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
                {formatCurrency(stats.saldoTotal)}
              </p>
              <p className="text-xs text-parchment-500 uppercase tracking-wider">
                Saldo Total
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-western bg-leather-800/50">
              <Package className="w-6 h-6 text-gold-500" />
            </div>
            <div>
              <p className="text-2xl font-display text-gold-500">
                {formatCurrency(stats.estoqueTotal)}
              </p>
              <p className="text-xs text-parchment-500 uppercase tracking-wider">
                Valor em Estoque
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-western bg-leather-800/50">
              <Users className="w-6 h-6 text-gold-500" />
            </div>
            <div>
              <p className="text-2xl font-display text-gold-500">
                {stats.funcionariosAtivos}
              </p>
              <p className="text-xs text-parchment-500 uppercase tracking-wider">
                Funcionarios Ativos
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
              <div className="flex items-center gap-3 flex-wrap">
                {activeTab === 'historico' && (
                  <>
                    <select
                      value={filterFuncionario || ''}
                      onChange={(e) =>
                        setFilterFuncionario(e.target.value ? Number(e.target.value) : null)
                      }
                      className="input-western py-2 text-sm"
                    >
                      <option value="">Todos funcionarios</option>
                      {auditoriaFuncionarios.map((f) => (
                        <option key={f.funcionario_id} value={f.funcionario_id}>
                          {f.nome}
                        </option>
                      ))}
                    </select>

                    <select
                      value={filterTipo}
                      onChange={(e) => setFilterTipo(e.target.value)}
                      className="input-western py-2 text-sm"
                    >
                      <option value="">Todos tipos</option>
                      {tiposUnicos.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {TIPO_LABELS[tipo] || tipo}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-parchment-500" />
                      <input
                        type="date"
                        value={filterDateStart}
                        onChange={(e) => setFilterDateStart(e.target.value)}
                        className="input-western py-2 text-sm"
                        placeholder="Data inicio"
                      />
                      <span className="text-parchment-500">-</span>
                      <input
                        type="date"
                        value={filterDateEnd}
                        onChange={(e) => setFilterDateEnd(e.target.value)}
                        className="input-western py-2 text-sm"
                        placeholder="Data fim"
                      />
                    </div>
                  </>
                )}
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-leather-500"
                  />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-western pl-9 py-2 text-sm w-64"
                  />
                </div>
              </div>
            }
          >
            <div className="tabs-western">
              <button
                className={`tab-western ${activeTab === 'resumo' ? 'active' : ''}`}
                onClick={() => setActiveTab('resumo')}
              >
                <Users size={14} className="inline mr-2" />
                Resumo por Funcionario
              </button>
              <button
                className={`tab-western ${activeTab === 'historico' ? 'active' : ''}`}
                onClick={() => setActiveTab('historico')}
              >
                <History size={14} className="inline mr-2" />
                Historico de Pagamentos
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {activeTab === 'resumo' ? (
              <Table
                data={filteredResumo}
                columns={resumoColumns}
                keyExtractor={(row) => row.funcionario_id}
                isLoading={isLoading}
                emptyMessage="Nenhum funcionario encontrado"
              />
            ) : (
              <Table
                data={filteredHistorico}
                columns={historicoColumns}
                keyExtractor={(row) => row.id}
                isLoading={isLoading}
                emptyMessage="Nenhum pagamento registrado"
              />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={`Historico - ${getFuncionarioNome(selectedFuncionarioId)}`}
        size="lg"
      >
        <div className="space-y-4">
          {loadingDetails ? (
            <div className="py-8 text-center">
              <div className="w-8 h-8 mx-auto border-2 border-leather-700 border-t-gold-500 rounded-full animate-spin" />
            </div>
          ) : funcionarioHistorico.length === 0 ? (
            <p className="text-center text-parchment-500 py-4">
              Nenhum pagamento registrado
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {funcionarioHistorico.map((pag) => (
                <div
                  key={pag.id}
                  className="flex items-center justify-between p-3 bg-leather-800/30 rounded-western"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={TIPO_VARIANTS[pag.tipo] || 'default'}>
                        {TIPO_LABELS[pag.tipo] || pag.tipo}
                      </Badge>
                      <span className="text-xs text-parchment-500">
                        {formatDateTime(pag.data_pagamento)}
                      </span>
                    </div>
                    {pag.descricao && (
                      <p className="text-sm text-parchment-400 mt-1">{pag.descricao}</p>
                    )}
                  </div>
                  <span className="font-heading text-gold-500 text-lg">
                    {formatCurrency(pag.valor)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {funcionarioHistorico.length > 0 && (
            <div className="p-3 bg-leather-800/50 rounded-western border-t border-leather-700">
              <div className="flex justify-between items-center">
                <span className="text-parchment-400">Total de pagamentos:</span>
                <span className="font-display text-xl text-gold-500">
                  {formatCurrency(funcionarioHistorico.reduce((sum, p) => sum + p.valor, 0))}
                </span>
              </div>
            </div>
          )}

          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
              Fechar
            </Button>
          </ModalFooter>
        </div>
      </Modal>

      {/* Pagar Estoque Modal */}
      <Modal
        isOpen={showPagarModal}
        onClose={() => setShowPagarModal(false)}
        title="Confirmar Pagamento de Estoque"
      >
        <div className="space-y-4">
          <p className="text-parchment-300">
            Deseja registrar o pagamento do estoque de{' '}
            <strong className="text-gold-500">{getFuncionarioNome(pagarFuncionarioId)}</strong>?
          </p>

          {pagarFuncionarioId && (
            <div className="p-3 bg-leather-800/50 rounded-western">
              <p className="text-sm text-parchment-400">Valor em estoque:</p>
              <p className="text-2xl font-display text-gold-500">
                {formatCurrency(
                  auditoriaFuncionarios.find((f) => f.funcionario_id === pagarFuncionarioId)
                    ?.estoque_valor || 0
                )}
              </p>
            </div>
          )}

          <div className="p-3 bg-leather-800/30 rounded-western">
            <p className="text-sm text-parchment-400">Esta acao ira:</p>
            <ul className="text-sm text-parchment-300 mt-2 space-y-1 list-disc list-inside">
              <li>Registrar o pagamento no historico</li>
              <li>Adicionar o valor ao saldo do funcionario</li>
              <li>Zerar o estoque do funcionario</li>
            </ul>
          </div>

          <p className="text-xs text-parchment-500">
            O pagamento real deve ser feito em RP (roleplay) fora do sistema.
          </p>

          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowPagarModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handlePagarEstoque} isLoading={isSaving}>
              Confirmar Pagamento
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </motion.div>
  );
}
