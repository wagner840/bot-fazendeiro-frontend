import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Empresa, Toast, DashboardStats } from '../lib/types';
import { getEmpresas, getDashboardStats } from '../lib/supabase';
import { generateId } from '../lib/utils';

interface AppContextType {
  // Empresa state
  empresas: Empresa[];
  selectedEmpresa: Empresa | null;
  setSelectedEmpresa: (empresa: Empresa | null) => void;
  loadEmpresas: () => Promise<void>;
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

  // Load empresas
  const loadEmpresas = useCallback(async () => {
    setIsLoadingEmpresas(true);
    try {
      const data = await getEmpresas();
      setEmpresas(data);

      // Auto-select first empresa if none selected
      if (!selectedEmpresa && data.length > 0) {
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

  const value: AppContextType = {
    empresas,
    selectedEmpresa,
    setSelectedEmpresa,
    loadEmpresas,
    isLoadingEmpresas,
    stats,
    loadStats,
    isLoadingStats,
    toasts,
    addToast,
    removeToast,
    sidebarCollapsed,
    setSidebarCollapsed,
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
