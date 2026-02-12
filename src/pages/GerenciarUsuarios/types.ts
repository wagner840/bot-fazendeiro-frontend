import type { UserRole, UserFrontend } from '../../context/AuthContext';

export interface CreateUserForm {
  discord_id: string;
  role: UserRole;
}

export interface UseGerenciarUsuariosReturn {
  // Data
  users: UserFrontend[];
  filteredUsers: UserFrontend[];

  // Loading states
  isLoading: boolean;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Create modal
  showCreateModal: boolean;
  setShowCreateModal: (show: boolean) => void;
  createForm: CreateUserForm;
  setCreateForm: (form: CreateUserForm) => void;
  handleCreateUser: () => Promise<void>;

  // Delete modal
  showDeleteModal: boolean;
  setShowDeleteModal: (show: boolean) => void;
  selectedUser: UserFrontend | null;
  setSelectedUser: (user: UserFrontend | null) => void;
  handleDeleteUser: () => Promise<void>;

  // Edit
  editingUser: number | null;
  setEditingUser: (id: number | null) => void;
  editRole: UserRole;
  setEditRole: (role: UserRole) => void;
  handleUpdateRole: (userId: number, newRole: UserRole) => Promise<void>;

  // Toggle active
  handleToggleActive: (user: UserFrontend) => Promise<void>;

  // Alerts
  error: string | null;
  setError: (error: string | null) => void;
  success: string | null;
}
