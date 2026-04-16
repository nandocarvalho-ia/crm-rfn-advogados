import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, UserCheck, Bot, Loader2 } from 'lucide-react';
import { useIABlockControl } from '@/hooks/useIABlockControl';
import { Conversation } from '@/hooks/useChatConversations';
import { cn } from '@/lib/utils';

interface ChatControlsProps {
  conversation: Conversation;
  onMessageSent: () => void;
  onControlChange?: () => void;
}

export const ChatControls = ({ conversation, onMessageSent, onControlChange }: ChatControlsProps) => {
  const [message, setMessage] = useState('');
  const { assumirConversa, devolverParaIA, sendHumanMessage, isSending } = useIABlockControl();

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;

    const success = await sendHumanMessage(conversation.session_id, message.trim());
    if (success) {
      setMessage('');
      onMessageSent();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAssumirConversa = async () => {
    const success = await assumirConversa(conversation.session_id, conversation.user_name);
    if (success) {
      onControlChange?.();
      onMessageSent();
    }
  };

  const handleDevolverParaIA = async () => {
    await devolverParaIA(conversation.session_id);
    onControlChange?.();
    onMessageSent();
  };

  const canSend = conversation.is_ia_blocked;

  return (
    <div className="border-t border-line bg-app-card px-4 py-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        {conversation.is_ia_blocked ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDevolverParaIA}
            className="gap-2"
          >
            <Bot className="h-4 w-4" />
            Devolver para IA
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={handleAssumirConversa}
            className="gap-2 bg-brand hover:bg-brand-hover"
          >
            <UserCheck className="h-4 w-4" />
            Assumir conversa
          </Button>
        )}
        {!canSend && (
          <span className="text-xs text-ink-muted">
            IA no controle. Clique em "Assumir conversa" para responder.
          </span>
        )}
      </div>

      <div className="flex items-end gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={canSend ? 'Digite sua mensagem...' : 'Assuma a conversa para digitar...'}
          className={cn(
            'resize-none min-h-[48px] max-h-[140px] bg-app-bg border-line text-sm',
            'focus-visible:ring-brand',
          )}
          rows={2}
          disabled={!canSend || isSending}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!message.trim() || !canSend || isSending}
          size="icon"
          className="h-12 w-12 shrink-0 bg-brand hover:bg-brand-hover"
          aria-label="Enviar"
        >
          {isSending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};
