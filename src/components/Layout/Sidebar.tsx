import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Package,
  ClipboardList,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wheat,
  UserCog,
  Building2,
  Shield,
  Warehouse,
  FileSearch,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { BUSINESS_ICONS } from '../../lib/types';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}

function NavItem({ to, icon, label, collapsed }: NavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      className={cn(
        'nav-item',
        isActive && 'active',
        collapsed && 'justify-center px-3'
      )}
    >
      <span className="w-5 h-5 flex-shrink-0">{icon}</span>
      {!collapsed && (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto' }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.2 }}
          className="whitespace-nowrap overflow-hidden"
        >
          {label}
        </motion.span>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  const {
    selectedEmpresa,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen
  } = useApp();
  const { isAdmin, isSuperadmin } = useAuth();

  const businessIcon = selectedEmpresa?.tipo_empresa?.codigo
    ? BUSINESS_ICONS[selectedEmpresa.tipo_empresa.codigo] || '🏢'
    : '🏢';

  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/dashboard/funcionarios', icon: <Users size={20} />, label: 'Funcionários' },
    { to: '/dashboard/produtos', icon: <Package size={20} />, label: 'Produtos' },
    { to: '/dashboard/estoque', icon: <Warehouse size={20} />, label: 'Estoque' },
    { to: '/dashboard/encomendas', icon: <ClipboardList size={20} />, label: 'Encomendas' },
    { to: '/dashboard/financeiro', icon: <DollarSign size={20} />, label: 'Financeiro' },
    ...(isAdmin ? [
      { to: '/dashboard/auditoria', icon: <FileSearch size={20} />, label: 'Auditoria' },
      { to: '/dashboard/empresas', icon: <Building2 size={20} />, label: 'Minhas Empresas' },
      { to: '/dashboard/usuarios', icon: <UserCog size={20} />, label: 'Gerenciar Usuários' },
      { to: '/dashboard/configuracoes', icon: <Settings size={20} />, label: 'Configurações' },
    ] : []),
    ...(isSuperadmin ? [
       { to: '/dashboard/superadmin/testers', icon: <Shield size={20} />, label: 'Gerenciar Testers' },
    ] : []),
  ];

  // Close mobile menu on navigation
  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[90]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        animate={{ 
          width: (sidebarCollapsed && !mobileMenuOpen) ? 72 : 256,
        }}
        className={cn(
          "fixed md:static inset-y-0 left-0 z-[100] flex flex-col bg-leather-900/95 border-r border-leather-700/50 transition-transform duration-300 md:translate-x-0 h-screen",
          !mobileMenuOpen && "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo / Brand */}
        <div className="p-4 border-b border-leather-700/50 flex items-center justify-between">
          <div className={cn(
            'flex items-center gap-3',
            (sidebarCollapsed && !mobileMenuOpen) && 'justify-center w-full'
          )}>
            <div className="w-10 h-10 rounded-western bg-gradient-to-br from-gold-500 to-whiskey-600 flex items-center justify-center shadow-gold-glow shrink-0">
              <Wheat className="w-6 h-6 text-leather-950" />
            </div>
            {(!sidebarCollapsed || mobileMenuOpen) && (
              <div className="overflow-hidden">
                <h1 className="font-display text-lg text-gold-500 leading-tight">
                  Fazendeiro
                </h1>
                <p className="text-xs text-parchment-500 font-body">
                  Painel Administrativo
                </p>
              </div>
            )}
          </div>
          
          {/* Mobile Close Button */}
          <button 
            className="md:hidden text-parchment-400 hover:text-parchment-200"
            onClick={() => setMobileMenuOpen(false)}
          >
            <ChevronLeft size={24} />
          </button>
        </div>

        {/* Company Selector */}
        {selectedEmpresa && (
          <div className={cn(
            'p-4 border-b border-leather-700/50',
            (sidebarCollapsed && !mobileMenuOpen) && 'p-2'
          )}>
            <div className={cn(
              'flex items-center gap-3 p-3 rounded-western bg-leather-800/50',
              (sidebarCollapsed && !mobileMenuOpen) && 'justify-center p-2'
            )}>
              <span className="text-2xl">{businessIcon}</span>
              {(!sidebarCollapsed || mobileMenuOpen) && (
                <div className="overflow-hidden flex-1 min-w-0">
                  <p className="font-heading text-sm text-parchment-100 truncate">
                    {selectedEmpresa.nome}
                  </p>
                  <p className="text-xs text-parchment-500 truncate">
                    {selectedEmpresa.tipo_empresa?.nome}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <div key={item.to} onClick={handleNavClick}>
              <NavItem
                to={item.to}
                icon={item.icon}
                label={item.label}
                collapsed={sidebarCollapsed && !mobileMenuOpen}
              />
            </div>
          ))}
        </nav>

        {/* Collapse Toggle (Desktop Only) */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden md:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-leather-800 border border-leather-600/50 items-center justify-center hover:bg-leather-700 transition-colors shadow-western"
        >
          {sidebarCollapsed ? (
            <ChevronRight size={14} className="text-gold-500" />
          ) : (
            <ChevronLeft size={14} className="text-gold-500" />
          )}
        </button>

        {/* Footer */}
        <div className={cn(
          'p-4 border-t border-leather-700/50',
          (sidebarCollapsed && !mobileMenuOpen) && 'p-2'
        )}>
          {(!sidebarCollapsed || mobileMenuOpen) ? (
            <p className="text-xs text-parchment-600 text-center font-body">
              Bot Fazendeiro v2.1
            </p>
          ) : (
            <p className="text-xs text-parchment-600 text-center">v2.1</p>
          )}
        </div>
      </motion.aside>
    </>
  );
}
