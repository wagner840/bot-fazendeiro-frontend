import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Users,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  Badge,
  Avatar,
} from '../components/ui';
import {
  formatCurrency,
  formatDateTime,
  type HistoricoPagamento,
  type Funcionario,
} from '../lib/types';
import {
  getHistoricoPagamentos,
  getFuncionarios,
  getRevenueChartData,
} from '../lib/supabase';
import { groupBy } from '../lib/utils';

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

export function Financeiro() {
  const { selectedEmpresa, addToast, stats } = useApp();
  const [pagamentos, setPagamentos] = useState<HistoricoPagamento[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [chartData, setChartData] = useState<{ mes: string; receita: number; pagamentos: number; lucro: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadData();
  }, [selectedEmpresa, selectedPeriod]);

  async function loadData() {

    if (!selectedEmpresa) return;

    try {
      setIsLoading(true);
      const [pagamentosData, funcionariosData, revenueData] = await Promise.all([
        getHistoricoPagamentos(selectedEmpresa.id),
        getFuncionarios(selectedEmpresa.id),
        getRevenueChartData(selectedEmpresa.id, selectedPeriod),
      ]);



      setPagamentos(pagamentosData);
      setFuncionarios(funcionariosData);

      // Process chart data with Profit calculation
      const processedChartData = revenueData.map(d => ({
        ...d,
        lucro: d.receita - d.pagamentos
      }));
      setChartData(processedChartData);

    } catch (error) {
      console.error('Error loading financial data:', error);
      addToast({
        type: 'error',
        title: 'Erro ao carregar dados financeiros',
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Calculate stats
  const financialStats = useMemo(() => {
    const totalPagamentos = pagamentos.reduce((sum, p) => sum + p.valor, 0);
    const totalSaldos = funcionarios.reduce((sum, f) => sum + f.saldo, 0);

    // Group payments by type
    const byType = groupBy(pagamentos, 'tipo');
    const estoqueTotal = byType['estoque']?.reduce((sum, p) => sum + p.valor, 0) || 0;
    const bonusTotal = byType['bonus']?.reduce((sum, p) => sum + p.valor, 0) || 0;

    return {
      totalPagamentos,
      totalSaldos,
      estoqueTotal,
      bonusTotal,
    };
  }, [pagamentos, funcionarios]);

  // Top earners
  const topEarners = useMemo(() => {
    return [...funcionarios]
      .sort((a, b) => b.saldo - a.saldo)
      .slice(0, 5);
  }, [funcionarios]);

  const pagamentoColumns = [
    {
      key: 'data_pagamento',
      header: 'Data',
      sortable: true,
      render: (p: HistoricoPagamento) => (
        <span className="text-parchment-400 text-sm">
          {formatDateTime(p.data_pagamento)}
        </span>
      ),
    },
    {
      key: 'funcionario',
      header: 'Funcionário',
      render: (p: HistoricoPagamento) => (
        <div className="flex items-center gap-2">
          <Avatar name={p.funcionario?.nome || 'Unknown'} size="sm" />
          <span className="font-heading text-parchment-100">
            {p.funcionario?.nome || 'Desconhecido'}
          </span>
        </div>
      ),
    },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (p: HistoricoPagamento) => (
        <Badge variant={p.tipo === 'estoque' ? 'gold' : 'success'}>
          {p.tipo}
        </Badge>
      ),
    },
    {
      key: 'descricao',
      header: 'Descrição',
      render: (p: HistoricoPagamento) => (
        <span className="text-sm text-parchment-400 truncate max-w-[200px] block">
          {p.descricao || '-'}
        </span>
      ),
    },
    {
      key: 'valor',
      header: 'Valor',
      sortable: true,
      align: 'right' as const,
      render: (p: HistoricoPagamento) => (
        <span className="font-heading text-gold-500">
          {formatCurrency(p.valor)}
        </span>
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
          <h1 className="font-display text-2xl sm:text-3xl text-gold-500">Financeiro</h1>
          <p className="text-parchment-400 mt-1 text-sm sm:text-base">
            Relatórios e histórico de {selectedEmpresa?.nome}
          </p>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
          {(['week', 'month', 'year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 sm:px-4 py-2 rounded-western text-xs sm:text-sm font-heading transition-colors whitespace-nowrap ${
                selectedPeriod === period
                  ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                  : 'text-parchment-400 hover:text-parchment-200'
              }`}
            >
              {period === 'week' ? 'Semana' : period === 'month' ? 'Mês' : 'Ano'}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-western bg-green-900/30">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-display text-gold-500">
                {formatCurrency(stats?.receitaMensal || 0)}
              </p>
              <p className="text-xs text-parchment-500 uppercase tracking-wider">
                Receita do Mês
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-western bg-rust-900/30">
              <TrendingDown className="w-6 h-6 text-rust-400" />
            </div>
            <div>
              <p className="text-2xl font-display text-gold-500">
                {formatCurrency(financialStats.totalPagamentos)}
              </p>
              <p className="text-xs text-parchment-500 uppercase tracking-wider">
                Total Pago
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-western bg-whiskey-900/30">
              <Wallet className="w-6 h-6 text-whiskey-400" />
            </div>
            <div>
              <p className="text-2xl font-display text-gold-500">
                {formatCurrency(financialStats.totalSaldos)}
              </p>
              <p className="text-xs text-parchment-500 uppercase tracking-wider">
                Saldos Pendentes
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-western bg-gold-900/30">
              <CreditCard className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <p className="text-2xl font-display text-gold-500">
                {formatCurrency((stats?.receitaMensal || 0) - financialStats.totalSaldos)}
              </p>
              <p className="text-xs text-parchment-500 uppercase tracking-wider">
                Lucro Estimado
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <h2 className="font-heading text-lg text-parchment-100">
                Evolução Financeira
              </h2>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] sm:h-[250px] lg:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPagamentos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b2635" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b2635" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(109, 79, 40, 0.3)" />
                    <XAxis
                      dataKey="mes"
                      tick={{ fill: '#f5e6d3', fontSize: 12 }}
                      axisLine={{ stroke: '#6d4f28' }}
                    />
                    <YAxis
                      tick={{ fill: '#f5e6d3', fontSize: 12 }}
                      axisLine={{ stroke: '#6d4f28' }}
                      tickFormatter={(value) => `R$${value / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#2d1b0e',
                        border: '1px solid #6d4f28',
                        borderRadius: '2px',
                      }}
                      formatter={(value) => formatCurrency(Number(value) || 0)}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="receita"
                      name="Receita"
                      stroke="#22c55e"
                      fillOpacity={1}
                      fill="url(#colorReceita)"
                    />
                    <Area
                      type="monotone"
                      dataKey="pagamentos"
                      name="Pagamentos"
                      stroke="#8b2635"
                      fillOpacity={1}
                      fill="url(#colorPagamentos)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bar Chart */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <h2 className="font-heading text-lg text-parchment-100">
                Comparativo Mensal
              </h2>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] sm:h-[250px] lg:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(109, 79, 40, 0.3)" />
                    <XAxis
                      dataKey="mes"
                      tick={{ fill: '#f5e6d3', fontSize: 12 }}
                      axisLine={{ stroke: '#6d4f28' }}
                    />
                    <YAxis
                      tick={{ fill: '#f5e6d3', fontSize: 12 }}
                      axisLine={{ stroke: '#6d4f28' }}
                      tickFormatter={(value) => `R$${value / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#2d1b0e',
                        border: '1px solid #6d4f28',
                        borderRadius: '2px',
                      }}
                      formatter={(value) => formatCurrency(Number(value) || 0)}
                    />
                    <Legend />
                    <Bar dataKey="lucro" name="Lucro" fill="#d4a853" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment History */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="font-heading text-lg text-parchment-100">
                Histórico de Pagamentos
              </h2>
            </CardHeader>
            <CardContent className="p-0">
              <Table
                data={pagamentos.slice(0, 10)}
                columns={pagamentoColumns}
                keyExtractor={(p) => p.id}
                isLoading={isLoading}
                emptyMessage="Nenhum pagamento registrado"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Earners */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader>
              <h2 className="font-heading text-lg text-parchment-100">
                Maiores Rendimentos
              </h2>
            </CardHeader>
            <CardContent className="p-0">
              {topEarners.length === 0 ? (
                <div className="p-6 text-center text-parchment-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum funcionário</p>
                </div>
              ) : (
                <div className="divide-y divide-leather-800/50">
                  {topEarners.map((f, index) => (
                    <div
                      key={f.id}
                      className="flex items-center gap-3 p-4 hover:bg-leather-800/30 transition-colors"
                    >
                      <div className="relative">
                        <Avatar name={f.nome} size="sm" />
                        {index < 3 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold-500 text-leather-950 text-xs font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-heading text-sm text-parchment-100 truncate">
                          {f.nome}
                        </p>
                      </div>
                      <span className="font-heading text-gold-500">
                        {formatCurrency(f.saldo)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
