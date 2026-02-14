import { Trash2 } from 'lucide-react';
import { Modal, Button } from '../../../components/ui';
import type { UserFrontend } from '../../../context/AuthContext';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: UserFrontend | null;
  userDisplayName: string | null;
  onDeleteUser: () => Promise<void>;
}

export function DeleteUserModal({
  isOpen,
  onClose,
  selectedUser,
  userDisplayName,
  onDeleteUser,
}: DeleteUserModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rust-900/30 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-8 h-8 text-rust-500" />
        </div>

        <h2 className="font-heading text-xl text-parchment-100 mb-2">Remover Usuário?</h2>

        <p className="text-parchment-400 mb-6">
          Tem certeza que deseja remover o acesso do usuário{' '}
          <span className="text-gold-500">{userDisplayName || 'Sem nome cadastrado'}</span>?
          {selectedUser?.discord_id && (
            <span className="block text-parchment-500 font-mono text-xs mt-1">
              ID: {selectedUser.discord_id}
            </span>
          )}
          <br />
          Esta ação não pode ser desfeita.
        </p>

        <div className="flex flex-col-reverse sm:flex-row justify-center gap-2 sm:gap-3">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button onClick={onDeleteUser} className="bg-rust-600 hover:bg-rust-700 w-full sm:w-auto">
            <Trash2 className="w-4 h-4 mr-2" />
            Remover
          </Button>
        </div>
      </div>
    </Modal>
  );
}
