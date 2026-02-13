import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  Wheat,
  Check,
  ArrowRight,
  Star,
  MessageCircle,
  Sparkles,
  Clock,
  Shield,
  Zap,
  Monitor,
  ChevronDown,
} from 'lucide-react';

import { stats, features, howItWorks, planos, faqItems } from '../../data/landing';
import { Navbar } from './Navbar';
import { DashboardMockup } from './DashboardMockup';
import { DiscordMockup } from './DiscordMockup';
import { AnimatedCounter } from './AnimatedCounter';
import { FAQItem } from './FAQItem';

export function LandingPage() {
  usePageTitle('Gestao Empresarial para RedM');
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  return (
    <div className="min-h-screen bg-leather-950 overflow-x-hidden">
      <Navbar />

      {/* ─── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* Backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-br from-leather-900 via-leather-950 to-leather-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-gold-500/8 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-whiskey-500/5 via-transparent to-transparent" />

        {/* Grain overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-noise mix-blend-overlay pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-0 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <motion.div
              style={{ opacity: heroOpacity, scale: heroScale }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/10 border border-gold-500/20 rounded-full mb-6"
              >
                <Sparkles className="w-4 h-4 text-gold-400" />
                <span className="text-gold-400 text-sm font-body">Sistema #1 para servidores RedM</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display text-parchment-100 mb-6 leading-tight"
              >
                Gerencie seu{' '}
                <span className="text-gold-500 relative">
                  roleplay
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                    <path d="M1 5.5C40 2.5 100 1 199 5.5" stroke="currentColor" strokeWidth="2" className="text-gold-500/40" />
                  </svg>
                </span>
                <br />
                como um{' '}
                <span className="text-gold-400">negocio real</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg sm:text-xl text-parchment-400 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                Bot Discord + Painel Web para controlar funcionarios, estoque, encomendas e
                financas do seu servidor RedM. Tudo automatizado.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link
                  to="/login"
                  state={{ from: { pathname: '/checkout' } }}
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-gold-600 to-gold-500 text-leather-950 font-heading font-bold text-lg rounded-lg shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40 hover:from-gold-500 hover:to-gold-400 transition-all"
                >
                  Testar Gratis por 3 Dias
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={() => document.getElementById('product-showcase')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-parchment-300 font-heading border border-leather-600 rounded-lg hover:border-gold-500/30 hover:text-gold-400 transition-all"
                >
                  <Monitor className="w-5 h-5" />
                  Ver o Painel
                </button>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-6 mt-8 justify-center lg:justify-start"
              >
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-parchment-500 text-sm">Setup em 5 min</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-parchment-500 text-sm">Sem cartao</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-parchment-500 text-sm">Cancele quando quiser</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 40, rotateY: -5 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="relative lg:mt-0 mt-4"
              style={{ perspective: '1000px' }}
            >
              <DashboardMockup />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-6 h-6 text-parchment-600" />
        </motion.div>
      </section>

      {/* ─── Social Proof Stats ────────────────────────────────────────── */}
      <section className="py-12 bg-leather-900/50 border-y border-leather-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-bold text-gold-500 font-heading">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-parchment-500 text-sm mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Product Showcase ──────────────────────────────────────────── */}
      <section id="product-showcase" className="py-24 bg-leather-950 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-500/5 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl sm:text-4xl text-gold-500 mb-4">
              Veja o produto real
            </h2>
            <p className="text-parchment-400 text-lg max-w-2xl mx-auto">
              Um painel completo e bonito que seus admins vao amar usar
            </p>
          </motion.div>

          {/* Platform showcase */}
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Desktop view */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Monitor className="w-5 h-5 text-gold-500" />
                <span className="text-parchment-300 font-heading text-sm">Painel Web</span>
              </div>
              <DashboardMockup />
            </motion.div>

            {/* Discord view */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-[#5865F2]" />
                <span className="text-parchment-300 font-heading text-sm">Bot Discord</span>
              </div>
              <DiscordMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Features Section ──────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-gradient-to-b from-leather-950 to-leather-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl sm:text-4xl text-gold-500 mb-4">
              Tudo que voce precisa em um so lugar
            </h2>
            <p className="text-parchment-400 text-lg max-w-2xl mx-auto">
              Cada funcionalidade pensada para donos de empresa no RedM
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`group relative p-6 rounded-xl bg-gradient-to-br ${feature.color} border ${feature.borderColor} hover:border-gold-500/40 transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="p-3 rounded-xl bg-gold-500/10 text-gold-500 w-fit mb-4 group-hover:bg-gold-500/20 group-hover:scale-110 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-heading text-lg text-parchment-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-parchment-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-leather-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl sm:text-4xl text-gold-500 mb-4">
              Comece em 3 passos
            </h2>
            <p className="text-parchment-400 text-lg">
              Sem complicacao. Funcionando em minutos.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {howItWorks.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative text-center"
              >
                {/* Connector line */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-gold-500/30 to-transparent" />
                )}

                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-gold-500/20 to-gold-500/5 border border-gold-500/20 mb-6">
                  <div className="text-gold-500">{step.icon}</div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-gold-500 rounded-full flex items-center justify-center">
                    <span className="text-leather-950 text-xs font-bold">{step.step}</span>
                  </div>
                </div>

                <h3 className="font-heading text-xl text-parchment-100 mb-2">
                  {step.title}
                </h3>
                <p className="text-parchment-400 text-sm leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing Section ───────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-gradient-to-b from-leather-900 to-leather-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl sm:text-4xl text-gold-500 mb-4">
              Planos simples e honestos
            </h2>
            <p className="text-parchment-400 text-lg max-w-2xl mx-auto">
              Sem surpresas. Todas as funcionalidades incluidas em todos os planos.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            {planos.map((plano, index) => (
              <motion.div
                key={plano.nome}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-xl overflow-hidden ${
                  plano.destaque
                    ? 'border-2 border-gold-500/50 shadow-xl shadow-gold-500/10'
                    : 'border border-leather-700/50'
                }`}
              >
                {/* Popular badge */}
                {plano.maisPopular && (
                  <div className="bg-gold-500 py-2 text-center">
                    <span className="text-leather-950 text-xs font-bold uppercase tracking-wider">
                      Mais Popular
                    </span>
                  </div>
                )}

                <div className={`p-8 ${plano.destaque ? 'bg-gradient-to-b from-gold-500/10 to-leather-900' : 'bg-leather-900/50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading text-xl text-parchment-100">
                      {plano.nome}
                    </h3>
                    {plano.economia && (
                      <span className="px-3 py-1 bg-gold-500/10 text-gold-400 text-xs font-bold rounded-full border border-gold-500/20">
                        {plano.economia}
                      </span>
                    )}
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gold-500 font-heading">
                        R$ {plano.precoMensal.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-parchment-500 text-sm">/mes</span>
                    </div>
                    {plano.periodo !== '/mes' && (
                      <p className="text-xs text-parchment-600 mt-1">
                        cobrado R$ {plano.preco.toFixed(2).replace('.', ',')} {plano.periodo}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plano.recursos.map((recurso) => (
                      <li key={recurso} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
                        <span className="text-parchment-300 text-sm">{recurso}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/login"
                    state={{ from: { pathname: `/checkout?plano=${plano.nome.toLowerCase()}` } }}
                    className={`block w-full text-center py-3.5 rounded-lg font-heading font-bold transition-all ${
                      plano.destaque
                        ? 'bg-gold-500 text-leather-950 hover:bg-gold-400 shadow-lg shadow-gold-500/20'
                        : 'bg-leather-800 text-parchment-200 border border-leather-600 hover:border-gold-500/50 hover:text-gold-400'
                    }`}
                  >
                    Assinar {plano.nome}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-parchment-600 text-sm mt-8">
            Teste gratis por 3 dias antes de assinar. Pagamento seguro via Pix. Cancele a qualquer momento sem multa.
          </p>
        </div>
      </section>

      {/* ─── FAQ Section ───────────────────────────────────────────────── */}
      <section id="faq" className="py-24 bg-leather-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl sm:text-4xl text-gold-500 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-parchment-400">
              Tire suas duvidas antes de comecar
            </p>
          </motion.div>

          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <FAQItem question={item.question} answer={item.answer} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-b from-leather-950 to-leather-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-500/8 via-transparent to-transparent" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gold-500/10 border border-gold-500/20 mb-8">
              <Wheat className="w-10 h-10 text-gold-500" />
            </div>

            <h2 className="font-display text-3xl sm:text-5xl text-parchment-100 mb-6">
              Pronto para profissionalizar{' '}
              <span className="text-gold-500">seu servidor?</span>
            </h2>
            <p className="text-parchment-400 text-lg mb-10 max-w-2xl mx-auto">
              Junte-se a dezenas de servidores que ja usam o Bot Fazendeiro
              para transformar a gestao das suas empresas de roleplay.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                state={{ from: { pathname: '/checkout' } }}
                className="group inline-flex items-center justify-center gap-2 px-10 py-5 bg-gradient-to-r from-gold-600 to-gold-500 text-leather-950 font-heading font-bold text-lg rounded-lg shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40 transition-all"
              >
                Testar Gratis por 3 Dias
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-parchment-500">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Setup em 5 minutos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                <span>Dados seguros</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                <span>Suporte rapido</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────────────── */}
      <footer className="py-16 bg-leather-950 border-t border-leather-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Wheat className="w-7 h-7 text-gold-500" />
                <span className="font-display text-xl text-gold-500">Bot Fazendeiro</span>
              </div>
              <p className="text-parchment-600 text-sm leading-relaxed">
                O sistema completo de gestao empresarial para servidores RedM.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-heading text-parchment-200 text-sm mb-4">Produto</h4>
              <ul className="space-y-2.5">
                <li>
                  <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-parchment-500 hover:text-gold-400 transition-colors text-sm">
                    Funcionalidades
                  </button>
                </li>
                <li>
                  <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="text-parchment-500 hover:text-gold-400 transition-colors text-sm">
                    Precos
                  </button>
                </li>
                <li>
                  <Link to="/faq" className="text-parchment-500 hover:text-gold-400 transition-colors text-sm">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-heading text-parchment-200 text-sm mb-4">Legal</h4>
              <ul className="space-y-2.5">
                <li>
                  <Link to="/termos-de-uso" className="text-parchment-500 hover:text-gold-400 transition-colors text-sm">
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link to="/politica-de-privacidade" className="text-parchment-500 hover:text-gold-400 transition-colors text-sm">
                    Privacidade
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-heading text-parchment-200 text-sm mb-4">Empresa</h4>
              <ul className="space-y-2.5">
                <li>
                  <Link to="/quem-somos" className="text-parchment-500 hover:text-gold-400 transition-colors text-sm">
                    Quem Somos
                  </Link>
                </li>
                <li>
                  <Link to="/suporte" className="text-parchment-500 hover:text-gold-400 transition-colors text-sm">
                    Suporte
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-leather-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-parchment-700 text-xs">
              &copy; {new Date().getFullYear()} Bot Fazendeiro. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-gold-500 fill-gold-500" />
              ))}
              <span className="text-parchment-500 text-xs ml-1">4.9/5 avaliacao</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
