export type StatusLead = 'novo' | 'conversando' | 'convertido';
export type CampanhaMock =
  | 'meta_cota'
  | 'meta_lote'
  | 'google_cota'
  | 'google_lote'
  | 'organico'
  | null;

export interface LeadMock {
  id: string;
  nome: string;
  telefone: string;
  estado: string;
  campanha: CampanhaMock;
  codigo_criativo: string | null;
  categoria_lead: string | null; // granular — transformado em 3 grupos na UI
  status_lead: StatusLead;
  tipo_caso: 'lote' | 'cota';
  created_at: string; // ISO
  data_conversao: string | null; // ISO
  valor_pago: number;
}

const CATEGORIAS_QUALIFICADAS = ['POTENCIAL BOM', 'BOM', 'POTENCIAL EXCELENTE', 'EXCELENTE'];

function makeLead(i: number): LeadMock {
  const nomes = [
    'Ana Paula Costa', 'Bruno Almeida', 'Carla Mendes', 'Daniel Souza', 'Eduarda Lima',
    'Felipe Rocha', 'Gabriela Nunes', 'Henrique Dias', 'Isabela Vieira', 'João Pedro Farias',
    'Karen Oliveira', 'Lucas Barbosa', 'Mariana Castro', 'Nelson Borges', 'Olívia Teixeira',
    'Paulo Henrique', 'Queila Martins', 'Rafael Silva', 'Sabrina Pereira', 'Tiago Moraes',
    'Ursula Gomes', 'Vinicius Araújo', 'Wagner Lopes', 'Xavier Freitas', 'Yasmin Cardoso',
    'Zélia Ribeiro', 'Alan Figueiredo', 'Beatriz Cunha', 'César Rocha', 'Diana Marinho',
  ];
  const estados = ['SP', 'RJ', 'MG', 'PR', 'RS', 'SC', 'BA', 'DF'];
  const campanhas: CampanhaMock[] = ['meta_cota', 'meta_lote', 'google_cota', 'google_lote', 'organico'];
  const tipos: Array<LeadMock['tipo_caso']> = ['lote', 'cota'];

  const nome = nomes[i % nomes.length];
  const estado = estados[i % estados.length];
  const campanha = campanhas[i % campanhas.length];
  const tipo = tipos[i % tipos.length];

  // Distribuição: 40% novo, 40% conversando, 20% convertido
  const statusRoll = i % 5;
  const status: StatusLead = statusRoll < 2 ? 'novo' : statusRoll < 4 ? 'conversando' : 'convertido';

  // Categoria: 30% sem classificação, 50% qualificado, 20% desqualificado
  const catRoll = (i * 7) % 10;
  let categoria: string | null;
  if (catRoll < 3) categoria = null;
  else if (catRoll < 8) categoria = CATEGORIAS_QUALIFICADAS[i % CATEGORIAS_QUALIFICADAS.length];
  else categoria = 'DESQUALIFICADO';

  const createdDaysAgo = (i * 3) % 45;
  const createdAt = new Date(Date.now() - createdDaysAgo * 24 * 3600_000 - (i % 12) * 3600_000).toISOString();

  const converted = status === 'convertido';
  const convertedDaysAgo = converted ? Math.max(0, createdDaysAgo - (i % 10)) : null;
  const dataConversao = convertedDaysAgo !== null
    ? new Date(Date.now() - convertedDaysAgo * 24 * 3600_000).toISOString()
    : null;

  const phone = `(${String(11 + (i % 20)).padStart(2, '0')}) 9${String(1000 + i).padStart(4, '0')}-${String((i * 37) % 10000).padStart(4, '0')}`;

  const valor = converted ? 1800 + ((i * 317) % 5200) : 0;

  return {
    id: `lead-${1000 + i}`,
    nome,
    telefone: phone,
    estado,
    campanha,
    codigo_criativo: campanha === 'organico' || !campanha ? null : `CRT-${200 + ((i * 11) % 400)}`,
    categoria_lead: categoria,
    status_lead: status,
    tipo_caso: tipo,
    created_at: createdAt,
    data_conversao: dataConversao,
    valor_pago: valor,
  };
}

export const MOCK_LEADS: LeadMock[] = Array.from({ length: 36 }, (_, i) => makeLead(i));
