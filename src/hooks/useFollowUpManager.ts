import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FollowUpSuggestion, FollowUpRecord, FollowUpAnalysis } from '@/types/followup';

export const useFollowUpManager = (telefone?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Buscar follow-up existente
  const { data: followUpData, isLoading } = useQuery({
    queryKey: ['follow-up', telefone],
    queryFn: async () => {
      if (!telefone) return null;
      
      const { data, error } = await supabase
        .from('follow_ups_inteligentes')
        .select('*')
        .eq('telefone', telefone)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as any;
    },
    enabled: !!telefone,
  });

  // Analisar conversa e gerar sugestões
  const analyzeConversation = async (telefone: string, nomeLeads: string) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-followup', {
        body: { telefone, nomeLeads },
      });

      if (error) throw error;
      
      if (data?.success) {
        toast({
          title: "Análise concluída",
          description: "Sugestões de follow-up geradas com sucesso",
        });
        
        // Atualizar cache
        queryClient.invalidateQueries({ queryKey: ['follow-up', telefone] });
        return data.analise;
      } else {
        throw new Error(data?.error || 'Erro na análise');
      }
    } catch (error) {
      console.error('Erro na análise:', error);
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar a conversa",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Atualizar follow-ups
  const updateFollowUpMutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!telefone) throw new Error('Telefone não informado');

      const { data, error } = await supabase
        .from('follow_ups_inteligentes')
        .update(updates)
        .eq('telefone', telefone)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-up', telefone] });
      toast({
        title: "Follow-up atualizado",
        description: "Configurações salvas com sucesso",
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar follow-up:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o follow-up",
        variant: "destructive",
      });
    },
  });

  // Pausar/reativar follow-up
  const toggleFollowUpStatus = (newStatus: 'ativo' | 'pausado' | 'finalizado') => {
    updateFollowUpMutation.mutate({ status: newStatus });
  };

  // Atualizar configuração personalizada
  const updateCustomConfig = (config: any) => {
    updateFollowUpMutation.mutate({ 
      configuracao_personalizada: config,
      updated_at: new Date().toISOString(),
    });
  };

  // Calcular próximas datas de envio
  const calculateSendDates = (followUps: FollowUpSuggestion[], baseDate: Date = new Date()) => {
    const result: FollowUpSuggestion[] = [];
    let currentDate = new Date(baseDate);

    followUps.forEach((followUp, index) => {
      const { tempo_espera, horario_comercial } = followUp;
      
      // Converter tempo de espera para minutos
      let minutesToAdd = 0;
      if (tempo_espera.includes('minuto')) {
        minutesToAdd = parseInt(tempo_espera);
      } else if (tempo_espera.includes('hora')) {
        minutesToAdd = parseInt(tempo_espera) * 60;
      } else if (tempo_espera.includes('dia')) {
        minutesToAdd = parseInt(tempo_espera) * 24 * 60;
      }

      currentDate = new Date(currentDate.getTime() + minutesToAdd * 60000);

      // Ajustar para horário comercial se necessário
      if (horario_comercial) {
        const hour = currentDate.getHours();
        if (hour < 8) {
          currentDate.setHours(8, 0, 0, 0);
        } else if (hour >= 20) {
          // Mover para próximo dia útil às 8h
          currentDate.setDate(currentDate.getDate() + 1);
          currentDate.setHours(8, 0, 0, 0);
        }
      }

      result.push({
        ...followUp,
        data_envio: currentDate.toISOString(),
        status: 'pendente',
      });
    });

    return result;
  };

  return {
    followUpData,
    isLoading,
    isAnalyzing,
    analyzeConversation,
    updateFollowUp: updateFollowUpMutation.mutate,
    toggleFollowUpStatus,
    updateCustomConfig,
    calculateSendDates,
    isUpdating: updateFollowUpMutation.isPending,
  };
};