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

/**
 * Fetches all active companies.
 * SECURITY: This query relies on Row Level Security (RLS) policies
 * to ensure users only see companies they are authorized to access.
 * See: pg_policies for 'empresas' table.
 */
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

/**
 * Updates the payment mode for a company.
 * @param empresaId - The ID of the company
 * @param modoPagamento - The new payment mode ('producao' or 'entrega')
 */
export async function updateModoPagamento(
  empresaId: number,
  modoPagamento: 'producao' | 'entrega'
): Promise<void> {
  const { error } = await supabase
    .from('empresas')
    .update({ modo_pagamento: modoPagamento })
    .eq('id', empresaId);

  if (error) throw error;
}

// ============ TIPOS EMPRESA FUNCTIONS ============

export async function getTiposEmpresa(baseRedmId?: number): Promise<TipoEmpresa[]> {
  let query = supabase
    .from('tipos_empresa')
    .select('*')
    .eq('ativo', true)
    .order('nome');

  if (baseRedmId) {
    query = query.eq('base_redm_id', baseRedmId);
  }

  const { data, error } = await query;

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



// ============ PRODUTO FUNCTIONS ============



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

export async function createProdutoEmpresa(
  empresaId: number,
  produtoReferenciaId: number,
  precoVenda: number,
  precoPagamento: number
): Promise<void> {
  const { error } = await supabase
    .from('produtos_empresa')
    .upsert(
      {
        empresa_id: empresaId,
        produto_referencia_id: produtoReferenciaId,
        preco_venda: precoVenda,
        preco_pagamento_funcionario: precoPagamento,
        estoque_atual: 0,
        ativo: true,
      },
      { onConflict: 'empresa_id,produto_referencia_id' }
    );

  if (error) throw error;
}

export async function bulkUpdatePrecos(
  empresaId: number,
  mode: 'min' | 'medio' | 'max'
): Promise<number> {
  // Fetch all produtos_empresa with their reference data
  const { data: produtos, error: fetchError } = await supabase
    .from('produtos_empresa')
    .select(`
      id,
      produto_referencia:produtos_referencia(preco_minimo, preco_maximo)
    `)
    .eq('empresa_id', empresaId)
    .eq('ativo', true);

  if (fetchError) throw fetchError;
  if (!produtos || produtos.length === 0) return 0;

  // Build updates
  const updates = produtos.map((p) => {
    const ref = p.produto_referencia as { preco_minimo: number; preco_maximo: number } | { preco_minimo: number; preco_maximo: number }[] | null;
    const minimo = ref ? (Array.isArray(ref) ? ref[0]?.preco_minimo : ref.preco_minimo) : 0;
    const maximo = ref ? (Array.isArray(ref) ? ref[0]?.preco_maximo : ref.preco_maximo) : 0;

    let precoVenda: number;
    if (mode === 'min') {
      precoVenda = minimo;
    } else if (mode === 'max') {
      precoVenda = maximo;
    } else {
      precoVenda = Math.round(((minimo + maximo) / 2) * 100) / 100;
    }

    const precoPagamento = Math.round(precoVenda * 0.25 * 100) / 100;

    return { id: p.id, preco_venda: precoVenda, preco_pagamento_funcionario: precoPagamento };
  });

  // Batch update each product
  for (const upd of updates) {
    const { error } = await supabase
      .from('produtos_empresa')
      .update({
        preco_venda: upd.preco_venda,
        preco_pagamento_funcionario: upd.preco_pagamento_funcionario,
      })
      .eq('id', upd.id);

    if (error) throw error;
  }

  return updates.length;
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

export async function getEstoqueEmpresa(empresaId: number): Promise<EstoqueProduto[]> {
  // Fetch all stock for the company to calculate values client-side
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



// ============ DASHBOARD STATS ============

export async function getDashboardStats(empresaId: number): Promise<DashboardStats> {
  // Use server-side RPC for a single optimized query
  const { data, error } = await supabase.rpc('get_dashboard_stats', {
    p_empresa_id: empresaId,
  });

  if (error) {
    console.error('Error fetching dashboard stats via RPC:', error);
    // Fallback to manual queries if RPC not available
    return getDashboardStatsFallback(empresaId);
  }

  if (data && data.length > 0) {
    const stats = data[0];
    return {
      totalFuncionarios: stats.total_funcionarios || 0,
      totalProdutos: stats.total_produtos || 0,
      valorEstoqueTotal: stats.valor_estoque_total || 0,
      saldoTotalFuncionarios: stats.saldo_total_funcionarios || 0,
      encomendasPendentes: stats.encomendas_pendentes || 0,
      encomendasEntregues: stats.encomendas_entregues || 0,
      receitaMensal: stats.receita_mensal || 0,
    };
  }

  return {
    totalFuncionarios: 0,
    totalProdutos: 0,
    valorEstoqueTotal: 0,
    saldoTotalFuncionarios: 0,
    encomendasPendentes: 0,
    encomendasEntregues: 0,
    receitaMensal: 0,
  };
}

async function getDashboardStatsFallback(empresaId: number): Promise<DashboardStats> {
  const { data: funcionarios } = await supabase
    .from('funcionarios')
    .select('saldo')
    .eq('empresa_id', empresaId)
    .eq('ativo', true);

  const totalFuncionarios = funcionarios?.length || 0;
  const saldoTotalFuncionarios = funcionarios?.reduce((sum, f) => sum + (f.saldo || 0), 0) || 0;

  const { data: produtos } = await supabase
    .from('produtos_empresa')
    .select('estoque_atual, preco_venda')
    .eq('empresa_id', empresaId)
    .eq('ativo', true);

  const totalProdutos = produtos?.length || 0;
  const valorEstoqueTotal =
    produtos?.reduce((sum, p) => sum + (p.estoque_atual || 0) * (p.preco_venda || 0), 0) || 0;

  const { data: encomendas } = await supabase
    .from('encomendas')
    .select('status, valor_total, data_criacao')
    .eq('empresa_id', empresaId);

  const encomendasPendentes =
    encomendas?.filter((e) => e.status === 'pendente' || e.status === 'em_andamento').length || 0;
  const encomendasEntregues = encomendas?.filter((e) => e.status === 'entregue').length || 0;

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

export async function getRevenueChartData(
  empresaId: number,
  period: 'week' | 'month' | 'year' = 'month'
): Promise<{ mes: string; receita: number; pagamentos: number }[]> {
  const dataMap: { [key: string]: { receita: number; pagamentos: number } } = {};
  const labels: string[] = [];
  const now = new Date();
  
  let startRange: Date;
  const endRange = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  // Initialize buckets based on period
  if (period === 'week') {
    // Last 7 days
    startRange = new Date(now);
    startRange.setDate(now.getDate() - 6);
    startRange.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const d = new Date(startRange);
      d.setDate(startRange.getDate() + i);
      const key = d.toLocaleDateString('pt-BR', { weekday: 'short' }); // Seg, Ter...
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      // We might have duplicate weekdays if we cross weeks? No, 7 days is unique. 
      // But let's use DD/MM to be precise if requested, but "Semana" usually implies days of week.
      // Let's stick to unique keys. If we just use weekday name, it handles 7 days fine.
      // Actually, let's use DD/MM for Month view and Weekday for Week view?
      // Plan said: Week -> "Seg", "Ter". Month -> "DD/MM". Year -> "Jan", "Fev".
      dataMap[label] = { receita: 0, pagamentos: 0 };
      labels.push(label);
    }
  } else if (period === 'month') {
    // Last 30 days
    startRange = new Date(now);
    startRange.setDate(now.getDate() - 29);
    startRange.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
        const d = new Date(startRange);
        d.setDate(startRange.getDate() + i);
        const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }); // 01/01
        dataMap[label] = { receita: 0, pagamentos: 0 };
        labels.push(label);
    }
  } else {
    // Year (Last 12 months)
    startRange = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const key = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      dataMap[label] = { receita: 0, pagamentos: 0 };
      labels.push(label);
    }
  }

  // 1. Fetch Orders
  const { data: orders } = await supabase
    .from('encomendas')
    .select('valor_total, data_entrega')
    .eq('empresa_id', empresaId)
    .eq('status', 'entregue')
    .gte('data_entrega', startRange.toISOString())
    .lte('data_entrega', endRange.toISOString());

  if (orders) {
    orders.forEach(o => {
      if (!o.data_entrega) return;
      const d = new Date(o.data_entrega);
      let label = '';

      if (period === 'week') {
         const key = d.toLocaleDateString('pt-BR', { weekday: 'short' });
         label = key.charAt(0).toUpperCase() + key.slice(1);
      } else if (period === 'month') {
         label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      } else {
         const key = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
         label = key.charAt(0).toUpperCase() + key.slice(1);
      }

      if (dataMap[label]) {
        dataMap[label].receita += (o.valor_total || 0);
      }
    });
  }

  // 2. Fetch Payments
  const { data: payments } = await supabase
    .from('historico_pagamentos')
    .select('valor, data_pagamento, funcionario:funcionarios!inner(empresa_id)')
    .eq('funcionario.empresa_id', empresaId)
    .gte('data_pagamento', startRange.toISOString())
    .lte('data_pagamento', endRange.toISOString());

  if (payments) {
    payments.forEach(p => {
      if (!p.data_pagamento) return;
      const d = new Date(p.data_pagamento);
      let label = '';

      if (period === 'week') {
         const key = d.toLocaleDateString('pt-BR', { weekday: 'short' });
         label = key.charAt(0).toUpperCase() + key.slice(1);
      } else if (period === 'month') {
         label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      } else {
         const key = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
         label = key.charAt(0).toUpperCase() + key.slice(1);
      }

      if (dataMap[label]) {
        dataMap[label].pagamentos += (p.valor || 0);
      }
    });
  }

  return labels.map(label => ({
    mes: label,
    receita: dataMap[label].receita,
    pagamentos: dataMap[label].pagamentos
  }));
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

