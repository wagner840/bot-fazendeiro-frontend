import { Modal, ModalFooter, Button, Badge } from '../../../components/ui';
import { formatCurrency, formatDateTime, type HistoricoPagamento } from '../../../lib/types';
import { TIPO_LABELS, TIPO_VARIANTS } from '../types';

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  funcionarioNome: string;
  funcionarioHistorico: HistoricoPagamento[];
  loadingDetails: boolean;
}

export function DetailsModal({
  isOpen,
  onClose,
  funcionarioNome,
  funcionarioHistorico,
  loadingDetails,
}: DetailsModalProps) {
  const total = funcionarioHistorico.reduce((sum, p) => sum + p.valor, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Historico - ${funcionarioNome}`} size="lg">
      <div className="space-y-4">
        {loadingDetails ? (
          <div className="py-8 text-center">
            <div className="w-8 h-8 mx-auto border-2 border-leather-700 border-t-gold-500 rounded-full animate-spin" />
          </div>
        ) : funcionarioHistorico.length === 0 ? (
          <p className="text-center text-parchment-500 py-4">Nenhum pagamento registrado</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {funcionarioHistorico.map((pag) => (
              <div
                key={pag.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-leather-800/30 rounded-western gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={TIPO_VARIANTS[pag.tipo] || 'default'}>
                      {TIPO_LABELS[pag.tipo] || pag.tipo}
                    </Badge>
                    <span className="text-xs text-parchment-500">
                      {formatDateTime(pag.data_pagamento)}
                    </span>
                  </div>
                  {pag.descricao && (
                    <p className="text-xs sm:text-sm text-parchment-400 mt-1 break-words">
                      {pag.descricao}
                    </p>
                  )}
                </div>
                <span className="font-heading text-gold-500 text-base sm:text-lg shrink-0">
                  {formatCurrency(pag.valor)}
                </span>
              </div>
            ))}
          </div>
        )}

        {funcionarioHistorico.length > 0 && (
          <div className="p-3 bg-leather-800/50 rounded-western border-t border-leather-700">
            <div className="flex justify-between items-center">
              <span className="text-parchment-400">Total de pagamentos:</span>
              <span className="font-display text-xl text-gold-500">{formatCurrency(total)}</span>
            </div>
          </div>
        )}

        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
