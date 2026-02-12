import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { Button } from '../../../components/ui';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface QuickPriceButtonsProps {
  onBulkPrecos: (mode: 'min' | 'medio' | 'max') => Promise<void>;
  isSaving: boolean;
}

export function QuickPriceButtons({ onBulkPrecos, isSaving }: QuickPriceButtonsProps) {
  return (
    <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center gap-3">
      <span className="text-xs sm:text-sm text-parchment-500 flex items-center gap-1">
        <Settings size={14} />
        Config. Rápida de Preços:
      </span>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onBulkPrecos('min')}
          isLoading={isSaving}
          className="flex-1 sm:flex-none"
        >
          Config. Mínimo
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onBulkPrecos('medio')}
          isLoading={isSaving}
          className="flex-1 sm:flex-none"
        >
          Config. Médio
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onBulkPrecos('max')}
          isLoading={isSaving}
          className="flex-1 sm:flex-none"
        >
          Config. Máximo
        </Button>
      </div>
    </motion.div>
  );
}
