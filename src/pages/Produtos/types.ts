import type { ProdutoEmpresa, ProdutoReferencia, TipoEmpresa } from '../../lib/types';

export interface ProdutoRefForm {
  tipo_empresa_id: number;
  codigo: string;
  nome: string;
  categoria: string;
  preco_minimo: number;
  preco_maximo: number;
  unidade: string;
  ativo: boolean;
}

export const emptyProdutoForm: ProdutoRefForm = {
  tipo_empresa_id: 0,
  codigo: '',
  nome: '',
  categoria: '',
  preco_minimo: 0,
  preco_maximo: 0,
  unidade: 'un',
  ativo: true,
};

export type ProdutoReferenciaWithTipo = ProdutoReferencia & { tipo_empresa?: TipoEmpresa };

export interface UseProdutosReturn {
  // Data
  produtos: ProdutoEmpresa[];
  categorias: string[];
  produtosReferencia: ProdutoReferenciaWithTipo[];
  tiposEmpresa: TipoEmpresa[];
  filteredProdutos: ProdutoEmpresa[];

  // Stats
  totalEstoque: number;
  valorTotalEstoque: number;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;

  // Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategoria: string;
  setSelectedCategoria: (categoria: string) => void;

  // Edit Price Modal
  editingProduct: ProdutoEmpresa | null;
  editPrecoVenda: string;
  editPrecoPagamento: string;
  setEditPrecoVenda: (value: string) => void;
  setEditPrecoPagamento: (value: string) => void;
  openEditModal: (produto: ProdutoEmpresa) => void;
  closeEditModal: () => void;
  handleSavePrice: () => Promise<void>;

  // Admin CRUD
  showCreateModal: boolean;
  showEditRefModal: boolean;
  showDeleteModal: boolean;
  selectedProdutoRef: ProdutoReferencia | null;
  produtoForm: ProdutoRefForm;
  adminError: string | null;
  adminSuccess: string | null;

  // Admin actions
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditRefModal: (produto: ProdutoReferencia) => void;
  closeEditRefModal: () => void;
  openDeleteModal: (produto: ProdutoReferencia) => void;
  closeDeleteModal: () => void;
  setProdutoForm: (form: ProdutoRefForm) => void;
  setAdminError: (error: string | null) => void;
  handleCreateProduto: () => Promise<void>;
  handleUpdateRef: () => Promise<void>;
  handleDeleteProduto: () => Promise<void>;
  handleBulkPrecos: (mode: 'min' | 'medio' | 'max') => Promise<void>;
  slugify: (text: string) => string;

  // Refresh
  loadData: () => Promise<void>;
}
