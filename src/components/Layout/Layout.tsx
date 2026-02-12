import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { Toast } from '../ui/Toast';
import { useApp } from '../../context/AppContext';

export function Layout() {
  const { toasts, isLoadingEmpresas, selectedEmpresa } = useApp();

  if (isLoadingEmpresas) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-leather-700 border-t-gold-500 animate-spin" />
          <p className="font-heading text-parchment-300">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!selectedEmpresa) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="western-card p-8 max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-leather-800 flex items-center justify-center">
            <span className="text-4xl">🏢</span>
          </div>
          <h1 className="font-display text-2xl text-gold-500 mb-3">
            Nenhuma Empresa Encontrada
          </h1>
          <p className="text-parchment-400 mb-6">
            Configure uma empresa através do bot Discord usando o comando{' '}
            <code className="px-2 py-1 bg-leather-800 rounded text-gold-400 font-mono text-sm">
              !configurar
            </code>
          </p>
          <div className="divider-western" />
          <p className="text-sm text-parchment-500">
            Após configurar, atualize esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto p-4 sm:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>

      <BottomNav />

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </div>
    </div>
  );
}
