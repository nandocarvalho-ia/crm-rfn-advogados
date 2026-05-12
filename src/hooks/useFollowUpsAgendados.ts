import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { extractErrorMessage } from '@/lib/errors';

export interface FollowUpLead {
  id: string;
  nome_lead: string | null;
  telefone: number;
  followup_1: string | null;
  followup_2: string | null;
  followup_3: string | null;
  last_interaction: string | null;
  updated_at: string | null;
  categoria_lead: string | null;
  status_lead: string | null;
}

/**
 * Retorna leads que têm textos de follow-up preparados pelo agente
 * observador (followup_1 IS NOT NULL). Ordenado pelo updated_at
 * mais recente — serve como proxy de "último contato" enquanto
 * last_interaction estiver vazio.
 */
export function useFollowUpsAgendados() {
  return useQuery({
    queryKey: ['followups-preparados'],
    queryFn: async (): Promise<FollowUpLead[]> => {
      const all: FollowUpLead[] = [];
      let from = 0;
      const size = 1000;
      while (true) {
        const { data, error } = await supabase
          .from('leads_roger')
          .select(
            'id, nome_lead, telefone, followup_1, followup_2, followup_3, last_interaction, updated_at, categoria_lead, status_lead',
          )
          .is('deleted_at', null)
          .not('followup_1', 'is', null)
          .order('updated_at', { ascending: false })
          .range(from, from + size - 1);
        if (error) throw error;
        all.push(...((data as unknown) as FollowUpLead[]));
        if ((data?.length ?? 0) < size) break;
        from += size;
      }
      return all;
    },
  });
}

interface UpdateArgs {
  id: string;
  followup_1: string;
  followup_2: string;
}

export function useUpdateFollowUpTexts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, followup_1, followup_2 }: UpdateArgs) => {
      const { error } = await supabase
        .from('leads_roger')
        .update({ followup_1, followup_2 })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups-preparados'] });
      queryClient.invalidateQueries({ queryKey: ['leads-roger'] });
      toast.success('Textos atualizados');
    },
    onError: (err: unknown) => {
      toast.error('Erro ao salvar textos', { description: extractErrorMessage(err) });
    },
  });
}
