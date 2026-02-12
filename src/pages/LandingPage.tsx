import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
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
  ChevronDown,
  BarChart3,
  ClipboardList,
  DollarSign,
  Bot,
  Sparkles,
  Clock,
  Globe,
  Monitor,
  Menu,
  X,
} from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────

const stats = [
  { label: 'Servidores Ativos', value: 25, suffix: '+' },
  { label: 'Empresas Gerenciadas', value: 150, suffix: '+' },
  { label: 'Entregas Processadas', value: 5000, suffix: '+' },
  { label: 'Uptime', value: 99.9, suffix: '%' },
];

const features = [
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Funcionarios & Pagamentos',
    description:
      'Cadastre funcionarios, controle saldos, pague automaticamente com base na producao. Tudo integrado.',
    color: 'from-gold-500/20 to-gold-500/5',
    borderColor: 'border-gold-500/20',
  },
  {
    icon: <Package className="w-6 h-6" />,
    title: 'Estoque Inteligente',
    description:
      'Registre entregas, acompanhe estoque em tempo real. O bot calcula comissoes e atualiza tudo sozinho.',
    color: 'from-whiskey-500/20 to-whiskey-500/5',
    borderColor: 'border-whiskey-500/20',
  },
  {
    icon: <ClipboardList className="w-6 h-6" />,
    title: 'Sistema de Encomendas',
    description:
      'Crie pedidos com produtos, acompanhe status de pendente a entregue. Seus clientes nunca mais ficam perdidos.',
    color: 'from-parchment-500/20 to-parchment-500/5',
    borderColor: 'border-parchment-500/20',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Dashboard & Relatorios',
    description:
      'Graficos de receita, distribuicao por categoria, ranking de funcionarios. Visao completa do seu negocio.',
    color: 'from-gold-500/20 to-gold-500/5',
    borderColor: 'border-gold-500/20',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Multi-Servidor',
    description:
      'Um bot, multiplos servidores. Dados totalmente isolados entre Downtown, Valiria e qualquer outro.',
    color: 'from-whiskey-500/20 to-whiskey-500/5',
    borderColor: 'border-whiskey-500/20',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Painel Web + Discord',
    description:
      'Gerencie pelo navegador com login Discord ou use comandos direto no chat. Voce escolhe.',
    color: 'from-parchment-500/20 to-parchment-500/5',
    borderColor: 'border-parchment-500/20',
  },
];

const howItWorks = [
  {
    step: '01',
    title: 'Adicione o Bot',
    description: 'Convide o Bot Fazendeiro para o seu servidor Discord com um clique.',
    icon: <Bot className="w-8 h-8" />,
  },
  {
    step: '02',
    title: 'Configure sua Empresa',
    description: 'Cadastre produtos, precos e funcionarios em minutos pelo painel ou Discord.',
    icon: <Sparkles className="w-8 h-8" />,
  },
  {
    step: '03',
    title: 'Gerencie Tudo',
    description: 'Acompanhe entregas, pagamentos e encomendas em tempo real. Pronto!',
    icon: <TrendingUp className="w-8 h-8" />,
  },
];

const discordMessages = [
  {
    user: 'Carlos Vaqueiro',
    avatar: 'CV',
    content: '/entregar carne_seca 50',
    isCommand: true,
  },
  {
    user: 'Bot Fazendeiro',
    avatar: null,
    isBot: true,
    content: null,
    embed: {
      title: 'Entrega Registrada',
      color: '#d4a853',
      fields: [
        { name: 'Produto', value: 'Carne Seca', inline: true },
        { name: 'Quantidade', value: '50 un', inline: true },
        { name: 'Comissao', value: 'R$ 75,00', inline: true },
      ],
      footer: 'Saldo atualizado: R$ 325,00',
    },
  },
  {
    user: 'Maria Tropeira',
    avatar: 'MT',
    content: '/encomenda criar "Jose Fazendeiro" carne_seca:30 couro:20',
    isCommand: true,
  },
  {
    user: 'Bot Fazendeiro',
    avatar: null,
    isBot: true,
    content: null,
    embed: {
      title: 'Encomenda #47 Criada',
      color: '#d4a853',
      fields: [
        { name: 'Comprador', value: 'Jose Fazendeiro', inline: true },
        { name: 'Itens', value: '2 produtos', inline: true },
        { name: 'Total', value: 'R$ 450,00', inline: true },
      ],
      footer: 'Status: Pendente',
    },
  },
];

