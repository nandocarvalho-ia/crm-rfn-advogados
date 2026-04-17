import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LeadRoger {
  id: string;
  nome_lead: string | null;
  telefone: string;
  email: string | null;
  estado: string | null;
  categoria_lead: string | null;
  status_lead: string | null;
  score_total: number | null;
  created_at: string;
  updated_at: string;
  potencial_recuperacao: string | null;
  valor_pago: number | null;
  qualificado_automaticamente: boolean | null;
  status_qualificacao: string | null;
  prioridade_atendimento: number | null;
  observacoes: string | null;
  resumo_ia: string | null;
  motivo_desqualificacao: string | null;
  data_compra: string | null;
  tipo_caso: string | null;
  tipo_financiamento: string | null;
  status_imovel: string | null;
  valor_estimado_recuperacao: number | null;
  proposta_recomendada: string | null;
  atendente?: string | null;
  // Fase 2 — campos que existem em leads_roger
  campanha: string | null;
  codigo_criativo: string | null;
  data_conversao: string | null;
  phone_last_8: string | null;
  etapa_atual: string | null;
  last_interaction: string | null;
  followup_1: string | null;
  followup_2: string | null;
}

export const useLeadsRoger = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch leads with real-time subscription
  const { data: leads = [], isLoading, error } = useQuery({
    queryKey: ['leads-roger'],
    queryFn: async () => {
      // Fetch all leads with pagination (Supabase default limit is 1000)
      let allLeads: any[] = [];
      let from = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('leads_roger')
          .select('*')
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .range(from, from + pageSize - 1);

        if (error) throw error;
        allLeads = [...allLeads, ...(data || [])];
        hasMore = (data?.length || 0) === pageSize;
        from += pageSize;
      }

      // Fetch fluxo data
      const { data: fluxoData, error: fluxoError } = await supabase
        .from('[FLUXO] • IA')
        .select('TELEFONE, ATENDENTE');
      
      if (fluxoError) throw fluxoError;
      
      // Create a map for quick lookup of ATENDENTE by TELEFONE
      const fluxoMap = new Map<string, string>();
      (fluxoData || []).forEach((fluxo: any) => {
        if (fluxo.TELEFONE) {
          fluxoMap.set(fluxo.TELEFONE, fluxo.ATENDENTE);
        }
      });
      
      // Combine the data
      return allLeads.map((lead: any) => ({
        ...lead,
        atendente: fluxoMap.get(String(lead.telefone)) || null
      })) as LeadRoger[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('leads-roger-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads_roger',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['leads-roger'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: '[FLUXO] • IA',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['leads-roger'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Calculate metrics from real data
  const metrics = {
    totalLeads: leads.length,
    qualifiedLeads: leads.filter(lead => 
      (lead.categoria_lead === 'EXCELENTE' || lead.categoria_lead === 'POTENCIAL EXCELENTE') &&
      lead.status_lead !== 'convertido'
    ).length,
    convertedLeads: leads.filter(lead => lead.status_lead === 'convertido').length,
    premiumLeads: leads.filter(lead => lead.categoria_lead?.startsWith('PREMIUM')).length,
    totalPotential: leads
      .filter(lead => lead.status_lead === 'convertido')
      .reduce((sum, lead) => {
        const valor = parseFloat(lead.valor_pago?.toString() || '0');
        return sum + (isNaN(valor) ? 0 : valor);
      }, 0),
    qualificationRate: leads.length > 0 
      ? ((leads.filter(lead => 
          (lead.categoria_lead === 'EXCELENTE' || lead.categoria_lead === 'POTENCIAL EXCELENTE') &&
          lead.status_lead !== 'convertido'
        ).length / leads.length) * 100) 
      : 0,
  };

  return {
    leads,
    isLoading,
    error,
    metrics,
  };
};