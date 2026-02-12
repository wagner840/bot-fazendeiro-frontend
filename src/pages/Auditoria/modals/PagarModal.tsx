import { Modal, ModalFooter, Button } from '../../../components/ui';
import { formatCurrency } from '../../../lib/types';
import type { AuditoriaFuncionario } from '../../../lib/supabase';

interface PagarModalProps {
  isOpen: boolean;
  onClose: () => void;
  funcionarioId: number | null;
  auditoriaFuncionarios: AuditoriaFuncionario[];
  onPagar: () => Promise<void>;
  isSaving: boolean;
  getFuncionarioNome: (id: number | null) => string;
}

export function PagarModal({
  isOpen,
  onClose,
  funcionarioId,
  auditoriaFuncionarios,
  onPagar,
  isSaving,
  getFuncionarioNome,
}: PagarModalProps) {
  const estoqueValor =
    auditoriaFuncionarios.find((f) => f.funcionario_id === funcionarioId)?.estoque_valor || 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Pagamento de Estoque">
      <div className="space-y-4">
        <p className="text-parchment-300">
          Deseja registrar o pagamento do estoque de{' '}
          <strong className="text-gold-500">{getFuncionarioNome(funcionarioId)}</strong>?
        </p>

        {funcionarioId && (
          <div className="p-3 bg-leather-800/50 rounded-western">
            <p className="text-sm text-parchment-400">Valor em estoque:</p>
            <p className="text-2xl font-display text-gold-500">{formatCurrency(estoqueValor)}</p>
          </div>
        )}

        <div className="p-3 bg-leather-800/30 rounded-western">
          <p className="text-sm text-parchment-400">Esta acao ira:</p>
          <ul className="text-sm text-parchment-300 mt-2 space-y-1 list-disc list-inside">
            <li>Registrar o pagamento no historico</li>
            <li>Adicionar o valor ao saldo do funcionario</li>
            <li>Zerar o estoque do funcionario</li>
          </ul>
        </div>

        <p className="text-xs text-parchment-500">
          O pagamento real deve ser feito em RP (roleplay) fora do sistema.
        </p>

        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onPagar} isLoading={isSaving}>
            Confirmar Pagamento
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
