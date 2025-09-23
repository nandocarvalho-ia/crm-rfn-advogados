import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useIABlockControl = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const toggleIAMutation = useMutation({
    mutationFn: async ({ telefone, block }: { telefone: string; block: boolean }) => {
      // Simular operação por enquanto - implementar com RPC ou edge function depois
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (block) {
        console.log(`Bloqueando IA para ${telefone}`);
      } else {
        console.log(`Desbloqueando IA para ${telefone}`);
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

  const toggleIA = async (telefone: string, currentlyBlocked: boolean) => {
    setLoadingStates(prev => ({ ...prev, [telefone]: true }));
    toggleIAMutation.mutate({ telefone, block: !currentlyBlocked });
  };

  const isLoading = (telefone: string) => loadingStates[telefone] || false;

  return {
    toggleIA,
    isLoading,
  };
};