const planos = [
  {
    nome: 'Mensal',
    preco: 29.9,
    periodo: '/mes',
    precoMensal: 29.9,
    destaque: false,
    recursos: [
      'Bot completo no Discord',
      'Painel web ilimitado',
      'Multiplas empresas por servidor',
      'Suporte via Discord',
      'Atualizacoes automaticas',
    ],
  },
  {
    nome: 'Trimestral',
    preco: 76.5,
    periodo: '/3 meses',
    precoMensal: 25.5,
    destaque: true,
    economia: '15% OFF',
    maisPopular: true,
    recursos: [
      'Tudo do plano mensal',
      'Prioridade no suporte',
      'Economia de R$ 13,20',
      'Configuracao assistida',
      'Acesso beta a novidades',
    ],
  },
  {
    nome: 'Anual',
    preco: 251.16,
    periodo: '/ano',
    precoMensal: 20.93,
    destaque: false,
    economia: '30% OFF',
    recursos: [
      'Tudo do trimestral',
      'Suporte prioritario VIP',
      'Economia de R$ 107,64',
      'Recursos beta antecipados',
      'Consultoria de setup',
    ],
  },
];

const faqItems = [
  {
    question: 'Como funciona a instalacao?',
    answer:
      'Basta clicar em "Comecar Agora", fazer login com Discord e adicionar o bot ao seu servidor. Em menos de 5 minutos voce ja pode configurar sua primeira empresa e comecar a gerenciar.',
  },
  {
    question: 'Funciona em qualquer servidor RedM?',
    answer:
      'Sim! O Bot Fazendeiro e compativel com qualquer servidor RedM que use Discord. Funciona com Downtown, Valiria, e qualquer outro framework.',
  },
  {
    question: 'Posso ter multiplas empresas?',
    answer:
      'Sim! Cada servidor pode ter quantas empresas quiser. Cada empresa tem seus proprios produtos, funcionarios, estoque e financeiro completamente separados.',
  },
  {
    question: 'O que acontece se eu cancelar?',
    answer:
      'Seus dados ficam salvos por 30 dias apos o cancelamento. Se reativar dentro desse periodo, tudo continua de onde parou. Sem multa ou taxa de cancelamento.',
  },
  {
    question: 'Tem suporte em portugues?',
    answer:
      'Sim! Todo o sistema, bot, painel e suporte sao 100% em portugues. Nossa equipe de suporte atende diretamente pelo Discord.',
  },
  {
    question: 'Preciso de conhecimento tecnico?',
    answer:
      'Nao! O bot foi feito para ser simples. Comandos intuitivos no Discord e um painel web visual fazem toda a gestao. Nao precisa saber programar nada.',
  },
];

// ─── Animated Counter ────────────────────────────────────────────────────────

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current * 10) / 10);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {Number.isInteger(value) ? Math.floor(count) : count.toFixed(1)}
      {suffix}
    </span>
  );
}

// ─── FAQ Item ────────────────────────────────────────────────────────────────

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div
      className="border border-leather-700/50 rounded-lg overflow-hidden bg-leather-900/30 hover:border-gold-500/20 transition-colors"
      initial={false}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <span className="font-heading text-parchment-200 text-base pr-4">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-gold-500" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-5 pb-5 text-parchment-400 text-sm leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Dashboard Mockup ────────────────────────────────────────────────────────

