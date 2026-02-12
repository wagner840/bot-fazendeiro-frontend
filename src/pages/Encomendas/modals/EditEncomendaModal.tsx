import { useState } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { Modal, ModalFooter, Button, Input } from '../../../components/ui';
import type { ProdutoEmpresa, EncomendaStatus } from '../../../lib/types';
import { formatCurrency } from '../../../lib/types';
import type { EncomendaForm, EncomendaItemForm } from '../types';

interface EditEncomendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  encomendaForm: EncomendaForm;
  onFormChange: (form: EncomendaForm) => void;
  onUpdate: () => Promise<void>;
  isSaving: boolean;
  adminError: string | null;
  produtos: ProdutoEmpresa[];
}

export function EditEncomendaModal({
  isOpen,
  onClose,
  encomendaForm,
  onFormChange,
  onUpdate,
  isSaving,
  adminError,
  produtos,
}: EditEncomendaModalProps) {
  const [selectedProdutoId, setSelectedProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState(1);

  const valorTotal = encomendaForm.itens.reduce(
    (sum, item) => sum + item.quantidade * item.valor_unitario,
    0
  );

  function handleAddItem() {
    const produto = produtos.find((p) => p.id === Number(selectedProdutoId));
    if (!produto?.produto_referencia) return;

    const alreadyAdded = encomendaForm.itens.some(
      (i) => i.codigo === produto.produto_referencia!.codigo
    );
    if (alreadyAdded) return;

    const newItem: EncomendaItemForm = {
      codigo: produto.produto_referencia.codigo,
      nome: produto.produto_referencia.nome,
      quantidade,
      valor_unitario: produto.preco_venda,
    };

    onFormChange({
      ...encomendaForm,
      itens: [...encomendaForm.itens, newItem],
    });
    setSelectedProdutoId('');
    setQuantidade(1);
  }

  function handleRemoveItem(codigo: string) {
    onFormChange({
      ...encomendaForm,
      itens: encomendaForm.itens.filter((i) => i.codigo !== codigo),
    });
  }

  function handleItemQuantityChange(codigo: string, qty: number) {
    onFormChange({
      ...encomendaForm,
      itens: encomendaForm.itens.map((i) =>
        i.codigo === codigo ? { ...i, quantidade: Math.max(1, qty) } : i
      ),
    });
  }

  const availableProdutos = produtos.filter(
    (p) =>
      p.produto_referencia &&
      !encomendaForm.itens.some((i) => i.codigo === p.produto_referencia!.codigo)
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Encomenda" size="lg">
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-parchment-400 mb-1">Comprador *</label>
          <Input
            value={encomendaForm.comprador}
            onChange={(e) => onFormChange({ ...encomendaForm, comprador: e.target.value })}
            placeholder="Nome do cliente"
          />
        </div>

        {/* Product Selector */}
        <div>
          <label className="block text-sm text-parchment-400 mb-1">Adicionar Produto</label>
          <div className="flex gap-2">
            <select
              value={selectedProdutoId}
              onChange={(e) => setSelectedProdutoId(e.target.value)}
              className="input-western flex-1"
            >
              <option value="">Selecione um produto...</option>
              {availableProdutos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.produto_referencia!.nome} — {formatCurrency(p.preco_venda)}
                </option>
              ))}
            </select>
            <Input
              type="number"
              min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20"
            />
            <Button
              onClick={handleAddItem}
              disabled={!selectedProdutoId}
              leftIcon={<Plus size={16} />}
              className="flex-shrink-0"
            >
              <span className="hidden sm:inline">Adicionar</span>
            </Button>
          </div>
        </div>

        {/* Items List */}
        {encomendaForm.itens.length > 0 && (
          <div>
            <label className="block text-sm text-parchment-400 mb-2">
              Itens da Encomenda ({encomendaForm.itens.length})
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {encomendaForm.itens.map((item) => (
                <div
                  key={item.codigo}
                  className="flex items-center gap-2 p-2 bg-leather-800/30 rounded-western border border-leather-700/30"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-parchment-200 truncate">{item.nome}</p>
                    <p className="text-xs text-parchment-500">
                      {formatCurrency(item.valor_unitario)} / un
                    </p>
                  </div>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantidade}
                    onChange={(e) =>
                      handleItemQuantityChange(
                        item.codigo,
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="w-16 text-center"
                  />
                  <span className="text-sm text-gold-400 w-24 text-right flex-shrink-0">
                    {formatCurrency(item.quantidade * item.valor_unitario)}
                  </span>
                  <button
                    onClick={() => handleRemoveItem(item.codigo)}
                    className="p-1.5 text-rust-400 hover:text-rust-300 hover:bg-rust-900/30 rounded transition-colors flex-shrink-0"
                    aria-label="Remover item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-leather-700/30">
              <span className="text-sm text-parchment-400 font-heading">Total</span>
              <span className="text-lg text-gold-400 font-heading">
                {formatCurrency(valorTotal)}
              </span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm text-parchment-400 mb-1">Status</label>
          <select
            value={encomendaForm.status}
            onChange={(e) => onFormChange({ ...encomendaForm, status: e.target.value as EncomendaStatus })}
            className="input-western w-full"
          >
            <option value="pendente">Pendente</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="entregue">Entregue</option>
          </select>
        </div>

        {adminError && (
          <div className="p-3 bg-rust-900/30 border border-rust-700 rounded-western text-rust-400 text-sm">
            {adminError}
          </div>
        )}

        <ModalFooter className="flex-col-reverse sm:flex-row">
          <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button onClick={onUpdate} isLoading={isSaving} leftIcon={<Check size={16} />} className="w-full sm:w-auto">
            Salvar Alterações
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
