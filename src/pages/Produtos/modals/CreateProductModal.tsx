import { Plus } from 'lucide-react';
import { Modal, ModalFooter, Button, Input } from '../../../components/ui';
import type { TipoEmpresa } from '../../../lib/types';
import type { ProdutoRefForm } from '../types';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSuperadmin: boolean;
  tiposEmpresa: TipoEmpresa[];
  produtoForm: ProdutoRefForm;
  onFormChange: (form: ProdutoRefForm) => void;
  onCreate: () => Promise<void>;
  isSaving: boolean;
  adminError: string | null;
  slugify: (text: string) => string;
}

export function CreateProductModal({
  isOpen,
  onClose,
  isSuperadmin,
  tiposEmpresa,
  produtoForm,
  onFormChange,
  onCreate,
  isSaving,
  adminError,
  slugify,
}: CreateProductModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isSuperadmin ? "Novo Produto de Referência" : "Novo Produto"}
      size={isSuperadmin ? "lg" : "md"}
    >
      <div className="space-y-4">
        {isSuperadmin ? (
          <>
            {/* Full form for superadmin */}
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
                  placeholder="Ex: CARNE_BOVINA"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-parchment-400 mb-1">Nome *</label>
                <Input
                  value={produtoForm.nome}
                  onChange={(e) => onFormChange({ ...produtoForm, nome: e.target.value })}
                  placeholder="Ex: Carne Bovina"
                />
              </div>
              <div>
                <label className="block text-sm text-parchment-400 mb-1">Categoria</label>
                <Input
                  value={produtoForm.categoria}
                  onChange={(e) => onFormChange({ ...produtoForm, categoria: e.target.value })}
                  placeholder="Ex: Carnes"
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
                  type="text"
                  placeholder="0,00"
                  value={produtoForm.preco_maximo}
                  onChange={(e) => onFormChange({ ...produtoForm, preco_maximo: e.target.value as unknown as number })}
                />
              </div>
              <div>
                <label className="block text-sm text-parchment-400 mb-1">Unidade</label>
                <Input
                  value={produtoForm.unidade}
                  onChange={(e) => onFormChange({ ...produtoForm, unidade: e.target.value })}
                  placeholder="un"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ativo-create"
                checked={produtoForm.ativo}
                onChange={(e) => onFormChange({ ...produtoForm, ativo: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="ativo-create" className="text-sm text-parchment-400">
                Produto ativo
              </label>
            </div>
          </>
        ) : (
          <>
            {/* Simplified form for regular admin */}
            <div>
              <label className="block text-sm text-parchment-400 mb-1">Nome do Produto *</label>
              <Input
                value={produtoForm.nome}
                onChange={(e) => onFormChange({ ...produtoForm, nome: e.target.value })}
                placeholder="Ex: Carne Bovina"
              />
              <p className="text-xs text-parchment-600 mt-1">
                Código gerado automaticamente: {produtoForm.nome.trim() ? slugify(produtoForm.nome.trim()) : '—'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div>
              <label className="block text-sm text-parchment-400 mb-1">Categoria</label>
              <Input
                value={produtoForm.categoria}
                onChange={(e) => onFormChange({ ...produtoForm, categoria: e.target.value })}
                placeholder="Ex: Carnes (opcional)"
              />
            </div>

            <div className="p-3 bg-leather-800/20 rounded-western border border-leather-700/30 text-xs text-parchment-500">
              O produto será adicionado ao catálogo com preço de venda = preço mínimo e pagamento = 25%.
            </div>
          </>
        )}

        {adminError && (
          <div className="p-3 bg-rust-900/30 border border-rust-700 rounded-western text-rust-400 text-sm">
            {adminError}
          </div>
        )}

        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onCreate} isLoading={isSaving} leftIcon={<Plus size={16} />}>
            Criar Produto
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
