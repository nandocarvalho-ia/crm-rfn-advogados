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

export const MOCK_KPIS: KPISet = {
  totalLeads: 1247,
  qualificationRate: 34.2,
  conversionRate: 12.8,
  recoveredPotential: 487_300,
  deltas: { total: 8.4, qualification: -2.1, conversion: 3.6, potential: 12.7 },
};

export interface OrigemRow {
  campanha: 'meta_cota' | 'meta_lote' | 'google_cota' | 'google_lote' | 'organico';
  label: string;
  qty: number;
  pct: number;
}

export const MOCK_ORIGEM: OrigemRow[] = [
  { campanha: 'meta_cota', label: 'Meta · Cota', qty: 412, pct: 33.0 },
  { campanha: 'meta_lote', label: 'Meta · Lote', qty: 298, pct: 23.9 },
  { campanha: 'google_cota', label: 'Google · Cota', qty: 231, pct: 18.5 },
  { campanha: 'google_lote', label: 'Google · Lote', qty: 187, pct: 15.0 },
  { campanha: 'organico', label: 'Orgânico', qty: 119, pct: 9.5 },
];

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

export const MOCK_CRIATIVOS: CriativoRow[] = [
  { codigo: 'CRT-0342', campanha: 'meta_cota', leads: 187, qualificados: 71, convertidos: 23, txQualif: 38.0, txConv: 32.4, potencial: 89_200 },
  { codigo: 'CRT-0289', campanha: 'google_cota', leads: 142, qualificados: 48, convertidos: 18, txQualif: 33.8, txConv: 37.5, potencial: 72_400 },
  { codigo: 'CRT-0411', campanha: 'meta_lote', leads: 128, qualificados: 39, convertidos: 12, txQualif: 30.5, txConv: 30.8, potencial: 58_600 },
  { codigo: 'CRT-0356', campanha: 'meta_cota', leads: 118, qualificados: 41, convertidos: 14, txQualif: 34.7, txConv: 34.1, potencial: 61_800 },
  { codigo: 'CRT-0398', campanha: 'google_lote', leads: 96, qualificados: 24, convertidos: 7, txQualif: 25.0, txConv: 29.2, potencial: 33_500 },
  { codigo: 'CRT-0271', campanha: 'meta_lote', leads: 88, qualificados: 27, convertidos: 9, txQualif: 30.7, txConv: 33.3, potencial: 41_200 },
  { codigo: 'CRT-0304', campanha: 'google_cota', leads: 72, qualificados: 19, convertidos: 6, txQualif: 26.4, txConv: 31.6, potencial: 28_300 },
  { codigo: 'CRT-0433', campanha: 'meta_cota', leads: 64, qualificados: 18, convertidos: 5, txQualif: 28.1, txConv: 27.8, potencial: 21_600 },
];

export interface LoteCota {
  tipo: 'Cota' | 'Lote';
  total: number;
  conversao: number;
  ticketMedio: number;
}

export const MOCK_LOTE_COTA: LoteCota[] = [
  { tipo: 'Cota', total: 643, conversao: 14.2, ticketMedio: 3_850 },
  { tipo: 'Lote', total: 485, conversao: 11.8, ticketMedio: 5_200 },
];

export interface FunilEtapa {
  etapa: string;
  count: number;
}

export const MOCK_FUNIL: FunilEtapa[] = [
  { etapa: 'Total de leads', count: 1247 },
  { etapa: 'Qualificados', count: 426 },
  { etapa: 'Em proposta', count: 213 },
  { etapa: 'Convertidos', count: 160 },
];

export interface FollowUpAgendado {
  id: string;
  nome: string;
  telefone: string;
  followUp: 1 | 2;
  agendadoEm: string; // ISO
}

export const MOCK_PROXIMOS_FOLLOWUPS: FollowUpAgendado[] = [
  { id: '1', nome: 'Ana Paula Costa', telefone: '(11) 98723-1144', followUp: 1, agendadoEm: new Date(Date.now() + 15 * 60_000).toISOString() },
  { id: '2', nome: 'Bruno Almeida', telefone: '(21) 99812-4400', followUp: 2, agendadoEm: new Date(Date.now() + 35 * 60_000).toISOString() },
  { id: '3', nome: 'Carla Mendes', telefone: '(31) 98111-2234', followUp: 1, agendadoEm: new Date(Date.now() + 55 * 60_000).toISOString() },
  { id: '4', nome: 'Daniel Souza', telefone: '(41) 99777-8822', followUp: 1, agendadoEm: new Date(Date.now() + 90 * 60_000).toISOString() },
  { id: '5', nome: 'Eduarda Lima', telefone: '(51) 99222-1100', followUp: 2, agendadoEm: new Date(Date.now() + 3 * 3600_000).toISOString() },
  { id: '6', nome: 'Felipe Rocha', telefone: '(11) 99456-3311', followUp: 1, agendadoEm: new Date(Date.now() + 5 * 3600_000).toISOString() },
  { id: '7', nome: 'Gabriela Nunes', telefone: '(21) 99334-7755', followUp: 2, agendadoEm: new Date(Date.now() - 20 * 60_000).toISOString() },
  { id: '8', nome: 'Henrique Dias', telefone: '(11) 98877-6644', followUp: 1, agendadoEm: new Date(Date.now() + 6 * 3600_000).toISOString() },
  { id: '9', nome: 'Isabela Vieira', telefone: '(31) 98123-4567', followUp: 1, agendadoEm: new Date(Date.now() - 2 * 3600_000).toISOString() },
  { id: '10', nome: 'João Pedro Farias', telefone: '(41) 98654-3210', followUp: 2, agendadoEm: new Date(Date.now() + 8 * 3600_000).toISOString() },
];

export interface EvolucaoPonto {
  date: string; // YYYY-MM-DD
  total: number;
  convertidos: number;
}

export const MOCK_EVOLUCAO: EvolucaoPonto[] = (() => {
  const today = new Date();
  const out: EvolucaoPonto[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const total = 25 + Math.round(20 * Math.sin(i / 3)) + Math.round(Math.random() * 10);
    const convertidos = Math.max(1, Math.round(total * (0.08 + Math.random() * 0.08)));
    out.push({ date: iso, total: Math.max(10, total), convertidos });
  }
  return out;
})();
