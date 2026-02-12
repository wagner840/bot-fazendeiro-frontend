import { motion } from 'framer-motion';
import { Package, Tag, Warehouse, DollarSign } from 'lucide-react';
import { Card } from '../../../components/ui';
import { formatCurrency } from '../../../lib/types';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface ProdutosStatsProps {
  produtosCount: number;
  categoriasCount: number;
  totalEstoque: number;
  valorTotalEstoque: number;
}

export function ProdutosStats({
  produtosCount,
  categoriasCount,
  totalEstoque,
  valorTotalEstoque,
}: ProdutosStatsProps) {
  return (
    <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-western bg-leather-800/50">
            <Package className="w-6 h-6 text-gold-500" />
          </div>
          <div>
            <p className="text-2xl font-display text-gold-500">
              {produtosCount}
            </p>
            <p className="text-xs text-parchment-500 uppercase tracking-wider">
              Produtos Ativos
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-western bg-leather-800/50">
            <Tag className="w-6 h-6 text-gold-500" />
          </div>
          <div>
            <p className="text-2xl font-display text-gold-500">
              {categoriasCount}
            </p>
            <p className="text-xs text-parchment-500 uppercase tracking-wider">
              Categorias
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-western bg-leather-800/50">
            <Warehouse className="w-6 h-6 text-gold-500" />
          </div>
          <div>
            <p className="text-2xl font-display text-gold-500">
              {totalEstoque.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-parchment-500 uppercase tracking-wider">
              Itens em Estoque
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-western bg-leather-800/50">
            <DollarSign className="w-6 h-6 text-gold-500" />
          </div>
          <div>
            <p className="text-2xl font-display text-gold-500">
              {formatCurrency(valorTotalEstoque)}
            </p>
            <p className="text-xs text-parchment-500 uppercase tracking-wider">
              Valor Total
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
