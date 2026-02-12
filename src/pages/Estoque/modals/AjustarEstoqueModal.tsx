import { Modal, ModalFooter, Button } from '../../../components/ui';
import type { Funcionario } from '../../../lib/types';
import type { AjustarForm } from '../types';

interface AjustarEstoqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  ajustarForm: AjustarForm;
  onFormChange: (form: AjustarForm) => void;
  funcionarios: Funcionario[];
  produtoCodigos: string[];
  onAjustar: () => Promise<void>;
  isSaving: boolean;
}

export function AjustarEstoqueModal({
  isOpen,
  onClose,
  ajustarForm,
  onFormChange,
  funcionarios,
  produtoCodigos,
  onAjustar,
  isSaving,
}: AjustarEstoqueModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajustar Estoque"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-parchment-400 mb-1">Funcionario</label>
          <select
            value={ajustarForm.funcionario_id || ''}
            onChange={(e) =>
              onFormChange({ ...ajustarForm, funcionario_id: Number(e.target.value) })
            }
            className="input-western w-full"
          >
            <option value="">Selecione um funcionario</option>
            {funcionarios.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-parchment-400 mb-1">Produto</label>
          <select
            value={ajustarForm.produto_codigo}
            onChange={(e) =>
              onFormChange({ ...ajustarForm, produto_codigo: e.target.value })
            }
            className="input-western w-full"
          >
            <option value="">Selecione um produto</option>
            {produtoCodigos.map((codigo) => (
              <option key={codigo} value={codigo}>
                {codigo}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-parchment-400 mb-1">Nova Quantidade</label>
          <input
            type="number"
            min="0"
            value={ajustarForm.quantidade}
            onChange={(e) =>
              onFormChange({ ...ajustarForm, quantidade: Number(e.target.value) })
            }
            className="input-western w-full"
            placeholder="0"
          />
          <p className="text-xs text-parchment-500 mt-1">
            Use 0 para remover o item do estoque.
          </p>
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onAjustar} isLoading={isSaving}>
            Salvar
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
