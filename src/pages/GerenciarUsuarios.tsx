import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  User,
  Trash2,
  Edit2,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserRole, UserFrontend } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, CardContent, Button, Input, Modal } from '../components/ui';
import { cn } from '../lib/utils';

interface CreateUserForm {
  discord_id: string;
  role: UserRole;
}

export function GerenciarUsuarios() {
  const { userFrontend, isSuperadmin, isAdmin } = useAuth();
  const [users, setUsers] = useState<UserFrontend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserFrontend | null>(null);
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('funcionario');
  const [createForm, setCreateForm] = useState<CreateUserForm>({
    discord_id: '',
    role: 'funcionario',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch users
  const fetchUsers = async () => {
    if (!userFrontend) return;

    try {
      setIsLoading(true);
      let query = supabase
        .from('usuarios_frontend')
        .select('*')
        .order('criado_em', { ascending: false });

      // If not superadmin, filter by guild_id
      if (!isSuperadmin && userFrontend.guild_id) {
        query = query.eq('guild_id', userFrontend.guild_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [userFrontend]);

  // Create user
  const handleCreateUser = async () => {
    if (!createForm.discord_id.trim()) {
      setError('Discord ID é obrigatório');
      return;
    }

    try {
      setError(null);

      const newUser = {
        discord_id: createForm.discord_id.trim(),
        guild_id: isSuperadmin && createForm.role === 'superadmin' ? null : userFrontend?.guild_id,
        role: createForm.role,
        criado_por: userFrontend?.discord_id,
      };

      const { error } = await supabase
        .from('usuarios_frontend')
        .insert(newUser);

      if (error) {
        if (error.code === '23505') {
          setError('Este Discord ID já está cadastrado');
        } else {
          throw error;
        }
        return;
      }

      setSuccess('Usuário criado com sucesso!');
      setShowCreateModal(false);
      setCreateForm({ discord_id: '', role: 'funcionario' });
      fetchUsers();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Erro ao criar usuário');
    }
  };

  // Update user role
  const handleUpdateRole = async (userId: number, newRole: UserRole) => {
    try {
      setError(null);

      const { error } = await supabase
        .from('usuarios_frontend')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(u =>
        u.id === userId ? { ...u, role: newRole } : u
      ));
      setEditingUser(null);
      setSuccess('Permissão atualizada!');

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Erro ao atualizar permissão');
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setError(null);

      const { error } = await supabase
        .from('usuarios_frontend')
        .delete()
        .eq('id', selectedUser.id);

      if (error) throw error;

      setUsers(users.filter(u => u.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
      setSuccess('Usuário removido!');

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Erro ao remover usuário');
    }
  };

  // Toggle user active status
  const handleToggleActive = async (user: UserFrontend) => {
    try {
      const { error } = await supabase
        .from('usuarios_frontend')
        .update({ ativo: !user.ativo })
        .eq('id', user.id);

      if (error) throw error;

      setUsers(users.map(u =>
        u.id === user.id ? { ...u, ativo: !u.ativo } : u
      ));
    } catch (err) {
      console.error('Error toggling user:', err);
      setError('Erro ao atualizar usuário');
    }
  };

  // Filter users
  const filteredUsers = users.filter(user =>
    user.discord_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'superadmin':
        return <Shield className="w-4 h-4 text-purple-400" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-gold-400" />;
      default:
        return <User className="w-4 h-4 text-parchment-400" />;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-900/30 text-purple-400 border-purple-700';
      case 'admin':
        return 'bg-gold-900/30 text-gold-400 border-gold-700';
      default:
        return 'bg-leather-800/30 text-parchment-400 border-leather-600';
    }
  };

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-gold-500">Gerenciar Usuários</h1>
          <p className="text-parchment-400 mt-1">
            Controle de acesso ao sistema
          </p>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
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
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gold-500" />
            <h2 className="font-heading text-lg text-parchment-100">
              Usuários ({filteredUsers.length})
            </h2>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="skeleton w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-1/3" />
                    <div className="skeleton h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-parchment-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-leather-700/50">
                    <th className="text-left px-4 py-3 text-xs text-parchment-500 uppercase tracking-wider">
                      Discord ID
                    </th>
                    <th className="text-left px-4 py-3 text-xs text-parchment-500 uppercase tracking-wider">
                      Permissão
                    </th>
                    <th className="text-left px-4 py-3 text-xs text-parchment-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 text-xs text-parchment-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-leather-800/50 hover:bg-leather-800/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-leather-700 flex items-center justify-center">
                            {getRoleIcon(user.role)}
                          </div>
                          <span className="text-parchment-200 font-mono text-sm">
                            {user.discord_id}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {editingUser === user.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={editRole}
                              onChange={(e) => setEditRole(e.target.value as UserRole)}
                              className="input-western py-1 px-2 text-sm"
                            >
                              <option value="funcionario">Funcionário</option>
                              <option value="admin">Admin</option>
                              {isSuperadmin && (
                                <option value="superadmin">Superadmin</option>
                              )}
                            </select>
                            <button
                              onClick={() => handleUpdateRole(user.id, editRole)}
                              className="p-1 text-green-400 hover:text-green-300"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="p-1 text-rust-400 hover:text-rust-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className={cn(
                            'text-xs px-2 py-1 rounded border',
                            getRoleBadge(user.role)
                          )}>
                            {user.role === 'superadmin' ? 'Superadmin' :
                             user.role === 'admin' ? 'Admin' : 'Funcionário'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={cn(
                            'text-xs px-2 py-1 rounded border transition-colors',
                            user.ativo
                              ? 'bg-green-900/30 text-green-400 border-green-700 hover:bg-green-900/50'
                              : 'bg-rust-900/30 text-rust-400 border-rust-700 hover:bg-rust-900/50'
                          )}
                        >
                          {user.ativo ? 'Ativo' : 'Inativo'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Don't allow editing own role or superadmin if not superadmin */}
                          {user.discord_id !== userFrontend?.discord_id &&
                           (isSuperadmin || user.role !== 'superadmin') && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingUser(user.id);
                                  setEditRole(user.role);
                                }}
                                className="p-2 text-parchment-400 hover:text-gold-400 transition-colors"
                                title="Editar permissão"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDeleteModal(true);
                                }}
                                className="p-2 text-parchment-400 hover:text-rust-400 transition-colors"
                                title="Remover usuário"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <div className="p-6">
          <h2 className="font-heading text-xl text-parchment-100 mb-4">
            Adicionar Novo Usuário
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-parchment-400 mb-1">
                Discord ID
              </label>
              <Input
                value={createForm.discord_id}
                onChange={(e) => setCreateForm({ ...createForm, discord_id: e.target.value })}
                placeholder="Ex: 123456789012345678"
              />
              <p className="text-xs text-parchment-600 mt-1">
                ID numérico do usuário no Discord
              </p>
            </div>

            <div>
              <label className="block text-sm text-parchment-400 mb-1">
                Permissão
              </label>
              <select
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as UserRole })}
                className="input-western w-full"
              >
                <option value="funcionario">Funcionário</option>
                <option value="admin">Admin</option>
                {isSuperadmin && (
                  <option value="superadmin">Superadmin</option>
                )}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateUser}>
              <UserPlus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-rust-900/30 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-rust-500" />
          </div>

          <h2 className="font-heading text-xl text-parchment-100 mb-2">
            Remover Usuário?
          </h2>

          <p className="text-parchment-400 mb-6">
            Tem certeza que deseja remover o acesso do usuário{' '}
            <span className="text-gold-500 font-mono">{selectedUser?.discord_id}</span>?
            <br />
            Esta ação não pode ser desfeita.
          </p>

          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteUser}
              className="bg-rust-600 hover:bg-rust-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remover
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}

export default GerenciarUsuarios;
