import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  RefreshCw,
  ChevronDown,
  Building2,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';
import { BUSINESS_ICONS } from '../../lib/types';

export function Header() {
  const {
    empresas,
    selectedEmpresa,
    setSelectedEmpresa,
    loadStats,
    isLoadingStats,
    setMobileMenuOpen,
  } = useApp();

  const [showEmpresaDropdown, setShowEmpresaDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRefresh = () => {
    loadStats();
  };

  return (
    <header className="h-16 border-b border-leather-700/50 bg-leather-900/50 backdrop-blur-sm px-4 md:px-6 flex items-center justify-between gap-4">
      
      {/* Mobile Menu Toggle - Visible only on mobile */}
      <button 
        className="md:hidden p-2 -ml-2 text-gold-500 hover:text-gold-400"
        onClick={() => setMobileMenuOpen(true)}
      >
       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>

      {/* Search Bar - Hidden on small mobile, visible on larger */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="search-western">
          <Search className="text-leather-500" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-western pl-10 py-2 text-sm"
          />
        </div>
      </div>
      
      {/* Mobile Search Icon - Visible only on mobile */}
      <div className="md:hidden flex-1 flex justify-end">
         {/* Could act as a toggle for a search overlay, but for now just a placeholder or minimal */}
         <button className="p-2 text-parchment-400">
           <Search size={20} />
         </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Refresh Button - Hidden on very small screens if needed, but useful */}
        <button
          onClick={handleRefresh}
          disabled={isLoadingStats}
          className="p-2 rounded-western hover:bg-leather-800/50 transition-colors hidden sm:block"
          title="Atualizar dados"
        >
          <RefreshCw
            size={18}
            className={cn(
              'text-parchment-400',
              isLoadingStats && 'animate-spin'
            )}
          />
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-western hover:bg-leather-800/50 transition-colors relative">
          <Bell size={18} className="text-parchment-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rust-600 rounded-full" />
        </button>

        {/* Company Selector */}
        <div className="relative">
          <button
            onClick={() => setShowEmpresaDropdown(!showEmpresaDropdown)}
            className="flex items-center gap-2 md:gap-3 px-2 md:px-4 py-2 rounded-western bg-leather-800/50 hover:bg-leather-800 transition-colors border border-leather-700/50"
          >
            <Building2 size={18} className="text-gold-500" />
            <span className="text-sm text-parchment-200 max-w-[100px] md:max-w-[150px] truncate hidden sm:block">
              {selectedEmpresa?.nome || 'Selecionar'}
            </span>
            <ChevronDown
              size={16}
              className={cn(
                'text-parchment-400 transition-transform duration-200',
                showEmpresaDropdown && 'rotate-180'
              )}
            />
          </button>

          <AnimatePresence>
            {showEmpresaDropdown && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowEmpresaDropdown(false)}
                />

                {/* Dropdown */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-72 z-50 western-card py-2 max-h-80 overflow-y-auto"
                >
                  <div className="px-4 py-2 border-b border-leather-700/50">
                    <p className="text-xs text-parchment-500 uppercase tracking-wider font-heading">
                      Empresas Disponíveis
                    </p>
                  </div>

                  {empresas.length === 0 ? (
                    <div className="px-4 py-6 text-center text-parchment-500 text-sm">
                      Nenhuma empresa encontrada
                    </div>
                  ) : (
                    <div className="py-1">
                      {empresas.map((empresa) => {
                        const icon = empresa.tipo_empresa?.codigo
                          ? BUSINESS_ICONS[empresa.tipo_empresa.codigo] || '🏢'
                          : '🏢';
                        const isSelected = selectedEmpresa?.id === empresa.id;

                        return (
                          <button
                            key={empresa.id}
                            onClick={() => {
                              setSelectedEmpresa(empresa);
                              setShowEmpresaDropdown(false);
                            }}
                            className={cn(
                              'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-leather-800/50 transition-colors',
                              isSelected && 'bg-gold-500/10'
                            )}
                          >
                            <span className="text-xl">{icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-parchment-100 truncate">
                                {empresa.nome}
                              </p>
                              <p className="text-xs text-parchment-500 truncate">
                                {empresa.tipo_empresa?.nome}
                              </p>
                            </div>
                            {isSelected && (
                              <Check size={16} className="text-gold-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
