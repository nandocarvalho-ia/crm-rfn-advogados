import { LayoutDashboard } from 'lucide-react';
import { EmptyState, PageHeader } from '@/components/common';

const Dashboard = () => {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral do funil, tráfego pago e próximos follow-ups."
      />
      <EmptyState
        icon={LayoutDashboard}
        title="Dashboard em construção"
        description="As 7 seções (KPIs, origem, criativos, Lote vs Cota, funil, próximos follow-ups e evolução temporal) serão adicionadas na próxima sub-etapa."
      />
    </>
  );
};

export default Dashboard;
