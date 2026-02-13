import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Toast } from '../lib/types';
import { generateId } from '../lib/utils';
import { useAuth } from './AuthContext';
import { useEmpresas } from '../hooks/queries/useEmpresas';
import { useDashboardStats } from '../hooks/queries/useDashboardStats';
import type { Empresa, DashboardStats } from '../lib/types';

interface AppContextType {
  // Empresa state
  empresas: Empresa[];
  selectedEmpresa: Empresa | null;
  setSelectedEmpresa: (empresa: Empresa | null) => void;
  loadEmpresas: () => Promise<void>;
  refreshEmpresas: () => Promise<void>;
  isLoadingEmpresas: boolean;

  // Dashboard stats (now React Query powered)
  stats: DashboardStats | null;
  loadStats: () => Promise<void>;
  isLoadingStats: boolean;

  // Toast notifications
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  // UI State
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Empresa state
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);

  // React Query: empresas
  const {
    data: empresas = [],
    isLoading: isLoadingEmpresas,
    refetch: refetchEmpresas,
  } = useEmpresas();

  // React Query: dashboard stats
  const {
    data: stats = null,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useDashboardStats(selectedEmpresa?.id);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // UI
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-select first empresa when data loads
  useEffect(() => {
    if (!selectedEmpresa && empresas.length > 0) {
      setSelectedEmpresa(empresas[0]);
    }
  }, [empresas, selectedEmpresa]);

  // Backwards-compatible loadEmpresas (now wraps refetch)
  const loadEmpresas = useCallback(async (forGuildId?: string) => {
    const result = await refetchEmpresas();
    const data = result.data ?? [];

    if (forGuildId) {
      const match = data.find(e => e.guild_id === forGuildId);
      if (match) {
        setSelectedEmpresa(match);
      } else if (data.length > 0) {
        setSelectedEmpresa(data[0]);
      }
    }
  }, [refetchEmpresas]);

  // Backwards-compatible refreshEmpresas
  const refreshEmpresas = useCallback(async () => {
    const result = await refetchEmpresas();
    const data = result.data ?? [];

    if (selectedEmpresa) {
      const updated = data.find(e => e.id === selectedEmpresa.id);
      if (updated) {
        setSelectedEmpresa(updated);
      }
    }
  }, [refetchEmpresas, selectedEmpresa]);

  // Backwards-compatible loadStats
  const loadStats = useCallback(async () => {
    await refetchStats();
  }, [refetchStats]);

  // Toast management
  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = generateId();
    setToasts((prev) => [...prev, { ...toast, id }]);

    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync Auth Context <-> App Context (for multi-server support)
  const { switchGuild, userFrontend } = useAuth();

  useEffect(() => {
      if (selectedEmpresa && userFrontend?.guild_id && selectedEmpresa.guild_id !== userFrontend.guild_id) {
          switchGuild(selectedEmpresa.guild_id);
      }
  }, [selectedEmpresa]);

  useEffect(() => {
      if (userFrontend?.guild_id) {
          if (!selectedEmpresa || selectedEmpresa.guild_id !== userFrontend.guild_id) {
              loadEmpresas(userFrontend.guild_id);
          }
      }
  }, [userFrontend?.guild_id]);

  const value: AppContextType = {
    empresas,
    selectedEmpresa,
    setSelectedEmpresa,
    loadEmpresas,
    refreshEmpresas,
    isLoadingEmpresas,
    stats,
    loadStats,
    isLoadingStats,
    toasts,
    addToast,
    removeToast,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
