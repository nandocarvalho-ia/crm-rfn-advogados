import { dayKey, eachDay } from '@/lib/periodo';
import { classifyCategoria } from '@/components/common';
import type { DashboardLead } from '@/hooks/useDashboardData';
import type {
  CriativoRow,
  EvolucaoPonto,
  FunilEtapa,
  KPISet,
  LoteCota,
  OrigemRow,
} from '@/components/dashboard/types';

const toNumber = (v: unknown): number => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if (typeof v === 'string') {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

const isQualificado = (l: DashboardLead) =>
  classifyCategoria(l.categoria_lead) === 'qualificado';

const pctDelta = (cur: number, prev: number): number => {
  if (prev === 0) return cur === 0 ? 0 : 100;
  return ((cur - prev) / prev) * 100;
};

// ----- KPIs -----
export function computeKPIs(
  createdCur: DashboardLead[],
  createdPrev: DashboardLead[],
  convertedCur: DashboardLead[],
  convertedPrev: DashboardLead[],
): KPISet {
  const qualifiedCur = createdCur.filter(isQualificado);
  const qualifiedPrev = createdPrev.filter(isQualificado);

  const qualifRate = createdCur.length > 0 ? (qualifiedCur.length / createdCur.length) * 100 : 0;
  const qualifRatePrev =
    createdPrev.length > 0 ? (qualifiedPrev.length / createdPrev.length) * 100 : 0;

  const convRate = qualifiedCur.length > 0 ? (convertedCur.length / qualifiedCur.length) * 100 : 0;
  const convRatePrev =
    qualifiedPrev.length > 0 ? (convertedPrev.length / qualifiedPrev.length) * 100 : 0;

  // Potencial de recuperação = SUM(valor_pago) APENAS de leads com
  // status_lead='convertido' criados no período. proposta_enviada e
  // qualificados sem conversão NÃO entram (decisão de negócio: só
  // contabilizar quando o contrato foi efetivamente fechado).
  const potencialCur = createdCur
    .filter((l) => l.status_lead === 'convertido')
    .reduce((s, l) => s + toNumber(l.valor_pago), 0);
  const potencialPrev = createdPrev
    .filter((l) => l.status_lead === 'convertido')
    .reduce((s, l) => s + toNumber(l.valor_pago), 0);

  return {
    totalLeads: createdCur.length,
    qualificationRate: qualifRate,
    conversionRate: convRate,
    recoveredPotential: potencialCur,
    deltas: {
      total: pctDelta(createdCur.length, createdPrev.length),
      qualification: pctDelta(qualifRate, qualifRatePrev),
      conversion: pctDelta(convRate, convRatePrev),
      potential: pctDelta(potencialCur, potencialPrev),
    },
  };
}

// ----- Origem -----
const ORIGEM_LABELS: Record<string, string> = {
  meta_cota: 'Meta · Cota',
  meta_lote: 'Meta · Lote',
  google_cota: 'Google · Cota',
  google_lote: 'Google · Lote',
  organico: 'Orgânico',
};

export function computeOrigem(leads: DashboardLead[]): OrigemRow[] {
  const count = new Map<string, number>();
  for (const l of leads) {
    if (!l.campanha) continue;
    count.set(l.campanha, (count.get(l.campanha) ?? 0) + 1);
  }
  const total = [...count.values()].reduce((a, b) => a + b, 0);
  const rows: OrigemRow[] = [];
  for (const [campanha, qty] of count) {
    rows.push({
      campanha: campanha as OrigemRow['campanha'],
      label: ORIGEM_LABELS[campanha] ?? campanha,
      qty,
      pct: total > 0 ? (qty / total) * 100 : 0,
    });
  }
  return rows.sort((a, b) => b.qty - a.qty);
}

// ----- Criativos -----
export function computeCriativos(leads: DashboardLead[], converted: DashboardLead[]): CriativoRow[] {
  type Agg = {
    codigo: string;
    campanha: CriativoRow['campanha'];
    leads: number;
    qualificados: number;
    convertidos: number;
    potencial: number;
  };
  const byCodigo = new Map<string, Agg>();
  const convertedById = new Set(converted.map((l) => l.id));

  for (const l of leads) {
    const codigo = l.codigo_criativo;
    if (!codigo) continue;
    const camp = (l.campanha as CriativoRow['campanha']) ?? 'meta_cota';
    if (!byCodigo.has(codigo)) {
      byCodigo.set(codigo, {
        codigo,
        campanha: camp,
        leads: 0,
        qualificados: 0,
        convertidos: 0,
        potencial: 0,
      });
    }
    const a = byCodigo.get(codigo)!;
    a.leads++;
    if (isQualificado(l)) a.qualificados++;
    if (convertedById.has(l.id) || l.status_lead === 'convertido') {
      a.convertidos++;
      a.potencial += toNumber(l.valor_pago);
    }
  }

  return [...byCodigo.values()]
    .map((a) => ({
      codigo: a.codigo,
      campanha: a.campanha,
      leads: a.leads,
      qualificados: a.qualificados,
      convertidos: a.convertidos,
      txQualif: a.leads > 0 ? (a.qualificados / a.leads) * 100 : 0,
      txConv: a.qualificados > 0 ? (a.convertidos / a.qualificados) * 100 : 0,
      potencial: a.potencial,
    }))
    .sort((a, b) => b.leads - a.leads);
}

// ----- Lote vs Cota -----
export function computeLoteCota(leads: DashboardLead[], converted: DashboardLead[]): LoteCota[] {
  const convertedById = new Set(converted.map((l) => l.id));
  const out: LoteCota[] = [];
  for (const tipo of ['Cota', 'Lote'] as const) {
    const key = tipo.toLowerCase();
    const subset = leads.filter((l) => l.tipo_caso === key);
    const convertidos = subset.filter((l) => convertedById.has(l.id) || l.status_lead === 'convertido');
    const ticketMedio =
      convertidos.length > 0
        ? convertidos.reduce((s, l) => s + toNumber(l.valor_pago), 0) / convertidos.length
        : 0;
    out.push({
      tipo,
      total: subset.length,
      conversao: subset.length > 0 ? (convertidos.length / subset.length) * 100 : 0,
      ticketMedio,
    });
  }
  return out;
}

// ----- Funil -----
export function computeFunil(leads: DashboardLead[], converted: DashboardLead[]): FunilEtapa[] {
  const qualificados = leads.filter(isQualificado);
  // "Em proposta" = qualificados cujo status_lead='proposta_enviada' OU
  // etapa_atual contém 'proposta' (cobre o sinal antigo).
  const emProposta = qualificados.filter((l) => {
    if (l.status_lead === 'proposta_enviada') return true;
    const e = (l.etapa_atual ?? '').toLowerCase();
    return e.includes('proposta');
  });
  const convertedById = new Set(converted.map((l) => l.id));
  const convertidos = leads.filter(
    (l) => convertedById.has(l.id) || l.status_lead === 'convertido',
  );

  return [
    { etapa: 'Total de leads', count: leads.length },
    { etapa: 'Qualificados', count: qualificados.length },
    { etapa: 'Em proposta', count: emProposta.length },
    { etapa: 'Convertidos', count: convertidos.length },
  ];
}

// ----- Evolução temporal -----
export function computeEvolucao(
  leads: DashboardLead[],
  converted: DashboardLead[],
  start: Date,
  end: Date,
): EvolucaoPonto[] {
  const days = eachDay(start, end);
  const totalByDay = new Map<string, number>();
  const convByDay = new Map<string, number>();

  for (const l of leads) {
    const d = new Date(l.created_at);
    const k = dayKey(d);
    totalByDay.set(k, (totalByDay.get(k) ?? 0) + 1);
  }
  for (const l of converted) {
    if (!l.data_conversao) continue;
    const k = dayKey(new Date(l.data_conversao));
    convByDay.set(k, (convByDay.get(k) ?? 0) + 1);
  }

  return days.map((d) => {
    const k = dayKey(d);
    return {
      date: k,
      total: totalByDay.get(k) ?? 0,
      convertidos: convByDay.get(k) ?? 0,
    };
  });
}
