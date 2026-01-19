import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
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
  const { selectedEmpresa, sidebarCollapsed, setSidebarCollapsed } = useApp();

  const businessIcon = selectedEmpresa?.tipo_empresa?.codigo
    ? BUSINESS_ICONS[selectedEmpresa.tipo_empresa.codigo] || '🏢'
    : '🏢';

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/funcionarios', icon: <Users size={20} />, label: 'Funcionários' },
    { to: '/produtos', icon: <Package size={20} />, label: 'Produtos' },
    { to: '/encomendas', icon: <ClipboardList size={20} />, label: 'Encomendas' },
    { to: '/financeiro', icon: <DollarSign size={20} />, label: 'Financeiro' },
    { to: '/configuracoes', icon: <Settings size={20} />, label: 'Configurações' },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen flex flex-col bg-leather-900/95 border-r border-leather-700/50 relative"
    >
      {/* Logo / Brand */}
      <div className="p-4 border-b border-leather-700/50">
        <div className={cn(
          'flex items-center gap-3',
          sidebarCollapsed && 'justify-center'
        )}>
          <div className="w-10 h-10 rounded-western bg-gradient-to-br from-gold-500 to-whiskey-600 flex items-center justify-center shadow-gold-glow">
            <Wheat className="w-6 h-6 text-leather-950" />
          </div>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overflow-hidden"
            >
              <h1 className="font-display text-lg text-gold-500 leading-tight">
                Fazendeiro
              </h1>
              <p className="text-xs text-parchment-500 font-body">
                Painel Administrativo
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Company Selector */}
      {selectedEmpresa && (
        <div className={cn(
          'p-4 border-b border-leather-700/50',
          sidebarCollapsed && 'p-2'
        )}>
          <div className={cn(
            'flex items-center gap-3 p-3 rounded-western bg-leather-800/50',
            sidebarCollapsed && 'justify-center p-2'
          )}>
            <span className="text-2xl">{businessIcon}</span>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden flex-1 min-w-0"
              >
                <p className="font-heading text-sm text-parchment-100 truncate">
                  {selectedEmpresa.nome}
                </p>
                <p className="text-xs text-parchment-500 truncate">
                  {selectedEmpresa.tipo_empresa?.nome}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            collapsed={sidebarCollapsed}
          />
        ))}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-leather-800 border border-leather-600/50 flex items-center justify-center hover:bg-leather-700 transition-colors shadow-western"
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
        sidebarCollapsed && 'p-2'
      )}>
        {!sidebarCollapsed ? (
          <p className="text-xs text-parchment-600 text-center font-body">
            Bot Fazendeiro v2.1
          </p>
        ) : (
          <p className="text-xs text-parchment-600 text-center">v2.1</p>
        )}
      </div>
    </motion.aside>
  );
}
