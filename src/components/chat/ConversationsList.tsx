import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';
import { Bot, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Conversation } from '@/hooks/useChatConversations';
import { cn } from '@/lib/utils';
import { avatarColorFromKey, formatPhoneBR, initialsFromName } from './utils';

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
  return (
    <ScrollArea className="flex-1">
      <ul className="divide-y divide-line-subtle">
        {conversations.map((conv) => {
          const active = selectedId === conv.session_id;
          const { bg, fg } = avatarColorFromKey(conv.user_name || conv.session_id);
          const initials = initialsFromName(conv.user_name);

          return (
            <li key={conv.session_id}>
              <button
                onClick={() => onSelect(conv)}
                className={cn(
                  'w-full text-left flex items-start gap-3 px-4 py-3 transition-colors',
                  'hover:bg-app-bg',
                  active && 'bg-brand-light/60',
                )}
              >
                <span
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                    bg,
                    fg,
                  )}
                >
                  {initials}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="truncate text-sm font-semibold text-ink">
                      {conv.user_name || 'Sem nome'}
                    </h4>
                    <span className="shrink-0 text-[11px] text-ink-muted">
                      {formatDistanceToNow(
                        toZonedTime(conv.last_message_timestamp, 'America/Sao_Paulo'),
                        { addSuffix: false, locale: ptBR },
                      )}
                    </span>
                  </div>

                  <p className="truncate text-xs text-ink-muted">
                    {formatPhoneBR(conv.telefone_limpo)}
                  </p>

                  <p className="mt-1 truncate text-sm text-ink-secondary">
                    {conv.last_message || 'Sem mensagens'}
                  </p>

                  <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                    {conv.is_ia_blocked ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-tag-warning-bg px-2 py-0.5 text-[10px] font-medium text-tag-warning">
                        <User className="h-3 w-3" />
                        Humano
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-tag-info-bg px-2 py-0.5 text-[10px] font-medium text-tag-info">
                        <Bot className="h-3 w-3" />
                        IA
                      </span>
                    )}

                    {conv.campanha && (
                      <span className="inline-flex items-center rounded-full bg-tag-neutral-bg px-2 py-0.5 text-[10px] text-tag-neutral">
                        {conv.campanha}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </ScrollArea>
  );
};
