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
  isLoggedIn: boolean;
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

  // Helper: Fetch with retry
  const fetchUserFrontendWithRetry = async (discordId: string, retries = 3): Promise<UserFrontend | null> => {
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
          .order('role', { ascending: true }) // superadmin first
          .limit(1);

        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

        if (error) {
          if (error.code === 'PGRST116') { // User not found (valid response)
            return null;
          }
          throw error; // Throw other errors to trigger retry
        }

        if (data && data.length > 0) {
          return data[0];
        } else {
          return null; // Empty list = user not found
        }

      } catch (err: any) {
        console.warn(`Attempt ${i + 1} failed:`, err);
        const isLastAttempt = i === retries - 1;
        
        // Don't retry on timeout if we have a valid previous state? No, we should distinct "User Not Found" vs "Network Error"
        if (isLastAttempt) {
            throw err;
        }
        // Wait 1s before retry
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    throw new Error('All retries failed');
  };

  // Fetch user frontend data from usuarios_frontend table
  const fetchUserFrontend = async (discordId: string): Promise<UserFrontend | null> => {
      try {
          return await fetchUserFrontendWithRetry(discordId);
      } catch (err) {
          console.error('Final fetchUserFrontend error:', err);
          throw err; // Propagate error so caller knows it failed
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


      if (!discordId) {
        setState(prev => ({ // Keep previous state if just session refresh weirdness? No, no ID = logout basically.
            ...prev,
            loading: false,
            error: 'Erro ao obter Discord ID.',
        }));
        return;
      }

      try {
        const userFrontend = await fetchUserFrontend(discordId);


        // Fetch subscription if user has a guild
        let subscription: SubscriptionStatus | null = null;
        if (userFrontend?.guild_id) {
          subscription = await fetchSubscription(userFrontend.guild_id);

        }

        setState({
          user: session.user,
          session,
          userFrontend,
          subscription,
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error(`Error fetching user frontend (${source}):`, err);
        
        // CRITICAL FIX: If we simply timed out or had a network error, 
        // AND we effectively already had a valid user session, DO NOT Log them out.
        // Just keep the old state but maybe update session.
        setState(prev => {
            if (prev.userFrontend) {

                return {
                    ...prev,
                    session, // Update session token
                    // userFrontend: keep existing
                    // subscription: keep existing
                    loading: false,
                };
            }
             // Real error and no previous state -> Access Denied / Error
            return {
                user: session.user,
                session,
                userFrontend: null,
                subscription: null,
                loading: false,
                error: 'Erro de conexão/timeout. Tente recarregar.',
            };
        });
      }
    };

    // Listen for auth changes - set up BEFORE getting initial session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {


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
      error: null,
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
  const isLoggedIn = !!state.session;
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
    isLoggedIn,
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
