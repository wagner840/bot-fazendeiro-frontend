import type { ReactNode } from 'react';
import {
  Users,
  Package,
  TrendingUp,
  Shield,
  ClipboardList,
  BarChart3,
  Globe,
  Bot,
  Sparkles,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Stat {
  label: string;
  value: number;
  suffix: string;
}

export interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
  color: string;
  borderColor: string;
}

export interface HowItWorksStep {
  step: string;
  title: string;
  description: string;
  icon: ReactNode;
}

export interface DiscordMessage {
  user: string;
  avatar: string | null;
  content: string | null;
  isCommand?: boolean;
  isBot?: boolean;
  embed?: {
    title: string;
    color: string;
    fields: { name: string; value: string; inline: boolean }[];
    footer: string;
  };
}

export interface Plano {
  nome: string;
  preco: number;
  periodo: string;
  precoMensal: number;
  destaque: boolean;
  economia?: string;
  maisPopular?: boolean;
  recursos: string[];
}

export interface FAQItemData {
  question: string;
  answer: string;
}

// ─── Data ───────────────────────────────────────────────────────────────────

export const stats: Stat[] = [
  { label: 'Servidores Ativos', value: 25, suffix: '+' },
  { label: 'Empresas Gerenciadas', value: 150, suffix: '+' },
  { label: 'Entregas Processadas', value: 5000, suffix: '+' },
  { label: 'Uptime', value: 99.9, suffix: '%' },
];

export const features: Feature[] = [
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

export const howItWorks: HowItWorksStep[] = [
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

export const discordMessages: DiscordMessage[] = [
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

export const planos: Plano[] = [
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

export const faqItems: FAQItemData[] = [
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
