import { motion } from 'framer-motion';
import {
  Wheat,
  Users,
  Package,
  DollarSign,
  ClipboardList,
  Shield,
  Check,
} from 'lucide-react';

export function DashboardMockup() {
  return (
    <div className="relative">
      {/* Browser Chrome */}
      <div className="rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-leather-700/50">
        {/* Title Bar */}
        <div className="bg-leather-900 px-4 py-3 flex items-center gap-3 border-b border-leather-700/50">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-rust-500/60" />
            <div className="w-3 h-3 rounded-full bg-gold-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-leather-800 rounded-md px-4 py-1 text-xs text-parchment-500 font-mono flex items-center gap-2">
              <Shield className="w-3 h-3" />
              botfazendeiro.com/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="bg-leather-950 p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gold-500/10">
                <Wheat className="w-5 h-5 text-gold-500" />
              </div>
              <div>
                <div className="text-sm font-heading text-parchment-200">Acougue Downtown</div>
                <div className="text-xs text-parchment-500">Downtown RP</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center text-xs text-gold-400 font-bold">W</div>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Funcionarios', value: '12', icon: <Users className="w-4 h-4" />, change: '+2' },
              { label: 'Estoque', value: '847', icon: <Package className="w-4 h-4" />, change: '+156' },
              { label: 'Receita Mensal', value: 'R$ 4.2k', icon: <DollarSign className="w-4 h-4" />, change: '+18%' },
              { label: 'Encomendas', value: '23', icon: <ClipboardList className="w-4 h-4" />, change: '5 pendentes' },
            ].map((stat) => (
              <div key={stat.label} className="bg-leather-900/60 border border-leather-700/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-parchment-500 text-[10px] sm:text-xs">{stat.label}</span>
                  <div className="text-gold-500/60">{stat.icon}</div>
                </div>
                <div className="text-lg sm:text-xl font-bold text-parchment-100 font-heading">{stat.value}</div>
                <div className="text-[10px] text-green-400 mt-1">{stat.change}</div>
              </div>
            ))}
          </div>

          {/* Chart Area */}
          <div className="bg-leather-900/40 border border-leather-700/30 rounded-lg p-4 mb-4">
            <div className="text-xs text-parchment-400 mb-3 font-heading">Receita Semanal</div>
            <div className="flex items-end gap-1 h-20 sm:h-24">
              {[40, 65, 45, 80, 55, 90, 70, 95, 60, 85, 75, 100].map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-gold-500/60 to-gold-400/30 rounded-t"
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.5, ease: 'easeOut' }}
                />
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-leather-900/40 border border-leather-700/30 rounded-lg p-4">
            <div className="text-xs text-parchment-400 mb-3 font-heading">Atividade Recente</div>
            <div className="space-y-2">
              {[
                { text: 'Carlos entregou 50x Carne Seca', time: 'ha 5 min', color: 'text-green-400' },
                { text: 'Encomenda #47 criada', time: 'ha 12 min', color: 'text-gold-400' },
                { text: 'Pagamento de R$ 150 para Maria', time: 'ha 1h', color: 'text-whiskey-400' },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-leather-700/20 last:border-0">
                  <span className={`text-xs ${activity.color}`}>{activity.text}</span>
                  <span className="text-[10px] text-parchment-600">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <motion.div
        className="absolute -right-4 top-1/4 bg-leather-900 border border-gold-500/30 rounded-lg p-3 shadow-xl hidden lg:block"
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <div className="text-xs font-heading text-parchment-200">Entrega Registrada</div>
            <div className="text-[10px] text-parchment-500">Carne Seca x50</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute -left-4 bottom-1/4 bg-leather-900 border border-gold-500/30 rounded-lg p-3 shadow-xl hidden lg:block"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-gold-400" />
          </div>
          <div>
            <div className="text-xs font-heading text-parchment-200">R$ 75,00</div>
            <div className="text-[10px] text-parchment-500">Comissao calculada</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
