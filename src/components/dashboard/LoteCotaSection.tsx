import { Building2, Home } from 'lucide-react';
import type { LoteCota } from './types';

const fmtMoney = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);

export function LoteCotaSection({ data }: { data: LoteCota[] }) {
  const total = data.reduce((acc, d) => acc + d.total, 0);

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {data.map((row) => {
        const Icon = row.tipo === 'Cota' ? Building2 : Home;
        const pct = total > 0 ? (row.total / total) * 100 : 0;
        return (
          <div
            key={row.tipo}
            className="rounded-xl bg-app-card p-6 shadow-sm border border-line"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink-muted">Leads · {row.tipo}</p>
                <p className="mt-1 text-3xl font-semibold text-ink leading-tight">
                  {row.total.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-ink-muted text-xs">Taxa de conversão</dt>
                <dd className="mt-0.5 font-medium text-ink">{row.conversao.toFixed(1)}%</dd>
              </div>
              <div>
                <dt className="text-ink-muted text-xs">Ticket médio</dt>
                <dd className="mt-0.5 font-medium text-ink">{fmtMoney(row.ticketMedio)}</dd>
              </div>
            </dl>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-ink-muted">
                <span>Proporção do total</span>
                <span>{pct.toFixed(1)}%</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-line-subtle">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