function DashboardMockup() {
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

// ─── Discord Mockup ──────────────────────────────────────────────────────────

function DiscordMockup() {
  return (
    <div className="rounded-xl overflow-hidden bg-[#313338] border border-[#3f4147] shadow-2xl shadow-black/50">
      {/* Discord Header */}
      <div className="bg-[#2b2d31] px-4 py-3 flex items-center gap-2 border-b border-[#1e1f22]">
        <span className="text-[#949ba4] text-sm">#</span>
        <span className="text-white text-sm font-semibold">geral-empresa</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-[#949ba4] text-xs">12 online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-4 max-h-[400px]">
        {discordMessages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            className="flex gap-3"
          >
            {/* Avatar */}
            {msg.isBot ? (
              <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center flex-shrink-0">
                <Wheat className="w-5 h-5 text-leather-950" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                {msg.avatar}
              </div>
            )}

            <div className="flex-1 min-w-0">
              {/* Username */}
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm font-semibold ${msg.isBot ? 'text-gold-400' : 'text-white'}`}>
                  {msg.isBot ? 'Bot Fazendeiro' : msg.user}
                </span>
                {msg.isBot && (
                  <span className="px-1.5 py-0.5 bg-[#5865F2] text-white text-[10px] font-bold rounded">BOT</span>
                )}
                <span className="text-[#949ba4] text-xs">Hoje as 14:32</span>
              </div>

              {/* Content */}
              {msg.content && (
                <p className="text-[#dbdee1] text-sm">
                  {msg.isCommand && <span className="text-[#5865F2]">/</span>}
                  {msg.isCommand ? msg.content.slice(1) : msg.content}
                </p>
              )}

              {/* Embed */}
              {msg.embed && (
                <div className="mt-1 border-l-4 rounded bg-[#2b2d31] p-3 max-w-md" style={{ borderColor: msg.embed.color }}>
                  <div className="text-white text-sm font-semibold mb-2">{msg.embed.title}</div>
                  <div className="grid grid-cols-3 gap-2">
                    {msg.embed.fields.map((field, fi) => (
                      <div key={fi}>
                        <div className="text-[#949ba4] text-[10px] uppercase font-bold">{field.name}</div>
                        <div className="text-[#dbdee1] text-xs">{field.value}</div>
                      </div>
                    ))}
                  </div>
                  {msg.embed.footer && (
                    <div className="text-[#949ba4] text-[10px] mt-2 pt-2 border-t border-[#3f4147]">
                      {msg.embed.footer}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-4">
        <div className="bg-[#383a40] rounded-lg px-4 py-2.5 text-[#6d6f78] text-sm flex items-center gap-2">
          <span className="text-[#b5bac1]">/</span>
          Escreva um comando...
        </div>
      </div>
    </div>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-leather-950/95 backdrop-blur-md border-b border-leather-800/50 shadow-lg'
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Wheat className="w-7 h-7 text-gold-500" />
            <span className="font-display text-xl text-gold-500">Bot Fazendeiro</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Funcionalidades', id: 'features' },
              { label: 'Como Funciona', id: 'how-it-works' },
              { label: 'Precos', id: 'pricing' },
              { label: 'FAQ', id: 'faq' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-parchment-400 hover:text-gold-400 transition-colors text-sm font-body"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-parchment-400 hover:text-parchment-200 transition-colors text-sm font-body"
            >
              Entrar
            </Link>
            <Link
              to="/login"
              state={{ from: { pathname: '/checkout' } }}
              className="px-5 py-2 bg-gold-500 text-leather-950 font-heading font-bold text-sm rounded-lg hover:bg-gold-400 transition-colors"
            >
              Testar Gratis
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-parchment-400"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-leather-950 border-b border-leather-800/50"
          >
            <div className="px-4 py-6 space-y-4">
              {[
                { label: 'Funcionalidades', id: 'features' },
                { label: 'Como Funciona', id: 'how-it-works' },
                { label: 'Precos', id: 'pricing' },
                { label: 'FAQ', id: 'faq' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="block w-full text-left text-parchment-300 hover:text-gold-400 transition-colors text-base font-body py-2"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-4 space-y-3 border-t border-leather-800/50">
                <Link
                  to="/login"
                  className="block w-full text-center py-3 text-parchment-300 border border-leather-700 rounded-lg font-heading"
                >
                  Entrar
                </Link>
                <Link
                  to="/login"
                  state={{ from: { pathname: '/checkout' } }}
                  className="block w-full text-center py-3 bg-gold-500 text-leather-950 font-heading font-bold rounded-lg"
                >
                  Testar Gratis
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

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
                    {plano.economia && !plano.maisPopular && (
                      <span className="px-3 py-1 bg-gold-500/10 text-gold-400 text-xs font-bold rounded-full border border-gold-500/20">
                        {plano.economia}
                      </span>
                    )}
                    {plano.maisPopular && plano.economia && (
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
