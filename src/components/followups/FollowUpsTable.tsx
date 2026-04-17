import { useMemo, useState } from 'react';
import { Loader2, Pencil, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useFollowUpsAgendados, type FollowUpLead } from '@/hooks/useFollowUpsAgendados';
import { formatPhoneBR } from '@/components/chat/utils';
import { StatusBadge } from '@/components/common';
import { EditarTextosModal } from './EditarTextosModal';

type FUFilter = 'all' | '1' | '2' | '3';

function relTime(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return formatDistanceToNow(d, { locale: ptBR, addSuffix: true });
}

export function FollowUpsTable() {
  const { data: leads = [], isLoading } = useFollowUpsAgendados();
  const [search, setSearch] = useState('');
  const [fuFilter, setFuFilter] = useState<FUFilter>('all');
  const [editing, setEditing] = useState<FollowUpLead | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (q) {
        const nome = (l.nome_lead || '').toLowerCase();
        const tel = String(l.telefone || '');
        if (!nome.includes(q) && !tel.includes(q)) return false;
      }
      if (fuFilter === '1' && !l.followup_1) return false;
      if (fuFilter === '2' && !l.followup_2) return false;
      if (fuFilter === '3' && !l.followup_3) return false;
      return true;
    });
  }, [leads, search, fuFilter]);

  return (
    <section className="rounded-xl bg-app-card shadow-sm border border-line">
      {/* Filtros */}
      <div className="p-4 border-b border-line flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <Input
            placeholder="Buscar por nome ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-app-bg border-line"
          />
        </div>

        <Select value={fuFilter} onValueChange={(v) => setFuFilter(v as FUFilter)}>
          <SelectTrigger className="w-[180px] h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="1">Com FU 1 pronto</SelectItem>
            <SelectItem value="2">Com FU 2 pronto</SelectItem>
            <SelectItem value="3">Com FU 3 pronto</SelectItem>
          </SelectContent>
        </Select>

        <p className="ml-auto text-sm text-ink-secondary">
          <span className="font-semibold text-ink">{filtered.length}</span> lead
          {filtered.length === 1 ? '' : 's'}
          {isLoading && <Loader2 className="ml-2 inline h-3.5 w-3.5 animate-spin text-ink-muted" />}
        </p>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-line bg-app-bg/40">
              <Th>Lead</Th>
              <Th>Status</Th>
              <Th>Textos prontos</Th>
              <Th>Última atualização</Th>
              <Th align="right">Ação</Th>
            </tr>
          </thead>
          <tbody>
            {isLoading && leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-ink-muted">
                  <Loader2 className="inline h-5 w-5 animate-spin" /> Carregando leads...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-ink-muted">
                  Nenhum lead encontrado com os filtros atuais.
                </td>
              </tr>
            ) : (
              filtered.map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-line-subtle hover:bg-app-bg transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-ink">{l.nome_lead || 'Sem nome'}</div>
                    <div className="text-xs text-ink-muted">{formatPhoneBR(String(l.telefone))}</div>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={l.status_lead as any} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <FUChip active={!!l.followup_1} label="FU 1" />
                      <FUChip active={!!l.followup_2} label="FU 2" />
                      <FUChip active={!!l.followup_3} label="FU 3" />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-ink-secondary">{relTime(l.updated_at)}</td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(l)}
                      className="gap-1.5"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar textos
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <EditarTextosModal lead={editing} onClose={() => setEditing(null)} />
    </section>
  );
}

function FUChip({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
        active ? 'bg-tag-info-bg text-tag-info' : 'bg-tag-neutral-bg text-tag-neutral opacity-60',
      )}
      title={active ? `${label} pronto` : `${label} não gerado`}
    >
      {label}
    </span>
  );
}

function Th({ children, align }: { children: React.ReactNode; align?: 'right' }) {
  return (
    <th
      className={cn(
        'py-2 px-4 text-xs font-medium uppercase tracking-wider text-ink-muted text-left',
        align === 'right' && 'text-right',
      )}
    >
      {children}
    </th>
  );
}
