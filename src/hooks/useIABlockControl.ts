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
      // Por ora, simular a operação até criarmos as edge functions necessárias
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (block) {
        console.log(`Bloqueando IA para ${telefone} (${nome})`);
        // TODO: Implementar inserção real na tabela ia_bloqueada
      } else {
        console.log(`Desbloqueando IA para ${telefone} (${nome})`);
        // TODO: Implementar atualização real na tabela ia_bloqueada
      }
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.block ? "IA Bloqueada" : "IA Ativada",
        description: `IA foi ${variables.block ? 'pausada' : 'ativada'} para este lead.`,
      });
      queryClient.invalidateQueries({ queryKey: ['leads-roger'] });
      setLoadingStates(prev => ({ ...prev, [variables.telefone]: false }));
    },
    onError: (error, variables) => {
      console.error('Erro ao alterar estado da IA:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o estado da IA.",
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