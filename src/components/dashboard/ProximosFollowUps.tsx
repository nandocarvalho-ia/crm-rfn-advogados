import { ChevronRight, Clock, Phone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { formatPhoneBR } from '@/components/chat/utils';
import type { FollowUpLead } from '@/hooks/useFollowUpsAgendados';

interface ProximosFollowUpsProps {
  data: FollowUpLead[];
}

export function ProximosFollowUps({ data }: ProximosFollowUpsProps) {
  return (
    <section className="rounded-xl bg-app-card shadow-sm border border-line flex flex-col">
      <header className="p-6 pb-3 border-b border-line">
        <h2 className="text-lg font-semibold text-ink">Próximos follow-ups</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Leads com texto preparado, ordenados por atualização recente.
        </p>
      </header>

      <ul className="divide-y divide-line-subtle overflow-y-auto">
        {data.length === 0 && (
          <li className="px-6 py-6 text-center text-sm text-ink-muted">
            Nenhum follow-up preparado no momento.
          </li>
        )}
        {data.map((f) => {
          const hasFu1 = !!f.followup_1;
          const hasFu2 = !!f.followup_2;
          return (
            <li key={f.id}>
              <button
                type="button"
                className="w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-app-bg transition-colors"
                onClick={() => console.log('[RFN] open lead', f.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink truncate">
                      {f.nome_lead || 'Sem nome'}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                        hasFu1 && hasFu2
                          ? 'bg-tag-success-bg text-tag-success'
                          : 'bg-tag-info-bg text-tag-info',
                      )}
                    >
                      {hasFu1 && hasFu2 ? 'FU 1+2' : 'FU 1'}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-ink-muted">
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {formatPhoneBR(String(f.telefone))}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {f.updated_at
                        ? formatDistanceToNow(new Date(f.updated_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })
                        : '—'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-muted" />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
