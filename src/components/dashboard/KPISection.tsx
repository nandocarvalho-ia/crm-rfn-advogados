import { DollarSign, Percent, TrendingUp, Users } from 'lucide-react';
import { KPICard } from '@/components/common';
import type { KPISet } from './mockData';

const fmtMoney = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);

export function KPISection({ kpis }: { kpis: KPISet }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <KPICard
        label="Total de leads"
        value={kpis.totalLeads.toLocaleString('pt-BR')}
        icon={Users}
        deltaPct={kpis.deltas.total}
        footnote="vs. período anterior"
      />
      <KPICard
        label="Taxa de qualificação"
        value={`${kpis.qualificationRate.toFixed(1)}%`}
        icon={Percent}
        deltaPct={kpis.deltas.qualification}
        footnote="vs. período anterior"
      />
      <KPICard
        label="Taxa de conversão"
        value={`${kpis.conversionRate.toFixed(1)}%`}
        icon={TrendingUp}
        deltaPct={kpis.deltas.conversion}
        footnote="vs. período anterior"
      />
      <KPICard
        label="Potencial de recuperação"
        value={fmtMoney(kpis.recoveredPotential)}
        icon={DollarSign}
        deltaPct={kpis.deltas.potential}
        footnote="qualificados ∪ convertidos no período"
      />
    </div>
  );
}
