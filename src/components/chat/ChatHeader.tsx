import { ArrowLeft, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Conversation } from '@/hooks/useChatConversations';
import { cn } from '@/lib/utils';
import { avatarColorFromKey, formatPhoneBR, initialsFromName } from './utils';

interface ChatHeaderProps {
  conversation: Conversation;
  onBack?: () => void;
}

export const ChatHeader = ({ conversation, onBack }: ChatHeaderProps) => {
  const { bg, fg } = avatarColorFromKey(conversation.user_name || conversation.session_id);
  const initials = initialsFromName(conversation.user_name);

  return (
    <div className="flex items-center gap-3 border-b border-line bg-app-card px-4 py-3">
      {onBack && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-9 w-9 md:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}

      <span
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
          bg,
          fg,
        )}
      >
        {initials}
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-ink">
          {conversation.user_name || 'Sem nome'}
        </h3>
        <p className="truncate text-xs text-ink-muted">
          {formatPhoneBR(conversation.telefone_limpo)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {conversation.is_ia_blocked ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-tag-warning-bg px-3 py-1 text-xs font-medium text-tag-warning">
            <User className="h-3 w-3" />
            Humano
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-tag-info-bg px-3 py-1 text-xs font-medium text-tag-info">
            <Bot className="h-3 w-3" />
            IA Rafael
          </span>
        )}
      </div>
    </div>
  );
};
