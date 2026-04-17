import { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, Download, Loader2, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CategoryBadge,
  classifyCategoria,
  parseCampanha,
  PlatformBadge,
} from '@/components/common';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useLeadsRoger, type LeadRoger } from '@/hooks/useLeadsRoger';
import { formatPhoneBR } from '@/components/chat/utils';
import { StatusInlineSelect } from './StatusInlineSelect';
import { LeadDetailsModal } from './LeadDetailsModal';
import type { StatusLead } from './mockLeads';

type CategoryFilter = 'all' | 'sem-classificacao' | 'qualificado' | 'desqualificado';
type StatusFilter = 'all' | StatusLead;
type TipoFilter = 'all' | 'lote' | 'cota';

const fmtDateTime = (iso: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const fmtMoney = (n: number | null | undefined) => {
  const v = typeof n === 'number' ? n : parseFloat(String(n ?? 0));
  if (!v || Number.isNaN(v)) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(v);
};

const isValidStatus = (s: string | null | undefined): s is StatusLead =>
  s === 'novo' || s === 'conversando' || s === 'convertido';

export function LeadsTable() {
  const { leads, isLoading } = useLeadsRoger();
  const queryClient = useQueryClient();

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const selectedLead = selectedLeadId
    ? leads.find((l) => l.id === selectedLeadId) ?? null
    : null;
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<CategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const hasActiveFilters =
    search !== '' ||
    catFilter !== 'all' ||
    statusFilter !== 'all' ||
    tipoFilter !== 'all' ||
    !!dateRange?.from ||
    !!dateRange?.to;

  const clearFilters = () => {
    setSearch('');
    setCatFilter('all');
    setStatusFilter('all');
    setTipoFilter('all');
    setDateRange(undefined);
  };

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: StatusLead }) => {
      const { error } = await supabase
        .from('leads_roger')
        .update({ status_lead: status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads-roger'] });
      toast.success('Status atualizado');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error('Erro ao atualizar status', { description: msg });
    },
  });

  const total = leads.length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const fromMs = dateRange?.from ? new Date(dateRange.from).setHours(0, 0, 0, 0) : null;
    const toMs = dateRange?.to
      ? new Date(dateRange.to).setHours(23, 59, 59, 999)
      : dateRange?.from
        ? new Date(dateRange.from).setHours(23, 59, 59, 999)
        : null;

    return leads.filter((l) => {
      if (q) {
        const nome = (l.nome_lead || '').toLowerCase();
        const tel = String(l.telefone || '');
        if (!nome.includes(q) && !tel.includes(q)) return false;
      }
      if (catFilter !== 'all' && classifyCategoria(l.categoria_lead) !== catFilter) return false;
      if (statusFilter !== 'all' && l.status_lead !== statusFilter) return false;
      if (tipoFilter !== 'all' && l.tipo_caso !== tipoFilter) return false;

      if (fromMs !== null && toMs !== null && l.created_at) {
        const createdMs = new Date(l.created_at).getTime();
        if (createdMs < fromMs || createdMs > toMs) return false;
      }

      return true;
    });
  }, [leads, search, catFilter, statusFilter, tipoFilter, dateRange]);

  const showConversionColumn = statusFilter === 'all' || statusFilter === 'convertido';

  const handleExportCSV = () => {
    const cols = [
      'Nome',
      'Telefone',
      'Estado',
      'Origem',
      'Criativo',
      'Categoria',
      'Status',
      'Tipo',
      'Criado em',
      'Convertido em',
      'Valor pago',
    ];
    const rows = filtered.map((l) => [
      l.nome_lead ?? '',
      String(l.telefone ?? ''),
      l.estado ?? '',
      l.campanha ?? '',
      l.codigo_criativo ?? '',
      l.categoria_lead ?? '',
      l.status_lead ?? '',
      l.tipo_caso ?? '',
      fmtDateTime(l.created_at),
      fmtDateTime(l.data_conversao),
      String(l.valor_pago ?? 0),
    ]);
    const csv = [cols, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-rfn-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`CSV gerado — ${filtered.length} linhas`);
  };

  return (
    <section className="rounded-xl bg-app-card shadow-sm border border-line">
      {/* Filtros */}
      <div className="p-4 border-b border-line flex flex-col gap-3 md:flex-row md:items-center md:flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <Input
            placeholder="Buscar por nome ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-app-bg border-line"
          />
        </div>

        <Select value={catFilter} onValueChange={(v) => setCatFilter(v as CategoryFilter)}>
          <SelectTrigger className="w-[180px] h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            <SelectItem value="sem-classificacao">Sem Classificação</SelectItem>
            <SelectItem value="qualificado">Qualificado</SelectItem>
            <SelectItem value="desqualificado">Desqualificado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-[160px] h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="novo">Novo</SelectItem>
            <SelectItem value="conversando">Conversando</SelectItem>
            <SelectItem value="convertido">Convertido</SelectItem>
          </SelectContent>
        </Select>

        <Select value={tipoFilter} onValueChange={(v) => setTipoFilter(v as TipoFilter)}>
          <SelectTrigger className="w-[140px] h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="lote">Lote</SelectItem>
            <SelectItem value="cota">Cota</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="default"
              className={cn(
                'h-10 justify-start gap-2 font-normal',
                dateRange?.from && 'text-ink',
                !dateRange?.from && 'text-ink-muted',
              )}
            >
              <CalendarIcon className="h-4 w-4" />
              {dateRange?.from
                ? dateRange.to
                  ? `${format(dateRange.from, 'dd/MM', { locale: ptBR })} — ${format(dateRange.to, 'dd/MM', { locale: ptBR })}`
                  : format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })
                : 'Período'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-1.5 text-ink-muted hover:text-ink"
          >
            <X className="h-4 w-4" />
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Cabeçalho da tabela com contador + export */}
      <div className="flex flex-col gap-2 px-4 py-3 border-b border-line-subtle md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-ink-secondary">
          Exibindo <span className="font-semibold text-ink">{filtered.length}</span> de{' '}
          <span className="font-semibold text-ink">{total}</span> leads
          {isLoading && <Loader2 className="ml-2 inline h-3.5 w-3.5 animate-spin text-ink-muted" />}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="gap-2"
          disabled={filtered.length === 0}
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-sm">
          <thead>
            <tr className="border-b border-line bg-app-bg/40">
              <Th>Lead</Th>
              <Th>Origem</Th>
              <Th>Categoria</Th>
              <Th>Status</Th>
              <Th>Tipo</Th>
              <Th>Criado em</Th>
              {showConversionColumn && <Th>Conv. em</Th>}
              <Th align="right">Valor</Th>
            </tr>
          </thead>
          <tbody>
            {isLoading && leads.length === 0 ? (
              <tr>
                <td colSpan={showConversionColumn ? 8 : 7} className="py-12 text-center text-ink-muted">
                  <Loader2 className="inline h-5 w-5 animate-spin" /> Carregando leads...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={showConversionColumn ? 8 : 7} className="py-12 text-center text-ink-muted">
                  Nenhum lead encontrado com os filtros atuais.
                </td>
              </tr>
            ) : (
              filtered.map((l) =>
                renderRow(
                  l,
                  showConversionColumn,
                  (id, status) => updateStatus.mutate({ id, status }),
                  () => setSelectedLeadId(l.id),
                ),
              )
            )}
          </tbody>
        </table>
      </div>

      <LeadDetailsModal lead={selectedLead} onClose={() => setSelectedLeadId(null)} />
    </section>
  );
}

