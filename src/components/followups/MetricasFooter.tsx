import { MessageCircleReply, Send } from 'lucide-react';
import { useFollowUpsAgendados } from '@/hooks/useFollowUpsAgendados';

export function MetricasFooter() {
  const { data = [], isLoading } = useFollowUpsAgendados();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <MetricaCard
        Icon={Send}
        label="Leads com follow-up preparado"
        value={isLoading ? '—' : data.length.toLocaleString('pt-BR')}
      />
      <MetricaCard
        Icon={MessageCircleReply}
        label="Taxa de resposta"
        value="—"
        footnote="Em breve"
      />
    </div>
  );
}

function MetricaCard({
  Icon,
  label,
  value,
  footnote,
}: {
  Icon: typeof Send;
  label: string;
  value: string;
  footnote?: string;
}) {
  return (
    <div className="rounded-xl bg-app-card p-5 shadow-sm border border-line">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-ink-muted">{label}</p>
          <p className="text-xl font-semibold text-ink">{value}</p>
          {footnote && <p className="text-xs text-ink-muted mt-0.5">{footnote}</p>}
        </div>
      </div>
    </div>
  );
}
