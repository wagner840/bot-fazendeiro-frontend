import { motion } from 'framer-motion';
import { Package, DollarSign, Warehouse, Users } from 'lucide-react';
import { Card } from '../../../components/ui';
import { formatCurrency } from '../../../lib/types';
import type { EstoqueStats as EstoqueStatsType } from '../types';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface EstoqueStatsProps {
  stats: EstoqueStatsType;
  isAdmin: boolean;
}

export function EstoqueStats({ stats, isAdmin }: EstoqueStatsProps) {
  return (
    <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-western bg-leather-800/50">
            <Package className="w-6 h-6 text-gold-500" />
          </div>
          <div>
            <p className="text-2xl font-display text-gold-500">{stats.totalItens}</p>
            <p className="text-xs text-parchment-500 uppercase tracking-wider">
              Total de Itens
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
              {formatCurrency(stats.valorTotal)}
            </p>
            <p className="text-xs text-parchment-500 uppercase tracking-wider">
              Valor Total
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
              {stats.produtosDistintos}
            </p>
            <p className="text-xs text-parchment-500 uppercase tracking-wider">
              Produtos Distintos
            </p>
          </div>
        </div>
      </Card>

      {isAdmin && (
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-western bg-leather-800/50">
              <Users className="w-6 h-6 text-gold-500" />
            </div>
            <div>
              <p className="text-2xl font-display text-gold-500">
                {stats.funcionariosComEstoque}
              </p>
              <p className="text-xs text-parchment-500 uppercase tracking-wider">
                Funcionarios c/ Estoque
              </p>
            </div>
          </div>
        </Card>
      )}
    </motion.div>
  );
}
