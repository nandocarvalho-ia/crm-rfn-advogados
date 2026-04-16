import { Send } from 'lucide-react';
import { EmptyState, PageHeader } from '@/components/common';

const FollowUps = () => {
  return (
    <>
      <PageHeader
        title="Follow-ups"
        description="Leads com follow-up agendado, edição de textos e métricas."
      />
      <EmptyState
        icon={Send}
        title="Follow-ups em construção"
        description="Card de configurações, tabela de follow-ups agendados e modal de edição chegam na próxima sub-etapa."
      />
    </>
  );
};

export default FollowUps;
