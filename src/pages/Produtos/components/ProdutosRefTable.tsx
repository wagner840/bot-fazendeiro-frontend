import { motion } from 'framer-motion';
import { Package, Edit3, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardContent, Badge } from '../../../components/ui';
import { formatCurrency, type ProdutoReferencia } from '../../../lib/types';
import type { ProdutoReferenciaWithTipo } from '../types';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface ProdutosRefTableProps {
  produtosReferencia: ProdutoReferenciaWithTipo[];
  onEditProduct: (produto: ProdutoReferencia) => void;
  onDeleteProduct: (produto: ProdutoReferencia) => void;
}

export function ProdutosRefTable({
  produtosReferencia,
  onEditProduct,
  onDeleteProduct,
}: ProdutosRefTableProps) {
  if (produtosReferencia.length === 0) return null;

  return (
    <motion.div variants={item}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-gold-500" />
              <h2 className="font-heading text-lg text-parchment-100">
                Produtos de Referência (Admin)
              </h2>
              <Badge variant="gold">{produtosReferencia.length}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-72">
            <table className="w-full">
              <thead className="sticky top-0 bg-leather-900">
                <tr className="border-b border-leather-700/50">
                  <th className="text-left px-4 py-2 text-xs text-parchment-500 uppercase">Tipo</th>
                  <th className="text-left px-4 py-2 text-xs text-parchment-500 uppercase">Código</th>
                  <th className="text-left px-4 py-2 text-xs text-parchment-500 uppercase">Nome</th>
                  <th className="text-left px-4 py-2 text-xs text-parchment-500 uppercase">Categoria</th>
                  <th className="text-left px-4 py-2 text-xs text-parchment-500 uppercase">Preço Mín/Máx</th>
                  <th className="text-left px-4 py-2 text-xs text-parchment-500 uppercase">Status</th>
                  <th className="text-right px-4 py-2 text-xs text-parchment-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtosReferencia.map((pr) => (
                  <tr key={pr.id} className="border-b border-leather-800/50 hover:bg-leather-800/30">
                    <td className="px-4 py-2">
                      <span className="text-lg" title={pr.tipo_empresa?.nome}>{pr.tipo_empresa?.icone || '📦'}</span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="font-mono text-xs text-gold-500">{pr.codigo}</span>
                    </td>
                    <td className="px-4 py-2 text-parchment-200 text-sm">{pr.nome}</td>
                    <td className="px-4 py-2 text-parchment-400 text-sm">{pr.categoria || '-'}</td>
                    <td className="px-4 py-2 text-parchment-300 text-sm">
                      {formatCurrency(pr.preco_minimo)} - {formatCurrency(pr.preco_maximo)}
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant={pr.ativo ? 'gold' : 'danger'} className="text-xs">
                        {pr.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditProduct(pr)}
                          className="p-1.5 text-parchment-400 hover:text-gold-400 transition-colors"
                          title="Editar"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(pr)}
                          className="p-1.5 text-parchment-400 hover:text-rust-400 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
