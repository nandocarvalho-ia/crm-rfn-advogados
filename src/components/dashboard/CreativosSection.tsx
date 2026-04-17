import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { parseCampanha, PlatformBadge } from '@/components/common';
import { cn } from '@/lib/utils';
import type { CriativoRow } from './types';

type SortKey = 'leads' | 'qualificados' | 'convertidos' | 'txQualif' | 'txConv' | 'potencial';
type SortDir = 'asc' | 'desc';

const fmtMoney = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);

export function CreativosSection({ data }: { data: CriativoRow[] }) {
  const [sortBy, setSortBy] = useState<SortKey>('leads');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const sorted = useMemo(() => {
    const copy = [...data];
    copy.sort((a, b) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return copy;
  }, [data, sortBy, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir('desc');
    }
  };

  return (
    <section className="rounded-xl bg-app-card p-6 shadow-sm border border-line">
      <h2 className="text-lg font-semibold text-ink">Performance por criativo</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Agregado por código de criativo. Clique no cabeçalho para ordenar.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <Th>Plataforma</Th>
              <Th>Código</Th>
              <Th>Tipo</Th>
              <Th onClick={() => toggleSort('leads')} active={sortBy === 'leads'} dir={sortDir} align="right">
                Leads
              </Th>
              <Th onClick={() => toggleSort('qualificados')} active={sortBy === 'qualificados'} dir={sortDir} align="right">
                Qualificados
              </Th>
              <Th onClick={() => toggleSort('convertidos')} active={sortBy === 'convertidos'} dir={sortDir} align="right">
                Convertidos
              </Th>
              <Th onClick={() => toggleSort('txQualif')} active={sortBy === 'txQualif'} dir={sortDir} align="right">
                Tx. qualif.
              </Th>
              <Th onClick={() => toggleSort('txConv')} active={sortBy === 'txConv'} dir={sortDir} align="right">
                Tx. conv.
              </Th>
              <Th onClick={() => toggleSort('potencial')} active={sortBy === 'potencial'} dir={sortDir} align="right">
                Potencial
              </Th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={9} className="py-10 text-center text-ink-muted text-sm">
                  Nenhum lead com código de criativo atribuído ainda.
                </td>
              </tr>
            )}
            {sorted.map((row) => {
              const { platform, type } = parseCampanha(row.campanha);
              return (
                <tr
                  key={row.codigo}
                  className="border-b border-line-subtle hover:bg-app-bg cursor-pointer transition-colors"
                  onClick={() => console.log('[RFN] drill-down criativo', row.codigo)}
                >
                  <td className="py-3 px-3">
                    <PlatformBadge platform={platform} />
                  </td>
                  <td className="py-3 px-3 font-mono text-ink">{row.codigo}</td>
                  <td className="py-3 px-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        type === 'cota'
                          ? 'bg-brand-light text-brand'
                          : 'bg-tag-warning-bg text-tag-warning',
                      )}
                    >
                      {type === 'cota' ? 'Cota' : 'Lote'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-ink">{row.leads}</td>
                  <td className="py-3 px-3 text-right text-ink">{row.qualificados}</td>
                  <td className="py-3 px-3 text-right text-ink">{row.convertidos}</td>
                  <td className="py-3 px-3 text-right text-ink-secondary">{row.txQualif.toFixed(1)}%</td>
                  <td className="py-3 px-3 text-right text-ink-secondary">{row.txConv.toFixed(1)}%</td>
                  <td className="py-3 px-3 text-right text-ink font-medium">{fmtMoney(row.potencial)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Th({
  children,
  onClick,
  active,
  dir,
  align,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  dir?: SortDir;
  align?: 'right';
}) {
  const sortable = !!onClick;
  return (
    <th
      className={cn(
        'py-2 px-3 text-xs font-medium uppercase tracking-wider text-ink-muted',
        align === 'right' && 'text-right',
        sortable && 'cursor-pointer select-none hover:text-ink',
      )}
      onClick={onClick}
    >
      <span className={cn('inline-flex items-center gap-1', align === 'right' && 'justify-end')}>
        {children}
        {sortable &&
          (active ? (
            dir === 'asc' ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )
          ) : (
            <ArrowUpDown className="h-3 w-3 opacity-40" />
          ))}
      </span>
    </th>
  );
}
