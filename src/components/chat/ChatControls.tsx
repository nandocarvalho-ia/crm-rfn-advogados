import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, UserCheck, Bot } from 'lucide-react';
import { useIABlockControl } from '@/hooks/useIABlockControl';
import { Conversation } from '@/hooks/useChatConversations';

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

  return (
    <div className="p-4 border-t bg-card">
      <div className="flex gap-2 mb-3">
        {conversation.is_ia_blocked ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDevolverParaIA}
            className="flex items-center gap-2"
          >
            <Bot className="h-4 w-4" />
            Devolver para IA
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={handleAssumirConversa}
            className="flex items-center gap-2"
          >
            <UserCheck className="h-4 w-4" />
            Assumir Conversa
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite sua mensagem..."
          className="resize-none min-h-[60px]"
          disabled={!conversation.is_ia_blocked || isSending}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!message.trim() || !conversation.is_ia_blocked || isSending}
          size="icon"
          className="shrink-0 h-[60px] w-[60px]"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {!conversation.is_ia_blocked && (
        <p className="text-xs text-muted-foreground mt-2">
          💡 Assuma a conversa para enviar mensagens manualmente
        </p>
      )}
    </div>
  );
};
