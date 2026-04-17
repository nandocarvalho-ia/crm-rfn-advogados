import { formatInTimeZone } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/hooks/useChatMessages';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const fromLead = message.isFromLead;

  return (
    <div className={cn('flex w-full mb-2', fromLead ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm',
          fromLead
            ? 'bg-app-card text-ink border border-line rounded-tl-sm'
            : 'bg-brand-light text-ink rounded-tr-sm',
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </p>
        <span
          className={cn(
            'mt-1 block text-[10px]',
            fromLead ? 'text-ink-muted' : 'text-ink-secondary/70',
          )}
        >
          {formatInTimeZone(message.timestamp, 'America/Sao_Paulo', 'HH:mm', { locale: ptBR })}
        </span>
      </div>
    </div>
  );
};
