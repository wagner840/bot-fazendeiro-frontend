import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../../lib/supabase';
import type { DashboardStats } from '../../lib/types';

export function useDashboardStats(empresaId: number | undefined) {
  return useQuery<DashboardStats>({
    queryKey: ['dashboardStats', empresaId],
    queryFn: () => getDashboardStats(empresaId!),
    enabled: !!empresaId,
  });
}
