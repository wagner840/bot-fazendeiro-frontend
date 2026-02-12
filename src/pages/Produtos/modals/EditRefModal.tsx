import { Check } from 'lucide-react';
import { Modal, ModalFooter, Button, Input } from '../../../components/ui';
import type { TipoEmpresa } from '../../../lib/types';
import type { ProdutoRefForm } from '../types';

interface EditRefModalProps {
  isOpen: boolean;
  onClose: () => void;
  tiposEmpresa: TipoEmpresa[];
  produtoForm: ProdutoRefForm;
  onFormChange: (form: ProdutoRefForm) => void;
  onUpdate: () => Promise<void>;
  isSaving: boolean;
  adminError: string | null;
}

export function EditRefModal({
  isOpen,
  onClose,
  tiposEmpresa,
  produtoForm,
  onFormChange,
  onUpdate,
  isSaving,
  adminError,
}: EditRefModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Produto de Referência"
      size="lg"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-parchment-400 mb-1">Tipo de Empresa *</label>
            <select
              value={produtoForm.tipo_empresa_id}
              onChange={(e) => onFormChange({ ...produtoForm, tipo_empresa_id: Number(e.target.value) })}
              className="input-western w-full"
            >
              {tiposEmpresa.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.icone} {tipo.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-parchment-400 mb-1">Código *</label>
            <Input
              value={produtoForm.codigo}
              onChange={(e) => onFormChange({ ...produtoForm, codigo: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-parchment-400 mb-1">Nome *</label>
            <Input
              value={produtoForm.nome}
              onChange={(e) => onFormChange({ ...produtoForm, nome: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-parchment-400 mb-1">Categoria</label>
            <Input
              value={produtoForm.categoria}
              onChange={(e) => onFormChange({ ...produtoForm, categoria: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-parchment-400 mb-1">Preço Mínimo *</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={produtoForm.preco_minimo}
              onChange={(e) => onFormChange({ ...produtoForm, preco_minimo: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="block text-sm text-parchment-400 mb-1">Preço Máximo *</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={produtoForm.preco_maximo}
              onChange={(e) => onFormChange({ ...produtoForm, preco_maximo: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="block text-sm text-parchment-400 mb-1">Unidade</label>
            <Input
              value={produtoForm.unidade}
              onChange={(e) => onFormChange({ ...produtoForm, unidade: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="ativo-edit"
            checked={produtoForm.ativo}
            onChange={(e) => onFormChange({ ...produtoForm, ativo: e.target.checked })}
            className="w-4 h-4"
          />
          <label htmlFor="ativo-edit" className="text-sm text-parchment-400">
            Produto ativo
          </label>
        </div>

        {adminError && (
          <div className="p-3 bg-rust-900/30 border border-rust-700 rounded-western text-rust-400 text-sm">
            {adminError}
          </div>
        )}

        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onUpdate} isLoading={isSaving} leftIcon={<Check size={16} />}>
            Salvar Alterações
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
