import { Trash2 } from 'lucide-react';
import { Modal, Button } from '../../../components/ui';
import type { ProdutoReferencia } from '../../../lib/types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProdutoRef: ProdutoReferencia | null;
  onDelete: () => Promise<void>;
  isSaving: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  selectedProdutoRef,
  onDelete,
  isSaving,
}: DeleteConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rust-900/30 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-8 h-8 text-rust-500" />
        </div>

        <h2 className="font-heading text-xl text-parchment-100 mb-2">
          Excluir Produto?
        </h2>

        <p className="text-parchment-400 mb-6">
          Tem certeza que deseja excluir o produto{' '}
          <span className="text-gold-500 font-mono">{selectedProdutoRef?.nome}</span>?
          <br />
          Esta ação não pode ser desfeita.
        </p>

        <div className="flex justify-center gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            onClick={onDelete}
            isLoading={isSaving}
            className="bg-rust-600 hover:bg-rust-700"
            leftIcon={<Trash2 size={16} />}
          >
            Excluir
          </Button>
        </div>
      </div>
    </Modal>
  );
}
