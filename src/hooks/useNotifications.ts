import { useState, useEffect, useCallback, useRef } from 'react';
import type { ActivityItem } from '../lib/types';
import { getActivityFeed } from '../lib/supabase/notifications';
import { supabase } from '../lib/supabase/client';

const LAST_READ_KEY = (id: number) => `notifications_last_read_${id}`;
const POLL_INTERVAL = 60_000;

function getLastRead(empresaId: number): string {
  return localStorage.getItem(LAST_READ_KEY(empresaId)) ?? new Date(0).toISOString();
}

function setLastRead(empresaId: number, ts: string) {
  localStorage.setItem(LAST_READ_KEY(empresaId), ts);
}

export function useNotifications(empresaId: number | null) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const computeUnread = useCallback(
    (items: ActivityItem[], empId: number) => {
      const lastRead = getLastRead(empId);
      return items.filter((a) => a.timestamp > lastRead).length;
    },
    []
  );

  const refresh = useCallback(async () => {
    if (!empresaId) return;
    setIsLoading(true);
    try {
      const data = await getActivityFeed(empresaId);
      setActivities(data);
      setUnreadCount(computeUnread(data, empresaId));
    } catch (err) {
      console.error('Failed to load activity feed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [empresaId, computeUnread]);

  const markAsRead = useCallback(() => {
    if (!empresaId) return;
    setLastRead(empresaId, new Date().toISOString());
    setUnreadCount(0);
  }, [empresaId]);

  // Initial load + polling
  useEffect(() => {
    if (!empresaId) {
      setActivities([]);
      setUnreadCount(0);
      return;
    }

    refresh();

    pollRef.current = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [empresaId, refresh]);

  // Realtime subscriptions
  useEffect(() => {
    if (!empresaId) return;

    const channel = supabase
      .channel(`activity-${empresaId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'historico_pagamentos',
        },
        () => refresh()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'encomendas',
          filter: `empresa_id=eq.${empresaId}`,
        },
        () => refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [empresaId, refresh]);

  return { activities, unreadCount, isLoading, markAsRead, refresh };
}
