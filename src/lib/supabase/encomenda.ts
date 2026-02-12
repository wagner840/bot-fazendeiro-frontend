import { supabase } from './client';
import type { Encomenda } from '../types';

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
