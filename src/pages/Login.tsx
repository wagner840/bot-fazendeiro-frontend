import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Shield, Users, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui';
import { usePageTitle } from '../hooks/usePageTitle';

export function Login() {
  usePageTitle('Login');
  const { signInWithDiscord, isAuthenticated, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Gerenciamento de Funcionários',
      description: 'Controle completo de funcionários, saldos e histórico de pagamentos',
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: 'Controle de Estoque',
      description: 'Gestão de produtos, preços e estoque em tempo real',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Segurança Multi-Tenant',
      description: 'Dados isolados por servidor Discord com RLS',
    },
  ];

  return (
    <div className="min-h-screen bg-leather-950 flex">
      {/* Left side - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-leather-900 to-leather-950 p-12 flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-4xl text-gold-500 mb-4">
            Bot Fazendeiro
          </h1>
          <p className="text-parchment-400 text-lg mb-12">
            Sistema de gestão empresarial para servidores Discord do RedM
          </p>

          <div className="space-y-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="p-3 rounded-western bg-gold-500/10 text-gold-500">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-heading text-parchment-100 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-parchment-500 text-sm">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo for mobile */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="font-display text-3xl text-gold-500 mb-2">
              Bot Fazendeiro
            </h1>
            <p className="text-parchment-500">
              Sistema de gestão empresarial
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-leather-900/50 border border-leather-700 rounded-western p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-[#5865F2]/20 flex items-center justify-center mx-auto mb-4">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-8 h-8 text-[#5865F2]"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </div>
              <h2 className="font-heading text-xl text-parchment-100 mb-2">
                Entrar com Discord
              </h2>
              <p className="text-parchment-500 text-sm">
                Faça login com sua conta Discord para acessar o painel
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-rust-900/30 border border-rust-700 rounded-western text-rust-400 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <Button
              onClick={() => {
                const searchParams = new URL(window.location.href).searchParams;
                // Check props or location state for redirect
                const from = (location.state as any)?.from?.pathname || searchParams.get('redirect');
                if (from) {
                  localStorage.setItem('authRedirect', from);
                }
                signInWithDiscord();
              }}
              disabled={loading}
              className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white py-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Continuar com Discord</span>
                </>
              )}
            </Button>

            <p className="mt-6 text-center text-parchment-600 text-xs">
              Ao continuar, você concorda com nossos termos de uso.
              <br />
              Apenas usuários autorizados pelo administrador do servidor podem acessar.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
