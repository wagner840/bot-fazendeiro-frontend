// Re-export types
export type { UserRole, UserFrontend, SubscriptionStatus, AuthState, AuthContextType } from './types';

// Re-export provider and hook
export { AuthProvider, AuthContext } from './AuthProvider';
export { useAuth } from './useAuth';

// Re-export service functions for testing/advanced usage
export {
  fetchUserFrontends,
  fetchSubscription,
  getDiscordId,
  checkRoleAccess,
} from './authService';
