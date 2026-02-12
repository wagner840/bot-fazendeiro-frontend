import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Eye,
  DollarSign,
  Package,
  History,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePageTitle } from '../hooks/usePageTitle';
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  Button,
  Modal,
  ModalFooter,
  Avatar,
  Badge,
} from '../components/ui';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  type Funcionario,
  type EstoqueProduto,
  type HistoricoPagamento,
} from '../lib/types';
import {
  getFuncionarios,
  getEstoqueFuncionario,
  getHistoricoPagamentosFuncionario,
  getEstoqueEmpresa,
  getProdutosEmpresa,
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

export function Funcionarios() {
  usePageTitle('Funcionários');
  const { selectedEmpresa, addToast } = useApp();
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [valoresEstoque, setValoresEstoque] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [estoque, setEstoque] = useState<EstoqueProduto[]>([]);
  const [historico, setHistorico] = useState<HistoricoPagamento[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'estoque' | 'historico'>('estoque');

  useEffect(() => {
    loadFuncionarios();
  }, [selectedEmpresa]);

  async function loadFuncionarios() {
    if (!selectedEmpresa) return;

    try {
      setIsLoading(true);
      const [funcs, estoqueData, produtosData] = await Promise.all([
        getFuncionarios(selectedEmpresa.id),
        getEstoqueEmpresa(selectedEmpresa.id),
        getProdutosEmpresa(selectedEmpresa.id),
      ]);
      
      setFuncionarios(funcs);

      // Calculate stock value per employee
      const valores: Record<number, number> = {};
      
      // Create a map of product prices
      const precosMap: Record<string, number> = {};
      produtosData.forEach(p => {
        if (p.produto_referencia?.codigo) {
           precosMap[p.produto_referencia.codigo.toLowerCase()] = p.preco_pagamento_funcionario || 0;
        }
      });

      // Sum up stock values
      estoqueData.forEach(item => {
        const funcId = item.funcionario_id;
        const codigo = item.produto_codigo.toLowerCase();
        const preco = precosMap[codigo] || 0;
        const valor = (item.quantidade || 0) * preco;
        
        if (!valores[funcId]) valores[funcId] = 0;
        valores[funcId] += valor;
      });

      setValoresEstoque(valores);
    } catch (error) {
      console.error('Error loading funcionarios:', error);
      addToast({
        type: 'error',
        title: 'Erro ao carregar funcionários',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function openDetails(funcionario: Funcionario) {
    setSelectedFuncionario(funcionario);
    setShowDetailsModal(true);
    setLoadingDetails(true);

    try {
      const [estoqueData, historicoData] = await Promise.all([
        getEstoqueFuncionario(funcionario.id),
        getHistoricoPagamentosFuncionario(funcionario.id),
      ]);

      setEstoque(estoqueData);
      setHistorico(historicoData);
    } catch (error) {
      console.error('Error loading details:', error);
      addToast({
        type: 'error',
        title: 'Erro ao carregar detalhes',
      });
    } finally {
      setLoadingDetails(false);
    }
  }

  const filteredFuncionarios = filterBySearch(funcionarios, searchQuery, [
    'nome',
    'discord_id',
  ]);

  const totalSaldo = funcionarios.reduce((sum, f) => sum + f.saldo, 0);

  const columns = [
    {
      key: 'nome',
      header: 'Funcionário',
      sortable: true,
      render: (f: Funcionario) => (
        <div className="flex items-center gap-3">
          <Avatar name={f.nome} size="sm" />
          <div>
            <p className="font-heading text-parchment-100">{f.nome}</p>
            <p className="text-xs text-parchment-500">{f.discord_id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'saldo',
      header: 'Saldo',
      sortable: true,
      render: (f: Funcionario) => (
        <div className="flex flex-col">
            <span className="font-heading text-gold-500">
            {formatCurrency(f.saldo)}
            </span>
            {valoresEstoque[f.id] > 0 && (
                <span className="text-xs text-parchment-500" title="Valor acumulado em estoque (não pago)">
                    + {formatCurrency(valoresEstoque[f.id])} em estoque
                </span>
            )}
        </div>
      ),
    },
    {
      key: 'data_cadastro',
      header: 'Desde',
      sortable: true,
      render: (f: Funcionario) => (
        <span className="text-parchment-400">{formatDate(f.data_cadastro)}</span>
      ),
    },
    {
      key: 'ativo',
      header: 'Status',
      render: (f: Funcionario) => (
        <Badge variant={f.ativo ? 'success' : 'danger'}>
          {f.ativo ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      render: (f: Funcionario) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openDetails(f)}
          leftIcon={<Eye size={14} />}
        >
          Detalhes
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
          <h1 className="font-display text-2xl sm:text-3xl text-gold-500">Funcionários</h1>
          <p className="text-parchment-400 mt-1 text-sm sm:text-base">
            Gerencie a equipe de {selectedEmpresa?.nome}
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-western bg-leather-800/50">
              <Users className="w-6 h-6 text-gold-500" />
            </div>
            <div>
              <p className="text-2xl font-display text-gold-500">
                {funcionarios.length}
              </p>
              <p className="text-xs text-parchment-500 uppercase tracking-wider">
                Total de Funcionários
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
                {formatCurrency(totalSaldo)}
              </p>
              <p className="text-xs text-parchment-500 uppercase tracking-wider">
                Saldo Total a Pagar
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
                {formatCurrency(totalSaldo * 0.25)}
              </p>
              <p className="text-xs text-parchment-500 uppercase tracking-wider">
                Média Saldo/Funcionário
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
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-leather-500"
                  />
                  <input
                    type="text"
                    placeholder="Buscar funcionário..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-western pl-9 py-2 text-sm w-full sm:w-64"
                  />
                </div>
              </div>
            }
          >
            <h2 className="font-heading text-lg text-parchment-100">
              Lista de Funcionários
            </h2>
          </CardHeader>

          <CardContent className="p-0">
            <Table
              data={filteredFuncionarios}
              columns={columns}
              keyExtractor={(f) => f.id}
              isLoading={isLoading}
              emptyMessage="Nenhum funcionário encontrado"
              emptyIcon={<Users className="w-12 h-12" />}
              emptyHint="Use !bemvindo @usuario no Discord para cadastrar"
              mobileCardRender={(f) => (
                <div
                  className="flex items-center gap-3 p-4 hover:bg-leather-800/30 transition-colors"
                  onClick={() => openDetails(f)}
                >
                  <Avatar name={f.nome} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-sm text-parchment-100 truncate">{f.nome}</p>
                    <p className="text-xs text-parchment-500">{f.discord_id}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-heading text-sm text-gold-500">{formatCurrency(f.saldo)}</p>
                    <Badge variant={f.ativo ? 'success' : 'danger'} className="mt-1">
                      {f.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              )}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={selectedFuncionario?.nome}
        size="lg"
      >
        {selectedFuncionario && (
          <div className="space-y-6">
            {/* Employee Info */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 sm:p-4 bg-leather-800/30 rounded-western">
              <Avatar name={selectedFuncionario.nome} size="lg" className="mx-auto sm:mx-0" />
              <div className="flex-1 text-center sm:text-left">
                <p className="font-heading text-base sm:text-lg text-parchment-100">
                  {selectedFuncionario.nome}
                </p>
                <p className="text-xs sm:text-sm text-parchment-500 break-all">
                  Discord: {selectedFuncionario.discord_id}
                </p>
                <p className="text-xs text-parchment-600">
                  Desde: {formatDate(selectedFuncionario.data_cadastro)}
                </p>
              </div>
              <div className="text-center sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 mt-2 sm:mt-0 border-leather-700/50">
                <p className="text-xs text-parchment-500 uppercase">Saldo Atual</p>
                <p className="text-xl sm:text-2xl font-display text-gold-500">
                  {formatCurrency(selectedFuncionario.saldo)}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="tabs-western">
              <button
                className={`tab-western ${activeTab === 'estoque' ? 'active' : ''}`}
                onClick={() => setActiveTab('estoque')}
              >
                <Package size={14} className="inline mr-2" />
                Estoque
              </button>
              <button
                className={`tab-western ${activeTab === 'historico' ? 'active' : ''}`}
                onClick={() => setActiveTab('historico')}
              >
                <History size={14} className="inline mr-2" />
                Histórico
              </button>
            </div>

            {/* Tab Content */}
            {loadingDetails ? (
              <div className="py-8 text-center">
                <div className="w-8 h-8 mx-auto border-2 border-leather-700 border-t-gold-500 rounded-full animate-spin" />
              </div>
            ) : activeTab === 'estoque' ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {estoque.length === 0 ? (
                  <p className="text-center text-parchment-500 py-4">
                    Nenhum item em estoque
                  </p>
                ) : (
                  estoque.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-leather-800/30 rounded-western"
                    >
                      <div>
                        <p className="font-heading text-sm text-parchment-100">
                          {item.produto_codigo}
                        </p>
                        <p className="text-xs text-parchment-500">
                          Atualizado: {formatDate(item.data_atualizacao)}
                        </p>
                      </div>
                      <Badge variant="gold">{item.quantidade} un.</Badge>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {historico.length === 0 ? (
                  <p className="text-center text-parchment-500 py-4">
                    Nenhum pagamento registrado
                  </p>
                ) : (
                  historico.map((pag) => (
                    <div
                      key={pag.id}
                      className="flex items-center justify-between p-3 bg-leather-800/30 rounded-western"
                    >
                      <div>
                        <p className="font-heading text-sm text-parchment-100">
                          {pag.tipo}
                        </p>
                        <p className="text-xs text-parchment-500">
                          {pag.descricao}
                        </p>
                        <p className="text-xs text-parchment-600">
                          {formatDateTime(pag.data_pagamento)}
                        </p>
                      </div>
                      <span className="font-heading text-gold-500">
                        {formatCurrency(pag.valor)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            <ModalFooter>
              <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                Fechar
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
