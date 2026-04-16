import { Users } from 'lucide-react';
import { EmptyState, PageHeader } from '@/components/common';

const CRM = () => {
  return (
    <>
      <PageHeader
        title="CRM"
        description="Gestão de leads — tabela completa com filtros, edição inline e exportação."
      />
      <EmptyState
        icon={Users}
        title="CRM reformulado em construção"
        description="A nova tabela com filtros simplificados, coluna de origem, data de conversão e exportação CSV chega na próxima sub-etapa."
      />
    </>
  );
};

export default CRM;
