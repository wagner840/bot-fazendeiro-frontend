import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Warehouse,
  Users,
  MoreHorizontal,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Início' },
  { to: '/dashboard/encomendas', icon: ClipboardList, label: 'Encomendas' },
  { to: '/dashboard/estoque', icon: Warehouse, label: 'Estoque' },
  { to: '/dashboard/funcionarios', icon: Users, label: 'Equipe' },
];

export function BottomNav() {
  const { setMobileMenuOpen } = useApp();
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-leather-900 border-t border-leather-700/50 h-16 flex items-center justify-around px-2">
      {navItems.map(({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to;
        return (
          <NavLink
            key={to}
            to={to}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-0',
              isActive ? 'text-gold-500' : 'text-parchment-500'
            )}
          >
            <Icon size={20} />
            <span className="text-[10px] font-heading truncate">{label}</span>
          </NavLink>
        );
      })}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-parchment-500 transition-colors"
        aria-label="Abrir menu"
      >
        <MoreHorizontal size={20} />
        <span className="text-[10px] font-heading">Mais</span>
      </button>
    </nav>
  );
}
