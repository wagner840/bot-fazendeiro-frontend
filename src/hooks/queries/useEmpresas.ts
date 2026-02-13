import { useQuery } from '@tanstack/react-query';
import { getEmpresas } from '../../lib/supabase';
import type { Empresa } from '../../lib/types';

export function useEmpresas() {
  return useQuery<Empresa[]>({
    queryKey: ['empresas'],
    queryFn: getEmpresas,
  });
}
