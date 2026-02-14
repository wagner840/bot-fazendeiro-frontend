import { motion } from 'framer-motion';
import { ShieldX, ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui';

export function Unauthorized() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-leather-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-leather-900/50 border border-leather-700 rounded-western p-8 max-w-xl w-full text-center"
      >
        <div className="w-20 h-20 rounded-full bg-rust-900/30 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-10 h-10 text-rust-500" />
        </div>

        <h1 className="font-display text-3xl text-rust-500 mb-2">Acesso Negado</h1>

        <p className="text-parchment-400 mb-6">
          Você ainda não tem permissão para acessar o painel.
        </p>

        {user && (
          <div className="bg-leather-800/50 rounded-western p-4 mb-6">
            <p className="text-parchment-500 text-sm mb-1">Logado como:</p>
            <div className="flex items-center justify-center gap-3">
              {user.user_metadata?.avatar_url && (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border-2 border-leather-600"
                />
              )}
              <div className="text-left">
                <p className="text-parchment-200 font-heading">
                  {user.user_metadata?.full_name || user.user_metadata?.name || 'Usuário Discord'}
                </p>
                <p className="text-parchment-500 text-xs">
                  {user.email || `ID: ${user.user_metadata?.provider_id}`}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-left bg-leather-800/30 rounded-western p-4 mb-6">
          <p className="text-parchment-300 text-sm font-heading mb-2">Como liberar acesso no bot:</p>
          <ol className="text-parchment-400 text-sm space-y-1 list-decimal pl-4">
            <li>
              No Discord, execute <code className="font-mono text-gold-400">/configurar</code> (ou{' '}
              <code className="font-mono text-gold-400">!configurar</code>) para iniciar o servidor.
            </li>
            <li>Escolha a base REDM deste servidor e finalize a empresa inicial.</li>
            <li>
              Garanta seu usuário como admin em <code className="font-mono text-gold-400">usuarios_frontend</code>{' '}
              para este guild.
            </li>
            <li>
              Se alterou dados no banco, rode <code className="font-mono text-gold-400">!limparcache</code> no bot.
            </li>
          </ol>
        </div>

        <p className="text-parchment-500 text-sm mb-6">
          Se o problema continuar, peça ao administrador para validar assinatura e permissões desse servidor.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>

          <Button
            variant="ghost"
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 text-rust-400 hover:text-rust-300"
          >
            <LogOut className="w-4 h-4" />
            Sair da conta
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default Unauthorized;
