import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { resolvePeriod, type PeriodRange } from '@/lib/periodo';
import type { PeriodKey } from '@/components/dashboard/types';

export interface DashboardLead {
  id: string;
  nome_lead: string | null;
  telefone: number;
  campanha: string | null;
  codigo_criativo: string | null;
  categoria_lead: string | null;
  status_lead: string | null;
  tipo_caso: string | null;
  etapa_atual: string | null;
  valor_pago: number | string | null;
  created_at: string;
  data_conversao: string | null;
}

const FIELDS =
  'id, nome_lead, telefone, campanha, codigo_criativo, categoria_lead, status_lead, tipo_caso, etapa_atual, valor_pago, created_at, data_conversao';

async function fetchCreatedBetween(start: Date, end: Date): Promise<DashboardLead[]> {
  const all: DashboardLead[] = [];
  let from = 0;
  const size = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('leads_roger')
      .select(FIELDS)
      .is('deleted_at', null)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
      .order('created_at', { ascending: true })
      .range(from, from + size - 1);
    if (error) throw error;
    all.push(...((data as unknown) as DashboardLead[]));
    if ((data?.length ?? 0) < size) break;
    from += size;
  }
  return all;
}

async function fetchConvertedBetween(start: Date, end: Date): Promise<DashboardLead[]> {
  const all: DashboardLead[] = [];
  let from = 0;
  const size = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('leads_roger')
      .select(FIELDS)
      .is('deleted_at', null)
      .eq('status_lead', 'convertido')
      .gte('data_conversao', start.toISOString())
      .lte('data_conversao', end.toISOString())
      .order('data_conversao', { ascending: true })
      .range(from, from + size - 1);
    if (error) throw error;
    all.push(...((data as unknown) as DashboardLead[]));
    if ((data?.length ?? 0) < size) break;
    from += size;
  }
  return all;
}

export interface DashboardData {
  period: PeriodKey;
  range: PeriodRange;
  createdCurrent: DashboardLead[];
  createdPrev: DashboardLead[];
  convertedCurrent: DashboardLead[];
  convertedPrev: DashboardLead[];
}

export function useDashboardData(period: PeriodKey) {
  return useQuery<DashboardData>({
    queryKey: ['dashboard', period],
    queryFn: async () => {
      const range = resolvePeriod(period);
      const [createdCurrent, createdPrev, convertedCurrent, convertedPrev] = await Promise.all([
        fetchCreatedBetween(range.start, range.end),
        fetchCreatedBetween(range.prevStart, range.prevEnd),
        fetchConvertedBetween(range.start, range.end),
        fetchConvertedBetween(range.prevStart, range.prevEnd),
      ]);
      return { period, range, createdCurrent, createdPrev, convertedCurrent, convertedPrev };
    },
    staleTime: 60_000,
  });
}
