export type PeriodKey = '7d' | '30d' | '90d' | 'today' | 'custom';

export interface KPISet {
  totalLeads: number;
  qualificationRate: number;
  conversionRate: number;
  recoveredPotential: number;
  deltas: {
    total: number;
    qualification: number;
    conversion: number;
    potential: number;
  };
}

export interface OrigemRow {
  campanha: 'meta_cota' | 'meta_lote' | 'google_cota' | 'google_lote' | 'organico';
  label: string;
  qty: number;
  pct: number;
}

export interface CriativoRow {
  codigo: string;
  campanha: 'meta_cota' | 'meta_lote' | 'google_cota' | 'google_lote';
  leads: number;
  qualificados: number;
  convertidos: number;
  txQualif: number;
  txConv: number;
  potencial: number;
}

export interface LoteCota {
  tipo: 'Cota' | 'Lote';
  total: number;
  conversao: number;
  ticketMedio: number;
}

export interface FunilEtapa {
  etapa: string;
  count: number;
}

export interface EvolucaoPonto {
  date: string; // YYYY-MM-DD
  total: number;
  convertidos: number;
}
