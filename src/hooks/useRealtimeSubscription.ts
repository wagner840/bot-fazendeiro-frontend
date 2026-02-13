import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

type RealtimeTable = 'encomendas' | 'funcionarios' | 'produtos_empresa' | 'pagamentos_pix' | 'assinaturas';

/**
 * Subscribes to Supabase Realtime changes on a table.
 * Automatically invalidates the corresponding React Query cache.
 */
export function useRealtimeSubscription(
  table: RealtimeTable,
  queryKeys: string[],
  options?: { enabled?: boolean; empresaId?: number }
) {
  const queryClient = useQueryClient();
  const enabled = options?.enabled ?? true;

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => {
          queryKeys.forEach((key) => {
            queryClient.invalidateQueries({ queryKey: [key] });
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, enabled, queryClient, ...queryKeys]);
}
