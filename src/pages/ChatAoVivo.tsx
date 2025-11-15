import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useChatConversations } from '@/hooks/useChatConversations';
import { useIsMobile } from '@/hooks/use-mobile';
import { ConversationsList } from '@/components/chat/ConversationsList';
import { ChatArea } from '@/components/chat/ChatArea';
import { MessageSquare, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ChatAoVivo = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { conversations, loading, error } = useChatConversations();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filterByPhone, setFilterByPhone] = useState('');
  const [filterByName, setFilterByName] = useState('');
  const [filterByCampaign, setFilterByCampaign] = useState('all');
  const [filterByIAStatus, setFilterByIAStatus] = useState('all');

  // Normalização de texto
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const normalizePhone = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  // Aplicar filtros
  const filteredConversations = conversations.filter(conv => {
    if (filterByName && !normalizeText(conv.user_name || '').includes(normalizeText(filterByName))) {
      return false;
    }
    if (filterByPhone && !normalizePhone(conv.telefone_limpo).includes(normalizePhone(filterByPhone))) {
      return false;
    }
    if (filterByCampaign && filterByCampaign !== 'all' && conv.campanha !== filterByCampaign) {
      return false;
    }
    if (filterByIAStatus === 'ia' && conv.is_ia_blocked) {
      return false;
    }
    if (filterByIAStatus === 'humano' && !conv.is_ia_blocked) {
      return false;
    }
    if (searchQuery && !normalizeText(conv.user_name || '').includes(normalizeText(searchQuery))) {
      return false;
    }
    return true;
  });

  // URL param handling
  useEffect(() => {
    const sessionParam = searchParams.get('session');
    if (sessionParam) {
      setSelectedConversationId(sessionParam);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const selectedConversation = conversations.find(c => c.session_id === selectedConversationId);

  const showSidebar = isMobile ? !selectedConversationId : true;
  const showChat = isMobile ? !!selectedConversationId : true;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      {showSidebar && (
        <div className={cn(
          'border-r bg-card flex flex-col',
          isMobile ? 'w-full' : 'w-96'
        )}>
          {/* Header */}
          <div className="p-4 border-b">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat ao Vivo - RFN Advogados
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredConversations.length} {filteredConversations.length === 1 ? 'conversa' : 'conversas'}
            </p>
          </div>

          {/* Filtros */}
          <div className="p-4 space-y-2 border-b">
            <Input
              placeholder="Buscar por nome..."
              value={filterByName}
              onChange={(e) => setFilterByName(e.target.value)}
            />
            <Input
              placeholder="Buscar por telefone..."
              value={filterByPhone}
              onChange={(e) => setFilterByPhone(e.target.value)}
            />

            <Select value={filterByIAStatus} onValueChange={setFilterByIAStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ia">🤖 IA Rafael</SelectItem>
                <SelectItem value="humano">👤 Humano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de conversas */}
          <ConversationsList
            conversations={filteredConversations}
            selectedId={selectedConversationId}
            onSelect={(conv) => setSelectedConversationId(conv.session_id)}
          />
        </div>
      )}

      {/* Chat Area */}
      {showChat && (
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <ChatArea
              conversation={selectedConversation}
              onBack={isMobile ? () => setSelectedConversationId(null) : undefined}
            />
          ) : (
            !isMobile && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Selecione uma conversa</p>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

// Adicionar cn helper se não existir
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

export default ChatAoVivo;
