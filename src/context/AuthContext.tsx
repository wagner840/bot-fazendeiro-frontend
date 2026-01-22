import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type UserRole = 'superadmin' | 'admin' | 'funcionario' | 'none';

export interface UserFrontend {
  id: number;
  discord_id: string;
  guild_id: string | null;
  role: UserRole;
  ativo: boolean;
  criado_em: string;
}

export interface SubscriptionStatus {
  ativa: boolean;
  status: string | null;
  dias_restantes: number;
  data_expiracao: string | null;
  plano_nome: string | null;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  userFrontend: UserFrontend | null;
  subscription: SubscriptionStatus | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  signInWithDiscord: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isSuperadmin: boolean;
  isAdmin: boolean;
  isFuncionario: boolean;
  hasActiveSubscription: boolean;
  hasAccess: (requiredRole?: UserRole) => boolean;
  refreshUserFrontend: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    userFrontend: null,
    subscription: null,
    loading: true,
    error: null,
  });

  // Fetch user frontend data from usuarios_frontend table
  const fetchUserFrontend = async (discordId: string): Promise<UserFrontend | null> => {
    console.log('fetchUserFrontend called with discordId:', discordId);
    try {
      console.log('Starting Supabase query...');

      // Use a timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout after 10s')), 10000);
      });

      const queryPromise = supabase
        .from('usuarios_frontend')
        .select('*')
        .eq('discord_id', discordId)
        .eq('ativo', true)
        .order('role', { ascending: true }) // superadmin first
        .limit(1);

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      console.log('Supabase query completed. Data:', data, 'Error:', error);

      if (error) {
        // User not found in usuarios_frontend - no access
        if (error.code === 'PGRST116') {
          console.log('User not found in usuarios_frontend (PGRST116)');
          return null;
        }
        throw error;
      }

      // Return first result (removed .single() to avoid hanging on empty results)
      if (data && data.length > 0) {
        return data[0];
      }

      console.log('No user found in usuarios_frontend');
      return null;
    } catch (err) {
      console.error('Error fetching user frontend:', err);
      return null;
    }
  };

  // Fetch subscription status for the user's guild
  const fetchSubscription = async (guildId: string): Promise<SubscriptionStatus | null> => {
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
      };
    } catch (err) {
      console.error('Error fetching subscription:', err);
      return null;
    }
  };

  // Get Discord ID from user metadata
  const getDiscordId = (user: User): string | null => {
    // Discord OAuth stores provider_id in user_metadata
    return user.user_metadata?.provider_id ||
           user.identities?.find(i => i.provider === 'discord')?.id ||
           null;
  };

  // Initialize auth state
  useEffect(() => {
    let isInitialized = false;

    // Helper to handle session
    const handleSession = async (session: Session | null, source: string) => {
      console.log(`handleSession called from ${source}, session:`, !!session);

      if (!session?.user) {
        setState({
          user: null,
          session: null,
          userFrontend: null,
          subscription: null,
          loading: false,
          error: null,
        });
        return;
      }

      const discordId = getDiscordId(session.user);
      console.log('Discord ID:', discordId);

      if (!discordId) {
        setState({
          user: session.user,
          session,
          userFrontend: null,
          subscription: null,
          loading: false,
          error: 'Erro ao obter Discord ID.',
        });
        return;
      }

      try {
        const userFrontend = await fetchUserFrontend(discordId);
        console.log('User frontend fetched:', userFrontend);

        // Fetch subscription if user has a guild
        let subscription: SubscriptionStatus | null = null;
        if (userFrontend?.guild_id) {
          subscription = await fetchSubscription(userFrontend.guild_id);
          console.log('Subscription fetched:', subscription);
        }

        setState({
          user: session.user,
          session,
          userFrontend,
          subscription,
          loading: false,
          error: userFrontend ? null : 'Acesso negado. Usuário não autorizado.',
        });
      } catch (err) {
        console.error(`Error fetching user frontend (${source}):`, err);
        setState({
          user: session.user,
          session,
          userFrontend: null,
          subscription: null,
          loading: false,
          error: 'Erro ao buscar dados do usuário.',
        });
      }
    };

    // Listen for auth changes - set up BEFORE getting initial session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, 'isInitialized:', isInitialized);

        if (event === 'INITIAL_SESSION') {
          // This is the initial session load - handle it
          isInitialized = true;
          await handleSession(session, 'INITIAL_SESSION');
        } else if (event === 'SIGNED_IN') {
          // Only handle if this is a fresh sign in (after initial load)
          if (isInitialized) {
            await handleSession(session, 'SIGNED_IN');
          }
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            session: null,
            userFrontend: null,
            subscription: null,
            loading: false,
            error: null,
          });
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setState(prev => ({
            ...prev,
            session,
          }));
        }
      }
    );

    // Fallback: If INITIAL_SESSION doesn't fire within 5s, manually check
    const fallbackTimeout = setTimeout(async () => {
      if (!isInitialized) {
        console.log('Fallback: INITIAL_SESSION did not fire, checking session manually');
        isInitialized = true;
        try {
          const { data: { session } } = await supabase.auth.getSession();
          await handleSession(session, 'fallback');
        } catch (err) {
          console.error('Fallback session check failed:', err);
          setState(prev => ({
            ...prev,
            loading: false,
            error: 'Erro ao inicializar autenticação.',
          }));
        }
      }
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallbackTimeout);
    };
  }, []);

  // Sign in with Discord
  const signInWithDiscord = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'identify guilds',
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error('Sign in error:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao fazer login com Discord.',
      }));
    }
  };

  // Sign out
  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setState({
        user: null,
        session: null,
        userFrontend: null,
        subscription: null,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error('Sign out error:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao fazer logout.',
      }));
    }
  };

  // Refresh user frontend data
  const refreshUserFrontend = async () => {
    if (!state.user) return;

    const discordId = getDiscordId(state.user);
    if (!discordId) return;

    const userFrontend = await fetchUserFrontend(discordId);
    setState(prev => ({
      ...prev,
      userFrontend,
      error: userFrontend ? null : 'Acesso negado. Usuário não autorizado.',
    }));
  };

  // Refresh subscription status
  const refreshSubscription = async () => {
    if (!state.userFrontend?.guild_id) return;

    const subscription = await fetchSubscription(state.userFrontend.guild_id);
    setState(prev => ({
      ...prev,
      subscription,
    }));
  };

  // Computed properties
  const isAuthenticated = !!state.user && !!state.userFrontend;
  const isSuperadmin = state.userFrontend?.role === 'superadmin';
  const isAdmin = state.userFrontend?.role === 'admin' || isSuperadmin;
  const isFuncionario = !!state.userFrontend;
  const hasActiveSubscription = state.subscription?.ativa === true || isSuperadmin;

  // Check if user has required role
  const hasAccess = (requiredRole?: UserRole): boolean => {
    if (!state.userFrontend) return false;
    if (!requiredRole) return true;

    const roleHierarchy: Record<UserRole, number> = {
      superadmin: 3,
      admin: 2,
      funcionario: 1,
      none: 0,
    };

    return roleHierarchy[state.userFrontend.role] >= roleHierarchy[requiredRole];
  };

  const value: AuthContextType = {
    ...state,
    signInWithDiscord,
    signOut,
    isAuthenticated,
    isSuperadmin,
    isAdmin,
    isFuncionario,
    hasActiveSubscription,
    hasAccess,
    refreshUserFrontend,
    refreshSubscription,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
