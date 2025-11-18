import { formatDistanceToNow } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Conversation } from '@/hooks/useChatConversations';
import { cn } from '@/lib/utils';

interface ConversationsListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (conversation: Conversation) => void;
}

export const ConversationsList = ({
  conversations,
  selectedId,
  onSelect,
}: ConversationsListProps) => {
  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 13) {
      return `(${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
    }
    return phone;
  };

  return (
    <ScrollArea className="flex-1">
      <div className="divide-y">
        {conversations.map((conv) => (
          <button
            key={conv.session_id}
            onClick={() => onSelect(conv)}
            className={cn(
              'w-full text-left p-4 hover:bg-accent transition-colors',
              selectedId === conv.session_id && 'bg-accent'
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-semibold text-sm truncate">{conv.user_name}</h4>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatDistanceToNow(toZonedTime(conv.last_message_timestamp, 'America/Sao_Paulo'), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>

            <p className="text-xs text-muted-foreground mb-2">
              {formatPhone(conv.telefone_limpo)}
            </p>

            <p className="text-sm text-muted-foreground truncate mb-2">
              {conv.last_message}
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              {conv.is_ia_blocked ? (
                <Badge variant="secondary" className="text-xs">
                  👤 Humano
                </Badge>
              ) : (
                <Badge variant="default" className="text-xs">
                  🤖 IA
                </Badge>
              )}
              
              {conv.campanha && (
                <Badge variant="outline" className="text-xs">
                  {conv.campanha}
                </Badge>
              )}
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};
