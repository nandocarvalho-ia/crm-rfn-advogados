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
  potencial_recuperacao: string | null;
  valor_pago: number | null;
  qualificado_automaticamente: boolean | null;
  status_qualificacao: string | null;
  prioridade_atendimento: number | null;
  observacoes: string | null;
  atendente?: string | null;
}

export const useLeadsRoger = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch leads with real-time subscription
  const { data: leads = [], isLoading, error } = useQuery({
    queryKey: ['leads-roger'],
    queryFn: async () => {
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads_roger')
        .select(`
          *,
          fluxo_ia:"[FLUXO] • IA"!left("ATENDENTE")
        `)
        .eq('[FLUXO] • IA.INSTÂNCIA', 'roger')
        .order('created_at', { ascending: false });
      
      if (leadsError) throw leadsError;
      
      // Map the fluxo_ia data to atendente field
      const mappedData = (leadsData || []).map((lead: any) => ({
        ...lead,
        atendente: lead.fluxo_ia?.[0]?.ATENDENTE || null,
        fluxo_ia: undefined // Remove the nested object
      }));
      
      return mappedData as LeadRoger[];
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Calculate metrics from real data
  const metrics = {
    totalLeads: leads.length,
    qualifiedLeads: leads.filter(lead => 
      ['PREMIUM_ATRASO', 'A_EXCELENTE', 'B_MUITO_BOM'].includes(lead.categoria_lead || '')
    ).length,
    premiumLeads: leads.filter(lead => lead.categoria_lead === 'PREMIUM_ATRASO').length,
    totalPotential: leads.reduce((sum, lead) => sum + (lead.valor_pago || 0), 0),
    conversionRate: leads.length > 0 
      ? ((leads.filter(lead => lead.status_lead === 'CONVERTIDO').length / leads.length) * 100) 
      : 0,
  };

  return {
    leads,
    isLoading,
    error,
    metrics,
  };
};