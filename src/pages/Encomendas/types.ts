import type { Encomenda, EncomendaStatus, ProdutoEmpresa } from '../../lib/types';

export interface EncomendaItemForm {
  codigo: string;
  nome: string;
  quantidade: number;
  valor_unitario: number;
}

export interface EncomendaForm {
  comprador: string;
  valor_total: number;
  status: EncomendaStatus;
  itens: EncomendaItemForm[];
}

export const emptyEncomendaForm: EncomendaForm = {
  comprador: '',
  valor_total: 0,
  status: 'pendente',
  itens: [],
};

export interface EncomendaStats {
  pendentes: number;
  emAndamento: number;
  entregues: number;
  valorTotal: number;
}

export interface UseEncomendasReturn {
  // Data
  encomendas: Encomenda[];
  filteredEncomendas: Encomenda[];
  produtos: ProdutoEmpresa[];
  stats: EncomendaStats;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;

  // Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: EncomendaStatus | '';
  setStatusFilter: (status: EncomendaStatus | '') => void;

  // Details Modal
  selectedEncomenda: Encomenda | null;
  showDetailsModal: boolean;
  openDetailsModal: (encomenda: Encomenda) => void;
  closeDetailsModal: () => void;
  handleUpdateStatus: (id: number, newStatus: EncomendaStatus) => Promise<void>;

  // Admin CRUD
  showCreateModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
  encomendaForm: EncomendaForm;
  adminError: string | null;
  adminSuccess: string | null;

  // Admin actions
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (encomenda: Encomenda) => void;
  closeEditModal: () => void;
  openDeleteModal: (encomenda: Encomenda) => void;
  closeDeleteModal: () => void;
  setEncomendaForm: (form: EncomendaForm) => void;
  setAdminError: (error: string | null) => void;
  handleCreateEncomenda: () => Promise<void>;
  handleUpdateEncomenda: () => Promise<void>;
  handleDeleteEncomenda: () => Promise<void>;

  // Refresh
  loadEncomendas: () => Promise<void>;
}
