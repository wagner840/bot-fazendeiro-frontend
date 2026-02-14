import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import type { UserFrontend, SubscriptionStatus } from './types';

// Fetch with retry logic
export async function fetchUserFrontendWithRetry(
  discordId: string,
  retries = 3
): Promise<UserFrontend[]> {
  for (let i = 0; i < retries; i++) {
    try {
      // Use a timeout to prevent hanging (increased to 15s)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout after 15s')), 15000);
      });

      const queryPromise = supabase
        .from('usuarios_frontend')
        .select('*')
        .eq('discord_id', discordId)
        .eq('ativo', true)
        .order('role', { ascending: true }); // superadmin first

      const { data, error } = (await Promise.race([queryPromise, timeoutPromise])) as Awaited<
        typeof queryPromise
      >;

      if (error) {
        if (error.code === 'PGRST116') {
          // User not found (valid response)
          return [];
        }
        throw error;
      }

      if (data && data.length > 0) {
        return data as UserFrontend[];
      } else {
        return [];
      }
    } catch (err) {
      console.warn(`Attempt ${i + 1} failed:`, err);
      const isLastAttempt = i === retries - 1;

      if (isLastAttempt) {
        throw err;
      }
      // Wait 1s before retry
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error('All retries failed');
}

// Fetch user frontend data from usuarios_frontend table
export async function fetchUserFrontends(discordId: string): Promise<UserFrontend[]> {
  try {
    return await fetchUserFrontendWithRetry(discordId);
  } catch (err) {
    console.error('Final fetchUserFrontends error:', err);
    throw err;
  }
}

// Fetch subscription status for the user's guild
export async function fetchSubscription(guildId: string): Promise<SubscriptionStatus | null> {
  try {
    const { data, error } = await supabase.rpc('verificar_assinatura', {
      p_guild_id: guildId,
    });

    if (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }

    if (data && data.length > 0) {
      return data[0];
    }

    return {
      ativa: false,
      status: null,
      dias_restantes: 0,
      data_expiracao: null,
      plano_nome: null,
      tipo: null,
    };
  } catch (err) {
    console.error('Error fetching subscription:', err);
    return null;
  }
}

// Create trial intent; activation happens when bot joins the guild.
export async function createTrialIntent(
  discordId?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.rpc('criar_trial_intent', {
      p_discord_id: discordId || null,
    });

    if (error) {
      console.error('Error creating trial intent:', error);
      return { success: false, message: 'Erro ao iniciar fluxo de teste gratuito.' };
    }

    if (data && data.length > 0) {
      const result = data[0];
      return {
        success: ['success', 'pending_exists'].includes(result.resultado),
        message: result.mensagem,
      };
    }

    return { success: false, message: 'Resposta inesperada do servidor.' };
  } catch (err) {
    console.error('Error creating trial intent:', err);
    return { success: false, message: 'Erro de conexao ao iniciar teste.' };
  }
}

// Get Discord ID from user metadata
export function getDiscordId(user: User): string | null {
  return (
    user.user_metadata?.provider_id ||
    user.identities?.find((i) => i.provider === 'discord')?.id ||
    null
  );
}

// Check if user has required role
export function checkRoleAccess(
  userRole: string | undefined,
  requiredRole: string | undefined,
  roleHierarchy: Record<string, number>
): boolean {
  if (!userRole) return false;
  if (!requiredRole) return true;

  return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
}
