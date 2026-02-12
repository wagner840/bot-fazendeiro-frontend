import { UserPlus } from 'lucide-react';
import { Modal, Button, Input } from '../../../components/ui';
import type { UserRole } from '../../../context/AuthContext';
import type { CreateUserForm } from '../types';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  createForm: CreateUserForm;
  setCreateForm: (form: CreateUserForm) => void;
  onCreateUser: () => Promise<void>;
  isSuperadmin: boolean;
}

export function CreateUserModal({
  isOpen,
  onClose,
  createForm,
  setCreateForm,
  onCreateUser,
  isSuperadmin,
}: CreateUserModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="font-heading text-xl text-parchment-100 mb-4">Adicionar Novo Usuário</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-parchment-400 mb-1">Discord ID</label>
            <Input
              value={createForm.discord_id}
              onChange={(e) => setCreateForm({ ...createForm, discord_id: e.target.value })}
              placeholder="Ex: 123456789012345678"
            />
            <p className="text-xs text-parchment-600 mt-1">ID numérico do usuário no Discord</p>
          </div>

          <div>
            <label className="block text-sm text-parchment-400 mb-1">Permissão</label>
            <select
              value={createForm.role}
              onChange={(e) =>
                setCreateForm({ ...createForm, role: e.target.value as UserRole })
              }
              className="input-western w-full"
            >
              <option value="funcionario">Funcionário</option>
              <option value="admin">Admin</option>
              {isSuperadmin && <option value="superadmin">Superadmin</option>}
            </select>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button onClick={onCreateUser} className="w-full sm:w-auto">
            <UserPlus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
