import { supabase } from './client';
import type { DashboardStats } from '../types';

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
