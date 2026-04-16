import { useState } from 'react';
import { PageHeader } from '@/components/common';
import { PeriodSelector } from '@/components/dashboard/PeriodSelector';
import { KPISection } from '@/components/dashboard/KPISection';
import { OrigemSection } from '@/components/dashboard/OrigemSection';
import { CreativosSection } from '@/components/dashboard/CreativosSection';
import { LoteCotaSection } from '@/components/dashboard/LoteCotaSection';
import { FunilSection } from '@/components/dashboard/FunilSection';
import { ProximosFollowUps } from '@/components/dashboard/ProximosFollowUps';
import { EvolucaoSection } from '@/components/dashboard/EvolucaoSection';
import {
  MOCK_KPIS,
  MOCK_ORIGEM,
  MOCK_CRIATIVOS,
  MOCK_LOTE_COTA,
  MOCK_FUNIL,
  MOCK_PROXIMOS_FOLLOWUPS,
  MOCK_EVOLUCAO,
  type PeriodKey,
} from '@/components/dashboard/mockData';

const Dashboard = () => {
  const [period, setPeriod] = useState<PeriodKey>('30d');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral do funil, performance de tráfego pago e próximos follow-ups."
        actions={<PeriodSelector value={period} onChange={setPeriod} />}
      />

      <KPISection kpis={MOCK_KPIS} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <OrigemSection data={MOCK_ORIGEM} />
        </div>
        <div className="lg:col-span-4">
          <ProximosFollowUps data={MOCK_PROXIMOS_FOLLOWUPS} />
        </div>
      </div>

      <CreativosSection data={MOCK_CRIATIVOS} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <LoteCotaSection data={MOCK_LOTE_COTA} />
        </div>
        <div className="lg:col-span-5">
          <FunilSection data={MOCK_FUNIL} />
        </div>
      </div>

      <EvolucaoSection data={MOCK_EVOLUCAO} />
    </div>
  );
};

export default Dashboard;
