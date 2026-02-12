import { Package, Check } from 'lucide-react';
import { Modal, ModalFooter, Button, Input } from '../../../components/ui';
import { formatCurrency, type ProdutoEmpresa } from '../../../lib/types';

interface EditPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: ProdutoEmpresa | null;
  editPrecoVenda: string;
  editPrecoPagamento: string;
  onPrecoVendaChange: (value: string) => void;
  onPrecoPagamentoChange: (value: string) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

export function EditPriceModal({
  isOpen,
  onClose,
  editingProduct,
  editPrecoVenda,
  editPrecoPagamento,
  onPrecoVendaChange,
  onPrecoPagamentoChange,
  onSave,
  isSaving,
}: EditPriceModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Preços"
      size="md"
    >
      {editingProduct && (
        <div className="space-y-6">
          {/* Product Info */}
          <div className="p-4 bg-leather-800/30 rounded-western">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-western bg-leather-700/50">
                <Package className="w-6 h-6 text-gold-500" />
              </div>
              <div>
                <p className="font-heading text-lg text-parchment-100">
                  {editingProduct.produto_referencia?.nome}
                </p>
                <p className="text-sm text-parchment-500">
                  Código: {editingProduct.produto_referencia?.codigo} •{' '}
                  {editingProduct.produto_referencia?.categoria}
                </p>
              </div>
            </div>
          </div>

          {/* Reference Prices */}
          <div className="p-4 bg-leather-800/20 rounded-western border border-leather-700/30">
            <p className="text-xs text-parchment-500 uppercase tracking-wider mb-2">
              Preços de Referência (Downtown)
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-parchment-400">Mínimo:</span>
              <span className="font-heading text-parchment-300">
                {formatCurrency(editingProduct.produto_referencia?.preco_minimo || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-parchment-400">Máximo:</span>
              <span className="font-heading text-parchment-300">
                {formatCurrency(editingProduct.produto_referencia?.preco_maximo || 0)}
              </span>
            </div>
          </div>

          {/* Price Inputs */}
          <div className="space-y-4">
            <Input
              label="Preço de Venda (R$)"
              type="number"
              step="0.01"
              min="0"
              value={editPrecoVenda}
              onChange={(e) => onPrecoVendaChange(e.target.value)}
              hint="Preço cobrado do cliente"
            />

            <Input
              label="Pagamento ao Funcionário (R$)"
              type="number"
              step="0.01"
              min="0"
              value={editPrecoPagamento}
              onChange={(e) => onPrecoPagamentoChange(e.target.value)}
              hint="Valor pago ao funcionário por unidade produzida"
            />

            {/* Margin Preview */}
            {editPrecoVenda && editPrecoPagamento && (
              <div className="p-3 bg-gold-900/20 rounded-western border border-gold-600/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-parchment-400">Margem:</span>
                  <span className="font-heading text-gold-400">
                    {formatCurrency(
                      parseFloat(editPrecoVenda) - parseFloat(editPrecoPagamento)
                    )}{' '}
                    (
                    {(
                      ((parseFloat(editPrecoVenda) - parseFloat(editPrecoPagamento)) /
                        parseFloat(editPrecoVenda)) *
                      100
                    ).toFixed(0)}
                    %)
                  </span>
                </div>
              </div>
            )}
          </div>

          <ModalFooter>
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="gold"
              onClick={onSave}
              isLoading={isSaving}
              leftIcon={<Check size={16} />}
            >
              Salvar
            </Button>
          </ModalFooter>
        </div>
      )}
    </Modal>
  );
}
