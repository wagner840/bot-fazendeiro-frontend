import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

interface ServerRow {
  guild_id: string;
  nome: string | null;
}

interface UserRow {
  discord_id: string;
  nome: string | null;
}

function normalizeIds(ids: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      ids
        .map((id) => id?.trim())
        .filter((id): id is string => Boolean(id))
    )
  );
}

export function useServerNames(guildIds: Array<string | null | undefined>) {
  const [names, setNames] = useState<Record<string, string>>({});
  const normalizedGuildIds = useMemo(() => normalizeIds(guildIds), [guildIds]);

  useEffect(() => {
    let mounted = true;

    async function fetchServerNames() {
      if (normalizedGuildIds.length === 0) {
        if (mounted) setNames({});
        return;
      }

      const { data } = await supabase
        .from('servidores')
        .select('guild_id, nome')
        .in('guild_id', normalizedGuildIds);

      if (!mounted || !data) return;

      const map: Record<string, string> = {};
      (data as ServerRow[]).forEach((server) => {
        if (server.nome) {
          map[server.guild_id] = server.nome;
        }
      });
      setNames(map);
    }

    fetchServerNames();
    return () => {
      mounted = false;
    };
  }, [normalizedGuildIds.join(',')]);

  return names;
}

export function useDiscordUserNames(discordIds: Array<string | null | undefined>) {
  const [names, setNames] = useState<Record<string, string>>({});
  const normalizedDiscordIds = useMemo(() => normalizeIds(discordIds), [discordIds]);

  useEffect(() => {
    let mounted = true;

    async function fetchUserNames() {
      if (normalizedDiscordIds.length === 0) {
        if (mounted) setNames({});
        return;
      }

      const [frontendUsersRes, funcionariosRes] = await Promise.all([
        supabase
          .from('usuarios_frontend')
          .select('discord_id, nome')
          .in('discord_id', normalizedDiscordIds),
        supabase
          .from('funcionarios')
          .select('discord_id, nome')
          .in('discord_id', normalizedDiscordIds),
      ]);

      if (!mounted) return;

      const map: Record<string, string> = {};

      if (funcionariosRes.data) {
        (funcionariosRes.data as UserRow[]).forEach((user) => {
          if (user.nome && !map[user.discord_id]) {
            map[user.discord_id] = user.nome;
          }
        });
      }

      if (frontendUsersRes.data) {
        (frontendUsersRes.data as UserRow[]).forEach((user) => {
          if (user.nome) {
            map[user.discord_id] = user.nome;
          }
        });
      }

      setNames(map);
    }

    fetchUserNames();
    return () => {
      mounted = false;
    };
  }, [normalizedDiscordIds.join(',')]);

  return names;
}
