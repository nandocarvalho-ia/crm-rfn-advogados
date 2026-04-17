import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/common';
import { PeriodSelector } from '@/components/dashboard/PeriodSelector';
import { KPISection } from '@/components/dashboard/KPISection';
import { OrigemSection } from '@/components/dashboard/OrigemSection';
import { CreativosSection } from '@/components/dashboard/CreativosSection';
import { LoteCotaSection } from '@/components/dashboard/LoteCotaSection';
import { FunilSection } from '@/components/dashboard/FunilSection';
import { ProximosFollowUps } from '@/components/dashboard/ProximosFollowUps';
import { EvolucaoSection } from '@/components/dashboard/EvolucaoSection';
import type { PeriodKey } from '@/components/dashboard/types';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useFollowUpsAgendados } from '@/hooks/useFollowUpsAgendados';
import {
  computeCriativos,
  computeEvolucao,
  computeFunil,
  computeKPIs,
  computeLoteCota,
  computeOrigem,
} from '@/lib/dashboardCalc';

const Dashboard = () => {
  const [period, setPeriod] = useState<PeriodKey>('30d');
  const { data, isLoading, isError, error } = useDashboardData(period);
  const { data: followUpsLeads = [] } = useFollowUpsAgendados();

  const aggregates = useMemo(() => {
    if (!data) return null;
    const { createdCurrent, createdPrev, convertedCurrent, convertedPrev, range } = data;
    return {
      kpis: computeKPIs(createdCurrent, createdPrev, convertedCurrent, convertedPrev),
      origem: computeOrigem(createdCurrent),
      criativos: computeCriativos(createdCurrent, convertedCurrent),
      loteCota: computeLoteCota(createdCurrent, convertedCurrent),
      funil: computeFunil(createdCurrent, convertedCurrent),
      evolucao: computeEvolucao(createdCurrent, convertedCurrent, range.start, range.end),
    };
  }, [data]);

  const proximosFollowUps = useMemo(() => followUpsLeads.slice(0, 10), [followUpsLeads]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral do funil, performance de tráfego pago e próximos follow-ups."
        actions={
          <div className="flex items-center gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-ink-muted" />}
            <PeriodSelector value={period} onChange={setPeriod} />
          </div>
        }
      />

      {isError && (
        <div className="rounded-xl bg-tag-danger-bg text-tag-danger p-4 text-sm">
          Erro ao carregar dashboard: {error instanceof Error ? error.message : 'desconhecido'}
        </div>
      )}

      {aggregates && (
        <>
          <KPISection kpis={aggregates.kpis} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <OrigemSection data={aggregates.origem} />
            </div>
            <div className="lg:col-span-4">
              <ProximosFollowUps data={proximosFollowUps} />
            </div>
          </div>

          <CreativosSection data={aggregates.criativos} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <LoteCotaSection data={aggregates.loteCota} />
            </div>
            <div className="lg:col-span-5">
              <FunilSection data={aggregates.funil} />
            </div>
          </div>

          <EvolucaoSection data={aggregates.evolucao} />
        </>
      )}
    </div>
  );
};

export default Dashboard;
