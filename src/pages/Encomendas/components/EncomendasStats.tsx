import { motion } from 'framer-motion';
import { Clock, Package, TruckIcon, ClipboardList } from 'lucide-react';
import { Card } from '../../../components/ui';
import { formatCurrency } from '../../../lib/types';
import type { EncomendaStats } from '../types';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface EncomendasStatsProps {
  stats: EncomendaStats;
}

export function EncomendasStats({ stats }: EncomendasStatsProps) {
  return (
    <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-western bg-whiskey-900/30">
            <Clock className="w-6 h-6 text-whiskey-400" />
          </div>
          <div>
            <p className="text-2xl font-display text-gold-500">
              {stats.pendentes}
            </p>
            <p className="text-xs text-parchment-500 uppercase tracking-wider">
              Pendentes
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-western bg-gold-900/30">
            <Package className="w-6 h-6 text-gold-400" />
          </div>
          <div>
            <p className="text-2xl font-display text-gold-500">
              {stats.emAndamento}
            </p>
            <p className="text-xs text-parchment-500 uppercase tracking-wider">
              Em Andamento
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-western bg-green-900/30">
            <TruckIcon className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-display text-gold-500">
              {stats.entregues}
            </p>
            <p className="text-xs text-parchment-500 uppercase tracking-wider">
              Entregues
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-western bg-leather-800/50">
            <ClipboardList className="w-6 h-6 text-gold-500" />
          </div>
          <div>
            <p className="text-2xl font-display text-gold-500">
              {formatCurrency(stats.valorTotal)}
            </p>
            <p className="text-xs text-parchment-500 uppercase tracking-wider">
              Total Entregue
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
