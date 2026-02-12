// Re-export from refactored module for backward compatibility
export type { UserRole, UserFrontend, SubscriptionStatus, AuthState, AuthContextType } from './auth/types';
export { AuthProvider, AuthContext } from './auth/AuthProvider';
export { useAuth } from './auth/useAuth';
