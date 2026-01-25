import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface SubscriptionGateProps {
  children: React.ReactNode;
}

/**
 * SubscriptionGate wraps protected content and redirects to
 * /assinatura-expirada if the server doesn't have an active subscription.
 * Superadmins bypass this check.
 */
export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { hasActiveSubscription, isSuperadmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-leather-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
      </div>
    );
  }

  // Superadmins always have access
  if (isSuperadmin) {
    return <>{children}</>;
  }

  // Check subscription
  if (!hasActiveSubscription) {

    return <Navigate to="/assinatura-expirada" replace />;
  }

  return <>{children}</>;
}

export default SubscriptionGate;
