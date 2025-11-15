import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const parseTimestamp = (input: any): Date => {
  if (!input) return new Date();
  if (input instanceof Date) return input;
  if (typeof input === 'string' || typeof input === 'number') {
    const date = new Date(input);
    return isNaN(date.getTime()) ? new Date() : date;
  }
  return new Date();
};

const cleanPhoneNumber = (sessionId: string): string => {
  // Apenas remove @s.whatsapp.net, não precisa mais remover sufixos roger/kamoi/viam
  return sessionId.replace('@s.whatsapp.net', '');
};

export interface Conversation {
  session_id: string;
  telefone_limpo: string;
  user_name: string;
  last_message: string;
  last_message_timestamp: Date;
  created_at: Date;
  lead_stage?: string;
  campanha?: string;
  is_ia_blocked: boolean;
}

export const useChatConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Buscar mensagens recentes (somente campos necessários)
      const { data: messages, error: messagesError } = await supabase
        .from('n8n_chat_histories_roger')
        .select('id, session_id, message, timestamp')
        .gte('timestamp', thirtyDaysAgo.toISOString())
        .order('timestamp', { ascending: false })
        .limit(2000);

      if (messagesError) throw messagesError;

      // Agrupar por session_id
      const conversationsMap = new Map<string, Partial<Conversation>>();

      for (const msg of messages || []) {
        const sessionId = msg.session_id;
        if (!conversationsMap.has(sessionId)) {
          conversationsMap.set(sessionId, {
            session_id: sessionId,
            last_message: (msg.message as any)?.content || '',
            last_message_timestamp: parseTimestamp(msg.timestamp),
            created_at: parseTimestamp(msg.timestamp),
          });
        }
      }

      const conversationsArray = Array.from(conversationsMap.values()) as Conversation[];
      
      // Extrair todos os telefones únicos
      const allPhones = conversationsArray.map(conv => cleanPhoneNumber(conv.session_id));
      const uniquePhones = [...new Set(allPhones)];
      const last8DigitsArray = uniquePhones.map(phone => phone.slice(-8));

      // Buscar todos os leads de uma vez usando os últimos 8 dígitos
      const { data: leadsData } = await supabase
        .from('leads_roger')
        .select('nome_lead, campanha, status_lead, phone_last_8')
        .in('phone_last_8', last8DigitsArray);

      // Buscar todos os status de bloqueio de uma vez
      const { data: blockDataArray } = await supabase
        .from('[FLUXO] • IA')
        .select('TELEFONE, ATENDENTE')
        .in('TELEFONE', uniquePhones)
        .eq('INSTÂNCIA', 'roger');

      // Criar maps para lookup rápido
      const leadsMap = new Map<string, any>();
      leadsData?.forEach(lead => {
        if (lead.phone_last_8) leadsMap.set(lead.phone_last_8, lead);
      });

      const blockMap = new Map();
      blockDataArray?.forEach(block => {
        blockMap.set(block.TELEFONE, block.ATENDENTE === 'HUMANO');
      });

      // Enriquecer conversações com os dados
      for (const conv of conversationsArray) {
        const telefoneCompleto = cleanPhoneNumber(conv.session_id);
        const last8Digits = telefoneCompleto.slice(-8);

        const leadData = leadsMap.get(last8Digits);
        
        conv.user_name = leadData?.nome_lead || 'Sem nome';
        conv.campanha = leadData?.campanha;
        conv.lead_stage = leadData?.status_lead;
        conv.is_ia_blocked = blockMap.get(telefoneCompleto) || false;
        conv.telefone_limpo = telefoneCompleto;
      }

      conversationsArray.sort((a, b) => 
        b.last_message_timestamp.getTime() - a.last_message_timestamp.getTime()
      );

      setConversations(conversationsArray);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar conversas:', err);
      setError('Erro ao carregar conversas');
    } finally {
      setLoading(false);
    }
  };

  const updateConversationFromMessage = async (payload: any) => {
    const sessionId = payload.new.session_id;
    const telefoneCompleto = cleanPhoneNumber(sessionId);
    const last8Digits = telefoneCompleto.slice(-8);

    const { data: leadData } = await supabase
      .from('leads_roger')
      .select('nome_lead, campanha, status_lead')
      .or(`phone_last_8.eq.${last8Digits},user_number.eq.${telefoneCompleto},telefone.eq.${telefoneCompleto}`)
      .maybeSingle();

    const { data: blockData } = await supabase
      .from('[FLUXO] • IA')
      .select('ATENDENTE')
      .eq('TELEFONE', telefoneCompleto)
      .eq('INSTÂNCIA', 'roger')
      .maybeSingle();

    const newConv: Conversation = {
      session_id: sessionId,
      telefone_limpo: telefoneCompleto,
      user_name: leadData?.nome_lead || 'Sem nome',
      last_message: (payload.new.message as any)?.content || '',
      last_message_timestamp: parseTimestamp(payload.new.timestamp),
      created_at: parseTimestamp(payload.new.timestamp),
      lead_stage: leadData?.status_lead,
      campanha: leadData?.campanha,
      is_ia_blocked: blockData?.ATENDENTE === 'HUMANO'
    };

    setConversations(prev => {
      const filtered = prev.filter(c => c.session_id !== sessionId);
      return [newConv, ...filtered];
    });
  };

  useEffect(() => {
    fetchConversations();

    // Real-time: novas mensagens
    const chatChannel = supabase
      .channel('chat_histories_changes_roger')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'n8n_chat_histories_roger'
      }, updateConversationFromMessage)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'n8n_chat_histories_roger'
      }, updateConversationFromMessage)
      .subscribe();

    // Real-time: mudanças no controle de IA
    const iaChannel = supabase
      .channel('ia_bloqueada_changes_roger')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: '[FLUXO] • IA',
        filter: 'INSTÂNCIA=eq.roger'
      }, (payload) => {
        const telefone = payload.new.TELEFONE;
        const isBlocked = payload.new.ATENDENTE === 'HUMANO';

        setConversations(prev => prev.map(conv => 
          conv.telefone_limpo === telefone 
            ? { ...conv, is_ia_blocked: isBlocked }
            : conv
        ));
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: '[FLUXO] • IA',
        filter: 'INSTÂNCIA=eq.roger'
      }, (payload) => {
        const telefone = payload.new.TELEFONE;
        const isBlocked = payload.new.ATENDENTE === 'HUMANO';

        setConversations(prev => prev.map(conv => 
          conv.telefone_limpo === telefone 
            ? { ...conv, is_ia_blocked: isBlocked }
            : conv
        ));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(iaChannel);
    };
  }, []);

  return { conversations, loading, error, refetch: fetchConversations };
};
