import { PageHeader } from '@/components/common';
import { LeadsTable } from '@/components/crm/LeadsTable';

const CRM = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="CRM"
        description="Gestão de leads — filtros, edição inline de status e exportação."
      />
      <LeadsTable />
    </div>
  );
};

export default CRM;
