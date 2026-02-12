import { ChevronDown, ChevronRight, Edit3, Warehouse } from 'lucide-react';
import { Badge, Button, EmptyState } from '../../../components/ui';
import { formatCurrency } from '../../../lib/types';
import type { EstoqueAgregado } from '../types';

interface EstoqueGlobalTableProps {
  data: EstoqueAgregado[];
  isLoading: boolean;
  expandedRows: Set<string>;
  onToggleRow: (codigo: string) => void;
  onAjustar: (funcionarioId: number, produtoCodigo: string, quantidade: number) => void;
  isAdmin: boolean;
}

export function EstoqueGlobalTable({
  data,
  isLoading,
  expandedRows,
  onToggleRow,
  onAjustar,
  isAdmin,
}: EstoqueGlobalTableProps) {
  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="w-8 h-8 mx-auto border-2 border-leather-700 border-t-gold-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={<Warehouse className="w-12 h-12" />}
        title="Nenhum item em estoque"
        hint="Use !entrega codigo quantidade @funcionario no Discord"
        compact
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table-western">
        <thead>
          <tr>
            <th style={{ width: '40px' }}></th>
            <th>Produto</th>
            <th>Qtd Total</th>
            <th>Valor Unit.</th>
            <th>Valor Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <>
              <tr key={row.produto_codigo}>
                <td>
                  <button
                    onClick={() => onToggleRow(row.produto_codigo)}
                    className="p-1 hover:bg-leather-700/50 rounded"
                  >
                    {expandedRows.has(row.produto_codigo) ? (
                      <ChevronDown size={16} className="text-gold-500" />
                    ) : (
                      <ChevronRight size={16} className="text-parchment-400" />
                    )}
                  </button>
                </td>
                <td>
                  <span className="font-heading text-parchment-100">
                    {row.produto_codigo}
                  </span>
                </td>
                <td>
                  <Badge variant="gold">{row.quantidade_total} un.</Badge>
                </td>
                <td>
                  <span className="text-parchment-400">
                    {formatCurrency(row.valor_unitario)}
                  </span>
                </td>
                <td>
                  <span className="font-heading text-gold-500">
                    {formatCurrency(row.valor_total)}
                  </span>
                </td>
              </tr>
              {expandedRows.has(row.produto_codigo) && (
                <tr key={`${row.produto_codigo}-expanded`}>
                  <td colSpan={5} className="p-0">
                    <div className="bg-leather-800/30 p-4 space-y-2">
                      <p className="text-xs text-parchment-500 uppercase tracking-wider mb-2">
                        Detalhes por Funcionario
                      </p>
                      {row.funcionarios.map((f) => (
                        <div
                          key={f.funcionario_id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-2 bg-leather-900/50 rounded gap-2"
                        >
                          <span className="text-parchment-300 text-sm">{f.funcionario_nome}</span>
                          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                            <Badge variant="default">{f.quantidade} un.</Badge>
                            <span className="text-gold-500 text-sm">{formatCurrency(f.valor)}</span>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  onAjustar(
                                    f.funcionario_id,
                                    row.produto_codigo,
                                    f.quantidade
                                  )
                                }
                                leftIcon={<Edit3 size={12} />}
                              >
                                Ajustar
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
