import { Clock, Info, Calendar } from 'lucide-react';

export function ConfigCard() {
  return (
    <section className="rounded-xl bg-app-card p-6 shadow-sm border border-line">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
          <Info className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-ink">Configurações de follow-up</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Parâmetros atuais do agente observador.
          </p>

          <dl className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <ConfigItem
              icon={Clock}
              title="Follow-up 1"
              description="1 hora após a última mensagem do Rafael"
            />
            <ConfigItem
              icon={Clock}
              title="Follow-up 2"
              description="12 horas após o envio do follow-up 1"
            />
            <ConfigItem
              icon={Calendar}
              title="Janela comercial"
              description="Seg-Sex 08h-20h · Sáb 08h-12h · Dom não envia"
            />
          </dl>

          <p className="mt-4 text-xs text-ink-muted">
            Para alterar estes parâmetros, entre em contato com o administrador técnico.
          </p>
        </div>
      </div>
    </section>
  );
}

function ConfigItem({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Clock;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-line-subtle bg-app-bg/60 p-3">
      <div className="flex items-center gap-2 text-ink-secondary">
        <Icon className="h-4 w-4" />
        <dt className="text-xs font-semibold uppercase tracking-wider">{title}</dt>
      </div>
      <dd className="mt-1 text-sm text-ink">{description}</dd>
    </div>
  );
}
