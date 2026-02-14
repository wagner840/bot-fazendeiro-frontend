import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  RefreshCw,
  ChevronDown,
  Building2,
  Check,
  LogOut,
  User,
  Shield,
  Settings,
  X,
  Bell,
  Clock,
  Briefcase,
  FileSearch,
  UserCog,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useServerNames } from '../../hooks/useEntityNames';
import { cn } from '../../lib/utils';
import { getBusinessIcon } from '../../lib/businessIcons';
import { NotificationPanel } from './NotificationPanel';

export function Header() {
  const {
    empresas,
    selectedEmpresa,
    setSelectedEmpresa,
    loadStats,
    isLoadingStats,
    setMobileMenuOpen,
  } = useApp();
  const { user, signOut, isSuperadmin, isAdmin, userFrontends, switchGuild, userFrontend, isTrial, subscription } = useAuth();
  const navigate = useNavigate();

  const [showEmpresaDropdown, setShowEmpresaDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const serverNames = useServerNames(userFrontends.map((uf) => uf.guild_id));

  const { activities, unreadCount, isLoading: isLoadingNotifications, markAsRead } = useNotifications(
    selectedEmpresa?.id ?? null
  );

  const handleOpenNotifications = () => {
    setShowNotifications(true);
    markAsRead();
  };

  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };

  useEffect(() => {
    if (showMobileSearch) {
      mobileSearchRef.current?.focus();
    }
  }, [showMobileSearch]);

  const handleRefresh = () => {
    loadStats();
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const getRoleBadge = () => {
    if (isSuperadmin) return { label: 'Superadmin', color: 'text-purple-400 bg-purple-900/30' };
    if (isAdmin) return { label: 'Admin', color: 'text-gold-400 bg-gold-900/30' };
    return { label: 'Funcionário', color: 'text-parchment-400 bg-leather-800/30' };
  };

  const roleBadge = getRoleBadge();
  const SelectedBusinessIcon = getBusinessIcon(selectedEmpresa?.tipo_empresa?.codigo);

  return (
    <header className="h-16 border-b border-leather-700/50 bg-leather-900/50 backdrop-blur-sm px-4 md:px-6 flex items-center justify-between gap-4 relative z-50">
      
      {/* Mobile Menu Toggle - Visible only on mobile */}
      <button
        className="md:hidden p-2 -ml-2 text-gold-500 hover:text-gold-400"
        onClick={() => setMobileMenuOpen(true)}
        aria-label="Abrir menu"
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
         <button
           className="p-2 text-parchment-400"
           onClick={() => setShowMobileSearch(true)}
           aria-label="Buscar"
         >
           <Search size={20} />
         </button>
      </div>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {showMobileSearch && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.15 }}
            className="md:hidden fixed inset-0 z-[200] bg-leather-950/98 flex flex-col"
          >
            <div className="flex items-center gap-2 p-4 border-b border-leather-700/50">
              <Search size={18} className="text-leather-500 flex-shrink-0" />
              <input
                ref={mobileSearchRef}
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-parchment-100 placeholder:text-parchment-600 outline-none text-base"
              />
              <button
                onClick={() => {
                  setShowMobileSearch(false);
                  setSearchQuery('');
                }}
                className="p-2 text-parchment-400 hover:text-parchment-200"
                aria-label="Fechar busca"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 p-4 text-center text-parchment-500 text-sm pt-12">
              {searchQuery
                ? 'Busca global em breve...'
                : 'Digite para buscar'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Trial Badge */}
        {isTrial && subscription && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-western bg-gold-500/10 border border-gold-500/30">
            <Clock size={14} className="text-gold-400" />
            <span className="text-xs font-heading text-gold-400">
              Trial: {subscription.dias_restantes}d restante{subscription.dias_restantes !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Notifications Bell */}
        <button
          onClick={handleOpenNotifications}
          className="relative p-2 rounded-western hover:bg-leather-800/50 transition-colors"
          title="Notificações"
          aria-label="Notificações"
        >
          <Bell
            size={18}
            className={cn(
              'text-parchment-400',
              unreadCount > 0 && 'text-gold-400'
            )}
          />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rust-500 rounded-full animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Refresh Button - Hidden on very small screens if needed, but useful */}
        <button
          onClick={handleRefresh}
          disabled={isLoadingStats}
          className="p-2 rounded-western hover:bg-leather-800/50 transition-colors hidden sm:block"
          title="Atualizar dados"
          aria-label="Atualizar dados"
        >
          <RefreshCw
            size={18}
            className={cn(
              'text-parchment-400',
              isLoadingStats && 'animate-spin'
            )}
          />
        </button>

        {/* Company Selector */}
        <div className={cn("relative", showEmpresaDropdown && "z-[10000]")}>
          <button
            onClick={() => setShowEmpresaDropdown(!showEmpresaDropdown)}
            className="flex items-center gap-2 md:gap-3 px-2 md:px-4 py-2 rounded-western bg-leather-800/50 hover:bg-leather-800 transition-colors border border-leather-700/50"
            aria-label="Selecionar empresa"
          >
            {selectedEmpresa ? (
              <SelectedBusinessIcon size={18} className="text-gold-500" />
            ) : (
              <Building2 size={18} className="text-gold-500" />
            )}
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
                  className="fixed inset-0 z-[9998]"
                  onClick={() => setShowEmpresaDropdown(false)}
                />

                {/* Dropdown */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-72 z-[9999] western-card py-2 max-h-80 overflow-y-auto"
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
                        const BusinessIcon = getBusinessIcon(empresa.tipo_empresa?.codigo);
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
                            <BusinessIcon className="w-5 h-5 text-gold-500 shrink-0" />
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

        {/* User Menu */}
        <div className={cn("relative", showUserMenu && "z-[10000]")}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-western hover:bg-leather-800/50 transition-colors"
            aria-label="Abrir menu do usuario"
          >
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Avatar"
                className="w-8 h-8 rounded-full border-2 border-leather-600"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-leather-700 flex items-center justify-center">
                <User size={16} className="text-parchment-400" />
              </div>
            )}
            <ChevronDown
              size={14}
              className={cn(
                'text-parchment-400 transition-transform duration-200 hidden sm:block',
                showUserMenu && 'rotate-180'
              )}
            />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-[9998]"
                  onClick={() => setShowUserMenu(false)}
                />

                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-64 z-[9999] western-card py-2"
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-leather-700/50">
                    <div className="flex items-center gap-3">
                      {user?.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt="Avatar"
                          className="w-10 h-10 rounded-full border-2 border-leather-600"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-leather-700 flex items-center justify-center">
                          <User size={20} className="text-parchment-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-parchment-100 truncate font-heading">
                          {user?.user_metadata?.full_name || user?.user_metadata?.name || 'Usuário'}
                        </p>
                        <span className={cn('text-xs px-2 py-0.5 rounded', roleBadge.color)}>
                          {roleBadge.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Server Selector - Manual Override */}
                  {userFrontends.length > 1 && (
                      <div className="py-2 border-b border-leather-700/50">
                          <p className="px-4 text-xs text-parchment-500 uppercase tracking-wider mb-1 font-heading">
                              Alternar Servidor
                          </p>
                          {userFrontends.map(uf => (
                              uf.guild_id && (
                                  <button
                                      key={uf.id}
                                      onClick={() => {
                                          switchGuild(uf.guild_id!);
                                          setShowUserMenu(false);
                                      }}
                                      className={cn(
                                          "w-full flex items-center justify-between px-4 py-2 hover:bg-leather-800/50 transition-colors text-left",
                                          userFrontend?.guild_id === uf.guild_id ? "text-gold-500 font-medium" : "text-parchment-300"
                                      )}
                                  >
                                      <span className="min-w-0 flex flex-col">
                                        <span className="text-sm truncate">
                                          {serverNames[uf.guild_id] || 'Sem nome cadastrado'}
                                        </span>
                                        <span className="text-xs text-parchment-500 font-mono truncate">
                                          ID: {uf.guild_id}
                                        </span>
                                      </span>
                                      {userFrontend?.guild_id === uf.guild_id && <Check size={14} />}
                                  </button>
                              )
                          ))}
                      </div>
                  )}

                  {/* Menu Items */}
                  <div className="py-1">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/dashboard/empresas');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-leather-800/50 transition-colors text-parchment-300"
                        >
                          <Briefcase size={16} />
                          <span className="text-sm">Minhas Empresas</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/dashboard/usuarios');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-leather-800/50 transition-colors text-parchment-300"
                        >
                          <UserCog size={16} />
                          <span className="text-sm">Gerenciar Usuários</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/dashboard/auditoria');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-leather-800/50 transition-colors text-parchment-300"
                        >
                          <FileSearch size={16} />
                          <span className="text-sm">Auditoria</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/dashboard/configuracoes');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-leather-800/50 transition-colors text-parchment-300"
                        >
                          <Settings size={16} />
                          <span className="text-sm">Configurações</span>
                        </button>
                      </>
                    )}

                    {isSuperadmin && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/superadmin');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-leather-800/50 transition-colors text-purple-400"
                      >
                        <Shield size={16} />
                        <span className="text-sm">Painel Superadmin</span>
                      </button>
                    )}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-leather-700/50 pt-1 mt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-rust-900/30 transition-colors text-rust-400"
                    >
                      <LogOut size={16} />
                      <span className="text-sm">Sair</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
      <NotificationPanel
        isOpen={showNotifications}
        onClose={handleCloseNotifications}
        activities={activities}
        isLoading={isLoadingNotifications}
      />
    </header>
  );
}
