import type { Funcionario, ProdutoEmpresa } from '../../lib/types';
import type { EstoqueGlobalItem } from '../../lib/supabase';

export interface EstoqueAgregado {
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

export interface AjustarForm {
  funcionario_id: number;
  produto_codigo: string;
  quantidade: number;
}

export interface EstoqueStats {
  totalItens: number;
  valorTotal: number;
  produtosDistintos: number;
  funcionariosComEstoque: number;
}

export interface UseEstoqueReturn {
  // Data
  estoqueData: EstoqueGlobalItem[];
  funcionarios: Funcionario[];
  produtos: ProdutoEmpresa[];
  estoqueAgregado: EstoqueAgregado[];
  estoqueFuncionario: EstoqueGlobalItem[];
  filteredAgregado: EstoqueAgregado[];
  filteredFuncionario: EstoqueGlobalItem[];
  stats: EstoqueStats;
  produtoCodigos: string[];
  funcionariosComEstoque: Funcionario[];

  // Loading states
  isLoading: boolean;
  isSaving: boolean;

  // UI state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: 'global' | 'funcionario';
  setActiveTab: (tab: 'global' | 'funcionario') => void;
  expandedRows: Set<string>;
  toggleRow: (codigo: string) => void;
  selectedFuncionarioFilter: number | null;
  setSelectedFuncionarioFilter: (id: number | null) => void;
  myFuncionarioId: number | null;

  // Ajustar Modal
  showAjustarModal: boolean;
  ajustarForm: AjustarForm;
  setAjustarForm: (form: AjustarForm) => void;
  openAjustarModal: (funcionarioId?: number, produtoCodigo?: string, quantidade?: number) => void;
  closeAjustarModal: () => void;
  handleAjustar: () => Promise<void>;

  // Zerar Modal
  showZerarModal: boolean;
  zerarFuncionarioId: number | null;
  openZerarModal: (funcionarioId: number) => void;
  closeZerarModal: () => void;
  handleZerar: () => Promise<void>;

  // Refresh
  loadData: () => Promise<void>;
}
