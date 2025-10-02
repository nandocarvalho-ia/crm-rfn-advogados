export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      "[FLUXO] • IA": {
        Row: {
          ATENDENTE: string | null
          CLASSIFICA: string | null
          DATA: string | null
          ETAPA: string | null
          FOLLOW: string | null
          INSTÂNCIA: string | null
          NOME: string | null
          TELEFONE: string
          TEMPERATURA: string | null
          "ÚLTIMA MENSAGEM": string | null
        }
        Insert: {
          ATENDENTE?: string | null
          CLASSIFICA?: string | null
          DATA?: string | null
          ETAPA?: string | null
          FOLLOW?: string | null
          INSTÂNCIA?: string | null
          NOME?: string | null
          TELEFONE: string
          TEMPERATURA?: string | null
          "ÚLTIMA MENSAGEM"?: string | null
        }
        Update: {
          ATENDENTE?: string | null
          CLASSIFICA?: string | null
          DATA?: string | null
          ETAPA?: string | null
          FOLLOW?: string | null
          INSTÂNCIA?: string | null
          NOME?: string | null
          TELEFONE?: string
          TEMPERATURA?: string | null
          "ÚLTIMA MENSAGEM"?: string | null
        }
        Relationships: []
      }
      anuncios_meta: {
        Row: {
          ad_id: string
          ad_name: string
          adset_id: string
          call_to_action: string | null
          created_at: string | null
          creative_id: string | null
          description: string | null
          destination_url: string | null
          headline: string | null
          id: string
          primary_text: string | null
          status: string | null
          updated_at: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          ad_id: string
          ad_name: string
          adset_id: string
          call_to_action?: string | null
          created_at?: string | null
          creative_id?: string | null
          description?: string | null
          destination_url?: string | null
          headline?: string | null
          id?: string
          primary_text?: string | null
          status?: string | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          ad_id?: string
          ad_name?: string
          adset_id?: string
          call_to_action?: string | null
          created_at?: string | null
          creative_id?: string | null
          description?: string | null
          destination_url?: string | null
          headline?: string | null
          id?: string
          primary_text?: string | null
          status?: string | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anuncios_meta_adset_id_fkey"
            columns: ["adset_id"]
            isOneToOne: false
            referencedRelation: "conjuntos_anuncios"
            referencedColumns: ["adset_id"]
          },
        ]
      }
      campanhas_meta: {
        Row: {
          budget_diario: number | null
          budget_total: number | null
          campaign_id: string
          campaign_name: string
          created_at: string | null
          id: string
          objetivo: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          budget_diario?: number | null
          budget_total?: number | null
          campaign_id: string
          campaign_name: string
          created_at?: string | null
          id?: string
          objetivo?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          budget_diario?: number | null
          budget_total?: number | null
          campaign_id?: string
          campaign_name?: string
          created_at?: string | null
          id?: string
          objetivo?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      classificacoes: {
        Row: {
          acao_recomendada: string | null
          cor: string | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          score_maximo: number
          score_minimo: number
        }
        Insert: {
          acao_recomendada?: string | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          score_maximo: number
          score_minimo: number
        }
        Update: {
          acao_recomendada?: string | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          score_maximo?: number
          score_minimo?: number
        }
        Relationships: []
      }
      conjuntos_anuncios: {
        Row: {
          adset_id: string
          adset_name: string
          bid_strategy: string | null
          budget_diario: number | null
          campaign_id: string
          created_at: string | null
          id: string
          status: string | null
          targeting_age_max: number | null
          targeting_age_min: number | null
          targeting_gender: string | null
          targeting_interests: string | null
          targeting_locations: string | null
          updated_at: string | null
        }
        Insert: {
          adset_id: string
          adset_name: string
          bid_strategy?: string | null
          budget_diario?: number | null
          campaign_id: string
          created_at?: string | null
          id?: string
          status?: string | null
          targeting_age_max?: number | null
          targeting_age_min?: number | null
          targeting_gender?: string | null
          targeting_interests?: string | null
          targeting_locations?: string | null
          updated_at?: string | null
        }
        Update: {
          adset_id?: string
          adset_name?: string
          bid_strategy?: string | null
          budget_diario?: number | null
          campaign_id?: string
          created_at?: string | null
          id?: string
          status?: string | null
          targeting_age_max?: number | null
          targeting_age_min?: number | null
          targeting_gender?: string | null
          targeting_interests?: string | null
          targeting_locations?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conjuntos_anuncios_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campanhas_meta"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "conjuntos_anuncios_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "v_performance_campanhas"
            referencedColumns: ["campaign_id"]
          },
        ]
      }
      contatos_agente: {
        Row: {
          agente: string | null
          created_at: string | null
          email: string | null
          id: number
          interesse_duvida: string | null
          role: string | null
          status: string | null
          user_name: string | null
          user_number: string | null
          user_profile: string | null
        }
        Insert: {
          agente?: string | null
          created_at?: string | null
          email?: string | null
          id?: number
          interesse_duvida?: string | null
          role?: string | null
          status?: string | null
          user_name?: string | null
          user_number?: string | null
          user_profile?: string | null
        }
        Update: {
          agente?: string | null
          created_at?: string | null
          email?: string | null
          id?: number
          interesse_duvida?: string | null
          role?: string | null
          status?: string | null
          user_name?: string | null
          user_number?: string | null
          user_profile?: string | null
        }
        Relationships: []
      }
      criterios_pontuacao: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          criterio: string
          id: string
          peso: number | null
          pontos: number
          subcategoria: string | null
          updated_at: string | null
          valor_resposta: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          criterio: string
          id?: string
          peso?: number | null
          pontos: number
          subcategoria?: string | null
          updated_at?: string | null
          valor_resposta: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          criterio?: string
          id?: string
          peso?: number | null
          pontos?: number
          subcategoria?: string | null
          updated_at?: string | null
          valor_resposta?: string
        }
        Relationships: []
      }
      estagios_funil: {
        Row: {
          acao_automatica: string | null
          cor: string
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          ordem: number
        }
        Insert: {
          acao_automatica?: string | null
          cor: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          ordem: number
        }
        Update: {
          acao_automatica?: string | null
          cor?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number
        }
        Relationships: []
      }
      follow_up: {
        Row: {
          created_at: string | null
          id: number
          last_message: string | null
          user_number: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          last_message?: string | null
          user_number?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          last_message?: string | null
          user_number?: string | null
        }
        Relationships: []
      }
      follow_ups_inteligentes: {
        Row: {
          configuracao_personalizada: Json | null
          contexto_conversa: string | null
          created_at: string | null
          data_envio_real: string | null
          horario_comercial_fim: string | null
          horario_comercial_inicio: string | null
          id: string
          log_envio: Json | null
          nome_lead: string | null
          proximo_followup_1: Json | null
          proximo_followup_2: Json | null
          proximo_followup_3: Json | null
          status: string | null
          status_envio: string | null
          sugestoes_ia: Json | null
          telefone: string
          tentativas_envio: number | null
          tipo_situacao: string
          ultima_resposta_lead: string | null
          updated_at: string | null
          webhook_n8n_url: string | null
        }
        Insert: {
          configuracao_personalizada?: Json | null
          contexto_conversa?: string | null
          created_at?: string | null
          data_envio_real?: string | null
          horario_comercial_fim?: string | null
          horario_comercial_inicio?: string | null
          id?: string
          log_envio?: Json | null
          nome_lead?: string | null
          proximo_followup_1?: Json | null
          proximo_followup_2?: Json | null
          proximo_followup_3?: Json | null
          status?: string | null
          status_envio?: string | null
          sugestoes_ia?: Json | null
          telefone: string
          tentativas_envio?: number | null
          tipo_situacao: string
          ultima_resposta_lead?: string | null
          updated_at?: string | null
          webhook_n8n_url?: string | null
        }
        Update: {
          configuracao_personalizada?: Json | null
          contexto_conversa?: string | null
          created_at?: string | null
          data_envio_real?: string | null
          horario_comercial_fim?: string | null
          horario_comercial_inicio?: string | null
          id?: string
          log_envio?: Json | null
          nome_lead?: string | null
          proximo_followup_1?: Json | null
          proximo_followup_2?: Json | null
          proximo_followup_3?: Json | null
          status?: string | null
          status_envio?: string | null
          sugestoes_ia?: Json | null
          telefone?: string
          tentativas_envio?: number | null
          tipo_situacao?: string
          ultima_resposta_lead?: string | null
          updated_at?: string | null
          webhook_n8n_url?: string | null
        }
        Relationships: []
      }
      historico_scoring: {
        Row: {
          created_at: string | null
          criterio: string
          id: string
          lead_id: string | null
          peso_aplicado: number | null
          pontos_obtidos: number | null
          resposta: string | null
          score_parcial: number | null
        }
        Insert: {
          created_at?: string | null
          criterio: string
          id?: string
          lead_id?: string | null
          peso_aplicado?: number | null
          pontos_obtidos?: number | null
          resposta?: string | null
          score_parcial?: number | null
        }
        Update: {
          created_at?: string | null
          criterio?: string
          id?: string
          lead_id?: string | null
          peso_aplicado?: number | null
          pontos_obtidos?: number | null
          resposta?: string | null
          score_parcial?: number | null
        }
        Relationships: []
      }
      ia_bloqueada: {
        Row: {
          chatID: string
          ia_bloqueada: string
          instancia: string
          nome: string | null
          telefone: string
          update_at: string | null
        }
        Insert: {
          chatID: string
          ia_bloqueada: string
          instancia: string
          nome?: string | null
          telefone: string
          update_at?: string | null
        }
        Update: {
          chatID?: string
          ia_bloqueada?: string
          instancia?: string
          nome?: string | null
          telefone?: string
          update_at?: string | null
        }
        Relationships: []
      }
      interacoes: {
        Row: {
          conteudo: string | null
          created_at: string | null
          direção: string
          enviada_por: string | null
          id: string
          lead_id: string | null
          status: string | null
          tipo: string
        }
        Insert: {
          conteudo?: string | null
          created_at?: string | null
          direção: string
          enviada_por?: string | null
          id?: string
          lead_id?: string | null
          status?: string | null
          tipo: string
        }
        Update: {
          conteudo?: string | null
          created_at?: string | null
          direção?: string
          enviada_por?: string | null
          id?: string
          lead_id?: string | null
          status?: string | null
          tipo?: string
        }
        Relationships: []
      }
      leads_roger: {
        Row: {
          categoria_lead: string | null
          cobranca_judicial: string | null
          created_at: string | null
          data_compra: string | null
          email: string | null
          estado: string | null
          followup_1: string | null
          followup_2: string | null
          followup_3: string | null
          id: string
          instancia: string | null
          motivo_cancelamento: string | null
          motivo_desqualificacao: string | null
          nome_lead: string | null
          potencial_recuperacao: string | null
          prioridade_atendimento: string | null
          proposta_recomendada: string | null
          qualificado_automaticamente: string | null
          resumo_ia: string | null
          score_total: string | null
          situacao_parcelas: string | null
          status_imovel: string | null
          status_lead: string | null
          status_qualificacao: string | null
          telefone: string
          tem_construcao: string | null
          tempo_pagando_meses: string | null
          tipo_caso: string | null
          tipo_financiamento: string | null
          updated_at: string | null
          valor_estimado_recuperacao: string | null
          valor_pago: number | null
        }
        Insert: {
          categoria_lead?: string | null
          cobranca_judicial?: string | null
          created_at?: string | null
          data_compra?: string | null
          email?: string | null
          estado?: string | null
          followup_1?: string | null
          followup_2?: string | null
          followup_3?: string | null
          id?: string
          instancia?: string | null
          motivo_cancelamento?: string | null
          motivo_desqualificacao?: string | null
          nome_lead?: string | null
          potencial_recuperacao?: string | null
          prioridade_atendimento?: string | null
          proposta_recomendada?: string | null
          qualificado_automaticamente?: string | null
          resumo_ia?: string | null
          score_total?: string | null
          situacao_parcelas?: string | null
          status_imovel?: string | null
          status_lead?: string | null
          status_qualificacao?: string | null
          telefone: string
          tem_construcao?: string | null
          tempo_pagando_meses?: string | null
          tipo_caso?: string | null
          tipo_financiamento?: string | null
          updated_at?: string | null
          valor_estimado_recuperacao?: string | null
          valor_pago?: number | null
        }
        Update: {
          categoria_lead?: string | null
          cobranca_judicial?: string | null
          created_at?: string | null
          data_compra?: string | null
          email?: string | null
          estado?: string | null
          followup_1?: string | null
          followup_2?: string | null
          followup_3?: string | null
          id?: string
          instancia?: string | null
          motivo_cancelamento?: string | null
          motivo_desqualificacao?: string | null
          nome_lead?: string | null
          potencial_recuperacao?: string | null
          prioridade_atendimento?: string | null
          proposta_recomendada?: string | null
          qualificado_automaticamente?: string | null
          resumo_ia?: string | null
          score_total?: string | null
          situacao_parcelas?: string | null
          status_imovel?: string | null
          status_lead?: string | null
          status_qualificacao?: string | null
          telefone?: string
          tem_construcao?: string | null
          tempo_pagando_meses?: string | null
          tipo_caso?: string | null
          tipo_financiamento?: string | null
          updated_at?: string | null
          valor_estimado_recuperacao?: string | null
          valor_pago?: number | null
        }
        Relationships: []
      }
      leads_viam: {
        Row: {
          ad_id: string | null
          adset_id: string | null
          agendamento_realizado: boolean | null
          area_atuacao: string | null
          campaign_id: string | null
          cidade: string | null
          classificacao: string | null
          click_id: string | null
          compareceu_reuniao: boolean | null
          contrato_assinado: boolean | null
          created_at: string
          data_agendamento: string | null
          data_ultima_interacao: string | null
          dependencia_indicacoes: boolean | null
          email: string | null
          estado: string | null
          estagio_funil: string
          estrutura_escritorio: string | null
          experiencia_marketing: string | null
          faturamento_mensal: string | null
          id: string
          investimento_atual_marketing: number | null
          nao_compareceu: boolean | null
          nome: string | null
          observacoes: string | null
          origem: string
          principal_desafio: string | null
          proximo_follow_up: string | null
          reagendou_reuniao: boolean | null
          recebeu_contrato: boolean | null
          referrer_url: string | null
          resultados_anteriores: string | null
          score_total: number | null
          status: string
          telefone: string
          tem_orcamento_marketing: boolean | null
          tempo_atuacao: number | null
          updated_at: string
          urgencia_solucao: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          ad_id?: string | null
          adset_id?: string | null
          agendamento_realizado?: boolean | null
          area_atuacao?: string | null
          campaign_id?: string | null
          cidade?: string | null
          classificacao?: string | null
          click_id?: string | null
          compareceu_reuniao?: boolean | null
          contrato_assinado?: boolean | null
          created_at?: string
          data_agendamento?: string | null
          data_ultima_interacao?: string | null
          dependencia_indicacoes?: boolean | null
          email?: string | null
          estado?: string | null
          estagio_funil?: string
          estrutura_escritorio?: string | null
          experiencia_marketing?: string | null
          faturamento_mensal?: string | null
          id?: string
          investimento_atual_marketing?: number | null
          nao_compareceu?: boolean | null
          nome?: string | null
          observacoes?: string | null
          origem?: string
          principal_desafio?: string | null
          proximo_follow_up?: string | null
          reagendou_reuniao?: boolean | null
          recebeu_contrato?: boolean | null
          referrer_url?: string | null
          resultados_anteriores?: string | null
          score_total?: number | null
          status?: string
          telefone: string
          tem_orcamento_marketing?: boolean | null
          tempo_atuacao?: number | null
          updated_at?: string
          urgencia_solucao?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          ad_id?: string | null
          adset_id?: string | null
          agendamento_realizado?: boolean | null
          area_atuacao?: string | null
          campaign_id?: string | null
          cidade?: string | null
          classificacao?: string | null
          click_id?: string | null
          compareceu_reuniao?: boolean | null
          contrato_assinado?: boolean | null
          created_at?: string
          data_agendamento?: string | null
          data_ultima_interacao?: string | null
          dependencia_indicacoes?: boolean | null
          email?: string | null
          estado?: string | null
          estagio_funil?: string
          estrutura_escritorio?: string | null
          experiencia_marketing?: string | null
          faturamento_mensal?: string | null
          id?: string
          investimento_atual_marketing?: number | null
          nao_compareceu?: boolean | null
          nome?: string | null
          observacoes?: string | null
          origem?: string
          principal_desafio?: string | null
          proximo_follow_up?: string | null
          reagendou_reuniao?: boolean | null
          recebeu_contrato?: boolean | null
          referrer_url?: string | null
          resultados_anteriores?: string | null
          score_total?: number | null
          status?: string
          telefone?: string
          tem_orcamento_marketing?: boolean | null
          tempo_atuacao?: number | null
          updated_at?: string
          urgencia_solucao?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_leads_ad"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "anuncios_meta"
            referencedColumns: ["ad_id"]
          },
          {
            foreignKeyName: "fk_leads_ad"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "v_performance_anuncios"
            referencedColumns: ["ad_id"]
          },
          {
            foreignKeyName: "fk_leads_adset"
            columns: ["adset_id"]
            isOneToOne: false
            referencedRelation: "conjuntos_anuncios"
            referencedColumns: ["adset_id"]
          },
          {
            foreignKeyName: "fk_leads_campaign"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campanhas_meta"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "fk_leads_campaign"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "v_performance_campanhas"
            referencedColumns: ["campaign_id"]
          },
        ]
      }
      mensagens_followup: {
        Row: {
          ativo: boolean | null
          classificacao: string
          created_at: string | null
          estagio_funil: string
          id: string
          template: string
          tipo_mensagem: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          classificacao: string
          created_at?: string | null
          estagio_funil: string
          id?: string
          template: string
          tipo_mensagem: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          classificacao?: string
          created_at?: string | null
          estagio_funil?: string
          id?: string
          template?: string
          tipo_mensagem?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      metricas_campanhas: {
        Row: {
          ad_id: string | null
          adset_id: string | null
          alcance: number | null
          campaign_id: string | null
          cliques: number | null
          comentarios: number | null
          compartilhamentos: number | null
          conversoes: number | null
          cpa: number | null
          cpc: number | null
          cpl: number | null
          created_at: string | null
          ctr: number | null
          curtidas: number | null
          data_metrica: string
          frequencia: number | null
          id: string
          impressoes: number | null
          leads_gerados: number | null
          receita_gerada: number | null
          roas: number | null
          saves: number | null
          taxa_conversao: number | null
          updated_at: string | null
          valor_gasto: number | null
        }
        Insert: {
          ad_id?: string | null
          adset_id?: string | null
          alcance?: number | null
          campaign_id?: string | null
          cliques?: number | null
          comentarios?: number | null
          compartilhamentos?: number | null
          conversoes?: number | null
          cpa?: number | null
          cpc?: number | null
          cpl?: number | null
          created_at?: string | null
          ctr?: number | null
          curtidas?: number | null
          data_metrica: string
          frequencia?: number | null
          id?: string
          impressoes?: number | null
          leads_gerados?: number | null
          receita_gerada?: number | null
          roas?: number | null
          saves?: number | null
          taxa_conversao?: number | null
          updated_at?: string | null
          valor_gasto?: number | null
        }
        Update: {
          ad_id?: string | null
          adset_id?: string | null
          alcance?: number | null
          campaign_id?: string | null
          cliques?: number | null
          comentarios?: number | null
          compartilhamentos?: number | null
          conversoes?: number | null
          cpa?: number | null
          cpc?: number | null
          cpl?: number | null
          created_at?: string | null
          ctr?: number | null
          curtidas?: number | null
          data_metrica?: string
          frequencia?: number | null
          id?: string
          impressoes?: number | null
          leads_gerados?: number | null
          receita_gerada?: number | null
          roas?: number | null
          saves?: number | null
          taxa_conversao?: number | null
          updated_at?: string | null
          valor_gasto?: number | null
        }
        Relationships: []
      }
      n8n_chat_histories: {
        Row: {
          datetime: string | null
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          datetime?: string | null
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          datetime?: string | null
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      n8n_chat_histories_roger: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      n8n_chat_histories_viam: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      n8n_chat_licitai_especialista_days: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      n8n_chat_licitai_teste_nando: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      n8n_vectors: {
        Row: {
          embedding: string | null
          id: string
          metadata: Json | null
          text: string | null
        }
        Insert: {
          embedding?: string | null
          id?: string
          metadata?: Json | null
          text?: string | null
        }
        Update: {
          embedding?: string | null
          id?: string
          metadata?: Json | null
          text?: string | null
        }
        Relationships: []
      }
      n8n_vectors_licitai: {
        Row: {
          embedding: string | null
          id: string
          metadata: Json | null
          text: string | null
        }
        Insert: {
          embedding?: string | null
          id?: string
          metadata?: Json | null
          text?: string | null
        }
        Update: {
          embedding?: string | null
          id?: string
          metadata?: Json | null
          text?: string | null
        }
        Relationships: []
      }
      n8n_vectors_teste: {
        Row: {
          embedding: string | null
          id: string
          metadata: Json | null
          text: string | null
        }
        Insert: {
          embedding?: string | null
          id?: string
          metadata?: Json | null
          text?: string | null
        }
        Update: {
          embedding?: string | null
          id?: string
          metadata?: Json | null
          text?: string | null
        }
        Relationships: []
      }
      prompt_roger: {
        Row: {
          created_at: string | null
          identidade: string
          objecoes: string
          regra_fundamental: string
          regras_finais: string
          script: string
          tipo: string
          tools: string
          transferencia: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          identidade: string
          objecoes: string
          regra_fundamental: string
          regras_finais: string
          script: string
          tipo: string
          tools: string
          transferencia: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          identidade?: string
          objecoes?: string
          regra_fundamental?: string
          regras_finais?: string
          script?: string
          tipo?: string
          tools?: string
          transferencia?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      PROMPTS: {
        Row: {
          AGENTE: string | null
          DATA: string | null
          DOCUMENTO: string | null
          EMPRESA: string | null
          INSTAGRAM: string | null
          PROMPT: string | null
          SENHA: string
          TELEFONE: string | null
          URL: string | null
        }
        Insert: {
          AGENTE?: string | null
          DATA?: string | null
          DOCUMENTO?: string | null
          EMPRESA?: string | null
          INSTAGRAM?: string | null
          PROMPT?: string | null
          SENHA: string
          TELEFONE?: string | null
          URL?: string | null
        }
        Update: {
          AGENTE?: string | null
          DATA?: string | null
          DOCUMENTO?: string | null
          EMPRESA?: string | null
          INSTAGRAM?: string | null
          PROMPT?: string | null
          SENHA?: string
          TELEFONE?: string | null
          URL?: string | null
        }
        Relationships: []
      }
      system_messages_analista: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          id: string
          instancia: string
          prompt: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          instancia: string
          prompt?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          instancia?: string
          prompt?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      system_messages_comercial: {
        Row: {
          area_atuacao: string | null
          ativo: boolean | null
          created_at: string | null
          id: string
          instancia: string
          nome_agente: string | null
          nome_escritorio: string | null
          updated_at: string | null
          versao_1: string | null
          versao_2: string | null
          versao_3: string
        }
        Insert: {
          area_atuacao?: string | null
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          instancia: string
          nome_agente?: string | null
          nome_escritorio?: string | null
          updated_at?: string | null
          versao_1?: string | null
          versao_2?: string | null
          versao_3: string
        }
        Update: {
          area_atuacao?: string | null
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          instancia?: string
          nome_agente?: string | null
          nome_escritorio?: string | null
          updated_at?: string | null
          versao_1?: string | null
          versao_2?: string | null
          versao_3?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_dashboard_leads: {
        Row: {
          acao_automatica: string | null
          acao_recomendada: string | null
          ad_id: string | null
          ad_name: string | null
          adset_id: string | null
          adset_name: string | null
          agendamento_realizado: boolean | null
          area_atuacao: string | null
          call_to_action: string | null
          campaign_id: string | null
          campaign_name: string | null
          campaign_objetivo: string | null
          cidade: string | null
          classificacao: string | null
          click_id: string | null
          compareceu_reuniao: boolean | null
          completude_dados: number | null
          contrato_assinado: boolean | null
          cor_classificacao: string | null
          cor_estagio: string | null
          created_at: string | null
          data_agendamento: string | null
          data_ultima_interacao: string | null
          dependencia_indicacoes: boolean | null
          descricacao_classificacao: string | null
          descricao_estagio: string | null
          email: string | null
          estado: string | null
          estagio_funil: string | null
          estrutura_escritorio: string | null
          experiencia_marketing: string | null
          faturamento_mensal: string | null
          follow_up_vencido: boolean | null
          headline: string | null
          id: string | null
          investimento_atual_marketing: number | null
          nao_compareceu: boolean | null
          nome: string | null
          observacoes: string | null
          origem: string | null
          principal_desafio: string | null
          proximo_follow_up: string | null
          reagendou_reuniao: boolean | null
          recebeu_contrato: boolean | null
          referrer_url: string | null
          resultados_anteriores: string | null
          score_total: number | null
          status: string | null
          targeting_age_max: number | null
          targeting_age_min: number | null
          telefone: string | null
          tem_orcamento_marketing: boolean | null
          tempo_atuacao: number | null
          total_interacoes: number | null
          ultima_interacao: string | null
          updated_at: string | null
          urgencia_solucao: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_leads_ad"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "anuncios_meta"
            referencedColumns: ["ad_id"]
          },
          {
            foreignKeyName: "fk_leads_ad"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "v_performance_anuncios"
            referencedColumns: ["ad_id"]
          },
          {
            foreignKeyName: "fk_leads_adset"
            columns: ["adset_id"]
            isOneToOne: false
            referencedRelation: "conjuntos_anuncios"
            referencedColumns: ["adset_id"]
          },
          {
            foreignKeyName: "fk_leads_campaign"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campanhas_meta"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "fk_leads_campaign"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "v_performance_campanhas"
            referencedColumns: ["campaign_id"]
          },
        ]
      }
      v_performance_anuncios: {
        Row: {
          ad_id: string | null
          ad_name: string | null
          adset_name: string | null
          call_to_action: string | null
          campaign_name: string | null
          clientes_convertidos: number | null
          cliques_30d: number | null
          cpc_medio: number | null
          cpl_medio: number | null
          ctr_medio: number | null
          gasto_30d: number | null
          headline: string | null
          impressoes_30d: number | null
          leads_qualificados: number | null
          score_medio: number | null
          status: string | null
          taxa_qualificacao: number | null
          total_leads: number | null
          ultimo_lead: string | null
        }
        Relationships: []
      }
      v_performance_campanhas: {
        Row: {
          baixo_potencial_count: number | null
          campaign_id: string | null
          campaign_name: string | null
          clientes_convertidos: number | null
          cpl_medio: number | null
          investimento_total: number | null
          leads_qualificados: number | null
          nao_qualificado_count: number | null
          objetivo: string | null
          potencial_count: number | null
          premium_count: number | null
          primeiro_lead: string | null
          qualificado_count: number | null
          receita_total: number | null
          roas_medio: number | null
          score_medio: number | null
          taxa_conversao_final: number | null
          taxa_qualificacao: number | null
          total_leads: number | null
          ultimo_lead: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      atualizar_lead: {
        Args: { dados_json: Json; lead_uuid: string }
        Returns: boolean
      }
      atualizar_metricas_campanha: {
        Args: { data_referencia?: string; metricas_data: Json }
        Returns: boolean
      }
      avancar_estagio_lead: {
        Args: { lead_uuid: string; novo_estagio: string }
        Returns: boolean
      }
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      buscar_ou_criar_lead_whatsapp: {
        Args: { nome_param?: string; telefone_param: string }
        Returns: string
      }
      calcular_atraso_meses: {
        Args: { data_entrega: string }
        Returns: number
      }
      calcular_score_lead: {
        Args: { lead_uuid: string }
        Returns: number
      }
      classifica_lead_completo: {
        Args: { dados_json: Json; lead_uuid: string }
        Returns: {
          classificacao_final: string
          lead_id: string
          message: string
          score_final: number
          success: boolean
        }[]
      }
      classificar_lead: {
        Args: { lead_uuid: string }
        Returns: string
      }
      criar_lead_minimo: {
        Args: { origem_param?: string; telefone_param: string }
        Returns: string
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_business_hours: {
        Args: { fim?: string; inicio?: string }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      processar_webhook_meta: {
        Args: { webhook_data: Json }
        Returns: Json
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      sugerir_proxima_acao: {
        Args: { lead_uuid: string }
        Returns: {
          acao: string
          prioridade: string
          template_id: string
          tempo_sugerido: unknown
        }[]
      }
      upsert_estrutura_meta: {
        Args: { ad_data?: Json; adset_data?: Json; campanha_data: Json }
        Returns: Json
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
