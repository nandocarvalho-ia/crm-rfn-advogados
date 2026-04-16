export interface FollowUpLead {
  id: string;
  nome: string;
  telefone: string;
  last_interaction: string; // ISO — última mensagem do Rafael
  tentativas_followup: 0 | 1; // já disparados (próximo = tentativas + 1)
  proximo_followup: string; // ISO
  followup_1: string;
  followup_2: string;
}

function rel(hours: number) {
  return new Date(Date.now() + hours * 3600_000).toISOString();
}

const DEFAULT_FU1 = (nome: string) =>
  `Oi, ${nome.split(' ')[0]}! Aqui é o Rafael do escritório RFN Advogados. ` +
  `Quis dar um retorno sobre o seu caso de distrato — você conseguiu dar uma olhada ` +
  `nas informações que mandei mais cedo? Qualquer dúvida, posso esclarecer por aqui.`;

const DEFAULT_FU2 = (nome: string) =>
  `${nome.split(' ')[0]}, passei novamente para checar se você ainda está com interesse ` +
  `em seguir com o distrato. A gente já ajudou outros clientes na sua situação e pode ` +
  `te mostrar o próximo passo em 5 minutos. Topa conversar hoje?`;

export const MOCK_FOLLOWUPS: FollowUpLead[] = [
  {
    id: 'fu-1',
    nome: 'Ana Paula Costa',
    telefone: '(11) 98723-1144',
    last_interaction: rel(-2),
    tentativas_followup: 0,
    proximo_followup: rel(0.25),
    followup_1: DEFAULT_FU1('Ana Paula Costa'),
    followup_2: DEFAULT_FU2('Ana Paula Costa'),
  },
  {
    id: 'fu-2',
    nome: 'Bruno Almeida',
    telefone: '(21) 99812-4400',
    last_interaction: rel(-13),
    tentativas_followup: 1,
    proximo_followup: rel(0.6),
    followup_1: DEFAULT_FU1('Bruno Almeida'),
    followup_2: DEFAULT_FU2('Bruno Almeida'),
  },
  {
    id: 'fu-3',
    nome: 'Carla Mendes',
    telefone: '(31) 98111-2234',
    last_interaction: rel(-1.2),
    tentativas_followup: 0,
    proximo_followup: rel(0.9),
    followup_1: DEFAULT_FU1('Carla Mendes'),
    followup_2: DEFAULT_FU2('Carla Mendes'),
  },
  {
    id: 'fu-4',
    nome: 'Daniel Souza',
    telefone: '(41) 99777-8822',
    last_interaction: rel(-3),
    tentativas_followup: 0,
    proximo_followup: rel(1.5),
    followup_1: DEFAULT_FU1('Daniel Souza'),
    followup_2: DEFAULT_FU2('Daniel Souza'),
  },
  {
    id: 'fu-5',
    nome: 'Eduarda Lima',
    telefone: '(51) 99222-1100',
    last_interaction: rel(-15),
    tentativas_followup: 1,
    proximo_followup: rel(3),
    followup_1: DEFAULT_FU1('Eduarda Lima'),
    followup_2: DEFAULT_FU2('Eduarda Lima'),
  },
  {
    id: 'fu-6',
    nome: 'Gabriela Nunes',
    telefone: '(21) 99334-7755',
    last_interaction: rel(-14),
    tentativas_followup: 1,
    proximo_followup: rel(-0.3),
    followup_1: DEFAULT_FU1('Gabriela Nunes'),
    followup_2: DEFAULT_FU2('Gabriela Nunes'),
  },
  {
    id: 'fu-7',
    nome: 'Isabela Vieira',
    telefone: '(31) 98123-4567',
    last_interaction: rel(-18),
    tentativas_followup: 1,
    proximo_followup: rel(-2),
    followup_1: DEFAULT_FU1('Isabela Vieira'),
    followup_2: DEFAULT_FU2('Isabela Vieira'),
  },
  {
    id: 'fu-8',
    nome: 'Lucas Barbosa',
    telefone: '(11) 98333-6655',
    last_interaction: rel(-1),
    tentativas_followup: 0,
    proximo_followup: rel(5),
    followup_1: DEFAULT_FU1('Lucas Barbosa'),
    followup_2: DEFAULT_FU2('Lucas Barbosa'),
  },
];

// Para a seção de métricas no rodapé
export const MOCK_METRICAS = {
  totalEnviados: 184,
  taxaResposta: null as number | null,
};
