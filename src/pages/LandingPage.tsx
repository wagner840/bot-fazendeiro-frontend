import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Wheat,
  Users,
  Package,
  TrendingUp,
  Shield,
  Zap,
  Check,
  ArrowRight,
  Star,
  MessageCircle,
} from 'lucide-react';

const features = [
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Gestão de Funcionários',
    description: 'Controle completo de funcionários, saldos e pagamentos automáticos',
  },
  {
    icon: <Package className="w-6 h-6" />,
    title: 'Controle de Estoque',
    description: 'Gerencie produtos, preços e estoque em tempo real',
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Relatórios Financeiros',
    description: 'Dashboards completos com métricas e gráficos',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Multi-Tenant',
    description: 'Dados isolados por servidor com segurança total',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Comandos Rápidos',
    description: 'Interface intuitiva com comandos simples no Discord',
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: 'Painel Web',
    description: 'Acesse tudo pelo navegador com login via Discord',
  },
];

const planos = [
  {
    nome: 'Mensal',
    preco: 29.9,
    periodo: '/mês',
    destaque: false,
    recursos: [
      'Acesso completo ao bot',
      'Painel web ilimitado',
      'Múltiplas empresas',
      'Suporte via Discord',
    ],
  },
  {
    nome: 'Trimestral',
    preco: 76.5,
    periodo: '/3 meses',
    destaque: true,
    economia: '15% OFF',
    recursos: [
      'Tudo do plano mensal',
      'Prioridade no suporte',
      'Economia de R$ 13,20',
      'Configuração assistida',
    ],
  },
  {
    nome: 'Anual',
    preco: 251.16,
    periodo: '/ano',
    destaque: false,
    economia: '30% OFF',
    recursos: [
      'Tudo do trimestral',
      'Suporte prioritário VIP',
      'Economia de R$ 107,64',
      'Recursos beta antecipados',
    ],
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-leather-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-leather-900 via-leather-950 to-leather-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-8"
            >
              <div className="p-4 rounded-full bg-gold-500/20 border border-gold-500/30">
                <Wheat className="w-16 h-16 text-gold-500" />
              </div>
            </motion.div>

            <h1 className="font-display text-5xl lg:text-7xl text-gold-500 mb-6">
              Bot Fazendeiro
            </h1>
            <p className="text-xl lg:text-2xl text-parchment-300 mb-4 max-w-3xl mx-auto">
              O sistema completo de gestão empresarial para
              <span className="text-gold-400 font-semibold"> servidores RedM</span>
            </p>
            <p className="text-parchment-500 mb-10 max-w-2xl mx-auto">
              Gerencie funcionários, estoque, encomendas e finanças do seu roleplay
              diretamente no Discord com um painel web moderno.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/checkout"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gold-600 to-gold-500 text-leather-950 font-heading font-bold rounded-western shadow-lg hover:shadow-gold-500/25 transition-all"
                >
                  Começar Agora
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-leather-800 text-parchment-200 font-heading rounded-western border border-leather-600 hover:border-gold-500/50 transition-all"
                >
                  Já sou assinante
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="rgb(28 25 23)"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-leather-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl text-gold-500 mb-4">
              Tudo que você precisa
            </h2>
            <p className="text-parchment-400 text-lg max-w-2xl mx-auto">
              Funcionalidades completas para gerenciar seu negócio de roleplay
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-leather-900/50 border border-leather-700 rounded-western hover:border-gold-500/30 transition-colors group"
              >
                <div className="p-3 rounded-western bg-gold-500/10 text-gold-500 w-fit mb-4 group-hover:bg-gold-500/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="font-heading text-lg text-parchment-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-parchment-500 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gradient-to-b from-leather-950 to-leather-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl text-gold-500 mb-4">
              Planos flexíveis
            </h2>
            <p className="text-parchment-400 text-lg max-w-2xl mx-auto">
              Escolha o plano ideal para o seu servidor
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {planos.map((plano, index) => (
              <motion.div
                key={plano.nome}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-8 rounded-western border ${
                  plano.destaque
                    ? 'bg-gradient-to-b from-gold-500/10 to-leather-900 border-gold-500/50 scale-105'
                    : 'bg-leather-900/50 border-leather-700'
                }`}
              >
                {plano.economia && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-gold-500 text-leather-950 text-sm font-bold rounded-full">
                      {plano.economia}
                    </span>
                  </div>
                )}

                {plano.destaque && (
                  <div className="absolute top-4 right-4">
                    <Star className="w-5 h-5 text-gold-500 fill-gold-500" />
                  </div>
                )}

                <h3 className="font-heading text-xl text-parchment-100 mb-2">
                  {plano.nome}
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gold-500">
                    R$ {plano.preco.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-parchment-500">{plano.periodo}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plano.recursos.map((recurso) => (
                    <li key={recurso} className="flex items-center gap-2 text-parchment-300">
                      <Check className="w-5 h-5 text-gold-500 flex-shrink-0" />
                      <span className="text-sm">{recurso}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={`/checkout?plano=${plano.nome.toLowerCase()}`}
                  className={`block text-center py-3 rounded-western font-heading transition-all ${
                    plano.destaque
                      ? 'bg-gold-500 text-leather-950 hover:bg-gold-400'
                      : 'bg-leather-800 text-parchment-200 border border-leather-600 hover:border-gold-500/50'
                  }`}
                >
                  Assinar
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-leather-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl text-gold-500 mb-6">
              Pronto para começar?
            </h2>
            <p className="text-parchment-400 text-lg mb-8">
              Configure seu bot em minutos e transforme a gestão do seu servidor
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/checkout"
                className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-gold-600 to-gold-500 text-leather-950 font-heading font-bold text-lg rounded-western shadow-lg hover:shadow-gold-500/25 transition-all"
              >
                Começar Agora
                <ArrowRight className="w-6 h-6" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-leather-950 border-t border-leather-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Wheat className="w-8 h-8 text-gold-500" />
              <span className="font-display text-2xl text-gold-500">Bot Fazendeiro</span>
            </div>
            <p className="text-parchment-600 text-sm">
              © {new Date().getFullYear()} Bot Fazendeiro. Todos os direitos reservados.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-parchment-500 hover:text-gold-500 transition-colors text-sm">
                Termos de Uso
              </a>
              <a href="#" className="text-parchment-500 hover:text-gold-500 transition-colors text-sm">
                Privacidade
              </a>
              <a href="#" className="text-parchment-500 hover:text-gold-500 transition-colors text-sm">
                Suporte
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
