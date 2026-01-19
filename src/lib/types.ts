// Database Types for Bot Fazendeiro

export interface TipoEmpresa {
  id: number;
  codigo: string;
  nome: string;
  descricao: string;
  cor_hex: string;
  icone: string;
  ativo: boolean;
}

export interface Empresa {
  id: number;
  guild_id: string;
  nome: string;
  tipo_empresa_id: number;
  proprietario_discord_id: string;
  data_criacao: string;
  ativo: boolean;
  // Joined data
  tipo_empresa?: TipoEmpresa;
}

export interface ProdutoReferencia {
  id: number;
  tipo_empresa_id: number;
  codigo: string;
  nome: string;
  categoria: string;
  preco_minimo: number;
  preco_maximo: number;
  unidade: string;
  ativo: boolean;
}

export interface ProdutoEmpresa {
  id: number;
  empresa_id: number;
  produto_referencia_id: number;
  preco_venda: number;
  preco_pagamento_funcionario: number;
  estoque_atual: number;
  ativo: boolean;
  // Joined data
  produto_referencia?: ProdutoReferencia;
}

export interface Funcionario {
  id: number;
  discord_id: string;
  nome: string;
  saldo: number;
  data_cadastro: string;
  ativo: boolean;
  empresa_id: number;
  channel_id: string;
  // Computed
  estoque_valor?: number;
  itens_estoque?: number;
}

export interface EstoqueProduto {
  id: number;
  funcionario_id: number;
  empresa_id: number;
  produto_codigo: string;
  quantidade: number;
  data_atualizacao: string;
  // Joined data
  produto?: ProdutoEmpresa;
}

export interface EncomendaItem {
  codigo: string;
  nome: string;
  quantidade: number;
  quantidade_entregue: number;
  valor_unitario: number;
}

export type EncomendaStatus = 'pendente' | 'em_andamento' | 'entregue';

export interface Encomenda {
  id: number;
  empresa_id: number;
  comprador: string;
  itens_json: EncomendaItem[];
  valor_total: number;
  status: EncomendaStatus;
  funcionario_responsavel_id: number | null;
  data_criacao: string;
  data_entrega: string | null;
  // Joined data
  funcionario_responsavel?: Funcionario;
}

export interface HistoricoPagamento {
  id: number;
  funcionario_id: number;
  tipo: string;
  valor: number;
  descricao: string;
  data_pagamento: string;
  // Joined data
  funcionario?: Funcionario;
}

// Dashboard Stats
export interface DashboardStats {
  totalFuncionarios: number;
  totalProdutos: number;
  valorEstoqueTotal: number;
  saldoTotalFuncionarios: number;
  encomendasPendentes: number;
  encomendasEntregues: number;
  receitaMensal: number;
}

// Charts Data
export interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string;
}

export interface RevenueChartData {
  mes: string;
  receita: number;
  pagamentos: number;
}

// Filter/Sort Types
export type SortDirection = 'asc' | 'desc';

export interface TableSort {
  column: string;
  direction: SortDirection;
}

export interface TableFilter {
  search: string;
  category?: string;
  status?: string;
}

// Form Types
export interface ProductPriceForm {
  preco_venda: number;
  preco_pagamento_funcionario: number;
}

export interface NewOrderForm {
  comprador: string;
  itens: {
    codigo: string;
    quantidade: number;
  }[];
}

// UI Types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Business Type Icons Map
export const BUSINESS_ICONS: Record<string, string> = {
  fazenda: '🌾',
  restaurante: '🍽️',
  bar: '🍺',
  padaria: '🥖',
  acougue: '🥩',
  grafica: '🖨️',
  estabulo: '🐴',
  artesanato: '🧶',
  jornal: '📰',
  atelie: '🎨',
  cavalaria: '🏇',
  tabacaria: '🚬',
  tatuagem: '💉',
  ferraria: '⚒️',
  madeireira: '🪵',
  mineradora: '⛏️',
  clinica: '🏥',
  mercearia: '🏪',
  bercario: '👶',
  agroindustria: '🏭',
  cartorio: '📜',
  armaria: '🔫',
  municoes: '💣',
  passaros: '🐦',
  nativo: '🪶',
};

// Status Colors
export const STATUS_COLORS: Record<EncomendaStatus, string> = {
  pendente: 'stamp-pending',
  em_andamento: 'stamp-progress',
  entregue: 'stamp-delivered',
};

// Format helpers
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

// Status Labels
export const STATUS_LABELS: Record<EncomendaStatus, string> = {
  pendente: 'Pendente',
  em_andamento: 'Em Andamento',
  entregue: 'Entregue',
};
