import { ChevronRight, Clock, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FollowUpAgendado } from './mockData';

function formatRelative(iso: string) {
  const target = new Date(iso).getTime();
  const diff = target - Date.now();
  const absMin = Math.abs(Math.round(diff / 60_000));
  const absHr = Math.round(absMin / 60);

  if (diff >= 0) {
    if (absMin < 60) return `em ${absMin} min`;
    if (absHr < 24) return `em ${absHr}h`;
    return `em ${Math.round(absHr / 24)}d`;
  }
  if (absMin < 60) return `atrasado há ${absMin} min`;
  if (absHr < 24) return `atrasado há ${absHr}h`;
  return `atrasado há ${Math.round(absHr / 24)}d`;
}

export function ProximosFollowUps({ data }: { data: FollowUpAgendado[] }) {
  return (
    <section className="rounded-xl bg-app-card shadow-sm border border-line flex flex-col">
      <header className="p-6 pb-3 border-b border-line">
        <h2 className="text-lg font-semibold text-ink">Próximos follow-ups</h2>
        <p className="mt-1 text-sm text-ink-muted">Próximos 10 disparos agendados.</p>
      </header>

      <ul className="divide-y divide-line-subtle overflow-y-auto">
        {data.map((f) => {
          const atrasado = new Date(f.agendadoEm).getTime() < Date.now();
          return (
            <li key={f.id}>
              <button
                type="button"
                className="w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-app-bg transition-colors"
                onClick={() => console.log('[RFN] open lead', f.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink truncate">{f.nome}</span>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                        f.followUp === 1
                          ? 'bg-tag-info-bg text-tag-info'
                          : 'bg-tag-warning-bg text-tag-warning',
                      )}
                    >
                      FU {f.followUp}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-ink-muted">
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {f.telefone}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1',
                        atrasado && 'text-tag-danger',
                      )}
                    >
                      <Clock className="h-3 w-3" />
                      {formatRelative(f.agendadoEm)}
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
