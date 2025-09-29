export interface FollowUpSuggestion {
  ordem: number;
  tempo_espera: string;
  texto: string;
  horario_comercial: boolean;
  data_envio?: string;
  status?: 'pendente' | 'enviado' | 'cancelado';
}

export interface FollowUpAnalysis {
  situacao: 'parou_responder' | 'dar_retorno' | 'documentos_enviados' | 'desqualificado' | 'atendimento_humano' | 'ativo';
  followups: FollowUpSuggestion[];
  contexto: string;
}

export interface FollowUpRecord {
  id: string;
  telefone: string;
  nome_lead: string;
  tipo_situacao: string;
  status: string;
  ultima_resposta_lead: string;
  contexto_conversa: string;
  sugestoes_ia: FollowUpAnalysis;
  configuracao_personalizada?: any;
  created_at: string;
  updated_at: string;
}