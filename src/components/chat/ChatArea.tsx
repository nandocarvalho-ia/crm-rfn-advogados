import { useLayoutEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useChatMessages } from '@/hooks/useChatMessages';
import { Conversation } from '@/hooks/useChatConversations';
import { ChatHeader } from './ChatHeader';
import { ChatControls } from './ChatControls';
import { MessageBubble } from './MessageBubble';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ChatAreaProps {
  conversation: Conversation;
  onBack?: () => void;
  onControlChange?: () => void;
}

export const ChatArea = ({ conversation, onBack, onControlChange }: ChatAreaProps) => {
  const { messages, loading, error, refetch } = useChatMessages(conversation.session_id);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll robusto: rola para o bottomRef sempre que mensagens mudam
  useLayoutEffect(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ block: 'end' });
    });
  }, [messages, conversation.session_id]);

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <ChatHeader conversation={conversation} onBack={onBack} />
        <div className="flex-1 flex items-center justify-center p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <ChatHeader conversation={conversation} onBack={onBack} />

      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <Skeleton className="h-16 w-[70%] rounded-2xl" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Nenhuma mensagem ainda</p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      <ChatControls conversation={conversation} onMessageSent={refetch} onControlChange={onControlChange} />
    </div>
  );
};
