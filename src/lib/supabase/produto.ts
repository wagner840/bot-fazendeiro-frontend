import { supabase } from './client';
import type { ProdutoEmpresa, ProdutoReferencia } from '../types';

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
