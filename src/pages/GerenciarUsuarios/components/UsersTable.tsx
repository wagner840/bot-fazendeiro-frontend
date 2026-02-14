import { Users, Shield, User, Edit2, Trash2, Check, X } from 'lucide-react';
import { Card, CardHeader, CardContent, DataCardMobile, ContextMenuActions } from '../../../components/ui';
import { cn } from '../../../lib/utils';
import type { UserRole, UserFrontend } from '../../../context/AuthContext';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

interface UsersTableProps {
  users: UserFrontend[];
  userNames: Record<string, string>;
  isLoading: boolean;
  currentUserDiscordId: string | undefined;
  isSuperadmin: boolean;
  editingUser: number | null;
  editRole: UserRole;
  setEditingUser: (id: number | null) => void;
  setEditRole: (role: UserRole) => void;
  onUpdateRole: (userId: number, newRole: UserRole) => Promise<void>;
  onToggleActive: (user: UserFrontend) => Promise<void>;
  onSelectUserForDelete: (user: UserFrontend) => void;
}

function getRoleIcon(role: UserRole) {
  switch (role) {
    case 'superadmin':
      return <Shield className="w-4 h-4 text-purple-400" />;
    case 'admin':
      return <Shield className="w-4 h-4 text-gold-400" />;
    default:
      return <User className="w-4 h-4 text-parchment-400" />;
  }
}

function getRoleBadge(role: UserRole) {
  switch (role) {
    case 'superadmin':
      return 'bg-purple-900/30 text-purple-400 border-purple-700';
    case 'admin':
      return 'bg-gold-900/30 text-gold-400 border-gold-700';
    default:
      return 'bg-leather-800/30 text-parchment-400 border-leather-600';
  }
}

function getRoleLabel(role: UserRole) {
  switch (role) {
    case 'superadmin':
      return 'Superadmin';
    case 'admin':
      return 'Admin';
    default:
      return 'Funcionario';
  }
}

export function UsersTable({
  users,
  userNames,
  isLoading,
  currentUserDiscordId,
  isSuperadmin,
  editingUser,
  editRole,
  setEditingUser,
  setEditRole,
  onUpdateRole,
  onToggleActive,
  onSelectUserForDelete,
}: UsersTableProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');

  const canManageUser = (user: UserFrontend) =>
    user.discord_id !== currentUserDiscordId && (isSuperadmin || user.role !== 'superadmin');

  const renderRoleCell = (user: UserFrontend) => {
    if (editingUser !== user.id) {
      return (
        <span className={cn('text-xs px-2 py-1 rounded border', getRoleBadge(user.role))}>
          {getRoleLabel(user.role)}
        </span>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <select
          value={editRole}
          onChange={(e) => setEditRole(e.target.value as UserRole)}
          className="input-western py-1 px-2 text-sm"
        >
          <option value="funcionario">Funcionario</option>
          <option value="admin">Admin</option>
          {isSuperadmin && <option value="superadmin">Superadmin</option>}
        </select>
        <button
          onClick={() => onUpdateRole(user.id, editRole)}
          className="p-1 text-green-400 hover:text-green-300"
          aria-label="Salvar permissao"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={() => setEditingUser(null)}
          className="p-1 text-rust-400 hover:text-rust-300"
          aria-label="Cancelar edicao"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gold-500" />
          <h2 className="font-heading text-lg text-parchment-100">Usuarios ({users.length})</h2>
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
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-parchment-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum usuario encontrado</p>
          </div>
        ) : isMobile ? (
          <div className="divide-y divide-leather-800/50">
            {users.map((user) => (
              <DataCardMobile
                key={user.id}
                title={userNames[user.discord_id] || user.nome || 'Sem nome cadastrado'}
                subtitle={`ID: ${user.discord_id}`}
                meta={getRoleLabel(user.role)}
                rightTop={
                  <button
                    onClick={() => onToggleActive(user)}
                    className={cn(
                      'text-xs px-2 py-1 rounded border transition-colors',
                      user.ativo
                        ? 'bg-green-900/30 text-green-400 border-green-700 hover:bg-green-900/50'
                        : 'bg-rust-900/30 text-rust-400 border-rust-700 hover:bg-rust-900/50'
                    )}
                  >
                    {user.ativo ? 'Ativo' : 'Inativo'}
                  </button>
                }
                rightBottom={renderRoleCell(user)}
                footer={
                  canManageUser(user) ? (
                    <div className="flex justify-end">
                      <ContextMenuActions
                        actions={[
                          {
                            id: 'edit',
                            label: 'Editar permissao',
                            icon: <Edit2 className="w-4 h-4" />,
                            onClick: () => {
                              setEditingUser(user.id);
                              setEditRole(user.role);
                            },
                          },
                          {
                            id: 'delete',
                            label: 'Remover usuario',
                            icon: <Trash2 className="w-4 h-4" />,
                            tone: 'danger',
                            onClick: () => onSelectUserForDelete(user),
                          },
                        ]}
                        buttonLabel="Acoes do usuario"
                      />
                    </div>
                  ) : null
                }
              />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-leather-700/50">
                  <th className="text-left px-4 py-3 text-xs text-parchment-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-parchment-500 uppercase tracking-wider">
                    Permissao
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-parchment-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs text-parchment-500 uppercase tracking-wider">
                    Acoes
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-leather-800/50 hover:bg-leather-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-leather-700 flex items-center justify-center">
                          {getRoleIcon(user.role)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-parchment-200 text-sm truncate">
                            {userNames[user.discord_id] || user.nome || 'Sem nome cadastrado'}
                          </p>
                          <p className="text-parchment-500 font-mono text-xs truncate">ID: {user.discord_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{renderRoleCell(user)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onToggleActive(user)}
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
                        {canManageUser(user) && (
                          <>
                            <button
                              onClick={() => {
                                setEditingUser(user.id);
                                setEditRole(user.role);
                              }}
                              className="p-2 text-parchment-400 hover:text-gold-400 transition-colors"
                              title="Editar permissao"
                              aria-label="Editar permissao"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onSelectUserForDelete(user)}
                              className="p-2 text-parchment-400 hover:text-rust-400 transition-colors"
                              title="Remover usuario"
                              aria-label="Remover usuario"
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
  );
}
