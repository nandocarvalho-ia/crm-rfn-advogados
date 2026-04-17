import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  /** Variação percentual vs período anterior. Positivo = verde, negativo = vermelho. */
  deltaPct?: number | null;
  /** Texto de suporte abaixo do valor (ex: "vs. últimos 30 dias"). */
  footnote?: string;
  className?: string;
}

export function KPICard({ label, value, icon: Icon, deltaPct, footnote, className }: KPICardProps) {
  const hasDelta = typeof deltaPct === 'number' && !Number.isNaN(deltaPct);
  const positive = (deltaPct ?? 0) >= 0;

  return (
    <div
      className={cn(
        'rounded-xl bg-app-card p-6 shadow-sm border border-line',
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-ink-muted">{label}</p>
          <p className="mt-1 text-3xl font-semibold text-ink leading-tight truncate">{value}</p>

          {(hasDelta || footnote) && (
            <div className="mt-2 flex items-center gap-2 text-xs">
              {hasDelta && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 font-medium',
                    positive ? 'text-tag-success' : 'text-tag-danger',
                  )}
                >
                  {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {positive ? '+' : ''}
                  {deltaPct!.toFixed(1)}%
                </span>
              )}
              {footnote && <span className="text-ink-muted">{footnote}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
