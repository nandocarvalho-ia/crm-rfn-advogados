import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, Loader2, Search } from 'lucide-react';
import { useChatConversations } from '@/hooks/useChatConversations';
import { useIsMobile } from '@/hooks/use-mobile';
import { ConversationsList } from '@/components/chat/ConversationsList';
import { ChatArea } from '@/components/chat/ChatArea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const ChatAoVivo = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { conversations, loading, error, refetch } = useChatConversations();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const [search, setSearch] = useState('');
  const [filterByIAStatus, setFilterByIAStatus] = useState('all');

  const normalizeText = (t: string) =>
    t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const normalizePhone = (p: string) => p.replace(/\D/g, '');

  const filteredConversations = conversations.filter((conv) => {
    if (search) {
      const rawDigits = normalizePhone(search);
      const looksLikePhone = rawDigits.length >= 3 && rawDigits.length === search.replace(/\s|-|\(|\)/g, '').length;
      const matchPhone = looksLikePhone
        ? normalizePhone(conv.telefone_limpo).includes(rawDigits)
        : false;

      // Nome: a partir de 3 caracteres, prefixo em qualquer token (nome ou sobrenome).
      const q = normalizeText(search).trim();
      let matchName = false;
      if (q.length >= 3) {
        const tokens = normalizeText(conv.user_name || '').split(/\s+/).filter(Boolean);
        matchName = tokens.some((t) => t.startsWith(q));
      }

      if (!matchName && !matchPhone) return false;
    }
    if (filterByIAStatus === 'ia' && conv.is_ia_blocked) return false;
    if (filterByIAStatus === 'humano' && !conv.is_ia_blocked) return false;
    return true;
  });

  useEffect(() => {
    const sessionParam = searchParams.get('session');
    if (sessionParam) {
      setSelectedConversationId(sessionParam);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const selectedConversation = conversations.find((c) => c.session_id === selectedConversationId);
  const showSidebar = isMobile ? !selectedConversationId : true;
  const showChat = isMobile ? !!selectedConversationId : true;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-app-bg">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-app-bg">
        <p className="text-tag-danger">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-app-bg">
      {/* Lista de conversas */}
      {showSidebar && (
        <div
          className={cn(
            'flex flex-col border-r border-line bg-app-card',
            isMobile ? 'w-full' : 'w-[380px] shrink-0',
          )}
        >
          <div className="border-b border-line px-4 py-3">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
              <MessageSquare className="h-4 w-4 text-brand" />
              Conversas
              <span className="ml-auto text-xs font-normal text-ink-muted">
                {filteredConversations.length}
              </span>
            </h2>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <Input
                placeholder="Buscar por nome ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 bg-app-bg border-line text-sm"
              />
            </div>

            <Select value={filterByIAStatus} onValueChange={setFilterByIAStatus}>
              <SelectTrigger className="mt-2 h-9 bg-app-bg border-line text-sm">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ia">🤖 IA Rafael</SelectItem>
                <SelectItem value="humano">👤 Humano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ConversationsList
            conversations={filteredConversations}
            selectedId={selectedConversationId}
            onSelect={(conv) => setSelectedConversationId(conv.session_id)}
          />
        </div>
      )}

      {/* Área da mensagem */}
      {showChat && (
        <div className="flex-1 min-w-0 flex flex-col">
          {selectedConversation ? (
            <ChatArea
              conversation={selectedConversation}
              onBack={isMobile ? () => setSelectedConversationId(null) : undefined}
              onControlChange={refetch}
            />
          ) : (
            !isMobile && (
              <div className="flex h-full items-center justify-center text-ink-muted">
                <div className="text-center">
                  <MessageSquare className="mx-auto mb-3 h-12 w-12 opacity-50" />
                  <p className="text-sm">Selecione uma conversa para começar.</p>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default ChatAoVivo;
