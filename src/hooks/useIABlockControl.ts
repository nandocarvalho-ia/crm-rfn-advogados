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
      
      // First try to update existing record
      const { data: existingRecord, error: selectError } = await supabase
        .from('[FLUXO] • IA')
        .select('TELEFONE')
        .eq('TELEFONE', telefone)
        .single();
      
      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError;
      }
      
      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('[FLUXO] • IA')
          .update({ ATENDENTE: atendente } as any)
          .eq('TELEFONE', telefone);
        
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('[FLUXO] • IA')
          .insert({ 
            TELEFONE: telefone,
            ATENDENTE: atendente,
            NOME: nome || null
          } as any);
        
        if (error) throw error;
      }
      
      return { success: true };
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