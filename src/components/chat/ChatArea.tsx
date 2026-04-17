import { Fragment, useLayoutEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useChatMessages, type ChatMessage } from '@/hooks/useChatMessages';
import { Conversation } from '@/hooks/useChatConversations';
import { ChatHeader } from './ChatHeader';
import { ChatControls } from './ChatControls';
import { MessageBubble } from './MessageBubble';
import { dayKey, formatDayLabel } from './utils';
import { AlertCircle, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ChatAreaProps {
  conversation: Conversation;
  onBack?: () => void;
  onControlChange?: () => void;
}

interface DayGroup {
  key: string;
  label: string;
  messages: ChatMessage[];
}

function groupByDay(messages: ChatMessage[]): DayGroup[] {
  const groups: DayGroup[] = [];
  let current: DayGroup | null = null;
  for (const m of messages) {
    const k = dayKey(m.timestamp);
    if (!current || current.key !== k) {
      current = { key: k, label: formatDayLabel(m.timestamp), messages: [] };
      groups.push(current);
    }
    current.messages.push(m);
  }
  return groups;
}

export const ChatArea = ({ conversation, onBack, onControlChange }: ChatAreaProps) => {
  const { messages, loading, error, refetch } = useChatMessages(conversation.session_id);
  const bottomRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ block: 'end' });
    });
  }, [messages, conversation.session_id]);

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <ChatHeader conversation={conversation} onBack={onBack} />
        <div className="flex-1 flex items-center justify-center p-4 bg-app-bg">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const groups = groupByDay(messages);

  return (
    <div className="flex flex-col h-full bg-app-bg">
      <ChatHeader conversation={conversation} onBack={onBack} />

      <ScrollArea className="flex-1 px-4 md:px-8 py-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <Skeleton className="h-14 w-[55%] rounded-2xl" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-ink-muted">
            <MessageSquare className="mb-2 h-10 w-10 opacity-60" />
            <p className="text-sm">Nenhuma mensagem ainda.</p>
          </div>
        ) : (
          <div>
            {groups.map((g) => (
              <Fragment key={g.key}>
                <div className="my-3 flex justify-center">
                  <span className="rounded-full bg-app-card px-3 py-1 text-[11px] font-medium text-ink-muted shadow-sm border border-line-subtle">
                    {g.label}
                  </span>
                </div>
                {g.messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </Fragment>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      <ChatControls
        conversation={conversation}
        onMessageSent={refetch}
        onControlChange={onControlChange}
      />
    </div>
  );
};
