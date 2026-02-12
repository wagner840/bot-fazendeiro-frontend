import { supabase } from './client';

const CHART_COLORS = ['#d4a853', '#8b2635', '#6d4f28', '#4a7c59', '#c4a77d'];

export async function getRevenueChartData(
  empresaId: number,
  period: 'week' | 'month' | 'year' = 'month'
): Promise<{ mes: string; receita: number; pagamentos: number }[]> {
  const dataMap: { [key: string]: { receita: number; pagamentos: number } } = {};
  const labels: string[] = [];
  const now = new Date();

  let startRange: Date;
  const endRange = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  // Initialize buckets based on period
  if (period === 'week') {
    // Last 7 days
    startRange = new Date(now);
    startRange.setDate(now.getDate() - 6);
    startRange.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const d = new Date(startRange);
      d.setDate(startRange.getDate() + i);
      const key = d.toLocaleDateString('pt-BR', { weekday: 'short' });
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      dataMap[label] = { receita: 0, pagamentos: 0 };
      labels.push(label);
    }
  } else if (period === 'month') {
    // Last 30 days
    startRange = new Date(now);
    startRange.setDate(now.getDate() - 29);
    startRange.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const d = new Date(startRange);
      d.setDate(startRange.getDate() + i);
      const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      dataMap[label] = { receita: 0, pagamentos: 0 };
      labels.push(label);
    }
  } else {
    // Year (Last 12 months)
    startRange = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const key = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      dataMap[label] = { receita: 0, pagamentos: 0 };
      labels.push(label);
    }
  }

  // 1. Fetch Orders
  const { data: orders } = await supabase
    .from('encomendas')
    .select('valor_total, data_entrega')
    .eq('empresa_id', empresaId)
    .eq('status', 'entregue')
    .gte('data_entrega', startRange.toISOString())
    .lte('data_entrega', endRange.toISOString());

  if (orders) {
    orders.forEach(o => {
      if (!o.data_entrega) return;
      const d = new Date(o.data_entrega);
      let label = '';

      if (period === 'week') {
        const key = d.toLocaleDateString('pt-BR', { weekday: 'short' });
        label = key.charAt(0).toUpperCase() + key.slice(1);
      } else if (period === 'month') {
        label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      } else {
        const key = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
        label = key.charAt(0).toUpperCase() + key.slice(1);
      }

      if (dataMap[label]) {
        dataMap[label].receita += (o.valor_total || 0);
      }
    });
  }

  // 2. Fetch Payments
  const { data: payments } = await supabase
    .from('historico_pagamentos')
    .select('valor, data_pagamento, funcionario:funcionarios!inner(empresa_id)')
    .eq('funcionario.empresa_id', empresaId)
    .gte('data_pagamento', startRange.toISOString())
    .lte('data_pagamento', endRange.toISOString());

  if (payments) {
    payments.forEach(p => {
      if (!p.data_pagamento) return;
      const d = new Date(p.data_pagamento);
      let label = '';

      if (period === 'week') {
        const key = d.toLocaleDateString('pt-BR', { weekday: 'short' });
        label = key.charAt(0).toUpperCase() + key.slice(1);
      } else if (period === 'month') {
        label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      } else {
        const key = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
        label = key.charAt(0).toUpperCase() + key.slice(1);
      }

      if (dataMap[label]) {
        dataMap[label].pagamentos += (p.valor || 0);
      }
    });
  }

  return labels.map(label => ({
    mes: label,
    receita: dataMap[label].receita,
    pagamentos: dataMap[label].pagamentos
  }));
}

export async function getCategoryDistribution(empresaId: number): Promise<{ name: string; value: number; fill: string }[]> {
  const { data: produtos, error } = await supabase
    .from('produtos_empresa')
    .select(`
      estoque_atual,
      preco_venda,
      produto_referencia:produtos_referencia(categoria)
    `)
    .eq('empresa_id', empresaId)
    .eq('ativo', true);

  if (error) throw error;

  // Group by category and calculate total value
  const categoryValues: Record<string, number> = {};
  let totalValue = 0;

  produtos?.forEach((p) => {
    const ref = p.produto_referencia as { categoria?: string } | { categoria?: string }[] | null;
    const categoria = ref ? (Array.isArray(ref) ? ref[0]?.categoria : ref.categoria) : 'Outros';
    const value = (p.estoque_atual || 0) * (p.preco_venda || 0);

    categoryValues[categoria || 'Outros'] = (categoryValues[categoria || 'Outros'] || 0) + value;
    totalValue += value;
  });

  // Convert to percentages
  const result = Object.entries(categoryValues)
    .map(([name, value], index) => ({
      name,
      value: totalValue > 0 ? Math.round((value / totalValue) * 100) : 0,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return result;
}
