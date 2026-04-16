import { parseCampanha, PlatformBadge } from '@/components/common';
import type { OrigemRow } from './mockData';

const HUE_BY_PLATFORM = {
  meta: 'bg-tag-meta',
  google: 'bg-tag-google',
  organico: 'bg-tag-organic',
  desconhecido: 'bg-tag-neutral',
} as const;

export function OrigemSection({ data }: { data: OrigemRow[] }) {
  const maxQty = Math.max(...data.map((d) => d.qty), 1);

  return (
    <section className="rounded-xl bg-app-card p-6 shadow-sm border border-line">
      <h2 className="text-lg font-semibold text-ink">Origem dos leads</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Distribuição por plataforma e tipo de campanha.
      </p>

      <div className="mt-6 space-y-4">
        {data.map((row) => {
          const { platform } = parseCampanha(row.campanha);
          const widthPct = Math.max(4, (row.qty / maxQty) * 100);
          return (
            <div key={row.campanha} className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 min-w-0">
                  <PlatformBadge platform={platform} />
                  <span className="text-sm text-ink-secondary truncate">{row.label}</span>
                </div>
                <div className="shrink-0 text-sm text-ink-muted">
                  <span className="font-medium text-ink">{row.qty.toLocaleString('pt-BR')}</span>
                  <span className="mx-1">·</span>
                  {row.pct.toFixed(1)}%
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-line-subtle">
                <div
                  className={`h-full rounded-full ${HUE_BY_PLATFORM[platform]}`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
