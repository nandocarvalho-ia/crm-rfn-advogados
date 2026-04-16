import { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { StatusInlineSelect } from './StatusInlineSelect';
import { MOCK_LEADS, type LeadMock, type StatusLead } from './mockLeads';

type CategoryFilter = 'all' | 'sem-classificacao' | 'qualificado' | 'desqualificado';
type StatusFilter = 'all' | StatusLead;
type TipoFilter = 'all' | 'lote' | 'cota';

const fmtDateTime = (iso: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const fmtMoney = (n: number) =>
  n === 0
    ? '—'
    : new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0,
      }).format(n);

export function LeadsTable() {
  const [leads, setLeads] = useState<LeadMock[]>(MOCK_LEADS);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<CategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>('all');

  const total = leads.length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (q && !l.nome.toLowerCase().includes(q) && !l.telefone.includes(q)) return false;
      if (catFilter !== 'all' && classifyCategoria(l.categoria_lead) !== catFilter) return false;
      if (statusFilter !== 'all' && l.status_lead !== statusFilter) return false;
      if (tipoFilter !== 'all' && l.tipo_caso !== tipoFilter) return false;
      return true;
    });
  }, [leads, search, catFilter, statusFilter, tipoFilter]);

  const showConversionColumn = statusFilter === 'all' || statusFilter === 'convertido';

  const handleStatusChange = (id: string, next: StatusLead) => {
    setLeads((arr) =>
      arr.map((l) =>
        l.id === id
          ? {
              ...l,
              status_lead: next,
              data_conversao:
                next === 'convertido'
                  ? (l.data_conversao ?? new Date().toISOString())
                  : l.status_lead === 'convertido' && next !== 'convertido'
                    ? null
                    : l.data_conversao,
            }
          : l,
      ),
    );
    toast.success('Status atualizado', {
      description: 'Em breve esta mudança persistirá no banco (Fase B).',
    });
  };

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
      l.nome,
      l.telefone,
      l.estado,
      l.campanha ?? '',
      l.codigo_criativo ?? '',
      l.categoria_lead ?? '',
      l.status_lead,
      l.tipo_caso,
      fmtDateTime(l.created_at),
      fmtDateTime(l.data_conversao),
      l.valor_pago.toString(),
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
      </div>

      {/* Cabeçalho da tabela com contador + export */}
      <div className="flex flex-col gap-2 px-4 py-3 border-b border-line-subtle md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-ink-secondary">
          Exibindo <span className="font-semibold text-ink">{filtered.length}</span> de{' '}
          <span className="font-semibold text-ink">{total}</span> leads
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="gap-2"
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
            {filtered.map((l) => {
              const { platform } = parseCampanha(l.campanha);
              const group = classifyCategoria(l.categoria_lead);
              return (
                <tr
                  key={l.id}
                  className="border-b border-line-subtle hover:bg-app-bg cursor-pointer transition-colors"
                  onClick={() => console.log('[RFN] open lead', l.id)}
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-ink">{l.nome}</div>
                    <div className="text-xs text-ink-muted">{l.telefone} · {l.estado}</div>
                  </td>
                  <td className="py-3 px-4">
                    <PlatformBadge platform={platform} />
                  </td>
                  <td className="py-3 px-4">
                    <CategoryBadge group={group} />
                  </td>
                  <td className="py-3 px-4">
                    <StatusInlineSelect
                      value={l.status_lead}
                      onChange={(next) => handleStatusChange(l.id, next)}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        l.tipo_caso === 'cota'
                          ? 'bg-brand-light text-brand'
                          : 'bg-tag-warning-bg text-tag-warning',
                      )}
                    >
                      {l.tipo_caso === 'cota' ? 'Cota' : 'Lote'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-ink-secondary">{fmtDateTime(l.created_at)}</td>
                  {showConversionColumn && (
                    <td className="py-3 px-4 text-ink-secondary">
                      {fmtDateTime(l.data_conversao)}
                    </td>
                  )}
                  <td className="py-3 px-4 text-right font-medium text-ink">
                    {fmtMoney(l.valor_pago)}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={showConversionColumn ? 8 : 7}
                  className="py-12 text-center text-ink-muted"
                >
                  Nenhum lead encontrado com os filtros atuais.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
