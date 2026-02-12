import { Check, Package, TruckIcon } from 'lucide-react';
import {
  Modal,
  ModalFooter,
  Button,
  StatusStamp,
  Avatar,
  Progress,
} from '../../../components/ui';
import {
  formatCurrency,
  formatDateTime,
  type Encomenda,
  type EncomendaStatus,
} from '../../../lib/types';

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  encomenda: Encomenda | null;
  onUpdateStatus: (id: number, newStatus: EncomendaStatus) => Promise<void>;
}

export function DetailsModal({
  isOpen,
  onClose,
  encomenda,
  onUpdateStatus,
}: DetailsModalProps) {
  if (!encomenda) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Encomenda #${encomenda.id}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Order Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 sm:p-4 bg-leather-800/30 rounded-western">
          <div className="flex items-center gap-3 sm:gap-4">
            <Avatar name={encomenda.comprador} size="lg" />
            <div>
              <p className="font-heading text-base sm:text-lg text-parchment-100">
                {encomenda.comprador}
              </p>
              <p className="text-xs sm:text-sm text-parchment-500">
                Criado em: {formatDateTime(encomenda.data_criacao)}
              </p>
            </div>
          </div>
          <StatusStamp status={encomenda.status} />
        </div>

        {/* Order Items */}
        <div>
          <h3 className="font-heading text-sm text-parchment-400 uppercase tracking-wider mb-3">
            Itens do Pedido
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {encomenda.itens_json?.map((item, index) => {
              const progress =
                (item.quantidade_entregue / item.quantidade) * 100;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-leather-800/30 rounded-western"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-heading text-sm text-parchment-100">
                        {item.nome || item.codigo}
                      </span>
                      <span className="text-sm text-parchment-400">
                        {item.quantidade_entregue}/{item.quantidade}
                      </span>
                    </div>
                    <Progress value={progress} />
                  </div>
                  <div className="ml-4 text-right">
                    <p className="font-heading text-gold-500">
                      {formatCurrency(item.valor_unitario * item.quantidade)}
                    </p>
                    <p className="text-xs text-parchment-500">
                      {formatCurrency(item.valor_unitario)}/un
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Total */}
        <div className="flex items-center justify-between p-4 bg-gold-900/20 rounded-western border border-gold-600/30">
          <span className="font-heading text-parchment-300 uppercase">
            Valor Total
          </span>
          <span className="text-2xl font-display text-gold-500">
            {formatCurrency(encomenda.valor_total)}
          </span>
        </div>

        {/* Delivery Info */}
        {encomenda.data_entrega && (
          <div className="flex items-center gap-3 p-3 bg-green-900/20 rounded-western border border-green-600/30">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-sm text-green-300">
              Entregue em: {formatDateTime(encomenda.data_entrega)}
            </span>
          </div>
        )}

        {/* Actions */}
        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>

          {encomenda.status === 'pendente' && (
            <Button
              variant="gold"
              onClick={() => onUpdateStatus(encomenda.id, 'em_andamento')}
              leftIcon={<Package size={16} />}
            >
              Iniciar Preparo
            </Button>
          )}

          {encomenda.status === 'em_andamento' && (
            <Button
              variant="gold"
              onClick={() => onUpdateStatus(encomenda.id, 'entregue')}
              leftIcon={<TruckIcon size={16} />}
            >
              Marcar Entregue
            </Button>
          )}
        </ModalFooter>
      </div>
    </Modal>
  );
}
