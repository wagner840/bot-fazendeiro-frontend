import { createClient } from '@supabase/supabase-js';
import type {
  Empresa,
  TipoEmpresa,
  Funcionario,
  ProdutoEmpresa,
  ProdutoReferencia,
  Encomenda,
  HistoricoPagamento,
  EstoqueProduto,
  DashboardStats,
} from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not found. Using mock data.');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// ============ EMPRESA FUNCTIONS ============

export async function getEmpresas(): Promise<Empresa[]> {
  const { data, error } = await supabase
    .from('empresas')
    .select(`
      *,
      tipo_empresa:tipos_empresa(*)
    `)
    .eq('ativo', true)
    .order('nome');

  if (error) throw error;
  return data || [];
}

export async function getEmpresaById(id: number): Promise<Empresa | null> {
  const { data, error } = await supabase
    .from('empresas')
    .select(`
      *,
      tipo_empresa:tipos_empresa(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getEmpresaByGuild(guildId: string): Promise<Empresa | null> {
  const { data, error } = await supabase
    .from('empresas')
    .select(`
      *,
      tipo_empresa:tipos_empresa(*)
    `)
    .eq('guild_id', guildId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// ============ TIPOS EMPRESA FUNCTIONS ============

export async function getTiposEmpresa(): Promise<TipoEmpresa[]> {
  const { data, error } = await supabase
    .from('tipos_empresa')
    .select('*')
    .eq('ativo', true)
    .order('nome');

  if (error) throw error;
  return data || [];
}

// ============ FUNCIONARIO FUNCTIONS ============

export async function getFuncionarios(empresaId: number): Promise<Funcionario[]> {
  const { data, error } = await supabase
    .from('funcionarios')
    .select('*')
    .eq('empresa_id', empresaId)
    .eq('ativo', true)
    .order('nome');

  if (error) throw error;
  return data || [];
}

export async function getFuncionarioById(id: number): Promise<Funcionario | null> {
  const { data, error } = await supabase
    .from('funcionarios')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateFuncionarioSaldo(id: number, novoSaldo: number): Promise<void> {
  const { error } = await supabase
    .from('funcionarios')
    .update({ saldo: novoSaldo })
    .eq('id', id);

  if (error) throw error;
}

export async function createFuncionario(funcionario: Partial<Funcionario>): Promise<Funcionario> {
  const { data, error } = await supabase
    .from('funcionarios')
    .insert(funcionario)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============ PRODUTO FUNCTIONS ============

export async function getProdutosReferencia(tipoEmpresaId: number): Promise<ProdutoReferencia[]> {
  const { data, error } = await supabase
    .from('produtos_referencia')
    .select('*')
    .eq('tipo_empresa_id', tipoEmpresaId)
    .eq('ativo', true)
    .order('categoria')
    .order('nome');

  if (error) throw error;
  return data || [];
}

export async function getProdutosEmpresa(empresaId: number): Promise<ProdutoEmpresa[]> {
  const { data, error } = await supabase
    .from('produtos_empresa')
    .select(`
      *,
      produto_referencia:produtos_referencia(*)
    `)
    .eq('empresa_id', empresaId)
    .eq('ativo', true)
    .order('id');

  if (error) throw error;
  return data || [];
}

export async function updateProdutoPreco(
  id: number,
  precoVenda: number,
  precoPagamento: number
): Promise<void> {
  const { error } = await supabase
    .from('produtos_empresa')
    .update({
      preco_venda: precoVenda,
      preco_pagamento_funcionario: precoPagamento,
    })
    .eq('id', id);

  if (error) throw error;
}

export async function updateProdutoEstoque(id: number, quantidade: number): Promise<void> {
  const { error } = await supabase
    .from('produtos_empresa')
    .update({ estoque_atual: quantidade })
    .eq('id', id);

  if (error) throw error;
}

// ============ ESTOQUE FUNCTIONS ============

export async function getEstoqueFuncionario(funcionarioId: number): Promise<EstoqueProduto[]> {
  const { data, error } = await supabase
    .from('estoque_produtos')
    .select('*')
    .eq('funcionario_id', funcionarioId)
    .gt('quantidade', 0)
    .order('produto_codigo');

  if (error) throw error;
  return data || [];
}

export async function getEstoqueGlobal(empresaId: number): Promise<EstoqueProduto[]> {
  const { data, error } = await supabase
    .from('estoque_produtos')
    .select('*')
    .eq('empresa_id', empresaId)
    .gt('quantidade', 0);

  if (error) throw error;
  return data || [];
}

// ============ ENCOMENDA FUNCTIONS ============

export async function getEncomendas(empresaId: number): Promise<Encomenda[]> {
  const { data, error } = await supabase
    .from('encomendas')
    .select(`
      *,
      funcionario_responsavel:funcionarios(*)
    `)
    .eq('empresa_id', empresaId)
    .order('data_criacao', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getEncomendasByStatus(
  empresaId: number,
  status: string
): Promise<Encomenda[]> {
  const { data, error } = await supabase
    .from('encomendas')
    .select(`
      *,
      funcionario_responsavel:funcionarios(*)
    `)
    .eq('empresa_id', empresaId)
    .eq('status', status)
    .order('data_criacao', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateEncomendaStatus(
  id: number,
  status: string,
  dataEntrega?: string
): Promise<void> {
  const updateData: Record<string, unknown> = { status };
  if (dataEntrega) {
    updateData.data_entrega = dataEntrega;
  }

  const { error } = await supabase
    .from('encomendas')
    .update(updateData)
    .eq('id', id);

  if (error) throw error;
}

export async function createEncomenda(encomenda: Partial<Encomenda>): Promise<Encomenda> {
  const { data, error } = await supabase
    .from('encomendas')
    .insert(encomenda)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============ HISTORICO PAGAMENTOS FUNCTIONS ============

export async function getHistoricoPagamentos(empresaId: number): Promise<HistoricoPagamento[]> {
  const { data, error } = await supabase
    .from('historico_pagamentos')
    .select(`
      *,
      funcionario:funcionarios!inner(empresa_id, nome)
    `)
    .eq('funcionario.empresa_id', empresaId)
    .order('data_pagamento', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getHistoricoPagamentosFuncionario(
  funcionarioId: number
): Promise<HistoricoPagamento[]> {
  const { data, error } = await supabase
    .from('historico_pagamentos')
    .select('*')
    .eq('funcionario_id', funcionarioId)
    .order('data_pagamento', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createPagamento(pagamento: Partial<HistoricoPagamento>): Promise<void> {
  const { error } = await supabase
    .from('historico_pagamentos')
    .insert(pagamento);

  if (error) throw error;
}

// ============ DASHBOARD STATS ============

export async function getDashboardStats(empresaId: number): Promise<DashboardStats> {
  // Get funcionarios count and total saldo
  const { data: funcionarios } = await supabase
    .from('funcionarios')
    .select('saldo')
    .eq('empresa_id', empresaId)
    .eq('ativo', true);

  const totalFuncionarios = funcionarios?.length || 0;
  const saldoTotalFuncionarios = funcionarios?.reduce((sum, f) => sum + (f.saldo || 0), 0) || 0;

  // Get produtos count and estoque value
  const { data: produtos } = await supabase
    .from('produtos_empresa')
    .select('estoque_atual, preco_venda')
    .eq('empresa_id', empresaId)
    .eq('ativo', true);

  const totalProdutos = produtos?.length || 0;
  const valorEstoqueTotal =
    produtos?.reduce((sum, p) => sum + (p.estoque_atual || 0) * (p.preco_venda || 0), 0) || 0;

  // Get encomendas stats
  const { data: encomendas } = await supabase
    .from('encomendas')
    .select('status, valor_total, data_criacao')
    .eq('empresa_id', empresaId);

  const encomendasPendentes =
    encomendas?.filter((e) => e.status === 'pendente' || e.status === 'em_andamento').length || 0;
  const encomendasEntregues = encomendas?.filter((e) => e.status === 'entregue').length || 0;

  // Calculate monthly revenue (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const receitaMensal =
    encomendas
      ?.filter((e) => e.status === 'entregue' && new Date(e.data_criacao) >= thirtyDaysAgo)
      .reduce((sum, e) => sum + (e.valor_total || 0), 0) || 0;

  return {
    totalFuncionarios,
    totalProdutos,
    valorEstoqueTotal,
    saldoTotalFuncionarios,
    encomendasPendentes,
    encomendasEntregues,
    receitaMensal,
  };
}

// ============ CHART DATA FUNCTIONS ============

const CHART_COLORS = ['#d4a853', '#8b2635', '#6d4f28', '#4a7c59', '#c4a77d'];

export async function getRevenueChartData(empresaId: number): Promise<{ mes: string; receita: number; pagamentos: number }[]> {
  // Get last 6 months of data
  const months: { mes: string; receita: number; pagamentos: number }[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString();

    // Get revenue from delivered orders
    const { data: orders } = await supabase
      .from('encomendas')
      .select('valor_total')
      .eq('empresa_id', empresaId)
      .eq('status', 'entregue')
      .gte('data_entrega', startOfMonth)
      .lte('data_entrega', endOfMonth);

    const receita = orders?.reduce((sum, o) => sum + (o.valor_total || 0), 0) || 0;

    // Get payments made
    const { data: payments } = await supabase
      .from('historico_pagamentos')
      .select('valor, funcionario:funcionarios!inner(empresa_id)')
      .eq('funcionario.empresa_id', empresaId)
      .gte('data_pagamento', startOfMonth)
      .lte('data_pagamento', endOfMonth);

    const pagamentos = payments?.reduce((sum, p) => sum + (p.valor || 0), 0) || 0;

    months.push({
      mes: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      receita,
      pagamentos,
    });
  }

  return months;
}

export async function getCategoryDistribution(empresaId: number): Promise<{ name: string; value: number; fill: string }[]> {
  const { data: produtos, error } = await supabase
    .from('produtos_empresa')
    .select(`
      estoque_atual,
      preco_venda,
      produto_referencia:produtos_referencia(categoria)
    `)
    .eq('empresa_id', empresaId)
    .eq('ativo', true);

  if (error) throw error;

  // Group by category and calculate total value
  const categoryValues: Record<string, number> = {};
  let totalValue = 0;

  produtos?.forEach((p) => {
    const ref = p.produto_referencia as { categoria?: string } | { categoria?: string }[] | null;
    const categoria = ref ? (Array.isArray(ref) ? ref[0]?.categoria : ref.categoria) : 'Outros';
    const value = (p.estoque_atual || 0) * (p.preco_venda || 0);

    categoryValues[categoria || 'Outros'] = (categoryValues[categoria || 'Outros'] || 0) + value;
    totalValue += value;
  });

  // Convert to percentages
  const result = Object.entries(categoryValues)
    .map(([name, value], index) => ({
      name,
      value: totalValue > 0 ? Math.round((value / totalValue) * 100) : 0,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return result;
}

// ============ UTILITY FUNCTIONS ============

export async function getCategorias(empresaId: number): Promise<string[]> {
  const { data, error } = await supabase
    .from('produtos_empresa')
    .select(`
      produto_referencia:produtos_referencia(categoria)
    `)
    .eq('empresa_id', empresaId)
    .eq('ativo', true);

  if (error) throw error;

  const categorias = new Set<string>();
  data?.forEach((p) => {
    const ref = p.produto_referencia as { categoria?: string } | { categoria?: string }[] | null;
    if (ref) {
      const categoria = Array.isArray(ref) ? ref[0]?.categoria : ref.categoria;
      if (categoria) {
        categorias.add(categoria);
      }
    }
  });

  return Array.from(categorias).sort();
}

// ============ ADMIN: PRODUTOS REFERENCIA CRUD ============

export async function getAllProdutosReferencia(): Promise<ProdutoReferencia[]> {
  const { data, error } = await supabase
    .from('produtos_referencia')
    .select(`
      *,
      tipo_empresa:tipos_empresa(*)
    `)
    .order('tipo_empresa_id')
    .order('categoria')
    .order('nome');

  if (error) throw error;
  return data || [];
}

export async function createProdutoReferencia(
  produto: Omit<ProdutoReferencia, 'id'>
): Promise<ProdutoReferencia> {
  const { data, error } = await supabase
    .from('produtos_referencia')
    .insert(produto)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProdutoReferencia(
  id: number,
  produto: Partial<ProdutoReferencia>
): Promise<ProdutoReferencia> {
  const { data, error } = await supabase
    .from('produtos_referencia')
    .update(produto)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProdutoReferencia(id: number): Promise<void> {
  const { error } = await supabase
    .from('produtos_referencia')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============ ADMIN: ENCOMENDAS CRUD ============

export async function getAllEncomendas(): Promise<Encomenda[]> {
  const { data, error } = await supabase
    .from('encomendas')
    .select(`
      *,
      empresa:empresas(id, nome),
      funcionario_responsavel:funcionarios(*)
    `)
    .order('data_criacao', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateEncomenda(
  id: number,
  encomenda: Partial<Encomenda>
): Promise<Encomenda> {
  const { data, error } = await supabase
    .from('encomendas')
    .update(encomenda)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEncomenda(id: number): Promise<void> {
  const { error } = await supabase
    .from('encomendas')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
