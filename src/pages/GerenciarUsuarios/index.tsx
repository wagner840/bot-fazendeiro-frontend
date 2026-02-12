import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, Shield, AlertTriangle, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, Button, Input } from '../../components/ui';
import { usePageTitle } from '../../hooks/usePageTitle';

import { useGerenciarUsuarios } from './hooks/useGerenciarUsuarios';
import { UsersTable } from './components/UsersTable';
import { CreateUserModal } from './modals/CreateUserModal';
import { DeleteUserModal } from './modals/DeleteUserModal';

export function GerenciarUsuarios() {
  usePageTitle('Gerenciar Usuários');
  const { userFrontend, isSuperadmin, isAdmin } = useAuth();

  const {
    filteredUsers,
    isLoading,
    searchQuery,
    setSearchQuery,
    showCreateModal,
    setShowCreateModal,
    createForm,
    setCreateForm,
    handleCreateUser,
    showDeleteModal,
    setShowDeleteModal,
    selectedUser,
    setSelectedUser,
    handleDeleteUser,
    editingUser,
    setEditingUser,
    editRole,
    setEditRole,
    handleUpdateRole,
    handleToggleActive,
    error,
    setError,
    success,
  } = useGerenciarUsuarios();

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Shield className="w-16 h-16 text-rust-500 mx-auto mb-4" />
          <h2 className="font-heading text-xl text-parchment-200 mb-2">Acesso Restrito</h2>
          <p className="text-parchment-500">Apenas administradores podem gerenciar usuários.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-gold-500">Gerenciar Usuários</h1>
          <p className="text-parchment-400 mt-1 text-sm sm:text-base">
            Controle de acesso ao sistema
          </p>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <UserPlus className="w-4 h-4" />
          Novo Usuário
        </Button>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-rust-900/30 border border-rust-700 rounded-western text-rust-400 flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-green-900/30 border border-green-700 rounded-western text-green-400 flex items-center gap-3"
          >
            <Check className="w-5 h-5" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-leather-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por Discord ID ou permissão..."
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <UsersTable
        users={filteredUsers}
        isLoading={isLoading}
        currentUserDiscordId={userFrontend?.discord_id}
        isSuperadmin={isSuperadmin}
        editingUser={editingUser}
        editRole={editRole}
        setEditingUser={setEditingUser}
        setEditRole={setEditRole}
        onUpdateRole={handleUpdateRole}
        onToggleActive={handleToggleActive}
        onSelectUserForDelete={(user) => {
          setSelectedUser(user);
          setShowDeleteModal(true);
        }}
      />

      {/* Modals */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        createForm={createForm}
        setCreateForm={setCreateForm}
        onCreateUser={handleCreateUser}
        isSuperadmin={isSuperadmin}
      />

      <DeleteUserModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        selectedUser={selectedUser}
        onDeleteUser={handleDeleteUser}
      />
    </motion.div>
  );
}

export default GerenciarUsuarios;
