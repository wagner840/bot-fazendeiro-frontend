// Re-export supabase client
export { supabase } from './client';

// Re-export empresa functions
export { getEmpresas, updateModoPagamento, getTiposEmpresa } from './empresa';

// Re-export funcionario functions
export { getFuncionarios } from './funcionario';

// Re-export produto functions
export {
  getProdutosEmpresa,
  createProdutoEmpresa,
  bulkUpdatePrecos,
  updateProdutoPreco,
  getCategorias,
  getAllProdutosReferencia,
  createProdutoReferencia,
  updateProdutoReferencia,
  deleteProdutoReferencia,
} from './produto';

// Re-export estoque functions
export {
  getEstoqueFuncionario,
  getEstoqueEmpresa,
  getEstoqueGlobal,
  ajustarEstoque,
  zerarEstoqueFuncionario,
} from './estoque';
export type { EstoqueGlobalItem } from './estoque';

// Re-export encomenda functions
export {
  getEncomendas,
  updateEncomendaStatus,
  createEncomenda,
  getAllEncomendas,
  updateEncomenda,
  deleteEncomenda,
} from './encomenda';

// Re-export pagamento functions
export {
  getHistoricoPagamentos,
  getHistoricoPagamentosFuncionario,
  zerarEstoqueComPagamento,
} from './pagamento';

// Re-export dashboard functions
export { getDashboardStats } from './dashboard';

// Re-export charts functions
export { getRevenueChartData, getCategoryDistribution } from './charts';

// Re-export auditoria functions
export {
  getHistoricoPagamentosEmpresa,
  getAuditoriaFuncionarios,
} from './auditoria';
export type { AuditoriaFuncionario } from './auditoria';

// Re-export notifications functions
export { getActivityFeed } from './notifications';
