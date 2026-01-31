import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Empresa, Toast, DashboardStats } from '../lib/types';
import { getEmpresas, getDashboardStats } from '../lib/supabase';
import { generateId } from '../lib/utils';
import { useAuth } from './AuthContext';

interface AppContextType {
  // Empresa state
  empresas: Empresa[];
  selectedEmpresa: Empresa | null;
  setSelectedEmpresa: (empresa: Empresa | null) => void;
  loadEmpresas: () => Promise<void>;
  refreshEmpresas: () => Promise<void>;
  isLoadingEmpresas: boolean;

  // Dashboard stats
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
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [isLoadingEmpresas, setIsLoadingEmpresas] = useState(true);

  // Stats
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // UI
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load empresas (optionally force-selecting a guild's empresa)
  const loadEmpresas = useCallback(async (forGuildId?: string) => {
    setIsLoadingEmpresas(true);
    try {
      const data = await getEmpresas();
      setEmpresas(data);

      if (forGuildId) {
        // Guild switch: select the first empresa matching the new guild
        const match = data.find(e => e.guild_id === forGuildId);
        if (match) {
          setSelectedEmpresa(match);
        } else if (data.length > 0) {
          setSelectedEmpresa(data[0]);
        }
      } else if (!selectedEmpresa && data.length > 0) {
        // Initial load: auto-select first
        setSelectedEmpresa(data[0]);
      }
    } catch (error) {
      console.error('Error loading empresas:', error);
      addToast({
        type: 'error',
        title: 'Erro ao carregar empresas',
        message: 'Não foi possível carregar a lista de empresas.',
      });
    } finally {
      setIsLoadingEmpresas(false);
    }
  }, [selectedEmpresa]);

  // Refresh empresas and update selected empresa with fresh data
  const refreshEmpresas = useCallback(async () => {
    try {
      const data = await getEmpresas();
      setEmpresas(data);

      // Update selectedEmpresa with fresh data if it exists
      if (selectedEmpresa) {
        const updated = data.find(e => e.id === selectedEmpresa.id);
        if (updated) {
          setSelectedEmpresa(updated);
        }
      }
    } catch (error) {
      console.error('Error refreshing empresas:', error);
    }
  }, [selectedEmpresa]);

  // Load stats
  const loadStats = useCallback(async () => {
    if (!selectedEmpresa) return;

    setIsLoadingStats(true);
    try {
      const data = await getDashboardStats(selectedEmpresa.id);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }, [selectedEmpresa]);

  // Toast management
  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = generateId();
    setToasts((prev) => [...prev, { ...toast, id }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Initial load
  useEffect(() => {
    loadEmpresas();
  }, []);

  // Load stats when empresa changes
  useEffect(() => {
    if (selectedEmpresa) {
      loadStats();
    }
  }, [selectedEmpresa, loadStats]);

  // Sync Auth Context <-> App Context (for multi-server support)
  const { switchGuild, userFrontend } = useAuth();

  // When user picks a different empresa, sync AuthContext to match
  useEffect(() => {
      if (selectedEmpresa && userFrontend?.guild_id && selectedEmpresa.guild_id !== userFrontend.guild_id) {
          switchGuild(selectedEmpresa.guild_id);
      }
  }, [selectedEmpresa]);

  // When user switches guild via AuthContext, reload empresas for the new guild
  useEffect(() => {
      if (userFrontend?.guild_id) {
          // Only reload if the current empresa doesn't match the new guild
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
