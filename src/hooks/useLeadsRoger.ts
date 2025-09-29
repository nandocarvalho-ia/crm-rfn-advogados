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
}

export const useLeadsRoger = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch leads with real-time subscription
  const { data: leads = [], isLoading, error } = useQuery({
    queryKey: ['leads-roger'],
    queryFn: async () => {
      // Execute both queries in parallel
      const [leadsResult, fluxoResult] = await Promise.all([
        supabase
          .from('leads_roger')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('[FLUXO] • IA')
          .select('TELEFONE, ATENDENTE')
      ]);
      
      if (leadsResult.error) throw leadsResult.error;
      if (fluxoResult.error) throw fluxoResult.error;
      
      // Create a map for quick lookup of ATENDENTE by TELEFONE
      const fluxoMap = new Map<string, string>();
      (fluxoResult.data || []).forEach((fluxo: any) => {
        if (fluxo.TELEFONE) {
          fluxoMap.set(fluxo.TELEFONE, fluxo.ATENDENTE);
        }
      });
      
      // Combine the data
      return (leadsResult.data || []).map((lead: any) => ({
        ...lead,
        atendente: fluxoMap.get(lead.telefone) || null
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
      lead.status_qualificacao === 'qualificado' || lead.categoria_lead?.startsWith('PREMIUM')
    ).length,
    premiumLeads: leads.filter(lead => lead.categoria_lead?.startsWith('PREMIUM')).length,
    totalPotential: leads
      .filter(lead => lead.status_qualificacao === 'qualificado' || lead.categoria_lead?.startsWith('PREMIUM'))
      .reduce((sum, lead) => {
        const valor = parseFloat(lead.valor_estimado_recuperacao?.toString() || '0');
        return sum + (isNaN(valor) ? 0 : valor);
      }, 0),
    qualificationRate: leads.length > 0 
      ? ((leads.filter(lead => lead.status_qualificacao === 'qualificado' || lead.categoria_lead?.startsWith('PREMIUM')).length / leads.length) * 100) 
      : 0,
  };

  return {
    leads,
    isLoading,
    error,
    metrics,
  };
};