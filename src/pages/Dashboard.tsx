import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Package,
  DollarSign,
  ClipboardList,
  TrendingUp,
  Warehouse,
  ArrowUpRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { Card, CardHeader, CardContent, StatCard, StatusStamp, Avatar, Progress } from '../components/ui';
import { formatCurrency, formatDate, type Encomenda, type Funcionario, type RevenueChartData, type ChartDataPoint } from '../lib/types';
import { getEncomendas, getFuncionarios, getRevenueChartData, getCategoryDistribution } from '../lib/supabase';

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

export function Dashboard() {
  const { selectedEmpresa, stats } = useApp();
  const [recentOrders, setRecentOrders] = useState<Encomenda[]>([]);
  const [topEmployees, setTopEmployees] = useState<Funcionario[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueChartData[]>([]);
  const [categoryData, setCategoryData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!selectedEmpresa) return;

      try {
        setIsLoading(true);
        const [orders, employees, revenue, categories] = await Promise.all([
          getEncomendas(selectedEmpresa.id),
          getFuncionarios(selectedEmpresa.id),
          getRevenueChartData(selectedEmpresa.id),
          getCategoryDistribution(selectedEmpresa.id),
        ]);

        setRecentOrders(orders.slice(0, 5));
        setTopEmployees(
          employees.sort((a, b) => b.saldo - a.saldo).slice(0, 5)
        );
        setRevenueData(revenue);
        setCategoryData(categories);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [selectedEmpresa]);

  if (!selectedEmpresa) return null;

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
          <h1 className="font-display text-3xl text-gold-500">Dashboard</h1>
          <p className="text-parchment-400 mt-1">
            Bem-vindo ao painel de controle de {selectedEmpresa.nome}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-parchment-500">Última atualização</p>
          <p className="font-heading text-parchment-300">
            {formatDate(new Date().toISOString())}
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          icon={<Users size={24} />}
          value={stats?.totalFuncionarios ?? 0}
          label="Funcionários"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          icon={<Package size={24} />}
          value={stats?.totalProdutos ?? 0}
          label="Produtos Ativos"
        />
        <StatCard
          icon={<Warehouse size={24} />}
          value={formatCurrency(stats?.valorEstoqueTotal ?? 0)}
          label="Valor em Estoque"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          icon={<DollarSign size={24} />}
          value={formatCurrency(stats?.receitaMensal ?? 0)}
          label="Receita Mensal"
          trend={{ value: 15, isPositive: true }}
        />
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="font-heading text-lg text-parchment-100">
                Receita vs Pagamentos
              </h2>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d4a853" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#d4a853" stopOpacity={0} />
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
                      tickFormatter={(value) => `R$${(Number(value) || 0) / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#2d1b0e',
                        border: '1px solid #6d4f28',
                        borderRadius: '2px',
                        color: '#f5e6d3',
                      }}
                      labelStyle={{ color: '#d4a853' }}
                      formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Receita/Pagamentos']}
                    />
                    <Area
                      type="monotone"
                      dataKey="receita"
                      name="Receita"
                      stroke="#d4a853"
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

        {/* Category Distribution */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader>
              <h2 className="font-heading text-lg text-parchment-100">
                Distribuição por Categoria
              </h2>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#2d1b0e',
                        border: '1px solid #6d4f28',
                        borderRadius: '2px',
                      }}
                      formatter={(value: any) => [`${value}%`, 'Distribuição']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.fill }}
                      />
                      <span className="text-sm text-parchment-300">{cat.name}</span>
                    </div>
                    <span className="text-sm font-heading text-gold-500">
                      {cat.value}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div variants={item}>
          <Card>
            <CardHeader
              action={
                <a
                  href="/encomendas"
                  className="text-sm text-gold-500 hover:text-gold-400 transition-colors flex items-center gap-1"
                >
                  Ver todas
                  <ArrowUpRight size={14} />
                </a>
              }
            >
              <h2 className="font-heading text-lg text-parchment-100">
                Encomendas Recentes
              </h2>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="skeleton w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="skeleton h-4 w-3/4" />
                        <div className="skeleton h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="p-6 text-center text-parchment-500">
                  <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma encomenda encontrada</p>
                </div>
              ) : (
                <div className="divide-y divide-leather-800/50">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center gap-4 p-4 hover:bg-leather-800/30 transition-colors"
                    >
                      <Avatar name={order.comprador} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-heading text-sm text-parchment-100 truncate">
                          {order.comprador}
                        </p>
                        <p className="text-xs text-parchment-500">
                          {order.itens_json?.length || 0} itens •{' '}
                          {formatDate(order.data_criacao)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-heading text-sm text-gold-500">
                          {formatCurrency(order.valor_total)}
                        </p>
                        <StatusStamp status={order.status} className="mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Employees */}
        <motion.div variants={item}>
          <Card>
            <CardHeader
              action={
                <a
                  href="/funcionarios"
                  className="text-sm text-gold-500 hover:text-gold-400 transition-colors flex items-center gap-1"
                >
                  Ver todos
                  <ArrowUpRight size={14} />
                </a>
              }
            >
              <h2 className="font-heading text-lg text-parchment-100">
                Top Funcionários
              </h2>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="skeleton w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="skeleton h-4 w-3/4" />
                        <div className="skeleton h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : topEmployees.length === 0 ? (
                <div className="p-6 text-center text-parchment-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum funcionário encontrado</p>
                </div>
              ) : (
                <div className="divide-y divide-leather-800/50">
                  {topEmployees.map((employee, index) => {
                    const maxSaldo = topEmployees[0]?.saldo || 1;
                    const percentage = (employee.saldo / maxSaldo) * 100;

                    return (
                      <div
                        key={employee.id}
                        className="flex items-center gap-4 p-4 hover:bg-leather-800/30 transition-colors"
                      >
                        <div className="relative">
                          <Avatar name={employee.nome} size="md" />
                          {index < 3 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold-500 text-leather-950 text-xs font-bold flex items-center justify-center">
                              {index + 1}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-heading text-sm text-parchment-100 truncate">
                            {employee.nome}
                          </p>
                          <div className="mt-1">
                            <Progress value={percentage} />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-heading text-sm text-gold-500">
                            {formatCurrency(employee.saldo)}
                          </p>
                          <p className="text-xs text-parchment-500">Saldo</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Stats Bar */}
      <motion.div variants={item}>
        <Card className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-western bg-whiskey-900/30">
                <ClipboardList size={20} className="text-whiskey-400" />
              </div>
              <div>
                <p className="text-2xl font-display text-gold-500">
                  {stats?.encomendasPendentes ?? 0}
                </p>
                <p className="text-xs text-parchment-500 uppercase tracking-wider">
                  Encomendas Pendentes
                </p>
              </div>
            </div>

            <div className="h-12 w-px bg-leather-700/50 hidden md:block" />

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-western bg-green-900/30">
                <TrendingUp size={20} className="text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-display text-gold-500">
                  {stats?.encomendasEntregues ?? 0}
                </p>
                <p className="text-xs text-parchment-500 uppercase tracking-wider">
                  Entregas Concluídas
                </p>
              </div>
            </div>

            <div className="h-12 w-px bg-leather-700/50 hidden md:block" />

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-western bg-rust-900/30">
                <DollarSign size={20} className="text-rust-400" />
              </div>
              <div>
                <p className="text-2xl font-display text-gold-500">
                  {formatCurrency(stats?.saldoTotalFuncionarios ?? 0)}
                </p>
                <p className="text-xs text-parchment-500 uppercase tracking-wider">
                  Saldo Total Funcionários
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
