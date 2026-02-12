import { supabase } from './client';
import { zerarEstoqueFuncionario } from './estoque';
import type { HistoricoPagamento } from '../types';

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
