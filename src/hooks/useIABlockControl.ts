import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useIABlockControl = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const toggleIAMutation = useMutation({
    mutationFn: async ({ telefone, nome, block }: { telefone: string; nome: string | null; block: boolean }) => {
      const atendente = block ? 'HUMANO' : 'IA';
      const currentDate = new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      const { error } = await supabase
        .from('[FLUXO] • IA')
        .upsert({
          'TELEFONE': telefone,
          'NOME': nome || '',
          'INSTÂNCIA': 'roger',
          'ATENDENTE': atendente,
          'DATA': currentDate,
          'ETAPA': '1',
          'FOLLOW': '0'
        }, {
          onConflict: 'TELEFONE,INSTÂNCIA'
        });
      
      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.block ? "IA Pausada" : "IA Ativada",
        description: `Atendimento alterado para ${variables.block ? 'HUMANO' : 'IA'} para este lead.`,
      });
      queryClient.invalidateQueries({ queryKey: ['leads-roger'] });
      setLoadingStates(prev => ({ ...prev, [variables.telefone]: false }));
    },
    onError: (error, variables) => {
      console.error('Erro ao alterar estado do atendente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o tipo de atendimento.",
        variant: "destructive",
      });
      setLoadingStates(prev => ({ ...prev, [variables.telefone]: false }));
    },
  });

  const toggleIA = async (telefone: string, nome: string | null, currentlyBlocked: boolean) => {
    setLoadingStates(prev => ({ ...prev, [telefone]: true }));
    toggleIAMutation.mutate({ telefone, nome, block: !currentlyBlocked });
  };

  const isLoading = (telefone: string) => loadingStates[telefone] || false;

  return {
    toggleIA,
    isLoading,
  };
};