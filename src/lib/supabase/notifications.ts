import { supabase } from './client';
import type { ActivityItem, ActivityType } from '../types';

const FEED_DAYS = 30;
const FEED_LIMIT = 50;

function getDateThreshold(): string {
  const d = new Date();
  d.setDate(d.getDate() - FEED_DAYS);
  return d.toISOString();
}

function paymentType(tipo: string): ActivityType {
  if (tipo === 'bonus') return 'payment_bonus';
  if (tipo === 'ajuste') return 'payment_ajuste';
  return 'payment_estoque';
}

function paymentDescription(tipo: string, nome: string, valor: number): string {
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Math.abs(valor));

  switch (tipo) {
    case 'bonus':
      return `${nome} recebeu bônus de ${formatted}`;
    case 'ajuste':
      return `Ajuste de ${formatted} para ${nome}`;
    default:
      return `${nome} recebeu ${formatted} (estoque)`;
  }
}

function orderDescription(status: string, comprador: string, valor: number, id: number): string {
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);

  switch (status) {
    case 'entregue':
      return `Encomenda #${id} entregue`;
    case 'em_andamento':
      return `Encomenda #${id} em andamento`;
    default:
      return `Nova encomenda de ${comprador} - ${formatted}`;
  }
}

function orderType(status: string): ActivityType {
  if (status === 'entregue') return 'order_delivered';
  if (status === 'em_andamento') return 'order_in_progress';
  return 'order_created';
}

export async function getActivityFeed(
  empresaId: number,
  limit: number = FEED_LIMIT
): Promise<ActivityItem[]> {
  const threshold = getDateThreshold();

  const [pagamentos, encomendas] = await Promise.all([
    supabase
      .from('historico_pagamentos')
      .select('id, tipo, valor, descricao, data_pagamento, funcionario:funcionarios!inner(empresa_id, nome)')
      .eq('funcionario.empresa_id', empresaId)
      .gte('data_pagamento', threshold)
      .order('data_pagamento', { ascending: false })
      .limit(limit),
    supabase
      .from('encomendas')
      .select('id, comprador, valor_total, status, data_criacao, funcionario_responsavel:funcionarios(nome)')
      .eq('empresa_id', empresaId)
      .gte('data_criacao', threshold)
      .order('data_criacao', { ascending: false })
      .limit(limit),
  ]);

  const activities: ActivityItem[] = [];

  if (pagamentos.data) {
    for (const p of pagamentos.data) {
      const func = p.funcionario as unknown as { nome: string } | null;
      const nome = func?.nome ?? 'Funcionário';
      activities.push({
        id: `pay-${p.id}`,
        type: paymentType(p.tipo),
        timestamp: p.data_pagamento,
        actorName: nome,
        description: paymentDescription(p.tipo, nome, p.valor),
        amount: p.valor,
      });
    }
  }

  if (encomendas.data) {
    for (const e of encomendas.data) {
      const resp = e.funcionario_responsavel as unknown as { nome: string } | null;
      activities.push({
        id: `ord-${e.id}`,
        type: orderType(e.status),
        timestamp: e.data_criacao,
        actorName: resp?.nome ?? e.comprador,
        description: orderDescription(e.status, e.comprador, e.valor_total, e.id),
        amount: e.valor_total,
      });
    }
  }

  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return activities.slice(0, limit);
}
