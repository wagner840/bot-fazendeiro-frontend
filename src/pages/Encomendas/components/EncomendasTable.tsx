import { motion } from 'framer-motion';
import { Search, Eye, Edit2, Trash2, ClipboardList } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  Button,
  Badge,
  StatusStamp,
  Avatar,
} from '../../../components/ui';
import {
  formatCurrency,
  formatDate,
  type Encomenda,
  type EncomendaStatus,
} from '../../../lib/types';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface EncomendasTableProps {
  encomendas: Encomenda[];
  isLoading: boolean;
  searchQuery: string;
  statusFilter: EncomendaStatus | '';
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (status: EncomendaStatus | '') => void;
  onViewDetails: (encomenda: Encomenda) => void;
  onEdit: (encomenda: Encomenda) => void;
  onDelete: (encomenda: Encomenda) => void;
  isAdmin: boolean;
}

export function EncomendasTable({
  encomendas,
  isLoading,
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onViewDetails,
  onEdit,
  onDelete,
  isAdmin,
}: EncomendasTableProps) {
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
            onClick={() => onViewDetails(e)}
            leftIcon={<Eye size={14} />}
          >
            Detalhes
          </Button>
          {isAdmin && (
            <>
              <button
                onClick={() => onEdit(e)}
                className="p-1.5 text-parchment-400 hover:text-gold-400 transition-colors"
                title="Editar"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => onDelete(e)}
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
    <motion.div variants={item}>
      <Card>
        <CardHeader
          action={
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value as EncomendaStatus | '')}
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
                  onChange={(e) => onSearchChange(e.target.value)}
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
            data={encomendas}
            columns={columns}
            keyExtractor={(e) => e.id}
            isLoading={isLoading}
            emptyMessage="Nenhuma encomenda encontrada"
            emptyIcon={<ClipboardList className="w-12 h-12" />}
            emptyHint="Use !encomenda codigo quantidade no Discord"
            mobileCardRender={(e) => (
              <div
                className="p-4 hover:bg-leather-800/30 transition-colors"
                onClick={() => onViewDetails(e)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar name={e.comprador} size="sm" />
                    <span className="font-heading text-sm text-parchment-100">{e.comprador}</span>
                  </div>
                  <StatusStamp status={e.status} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-parchment-400">{e.itens_json?.length || 0} itens</span>
                  <span className="font-heading text-gold-500">{formatCurrency(e.valor_total)}</span>
                </div>
              </div>
            )}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