function renderRow(
  l: LeadRoger,
  showConversionColumn: boolean,
  onStatusChange: (id: string, next: StatusLead) => void,
  onOpen: () => void,
) {
  const { platform } = parseCampanha(l.campanha);
  const group = classifyCategoria(l.categoria_lead);
  const currentStatus: StatusLead = isValidStatus(l.status_lead) ? l.status_lead : 'novo';

  return (
    <tr
      key={l.id}
      className="border-b border-line-subtle hover:bg-app-bg cursor-pointer transition-colors"
      onClick={onOpen}
    >
      <td className="py-3 px-4">
        <div className="font-medium text-ink">{l.nome_lead || 'Sem nome'}</div>
        <div className="text-xs text-ink-muted">
          {formatPhoneBR(String(l.telefone))} {l.estado ? `· ${l.estado}` : ''}
        </div>
      </td>
      <td className="py-3 px-4">
        <PlatformBadge platform={platform} />
      </td>
      <td className="py-3 px-4">
        <CategoryBadge group={group} />
      </td>
      <td className="py-3 px-4">
        <StatusInlineSelect
          value={currentStatus}
          onChange={(next) => onStatusChange(l.id, next)}
        />
      </td>
      <td className="py-3 px-4">
        {l.tipo_caso ? (
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
              l.tipo_caso === 'cota'
                ? 'bg-brand-light text-brand'
                : l.tipo_caso === 'lote'
                  ? 'bg-tag-warning-bg text-tag-warning'
                  : 'bg-tag-neutral-bg text-tag-neutral',
            )}
          >
            {l.tipo_caso}
          </span>
        ) : (
          <span className="text-ink-muted text-xs">—</span>
        )}
      </td>
      <td className="py-3 px-4 text-ink-secondary">{fmtDateTime(l.created_at)}</td>
      {showConversionColumn && (
        <td className="py-3 px-4 text-ink-secondary">{fmtDateTime(l.data_conversao)}</td>
      )}
      <td className="py-3 px-4 text-right font-medium text-ink">{fmtMoney(l.valor_pago)}</td>
    </tr>
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
