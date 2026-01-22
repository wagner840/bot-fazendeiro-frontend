import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { loading, hasAccess, user, userFrontend } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-leather-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500" />
          <p className="text-parchment-400">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // User not logged in - redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User logged in but not authorized (not in usuarios_frontend)
  if (!userFrontend) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User authenticated but doesn't have required role
  if (requiredRole && !hasAccess(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // All checks passed - render children
  return <>{children}</>;
}

export default ProtectedRoute;
