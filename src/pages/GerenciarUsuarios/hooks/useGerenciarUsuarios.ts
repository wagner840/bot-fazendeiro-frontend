import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import type { UserRole, UserFrontend } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import type { CreateUserForm, UseGerenciarUsuariosReturn } from '../types';

export function useGerenciarUsuarios(): UseGerenciarUsuariosReturn {
  const { userFrontend, isSuperadmin } = useAuth();

  // Data state
  const [users, setUsers] = useState<UserFrontend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreateUserForm>({
    discord_id: '',
    role: 'funcionario',
  });

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserFrontend | null>(null);

  // Edit state
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('funcionario');

  // Alert state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    if (!userFrontend) return;

    try {
      setIsLoading(true);
      let query = supabase
        .from('usuarios_frontend')
        .select('*')
        .order('criado_em', { ascending: false });

      if (!isSuperadmin && userFrontend.guild_id) {
        query = query.eq('guild_id', userFrontend.guild_id);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  }, [userFrontend, isSuperadmin]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.discord_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.nome || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  // Create user
  const handleCreateUser = useCallback(async () => {
    if (!createForm.discord_id.trim()) {
      setError('Discord ID é obrigatório');
      return;
    }

    try {
      setError(null);

      const newUser = {
        discord_id: createForm.discord_id.trim(),
        guild_id:
          isSuperadmin && createForm.role === 'superadmin' ? null : userFrontend?.guild_id,
        role: createForm.role,
        criado_por: userFrontend?.discord_id,
      };

      const { error: insertError } = await supabase.from('usuarios_frontend').insert(newUser);

      if (insertError) {
        if (insertError.code === '23505') {
          setError('Este Discord ID já está cadastrado');
        } else {
          throw insertError;
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
  }, [createForm, isSuperadmin, userFrontend, fetchUsers]);

  // Update user role
  const handleUpdateRole = useCallback(
    async (userId: number, newRole: UserRole) => {
      try {
        setError(null);

        const { error: updateError } = await supabase
          .from('usuarios_frontend')
          .update({ role: newRole })
          .eq('id', userId);

        if (updateError) throw updateError;

        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
        setEditingUser(null);
        setSuccess('Permissão atualizada!');

        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Error updating user:', err);
        setError('Erro ao atualizar permissão');
      }
    },
    []
  );

  // Delete user
  const handleDeleteUser = useCallback(async () => {
    if (!selectedUser) return;

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('usuarios_frontend')
        .delete()
        .eq('id', selectedUser.id);

      if (deleteError) throw deleteError;

      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
      setSuccess('Usuário removido!');

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Erro ao remover usuário');
    }
  }, [selectedUser]);

  // Toggle user active status
  const handleToggleActive = useCallback(async (user: UserFrontend) => {
    try {
      const { error: updateError } = await supabase
        .from('usuarios_frontend')
        .update({ ativo: !user.ativo })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ativo: !u.ativo } : u)));
    } catch (err) {
      console.error('Error toggling user:', err);
      setError('Erro ao atualizar usuário');
    }
  }, []);

  return {
    // Data
    users,
    filteredUsers,

    // Loading states
    isLoading,

    // Search
    searchQuery,
    setSearchQuery,

    // Create modal
    showCreateModal,
    setShowCreateModal,
    createForm,
    setCreateForm,
    handleCreateUser,

    // Delete modal
    showDeleteModal,
    setShowDeleteModal,
    selectedUser,
    setSelectedUser,
    handleDeleteUser,

    // Edit
    editingUser,
    setEditingUser,
    editRole,
    setEditRole,
    handleUpdateRole,

    // Toggle active
    handleToggleActive,

    // Alerts
    error,
    setError,
    success,
  };
}
