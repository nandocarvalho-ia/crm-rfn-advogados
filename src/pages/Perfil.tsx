import { Lock, Mail, Shield, User } from 'lucide-react';
import { PageHeader } from '@/components/common';

const Perfil = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Perfil"
        description="Suas informações pessoais e dados da conta."
      />

      <section className="rounded-xl bg-app-card p-6 shadow-sm border border-line">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-light text-xl font-semibold text-brand">
            DR
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-ink">Dr. Roger</h2>
            <p className="text-sm text-ink-muted">RFN Advogados · Advogado responsável</p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow icon={<User className="h-4 w-4" />} label="Nome" value="Dr. Roger" />
          <InfoRow
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            value="—"
            hint="Não cadastrado"
          />
          <InfoRow
            icon={<Shield className="h-4 w-4" />}
            label="Papel"
            value="Administrador"
          />
          <InfoRow
            icon={<Lock className="h-4 w-4" />}
            label="Autenticação"
            value="Pendente"
            hint="Login com senha será adicionado numa fase futura"
          />
        </dl>
      </section>

      <div className="rounded-xl bg-brand-light/50 border border-brand/20 p-4 text-sm text-ink-secondary">
        <p>
          <span className="font-medium text-ink">Edição e troca de senha</span> ficam para a
          próxima fase quando a autenticação for integrada. Por ora, o acesso ao CRM é
          direto via URL.
        </p>
      </div>
    </div>
  );
};

function InfoRow({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg bg-app-bg border border-line-subtle p-3">
      <dt className="flex items-center gap-2 text-xs text-ink-muted">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
      {hint && <p className="mt-0.5 text-[11px] text-ink-muted">{hint}</p>}
    </div>
  );
}

export default Perfil;
