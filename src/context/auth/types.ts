import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'superadmin' | 'admin' | 'funcionario' | 'none';

export interface UserFrontend {
  id: number;
  discord_id: string;
  guild_id: string | null;
  role: UserRole;
  ativo: boolean;
  criado_em: string;
}

export type SubscriptionTipo = 'trial' | 'paga' | 'tester';

export interface SubscriptionStatus {
  ativa: boolean;
  status: string | null;
  dias_restantes: number;
  data_expiracao: string | null;
  plano_nome: string | null;
  tipo: SubscriptionTipo | null;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  userFrontend: UserFrontend | null;
  userFrontends: UserFrontend[];
  subscription: SubscriptionStatus | null;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  signInWithDiscord: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isLoggedIn: boolean;
  isSuperadmin: boolean;
  isAdmin: boolean;
  isFuncionario: boolean;
  hasActiveSubscription: boolean;
  isTrial: boolean;
  isTrialExpired: boolean;
  hasAccess: (requiredRole?: UserRole) => boolean;
  activateTrial: (guildId: string) => Promise<{ success: boolean; message: string }>;
  refreshUserFrontend: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  switchGuild: (guildId: string) => Promise<void>;
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  superadmin: 3,
  admin: 2,
  funcionario: 1,
  none: 0,
};

export const initialAuthState: AuthState = {
  user: null,
  session: null,
  userFrontend: null,
  userFrontends: [],
  subscription: null,
  loading: true,
  error: null,
};
