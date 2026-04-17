import { PageHeader } from '@/components/common';
import { ConfigCard } from '@/components/followups/ConfigCard';
import { FollowUpsTable } from '@/components/followups/FollowUpsTable';
import { MetricasFooter } from '@/components/followups/MetricasFooter';

const FollowUps = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-ups"
        description="Leads com follow-up agendado, edição de textos e métricas."
      />
      <ConfigCard />
      <FollowUpsTable />
      <MetricasFooter />
    </div>
  );
};

export default FollowUps;
