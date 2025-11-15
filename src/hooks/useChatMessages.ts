import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: number;
  session_id: string;
  type: 'human' | 'ai';
  content: string;
  timestamp: Date;
  isFromLead: boolean;
}

const parseTimestamp = (input: any): Date => {
  if (!input) return new Date();
  if (input instanceof Date) return input;
  if (typeof input === 'string' || typeof input === 'number') {
    const date = new Date(input);
    return isNaN(date.getTime()) ? new Date() : date;
  }
  return new Date();
};

export const useChatMessages = (sessionId: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    if (!sessionId) {
      setMessages([]);
      return;
    }

    try {
      setLoading(true);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error: messagesError } = await supabase
        .from('n8n_chat_histories_roger')
        .select('*')
        .eq('session_id', sessionId)
        .gte('timestamp', thirtyDaysAgo.toISOString())
        .order('timestamp', { ascending: true });

      if (messagesError) throw messagesError;

      const parsedMessages: ChatMessage[] = (data || []).map((msg) => ({
        id: msg.id,
        session_id: msg.session_id,
        type: (msg.message as any)?.type || 'ai',
        content: (msg.message as any)?.content || '',
        timestamp: parseTimestamp(msg.timestamp),
        isFromLead: (msg.message as any)?.type === 'human'
      }));

      setMessages(parsedMessages);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar mensagens:', err);
      setError('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    if (!sessionId) return;

    // Real-time: novas mensagens
    const channel = supabase
      .channel(`chat_messages_roger_${sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'n8n_chat_histories_roger',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        const newMsg: ChatMessage = {
          id: payload.new.id,
          session_id: payload.new.session_id,
          type: (payload.new.message as any)?.type || 'ai',
          content: (payload.new.message as any)?.content || '',
          timestamp: parseTimestamp(payload.new.timestamp),
          isFromLead: (payload.new.message as any)?.type === 'human'
        };

        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'n8n_chat_histories_roger',
        filter: `session_id=eq.${sessionId}`
      }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return { messages, loading, error, refetch: fetchMessages };
};
