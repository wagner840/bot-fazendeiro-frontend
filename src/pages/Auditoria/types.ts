import type { HistoricoPagamento } from '../../lib/types';
import type { AuditoriaFuncionario } from '../../lib/supabase';

// Payment type labels and colors
export const TIPO_LABELS: Record<string, string> = {
  estoque_acumulado: 'Estoque Acumulado',
  bonus: 'Bnus',
  ajuste: 'Ajuste',
  manual: 'Manual',
};

export const TIPO_VARIANTS: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'gold'> = {
  estoque_acumulado: 'gold',
  bonus: 'success',
  ajuste: 'warning',
  manual: 'default',
};

export interface AuditoriaStats {
  totalPagoHistorico: number;
  saldoTotal: number;
  estoqueTotal: number;
  funcionariosAtivos: number;
}

export interface UseAuditoriaReturn {
  // Data
  historico: HistoricoPagamento[];
  auditoriaFuncionarios: AuditoriaFuncionario[];
  filteredHistorico: HistoricoPagamento[];
  filteredResumo: AuditoriaFuncionario[];
  stats: AuditoriaStats;
  tiposUnicos: string[];

  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  loadingDetails: boolean;

  // Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: 'resumo' | 'historico';
  setActiveTab: (tab: 'resumo' | 'historico') => void;
  filterFuncionario: number | null;
  setFilterFuncionario: (id: number | null) => void;
  filterTipo: string;
  setFilterTipo: (tipo: string) => void;
  filterDateStart: string;
  setFilterDateStart: (date: string) => void;
  filterDateEnd: string;
  setFilterDateEnd: (date: string) => void;

  // Details modal
  showDetailsModal: boolean;
  selectedFuncionarioId: number | null;
  funcionarioHistorico: HistoricoPagamento[];
  openDetailsModal: (funcionarioId: number) => void;
  closeDetailsModal: () => void;

  // Pagar modal
  showPagarModal: boolean;
  pagarFuncionarioId: number | null;
  openPagarModal: (funcionarioId: number) => void;
  closePagarModal: () => void;
  handlePagarEstoque: () => Promise<void>;

  // Helpers
  getFuncionarioNome: (id: number | null) => string;
}
