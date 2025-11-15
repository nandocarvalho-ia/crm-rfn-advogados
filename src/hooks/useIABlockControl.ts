import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useIABlockControl = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [isSending, setIsSending] = useState(false);

  const cleanPhoneNumber = (sessionId: string): string => {
    return sessionId
      .replace('@s.whatsapp.net', '')
      .replace(/roger$/, '')
      .replace(/kamoi$/, '')
      .replace(/viam$/, '');
  };

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

  const assumirConversa = async (sessionId: string, nome: string): Promise<boolean> => {
    try {
      const telefone = cleanPhoneNumber(sessionId);

      // Buscar nome da tabela leads se estiver vazio
      let nomeAtualizado = nome;
      if (!nome || nome.trim() === '') {
        const { data: leadData } = await supabase
          .from('leads_roger')
          .select('nome_lead')
          .eq('telefone', parseInt(telefone, 10))
          .maybeSingle();

        if (leadData?.nome_lead) {
          nomeAtualizado = leadData.nome_lead;
        }
      }

      // Atualizar ou inserir na tabela de controle
      const { data: updateData, error: updateError } = await supabase
        .from('[FLUXO] • IA')
        .update({ 
          ATENDENTE: 'HUMANO',
          NOME: nomeAtualizado,
          DATA: new Date().toISOString()
        } as any)
        .eq('TELEFONE', telefone)
        .select();

      if (!updateData || updateData.length === 0) {
        const { error: insertError } = await supabase
          .from('[FLUXO] • IA')
          .insert({
            ATENDENTE: 'HUMANO',
            TELEFONE: telefone,
            NOME: nomeAtualizado
          } as any);

        if (insertError) {
          console.error('❌ Erro ao inserir controle IA:', insertError);
          throw insertError;
        }
      } else if (updateError) {
        console.error('❌ Erro ao atualizar controle IA:', updateError);
        throw updateError;
      }

      toast({
        title: "✅ Conversa assumida!",
        description: `Você agora controla a conversa com ${nomeAtualizado}`,
      });
      return true;
    } catch (error) {
      console.error('❌ Erro ao assumir conversa:', error);
      toast({
        title: "Erro",
        description: `Não foi possível assumir: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
      return false;
    }
  };

  const devolverParaIA = async (sessionId: string) => {
    try {
      const telefone = cleanPhoneNumber(sessionId);

      const { error } = await supabase
        .from('[FLUXO] • IA')
        .update({ ATENDENTE: 'IA' } as any)
        .eq('TELEFONE', telefone);

      if (error) throw error;

      toast({
        title: "🤖 Rafael retomou o controle",
        description: "A conversa foi devolvida para a IA",
      });
    } catch (error) {
      console.error('Erro ao devolver para IA:', error);
      toast({
        title: "Erro",
        description: "Não foi possível devolver para a IA",
        variant: "destructive",
      });
    }
  };

  const sendHumanMessage = async (sessionId: string, mensagem: string) => {
    setIsSending(true);
    try {
      const telefone = cleanPhoneNumber(sessionId);

      // Enviar via webhook N8N
      const webhookResponse = await fetch(
        'https://n8n-n8n.nnes2l.easypanel.host/webhook/chatroger',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            telefone: telefone,
            mensagem: mensagem,
            tipo: 'humano'
          })
        }
      );

      if (!webhookResponse.ok) {
        throw new Error(`Webhook retornou ${webhookResponse.status}`);
      }

      // Salvar no histórico como tipo 'ai' (mensagem enviada pelo sistema)
      const { error: insertError } = await supabase
        .from('n8n_chat_histories_roger')
        .insert({
          session_id: telefone,
          message: {
            type: 'ai',
            content: mensagem,
            additional_kwargs: {},
            response_metadata: {}
          }
        });

      if (insertError) throw insertError;

      toast({
        title: "✅ Mensagem enviada!",
        description: "O lead receberá sua mensagem no WhatsApp",
      });

      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro ao enviar",
        description: "O webhook não respondeu. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const checkBlockStatus = async (sessionId: string): Promise<boolean> => {
    try {
      const telefone = cleanPhoneNumber(sessionId);

      const { data } = await supabase
        .from('[FLUXO] • IA')
        .select('ATENDENTE')
        .eq('TELEFONE', telefone)
        .maybeSingle();

      return data?.ATENDENTE === 'HUMANO';
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      return false;
    }
  };

  const isLoading = (telefone: string) => loadingStates[telefone] || false;

  return {
    toggleIA,
    isLoading,
    assumirConversa,
    devolverParaIA,
    sendHumanMessage,
    checkBlockStatus,
    isSending
  };
};