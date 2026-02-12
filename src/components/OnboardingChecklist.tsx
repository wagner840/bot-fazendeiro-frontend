import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Package, Users, ClipboardList, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from './ui';
import type { DashboardStats } from '../lib/types';

interface OnboardingChecklistProps {
  stats: DashboardStats;
  empresaId: number;
}

interface Step {
  label: string;
  to: string;
  done: boolean;
  icon: typeof Package;
}

export function OnboardingChecklist({ stats, empresaId }: OnboardingChecklistProps) {
  const storageKey = `onboarding_completed_${empresaId}`;
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(storageKey) === 'true'
  );

  const steps: Step[] = [
    {
      label: 'Configure seus produtos',
      to: '/dashboard/produtos',
      done: stats.totalProdutos > 0,
      icon: Package,
    },
    {
      label: 'Adicione funcionários',
      to: '/dashboard/funcionarios',
      done: stats.totalFuncionarios > 0,
      icon: Users,
    },
    {
      label: 'Crie sua primeira encomenda',
      to: '/dashboard/encomendas',
      done: stats.encomendasPendentes > 0 || stats.encomendasEntregues > 0,
      icon: ClipboardList,
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const allDone = completedCount === steps.length;

  // Auto-save when all steps are completed so it never shows again
  useEffect(() => {
    if (allDone && !dismissed) {
      localStorage.setItem(storageKey, 'true');
      setDismissed(true);
    }
  }, [allDone, dismissed, storageKey]);

  if (dismissed || allDone) return null;

  function handleDismiss() {
    localStorage.setItem(storageKey, 'true');
    setDismissed(true);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="relative overflow-hidden border-gold-500/30">
        <div className="absolute top-0 left-0 h-1 bg-gold-500/20 w-full">
          <div
            className="h-full bg-gold-500 transition-all duration-500"
            style={{ width: `${(completedCount / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-heading text-lg text-parchment-100">
                Primeiros Passos
              </h3>
              <p className="text-sm text-parchment-500 mt-0.5">
                {completedCount} de {steps.length} concluídos
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-parchment-500 hover:text-parchment-300 transition-colors"
              aria-label="Dispensar checklist"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <Link
                  key={step.label}
                  to={step.to}
                  className={`flex items-center gap-3 p-3 rounded-western transition-colors ${
                    step.done
                      ? 'bg-green-900/20 border border-green-500/20'
                      : 'bg-leather-800/30 hover:bg-leather-800/50 border border-leather-700/30'
                  }`}
                >
                  {step.done ? (
                    <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle size={20} className="text-parchment-500 flex-shrink-0" />
                  )}
                  <Icon size={16} className={step.done ? 'text-green-400' : 'text-parchment-400'} />
                  <span
                    className={`text-sm font-heading ${
                      step.done ? 'text-green-400 line-through' : 'text-parchment-200'
                    }`}
                  >
                    {step.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
