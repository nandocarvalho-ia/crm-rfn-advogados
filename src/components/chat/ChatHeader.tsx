import { ArrowLeft, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Conversation } from '@/hooks/useChatConversations';

interface ChatHeaderProps {
  conversation: Conversation;
  onBack?: () => void;
}

export const ChatHeader = ({ conversation, onBack }: ChatHeaderProps) => {
  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 13) {
      return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
    }
    return phone;
  };

  return (
    <div className="flex items-center gap-3 p-4 border-b bg-card">
      {onBack && (
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{conversation.user_name}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-3 w-3" />
          <span className="truncate">{formatPhone(conversation.telefone_limpo)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {conversation.is_ia_blocked ? (
          <Badge variant="secondary" className="text-xs">
            👤 Humano
          </Badge>
        ) : (
          <Badge variant="default" className="text-xs">
            🤖 IA Rafael
          </Badge>
        )}
        
        {conversation.campanha && (
          <Badge variant="outline" className="text-xs truncate max-w-[120px]">
            {conversation.campanha}
          </Badge>
        )}
      </div>
    </div>
  );
};
