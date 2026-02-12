import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import {
  fetchUserFrontends,
  fetchSubscription,
  getDiscordId,
} from './authService';
import type {
  AuthState,
  AuthContextType,
  UserRole,
  SubscriptionStatus,
} from './types';
import { ROLE_HIERARCHY, initialAuthState } from './types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialAuthState);

  // Initialize auth state
  useEffect(() => {
    let isInitialized = false;

    // Helper to handle session
    const handleSession = async (session: Session | null, source: string) => {
      if (!session?.user) {
        setState({
          ...initialAuthState,
          loading: false,
        });
        return;
      }

      const discordId = getDiscordId(session.user);

      if (!discordId) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'Erro ao obter Discord ID.',
        }));
        return;
      }

      try {
        const userFrontends = await fetchUserFrontends(discordId);

        if (userFrontends.length === 0) {
          setState({
            user: session.user,
            session,
            userFrontend: null,
            userFrontends: [],
            subscription: null,
            loading: false,
            error: null,
          });
          return;
        }

        // Check if user previously selected a guild (persisted in localStorage)
        const savedGuildId = localStorage.getItem('selectedGuildId');

        // Find best association (saved preference > active subscription > first)
        let selectedUserFrontend = userFrontends[0];
        let selectedSubscription: SubscriptionStatus | null = null;

        // If user had a saved preference, try to use it first
        if (savedGuildId) {
          const savedFrontend = userFrontends.find((uf) => uf.guild_id === savedGuildId);
          if (savedFrontend) {
            const sub = await fetchSubscription(savedGuildId);
            selectedUserFrontend = savedFrontend;
            selectedSubscription = sub;
          }
        }

        // If no saved preference matched, find first with active subscription
        if (!selectedSubscription || !selectedSubscription.ativa) {
          for (const uf of userFrontends) {
            if (uf.guild_id) {
              const sub = await fetchSubscription(uf.guild_id);
              if (sub?.ativa) {
                selectedUserFrontend = uf;
                selectedSubscription = sub;
                break;
              }
              // Backup first one if none are active
              if (!selectedSubscription) {
                selectedSubscription = sub;
              }
            }
          }
        }

        setState({
          user: session.user,
          session,
          userFrontend: selectedUserFrontend,
          userFrontends,
          subscription: selectedSubscription,
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error(`Error fetching user frontend (${source}):`, err);

        // If we had a valid user session, don't log them out on network errors
        setState((prev) => {
          if (prev.userFrontend) {
            return {
              ...prev,
              session,
              loading: false,
            };
          }
          return {
            user: session.user,
            session,
            userFrontend: null,
            userFrontends: [],
            subscription: null,
            loading: false,
            error: 'Erro de conexão/timeout. Tente recarregar.',
          };
        });
      }
    };

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        isInitialized = true;
        await handleSession(session, 'INITIAL_SESSION');
      } else if (event === 'SIGNED_IN') {
        if (isInitialized) {
          await handleSession(session, 'SIGNED_IN');
        }
      } else if (event === 'SIGNED_OUT') {
        setState({
          ...initialAuthState,
          loading: false,
        });
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setState((prev) => ({
          ...prev,
          session,
        }));
      }
    });

    // Fallback: If INITIAL_SESSION doesn't fire within 5s, manually check
    const fallbackTimeout = setTimeout(async () => {
      if (!isInitialized) {
        isInitialized = true;
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          await handleSession(session, 'fallback');
        } catch (err) {
          console.error('Fallback session check failed:', err);
          setState((prev) => ({
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
    setState((prev) => ({ ...prev, loading: true, error: null }));

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
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Erro ao fazer login com Discord.',
      }));
    }
  };

  // Sign out
  const signOut = async () => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear persisted guild selection
      localStorage.removeItem('selectedGuildId');

      setState({
        ...initialAuthState,
        loading: false,
      });
    } catch (err) {
      console.error('Sign out error:', err);
      setState((prev) => ({
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

    const userFrontends = await fetchUserFrontends(discordId);
    const currentGuildId = state.userFrontend?.guild_id;
    const userFrontend =
      userFrontends.find((uf) => uf.guild_id === currentGuildId) || userFrontends[0] || null;
    setState((prev) => ({
      ...prev,
      userFrontend,
      userFrontends,
      error: null,
    }));
  };

  // Refresh subscription status
  const refreshSubscription = async () => {
    if (!state.userFrontend?.guild_id) return;

    const subscription = await fetchSubscription(state.userFrontend.guild_id);
    setState((prev) => ({
      ...prev,
      subscription,
    }));
  };

  // Switch Guild Context
  const switchGuild = async (guildId: string) => {
    const targetFrontend = state.userFrontends.find((uf) => uf.guild_id === guildId);

    if (!targetFrontend) {
      console.warn(`Guild ${guildId} not found in user associations.`);
      return;
    }

    if (state.userFrontend?.id === targetFrontend.id && state.subscription) {
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));

    const subscription = await fetchSubscription(guildId);

    // Persist choice so it survives page refresh
    localStorage.setItem('selectedGuildId', guildId);

    setState((prev) => ({
      ...prev,
      userFrontend: targetFrontend,
      subscription: subscription,
      loading: false,
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

    return ROLE_HIERARCHY[state.userFrontend.role] >= ROLE_HIERARCHY[requiredRole];
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
    switchGuild,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
