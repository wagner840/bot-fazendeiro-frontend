import { supabase } from './client';
import type { Funcionario } from '../types';

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
