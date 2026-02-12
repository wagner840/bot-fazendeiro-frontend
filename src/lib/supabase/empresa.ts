import { supabase } from './client';
import type { Empresa, TipoEmpresa } from '../types';

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
