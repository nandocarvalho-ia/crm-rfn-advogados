import { formatInTimeZone } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/hooks/useChatMessages';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  return (
    <div
      className={cn(
        'flex w-full mb-4',
        message.isFromLead ? 'justify-start' : 'justify-end'
      )}
    >
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-2 shadow-sm',
          message.isFromLead
            ? 'bg-muted text-foreground rounded-tl-none'
            : 'bg-primary text-primary-foreground rounded-tr-none'
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <span
          className={cn(
            'text-xs mt-1 block',
            message.isFromLead ? 'text-muted-foreground' : 'text-primary-foreground/70'
          )}
        >
          {formatInTimeZone(message.timestamp, 'America/Sao_Paulo', 'HH:mm', { locale: ptBR })}
        </span>
      </div>
    </div>
  );
};
