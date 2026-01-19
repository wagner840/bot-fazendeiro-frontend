import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Search,
  Eye,
  Check,
  Clock,
  Package,
  TruckIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  Button,
  Modal,
  ModalFooter,
  Badge,
  StatusStamp,
  Avatar,
  Progress,
} from '../components/ui';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  type Encomenda,
  type EncomendaStatus,
  STATUS_LABELS,
} from '../lib/types';
import { getEncomendas, updateEncomendaStatus } from '../lib/supabase';

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

export function Encomendas() {
  const { selectedEmpresa, addToast } = useApp();
  const [encomendas, setEncomendas] = useState<Encomenda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EncomendaStatus | ''>('');

  // Details Modal
  const [selectedEncomenda, setSelectedEncomenda] = useState<Encomenda | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadEncomendas();
  }, [selectedEmpresa]);

  async function loadEncomendas() {
    if (!selectedEmpresa) return;

    try {
      setIsLoading(true);
      const data = await getEncomendas(selectedEmpresa.id);
      setEncomendas(data);
    } catch (error) {
      console.error('Error loading encomendas:', error);
      addToast({
        type: 'error',
        title: 'Erro ao carregar encomendas',
      });
    } finally {
      setIsLoading(false);
    }
  }

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

  // Filter
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

  const columns = [
    {
      key: 'id',
      header: '#',
      width: '80px',
      render: (e: Encomenda) => (
        <span className="font-mono text-gold-500">#{e.id}</span>
      ),
    },
    {
      key: 'comprador',
      header: 'Comprador',
      sortable: true,
      render: (e: Encomenda) => (
        <div className="flex items-center gap-3">
          <Avatar name={e.comprador} size="sm" />
          <span className="font-heading text-parchment-100">{e.comprador}</span>
        </div>
      ),
    },
    {
      key: 'itens',
      header: 'Itens',
      render: (e: Encomenda) => (
        <Badge variant="default">
          {e.itens_json?.length || 0} itens
        </Badge>
      ),
    },
    {
      key: 'valor_total',
      header: 'Valor',
      sortable: true,
      render: (e: Encomenda) => (
        <span className="font-heading text-gold-500">
          {formatCurrency(e.valor_total)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (e: Encomenda) => <StatusStamp status={e.status} />,
    },
    {
      key: 'data_criacao',
      header: 'Data',
      sortable: true,
      render: (e: Encomenda) => (
        <span className="text-parchment-400 text-sm">
          {formatDate(e.data_criacao)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      render: (e: Encomenda) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedEncomenda(e);
            setShowDetailsModal(true);
          }}
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
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-gold-500">Encomendas</h1>
          <p className="text-parchment-400 mt-1">
            Pedidos e entregas de {selectedEmpresa?.nome}
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-western bg-whiskey-900/30">
              <Clock className="w-6 h-6 text-whiskey-400" />
            </div>
            <div>
              <p className="text-2xl font-display text-gold-500">
                {stats.pendentes}
              </p>
              <p className="text-xs text-parchment-500 uppercase tracking-wider">
                Pendentes
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-western bg-gold-900/30">
              <Package className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <p className="text-2xl font-display text-gold-500">
                {stats.emAndamento}
              </p>
              <p className="text-xs text-parchment-500 uppercase tracking-wider">
                Em Andamento
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-western bg-green-900/30">
              <TruckIcon className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-display text-gold-500">
                {stats.entregues}
              </p>
              <p className="text-xs text-parchment-500 uppercase tracking-wider">
                Entregues
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-western bg-leather-800/50">
              <ClipboardList className="w-6 h-6 text-gold-500" />
            </div>
            <div>
              <p className="text-2xl font-display text-gold-500">
                {formatCurrency(stats.valorTotal)}
              </p>
              <p className="text-xs text-parchment-500 uppercase tracking-wider">
                Total Entregue
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
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as EncomendaStatus | '')}
                  className="select-western py-2 text-sm w-48"
                >
                  <option value="">Todos os Status</option>
                  <option value="pendente">Pendente</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="entregue">Entregue</option>
                </select>

                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-leather-500"
                  />
                  <input
                    type="text"
                    placeholder="Buscar encomenda..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-western pl-9 py-2 text-sm w-64"
                  />
                </div>
              </div>
            }
          >
            <h2 className="font-heading text-lg text-parchment-100">
              Lista de Encomendas
            </h2>
          </CardHeader>

          <CardContent className="p-0">
            <Table
              data={filteredEncomendas}
              columns={columns}
              keyExtractor={(e) => e.id}
              isLoading={isLoading}
              emptyMessage="Nenhuma encomenda encontrada"
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={`Encomenda #${selectedEncomenda?.id}`}
        size="lg"
      >
        {selectedEncomenda && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="flex items-center justify-between p-4 bg-leather-800/30 rounded-western">
              <div className="flex items-center gap-4">
                <Avatar name={selectedEncomenda.comprador} size="lg" />
                <div>
                  <p className="font-heading text-lg text-parchment-100">
                    {selectedEncomenda.comprador}
                  </p>
                  <p className="text-sm text-parchment-500">
                    Criado em: {formatDateTime(selectedEncomenda.data_criacao)}
                  </p>
                </div>
              </div>
              <StatusStamp status={selectedEncomenda.status} />
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-heading text-sm text-parchment-400 uppercase tracking-wider mb-3">
                Itens do Pedido
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedEncomenda.itens_json?.map((item, index) => {
                  const progress =
                    (item.quantidade_entregue / item.quantidade) * 100;

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-leather-800/30 rounded-western"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-heading text-sm text-parchment-100">
                            {item.nome || item.codigo}
                          </span>
                          <span className="text-sm text-parchment-400">
                            {item.quantidade_entregue}/{item.quantidade}
                          </span>
                        </div>
                        <Progress value={progress} />
                      </div>
                      <div className="ml-4 text-right">
                        <p className="font-heading text-gold-500">
                          {formatCurrency(item.valor_unitario * item.quantidade)}
                        </p>
                        <p className="text-xs text-parchment-500">
                          {formatCurrency(item.valor_unitario)}/un
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Total */}
            <div className="flex items-center justify-between p-4 bg-gold-900/20 rounded-western border border-gold-600/30">
              <span className="font-heading text-parchment-300 uppercase">
                Valor Total
              </span>
              <span className="text-2xl font-display text-gold-500">
                {formatCurrency(selectedEncomenda.valor_total)}
              </span>
            </div>

            {/* Delivery Info */}
            {selectedEncomenda.data_entrega && (
              <div className="flex items-center gap-3 p-3 bg-green-900/20 rounded-western border border-green-600/30">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-sm text-green-300">
                  Entregue em: {formatDateTime(selectedEncomenda.data_entrega)}
                </span>
              </div>
            )}

            {/* Actions */}
            <ModalFooter>
              <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                Fechar
              </Button>

              {selectedEncomenda.status === 'pendente' && (
                <Button
                  variant="gold"
                  onClick={() => handleUpdateStatus(selectedEncomenda.id, 'em_andamento')}
                  leftIcon={<Package size={16} />}
                >
                  Iniciar Preparo
                </Button>
              )}

              {selectedEncomenda.status === 'em_andamento' && (
                <Button
                  variant="gold"
                  onClick={() => handleUpdateStatus(selectedEncomenda.id, 'entregue')}
                  leftIcon={<TruckIcon size={16} />}
                >
                  Marcar Entregue
                </Button>
              )}
            </ModalFooter>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
