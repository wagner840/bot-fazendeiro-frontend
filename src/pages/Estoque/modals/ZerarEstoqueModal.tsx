import { Modal, ModalFooter, Button } from '../../../components/ui';
import type { Funcionario } from '../../../lib/types';

interface ZerarEstoqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  funcionarioId: number | null;
  funcionarios: Funcionario[];
  onZerar: () => Promise<void>;
  isSaving: boolean;
}

export function ZerarEstoqueModal({
  isOpen,
  onClose,
  funcionarioId,
  funcionarios,
  onZerar,
  isSaving,
}: ZerarEstoqueModalProps) {
  const funcionarioNome = funcionarios.find((f) => f.id === funcionarioId)?.nome;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Pagamento e Zerar Estoque"
    >
      <div className="space-y-4">
        <p className="text-parchment-300">
          Tem certeza que deseja pagar e zerar o estoque de{' '}
          <strong className="text-gold-500">{funcionarioNome}</strong>?
        </p>
        <div className="p-3 bg-leather-800/50 rounded-western">
          <p className="text-sm text-parchment-400">
            Esta ação irá:
          </p>
          <ul className="text-sm text-parchment-300 mt-2 space-y-1 list-disc list-inside">
            <li>Calcular o valor total do estoque</li>
            <li>Registrar o pagamento no histórico</li>
            <li>Adicionar o valor ao saldo do funcionário</li>
            <li>Zerar o estoque do funcionário</li>
          </ul>
        </div>
        <p className="text-xs text-parchment-500">
          O pagamento real deve ser feito em RP (roleplay) fora do sistema.
        </p>

        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onZerar} isLoading={isSaving}>
            Pagar e Zerar
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
