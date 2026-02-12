import { supabase } from './client';
import type { HistoricoPagamento } from '../types';

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