export async function getAllProdutosReferencia(guildId?: string): Promise<ProdutoReferencia[]> {
  let query = supabase
    .from('produtos_referencia')
    .select(`
      *,
      tipo_empresa:tipos_empresa(*)
    `);

  if (guildId) {
    query = query.or(`guild_id.is.null,guild_id.eq.${guildId}`);
  }

  query = query
    .order('tipo_empresa_id')
    .order('categoria')
    .order('nome');

  const { data, error } = await query;
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

// ============ ESTOQUE GLOBAL FUNCTIONS ============

export interface EstoqueGlobalItem {
  id: number;
  funcionario_id: number;
  empresa_id: number;
  produto_codigo: string;
  quantidade: number;
  data_atualizacao: string;
  funcionario_nome: string;
  preco_venda: number;
  preco_pagamento_funcionario: number;
}

export async function getEstoqueGlobal(empresaId: number): Promise<EstoqueGlobalItem[]> {
  // First get all estoque items for the empresa
  const { data: estoqueData, error: estoqueError } = await supabase
    .from('estoque_produtos')
    .select('*')
    .eq('empresa_id', empresaId)
    .gt('quantidade', 0);

  if (estoqueError) throw estoqueError;
  if (!estoqueData || estoqueData.length === 0) return [];

  // Get funcionarios for names
  const funcionarioIds = [...new Set(estoqueData.map(e => e.funcionario_id))];
  const { data: funcionariosData, error: funcError } = await supabase
    .from('funcionarios')
    .select('id, nome')
    .in('id', funcionarioIds);

  if (funcError) throw funcError;

  // Get produtos_empresa for prices
  const { data: produtosData, error: prodError } = await supabase
    .from('produtos_empresa')
    .select('produto_referencia:produtos_referencia(codigo), preco_venda, preco_pagamento_funcionario')
    .eq('empresa_id', empresaId)
    .eq('ativo', true);

  if (prodError) throw prodError;

  // Create maps for lookup
  const funcionariosMap: Record<number, string> = {};
  funcionariosData?.forEach(f => {
    funcionariosMap[f.id] = f.nome;
  });

  const precosMap: Record<string, { preco_venda: number; preco_pagamento_funcionario: number }> = {};
  produtosData?.forEach(p => {
    const ref = p.produto_referencia as { codigo?: string } | { codigo?: string }[] | null;
    const codigo = ref ? (Array.isArray(ref) ? ref[0]?.codigo : ref.codigo) : null;
    if (codigo) {
      precosMap[codigo.toLowerCase()] = {
        preco_venda: p.preco_venda || 0,
        preco_pagamento_funcionario: p.preco_pagamento_funcionario || 0,
      };
    }
  });

  // Enrich estoque data
  return estoqueData.map(item => ({
    ...item,
    funcionario_nome: funcionariosMap[item.funcionario_id] || 'Desconhecido',
    preco_venda: precosMap[item.produto_codigo.toLowerCase()]?.preco_venda || 0,
    preco_pagamento_funcionario: precosMap[item.produto_codigo.toLowerCase()]?.preco_pagamento_funcionario || 0,
  }));
}

export async function ajustarEstoque(
  funcionarioId: number,
  empresaId: number,
  produtoCodigo: string,
  novaQuantidade: number
): Promise<void> {
  if (novaQuantidade <= 0) {
    // Delete the row if quantity is 0 or less
    const { error } = await supabase
      .from('estoque_produtos')
      .delete()
      .eq('funcionario_id', funcionarioId)
      .eq('empresa_id', empresaId)
      .eq('produto_codigo', produtoCodigo);

    if (error) throw error;
  } else {
    // Upsert the row
    const { error } = await supabase
      .from('estoque_produtos')
      .upsert(
        {
          funcionario_id: funcionarioId,
          empresa_id: empresaId,
          produto_codigo: produtoCodigo,
          quantidade: novaQuantidade,
          data_atualizacao: new Date().toISOString(),
        },
        { onConflict: 'funcionario_id,empresa_id,produto_codigo' }
      );

    if (error) throw error;
  }
}

export async function zerarEstoqueFuncionario(
  funcionarioId: number,
  empresaId: number
): Promise<void> {
  const { error } = await supabase
    .from('estoque_produtos')
    .delete()
    .eq('funcionario_id', funcionarioId)
    .eq('empresa_id', empresaId);

  if (error) throw error;
}

/**
 * Zeros employee stock AND registers payment (mirrors bot's /pagar command).
 * 1. Calculates total stock value
 * 2. Inserts into historico_pagamentos
 * 3. Updates funcionarios.saldo (adds the stock value)
 * 4. Deletes all estoque_produtos for that funcionario+empresa
 */
export async function zerarEstoqueComPagamento(
  funcionarioId: number,
  empresaId: number
): Promise<{ valorPago: number }> {
  // 1. Get employee's current stock with prices
  const { data: estoqueData, error: estoqueError } = await supabase
    .from('estoque_produtos')
    .select('*')
    .eq('funcionario_id', funcionarioId)
    .eq('empresa_id', empresaId)
    .gt('quantidade', 0);

  if (estoqueError) throw estoqueError;
  if (!estoqueData || estoqueData.length === 0) {
    return { valorPago: 0 };
  }

  // 2. Get product prices for calculating total value
  const { data: produtosData, error: prodError } = await supabase
    .from('produtos_empresa')
    .select('produto_referencia:produtos_referencia(codigo), preco_pagamento_funcionario')
    .eq('empresa_id', empresaId)
    .eq('ativo', true);

  if (prodError) throw prodError;

  // Create price map
  const precosMap: Record<string, number> = {};
  produtosData?.forEach(p => {
    const ref = p.produto_referencia as { codigo?: string } | { codigo?: string }[] | null;
    const codigo = ref ? (Array.isArray(ref) ? ref[0]?.codigo : ref.codigo) : null;
    if (codigo) {
      precosMap[codigo.toLowerCase()] = p.preco_pagamento_funcionario || 0;
    }
  });

  // 3. Calculate total stock value
  let valorTotal = 0;
  estoqueData.forEach(item => {
    const preco = precosMap[item.produto_codigo.toLowerCase()] || 0;
    valorTotal += item.quantidade * preco;
  });

  if (valorTotal <= 0) {
    // Just delete stock if no value
    await zerarEstoqueFuncionario(funcionarioId, empresaId);
    return { valorPago: 0 };
  }

  // 4. Get current employee saldo
  const { data: funcData, error: funcError } = await supabase
    .from('funcionarios')
    .select('saldo, nome')
    .eq('id', funcionarioId)
    .single();

  if (funcError) throw funcError;

  const novoSaldo = (funcData.saldo || 0) + valorTotal;

  // 5. Insert into historico_pagamentos
  const { error: histError } = await supabase
    .from('historico_pagamentos')
    .insert({
      funcionario_id: funcionarioId,
      tipo: 'estoque_acumulado',
      valor: valorTotal,
      descricao: `Pagamento de estoque acumulado via painel - ${estoqueData.length} produto(s)`,
      data_pagamento: new Date().toISOString(),
    });

  if (histError) throw histError;

  // 6. Update funcionarios.saldo
  const { error: updateError } = await supabase
    .from('funcionarios')
    .update({ saldo: novoSaldo })
    .eq('id', funcionarioId);

  if (updateError) throw updateError;

  // 7. Delete all stock
  const { error: deleteError } = await supabase
    .from('estoque_produtos')
    .delete()
    .eq('funcionario_id', funcionarioId)
    .eq('empresa_id', empresaId);

  if (deleteError) throw deleteError;

  return { valorPago: valorTotal };
}

// ============ AUDITORIA FUNCTIONS ============

export interface AuditoriaFuncionario {
  funcionario_id: number;
  nome: string;
  discord_id: string;
  total_historico: number;
  saldo_atual: number;
  estoque_valor: number;
}

/**
 * Get payment history for an empresa with employee names
 */
export async function getHistoricoPagamentosEmpresa(empresaId: number): Promise<HistoricoPagamento[]> {
  const { data, error } = await supabase
    .from('historico_pagamentos')
    .select(`
      *,
      funcionario:funcionarios!inner(empresa_id, nome, discord_id)
    `)
    .eq('funcionario.empresa_id', empresaId)
    .order('data_pagamento', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get per-employee audit summary for an empresa
 */
export async function getAuditoriaFuncionarios(empresaId: number): Promise<AuditoriaFuncionario[]> {
  // 1. Get all funcionarios
  const { data: funcionarios, error: funcError } = await supabase
    .from('funcionarios')
    .select('id, nome, discord_id, saldo')
    .eq('empresa_id', empresaId)
    .eq('ativo', true);

  if (funcError) throw funcError;
  if (!funcionarios || funcionarios.length === 0) return [];

  const funcionarioIds = funcionarios.map(f => f.id);

  // 2. Get total historico_pagamentos per funcionario
  const { data: pagamentosData, error: pagError } = await supabase
    .from('historico_pagamentos')
    .select('funcionario_id, valor')
    .in('funcionario_id', funcionarioIds);

  if (pagError) throw pagError;

  // Sum payments per employee
  const pagamentosMap: Record<number, number> = {};
  pagamentosData?.forEach(p => {
    if (!pagamentosMap[p.funcionario_id]) pagamentosMap[p.funcionario_id] = 0;
    pagamentosMap[p.funcionario_id] += p.valor || 0;
  });

  // 3. Get estoque data and prices
  const { data: estoqueData, error: estError } = await supabase
    .from('estoque_produtos')
    .select('*')
    .eq('empresa_id', empresaId)
    .gt('quantidade', 0);

  if (estError) throw estError;

  const { data: produtosData, error: prodError } = await supabase
    .from('produtos_empresa')
    .select('produto_referencia:produtos_referencia(codigo), preco_pagamento_funcionario')
    .eq('empresa_id', empresaId)
    .eq('ativo', true);

  if (prodError) throw prodError;

  // Create price map
  const precosMap: Record<string, number> = {};
  produtosData?.forEach(p => {
    const ref = p.produto_referencia as { codigo?: string } | { codigo?: string }[] | null;
    const codigo = ref ? (Array.isArray(ref) ? ref[0]?.codigo : ref.codigo) : null;
    if (codigo) {
      precosMap[codigo.toLowerCase()] = p.preco_pagamento_funcionario || 0;
    }
  });

  // Calculate stock value per employee
  const estoqueMap: Record<number, number> = {};
  estoqueData?.forEach(item => {
    const preco = precosMap[item.produto_codigo.toLowerCase()] || 0;
    const valor = item.quantidade * preco;
    if (!estoqueMap[item.funcionario_id]) estoqueMap[item.funcionario_id] = 0;
    estoqueMap[item.funcionario_id] += valor;
  });

  // 4. Build result
  return funcionarios.map(f => ({
    funcionario_id: f.id,
    nome: f.nome,
    discord_id: f.discord_id,
    total_historico: pagamentosMap[f.id] || 0,
    saldo_atual: f.saldo || 0,
    estoque_valor: estoqueMap[f.id] || 0,
  }));
}

