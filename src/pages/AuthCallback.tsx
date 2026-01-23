import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);

        // Check for error in URL
        const errorParam = hashParams.get('error') || queryParams.get('error');
        const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');

        if (errorParam) {
          throw new Error(errorDescription || errorParam);
        }

        // Handle code exchange for PKCE flow
        const code = queryParams.get('code');

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            throw exchangeError;
          }
        }

        // Get session to verify auth worked
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session) {
          // Success - redirect to home or saved path
          const redirectPath = localStorage.getItem('authRedirect');
          localStorage.removeItem('authRedirect');
          navigate(redirectPath || '/dashboard', { replace: true });
        } else {
          // No session - something went wrong
          throw new Error('Falha ao obter sessão após autenticação');
        }
      } catch (err: any) {
        // Check for AbortError or "aborted" message
        const isAbort = err.name === 'AbortError' || 
                       (typeof err.message === 'string' && err.message.toLowerCase().includes('aborted'));

        if (isAbort) {
          console.warn('Auth callback aborted. Retrying session check...');
          try {
             // Wait a moment and check if session was established anyway
             await new Promise(resolve => setTimeout(resolve, 1000));
             const { data: { session } } = await supabase.auth.getSession();
             
             if (session) {
                navigate('/dashboard', { replace: true });
                return;
             }
          } catch (retryErr) {
             console.error('Retry failed:', retryErr);
          }
        }

        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido na autenticação');

        // Redirect to login after delay
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-leather-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-leather-900/50 border border-rust-700 rounded-western p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-rust-900/30 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-rust-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h2 className="font-heading text-xl text-parchment-100 mb-2">
            Erro na Autenticação
          </h2>
          <p className="text-rust-400 mb-4">{error}</p>
          <p className="text-parchment-500 text-sm">
            Redirecionando para a página de login...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-leather-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gold-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-[#5865F2]"
            >
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </div>
        </div>

        <div className="text-center">
          <p className="text-parchment-300 font-heading">
            Autenticando com Discord...
          </p>
          <p className="text-parchment-500 text-sm mt-1">
            Aguarde enquanto verificamos suas credenciais
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default AuthCallback;
