import { motion } from 'framer-motion';
import { History, DollarSign, Package, Users } from 'lucide-react';
import { Card } from '../../../components/ui';
import { formatCurrency } from '../../../lib/types';
import type { AuditoriaStats as AuditoriaStatsType } from '../types';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface AuditoriaStatsProps {
  stats: AuditoriaStatsType;
}

export function AuditoriaStats({ stats }: AuditoriaStatsProps) {
  return (
    <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-western bg-leather-800/50">
            <History className="w-6 h-6 text-gold-500" />
          </div>
          <div>
            <p className="text-2xl font-display text-gold-500">
              {formatCurrency(stats.totalPagoHistorico)}
            </p>
            <p className="text-xs text-parchment-500 uppercase tracking-wider">
              Total Pago (Historico)
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
              {formatCurrency(stats.saldoTotal)}
            </p>
            <p className="text-xs text-parchment-500 uppercase tracking-wider">Saldo Total</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-western bg-leather-800/50">
            <Package className="w-6 h-6 text-gold-500" />
          </div>
          <div>
            <p className="text-2xl font-display text-gold-500">
              {formatCurrency(stats.estoqueTotal)}
            </p>
            <p className="text-xs text-parchment-500 uppercase tracking-wider">Valor em Estoque</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-western bg-leather-800/50">
            <Users className="w-6 h-6 text-gold-500" />
          </div>
          <div>
            <p className="text-2xl font-display text-gold-500">{stats.funcionariosAtivos}</p>
            <p className="text-xs text-parchment-500 uppercase tracking-wider">
              Funcionarios Ativos
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
