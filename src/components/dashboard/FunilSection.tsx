import type { FunilEtapa } from './mockData';

const SHADES = ['bg-brand', 'bg-brand/80', 'bg-brand/60', 'bg-brand/45'];

export function FunilSection({ data }: { data: FunilEtapa[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <section className="rounded-xl bg-app-card p-6 shadow-sm border border-line">
      <h2 className="text-lg font-semibold text-ink">Funil</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Do lead que entrou até o lead convertido.
      </p>

      <div className="mt-6 space-y-3">
        {data.map((etapa, idx) => {
          const pctOfMax = (etapa.count / maxCount) * 100;
          const pctVsPrev =
            idx === 0
              ? null
              : data[idx - 1].count > 0
                ? (etapa.count / data[idx - 1].count) * 100
                : 0;
          return (
            <div key={etapa.etapa}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="font-medium text-ink">{etapa.etapa}</span>
                <span className="text-ink-muted">
                  <span className="font-semibold text-ink">
                    {etapa.count.toLocaleString('pt-BR')}
                  </span>
                  {pctVsPrev !== null && (
                    <span className="ml-2 text-xs">
                      ({pctVsPrev.toFixed(1)}% da etapa anterior)
                    </span>
                  )}
                </span>
              </div>
              <div className="h-8 w-full overflow-hidden rounded-lg bg-line-subtle">
                <div
                  className={`h-full rounded-lg ${SHADES[idx] ?? 'bg-brand/30'} transition-all`}
                  style={{ width: `${Math.max(6, pctOfMax)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
