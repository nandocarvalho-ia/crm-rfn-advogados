import { useMemo, useState } from 'react';
import { Pencil, Search } from 'lucide-react';
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
import { EditarTextosModal } from './EditarTextosModal';
import { MOCK_FOLLOWUPS, type FollowUpLead } from './mockFollowUps';

type FUFilter = 'all' | '1' | '2';

function relativeLong(iso: string, { past = true }: { past?: boolean } = {}) {
  const ms = Date.now() - new Date(iso).getTime();
  const abs = Math.abs(ms);
  const min = Math.round(abs / 60_000);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);

  if (ms >= 0) {
    if (past) {
      if (min < 60) return `há ${min} min`;
      if (hr < 24) return `há ${hr}h`;
      return `há ${day}d`;
    }
    // passou mas queremos rótulo de atraso
    if (min < 60) return `atrasado há ${min} min`;
    if (hr < 24) return `atrasado há ${hr}h`;
    return `atrasado há ${day}d`;
  }
  // futuro
  if (min < 60) return `em ${min} min`;
  if (hr < 24) return `em ${hr}h`;
  return `em ${day}d`;
}

function formatSchedule(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function FollowUpsTable() {
  const [leads, setLeads] = useState<FollowUpLead[]>(MOCK_FOLLOWUPS);
  const [search, setSearch] = useState('');
  const [fuFilter, setFuFilter] = useState<FUFilter>('all');
  const [editing, setEditing] = useState<FollowUpLead | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      const fu = l.tentativas_followup + 1;
      if (fuFilter !== 'all' && String(fu) !== fuFilter) return false;
      if (q && !l.nome.toLowerCase().includes(q) && !l.telefone.includes(q)) return false;
      return true;
    });
  }, [leads, search, fuFilter]);

  const handleSave = (id: string, fu1: string, fu2: string) => {
    setLeads((arr) =>
      arr.map((l) =>
        l.id === id ? { ...l, followup_1: fu1, followup_2: fu2 } : l,
      ),
    );
  };

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
            <SelectItem value="all">Todos os follow-ups</SelectItem>
            <SelectItem value="1">Follow-up 1</SelectItem>
            <SelectItem value="2">Follow-up 2</SelectItem>
          </SelectContent>
        </Select>

        <p className="ml-auto text-sm text-ink-secondary">
          <span className="font-semibold text-ink">{filtered.length}</span> agendado
          {filtered.length === 1 ? '' : 's'}
        </p>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-line bg-app-bg/40">
              <Th>Lead</Th>
              <Th>Último contato</Th>
              <Th>Follow-up</Th>
              <Th>Disparo agendado</Th>
              <Th align="right">Ação</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => {
              const fuNum = l.tentativas_followup + 1;
              const atrasado = new Date(l.proximo_followup).getTime() < Date.now();
              return (
                <tr key={l.id} className="border-b border-line-subtle hover:bg-app-bg transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-medium text-ink">{l.nome}</div>
                    <div className="text-xs text-ink-muted">{l.telefone}</div>
                  </td>
                  <td className="py-3 px-4 text-ink-secondary">
                    {relativeLong(l.last_interaction, { past: true })}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        fuNum === 1
                          ? 'bg-tag-info-bg text-tag-info'
                          : 'bg-tag-warning-bg text-tag-warning',
                      )}
                    >
                      FU {fuNum}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-ink">{formatSchedule(l.proximo_followup)}</div>
                    <div
                      className={cn(
                        'text-xs',
                        atrasado ? 'text-tag-danger' : 'text-ink-muted',
                      )}
                    >
                      {relativeLong(l.proximo_followup, { past: false })}
                    </div>
                  </td>
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
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-ink-muted">
                  Nenhum follow-up agendado com os filtros atuais.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <EditarTextosModal
        lead={editing}
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />
    </section>
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
