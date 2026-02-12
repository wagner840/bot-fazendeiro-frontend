import { supabase } from './client';
import type { EstoqueProduto } from '../types';

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
