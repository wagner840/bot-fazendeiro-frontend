import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  Search,
  Eye,
  Check,
  Clock,
  Package,
  TruckIcon,
  Plus,
  Trash2,
  Edit2,
  X,
  AlertTriangle,
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
import {
  getEncomendas,
  updateEncomendaStatus,
  createEncomenda,
  updateEncomenda,
  deleteEncomenda,
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

// Form para criar/editar encomenda
interface EncomendaForm {
  comprador: string;
  valor_total: number;
  status: EncomendaStatus;
}

const emptyEncomendaForm: EncomendaForm = {
  comprador: '',
  valor_total: 0,
  status: 'pendente',
};

export function Encomendas() {
  const { selectedEmpresa, addToast } = useApp();
  const { isAdmin } = useAuth();
  const [encomendas, setEncomendas] = useState<Encomenda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  const [isSaving, setIsSaving] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);

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

  // ============ ADMIN CRUD FUNCTIONS ============

  function openCreateModal() {
    setEncomendaForm(emptyEncomendaForm);
    setShowCreateModal(true);
    setAdminError(null);
  }

  function openEditModal(encomenda: Encomenda) {
    setSelectedEncomenda(encomenda);
    setEncomendaForm({
      comprador: encomenda.comprador,
      valor_total: encomenda.valor_total,
      status: encomenda.status,
    });
    setShowEditModal(true);
    setAdminError(null);
  }

  function openDeleteModal(encomenda: Encomenda) {
    setSelectedEncomenda(encomenda);
    setShowDeleteModal(true);
  }

  async function handleCreateEncomenda() {
    if (!encomendaForm.comprador.trim()) {
      setAdminError('Nome do comprador é obrigatório');
      return;
    }

    if (!selectedEmpresa) return;

    try {
      setIsSaving(true);
      setAdminError(null);
      await createEncomenda({
        empresa_id: selectedEmpresa.id,
        comprador: encomendaForm.comprador.trim(),
        valor_total: encomendaForm.valor_total,
        status: encomendaForm.status,
        itens_json: [],
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

      const updateData: Partial<Encomenda> = {
        comprador: encomendaForm.comprador.trim(),
        valor_total: encomendaForm.valor_total,
        status: encomendaForm.status,
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
      width: isAdmin ? '180px' : '100px',
      render: (e: Encomenda) => (
        <div className="flex items-center gap-1">
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
          {isAdmin && (
            <>
              <button
                onClick={() => openEditModal(e)}
                className="p-1.5 text-parchment-400 hover:text-gold-400 transition-colors"
                title="Editar"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => openDeleteModal(e)}
                className="p-1.5 text-parchment-400 hover:text-rust-400 transition-colors"
                title="Excluir"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
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
          <h1 className="font-display text-2xl sm:text-3xl text-gold-500">Encomendas</h1>
          <p className="text-parchment-400 mt-1 text-sm sm:text-base">
            Pedidos e entregas de {selectedEmpresa?.nome}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openCreateModal} leftIcon={<Plus size={16} />} className="w-full sm:w-auto">
            Nova Encomenda
          </Button>
        )}
      </motion.div>

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
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as EncomendaStatus | '')}
                  className="select-western py-2 text-sm w-full sm:w-48"
                >
                  <option value="">Todos os Status</option>
                  <option value="pendente">Pendente</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="entregue">Entregue</option>
                </select>

                <div className="relative flex-1 sm:flex-none">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-leather-500"
                  />
                  <input
                    type="text"
                    placeholder="Buscar encomenda..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-western pl-9 py-2 text-sm w-full sm:w-64"
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 sm:p-4 bg-leather-800/30 rounded-western">
              <div className="flex items-center gap-3 sm:gap-4">
                <Avatar name={selectedEncomenda.comprador} size="lg" />
                <div>
                  <p className="font-heading text-base sm:text-lg text-parchment-100">
                    {selectedEncomenda.comprador}
                  </p>
                  <p className="text-xs sm:text-sm text-parchment-500">
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

      {/* Admin Create Encomenda Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Nova Encomenda" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-parchment-400 mb-1">Comprador *</label>
            <Input
              value={encomendaForm.comprador}
              onChange={(e) => setEncomendaForm({ ...encomendaForm, comprador: e.target.value })}
              placeholder="Nome do cliente"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-parchment-400 mb-1">Valor Total</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={encomendaForm.valor_total}
                onChange={(e) => setEncomendaForm({ ...encomendaForm, valor_total: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm text-parchment-400 mb-1">Status</label>
              <select
                value={encomendaForm.status}
                onChange={(e) => setEncomendaForm({ ...encomendaForm, status: e.target.value as EncomendaStatus })}
                className="input-western w-full"
              >
                <option value="pendente">Pendente</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="entregue">Entregue</option>
              </select>
            </div>
          </div>

          {adminError && (
            <div className="p-3 bg-rust-900/30 border border-rust-700 rounded-western text-rust-400 text-sm">
              {adminError}
            </div>
          )}

          <ModalFooter className="flex-col-reverse sm:flex-row">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleCreateEncomenda} isLoading={isSaving} leftIcon={<Plus size={16} />} className="w-full sm:w-auto">
              Criar Encomenda
            </Button>
          </ModalFooter>
        </div>
      </Modal>

      {/* Admin Edit Encomenda Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Editar Encomenda" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-parchment-400 mb-1">Comprador *</label>
            <Input
              value={encomendaForm.comprador}
              onChange={(e) => setEncomendaForm({ ...encomendaForm, comprador: e.target.value })}
              placeholder="Nome do cliente"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-parchment-400 mb-1">Valor Total</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={encomendaForm.valor_total}
                onChange={(e) => setEncomendaForm({ ...encomendaForm, valor_total: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm text-parchment-400 mb-1">Status</label>
              <select
                value={encomendaForm.status}
                onChange={(e) => setEncomendaForm({ ...encomendaForm, status: e.target.value as EncomendaStatus })}
                className="input-western w-full"
              >
                <option value="pendente">Pendente</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="entregue">Entregue</option>
              </select>
            </div>
          </div>

          {adminError && (
            <div className="p-3 bg-rust-900/30 border border-rust-700 rounded-western text-rust-400 text-sm">
              {adminError}
            </div>
          )}

          <ModalFooter className="flex-col-reverse sm:flex-row">
            <Button variant="secondary" onClick={() => setShowEditModal(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleUpdateEncomenda} isLoading={isSaving} leftIcon={<Check size={16} />} className="w-full sm:w-auto">
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
            Excluir Encomenda?
          </h2>

          <p className="text-parchment-400 mb-6">
            Tem certeza que deseja excluir a encomenda{' '}
            <span className="text-gold-500 font-mono">#{selectedEncomenda?.id}</span>
            {' '}de {selectedEncomenda?.comprador}?
            <br />
            Esta ação não pode ser desfeita.
          </p>

          <div className="flex flex-col-reverse sm:flex-row justify-center gap-2 sm:gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteEncomenda}
              isLoading={isSaving}
              className="bg-rust-600 hover:bg-rust-700 w-full sm:w-auto"
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
