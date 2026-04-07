

## Plano: Documentação Interna Completa da Plataforma

### Formato
Documento Markdown (.md) gerado como arquivo em `/mnt/documents/`, cobrindo todas as seções abaixo.

### Conteúdo do Documento

**1. Visão Geral do Sistema**
- Cliente: RFN Advogados
- Instância: `roger` | IA: Rafael
- Stack: React 18 + Vite 5 + TypeScript 5 + Tailwind CSS v3 + shadcn/ui
- Supabase (projeto `mugrbcstwkkhvpsvuhjp`) para banco, auth, edge functions, real-time
- N8N para automação de envio de mensagens via WhatsApp

**2. Arquitetura do App**
- Rotas (`/` = CRM Dashboard, `/chat-ao-vivo` = Chat)
- Estrutura de pastas (pages, components, hooks, integrations, types)
- Diagrama de fluxo de dados

**3. Páginas e Componentes**
- `Index.tsx` → `CRMDashboardReal.tsx` (tabela de leads, KPIs, filtros, modais de detalhes/criação/edição/exclusão, follow-up)
- `ChatAoVivo.tsx` → `ConversationsList`, `ChatArea`, `ChatHeader`, `ChatControls`, `MessageBubble`
- `FollowUpModal.tsx`, `ObservacoesHistory.tsx`

**4. Hooks Customizados**
- `useLeadsRoger` — busca paginada de leads + join com `[FLUXO] • IA` para campo `atendente`, real-time
- `useIABlockControl` — toggle IA/HUMANO, assumir conversa, devolver, enviar mensagem manual via webhook
- `useChatConversations` — lista conversas agrupadas por session_id, real-time
- `useChatMessages` — mensagens de uma conversa específica, real-time
- `useFollowUpManager` — CRUD de follow-ups, análise via edge function
- `useBulkFollowUpManager` — análise em lote de follow-ups

**5. Banco de Dados (Supabase)**
- Tabelas principais: `leads_roger`, `n8n_chat_histories_roger`, `[FLUXO] • IA`, `follow_ups_inteligentes`, `interacoes`
- Schema detalhado de cada tabela com tipos e defaults
- Políticas RLS
- Convenções (telefone numérico, session_id sem sufixo, soft delete com `deleted_at`)

**6. Edge Functions**
- `analyze-followup` — análise individual com IA (Gemini 2.5 Flash via Lovable AI Gateway)
- `bulk-analyze-followups` — processamento em lote
- `send-scheduled-followups` — envio automático respeitando horário comercial

**7. Integrações Externas**
- Webhook N8N: `https://n8n-n8n.nnes2l.easypanel.host/webhook/chatroger`
- Lovable AI Gateway: `https://ai.gateway.lovable.dev/v1/chat/completions` (modelo `google/gemini-2.5-flash`)
- Supabase URL e anon key

**8. Fluxos Críticos**
- Fluxo de qualificação de lead (categorias, scores, status)
- Fluxo de chat (assumir/devolver conversa, enviar mensagem manual)
- Fluxo de follow-up (análise IA → agendamento → envio)
- Fluxo de controle IA (tabela `[FLUXO] • IA`, campo `ATENDENTE`)

**9. Convenções e Regras**
- Formato de telefone (numérico com DDI 55)
- Detecção de estado por DDD (`getEstadoFromTelefone`)
- Tipo de mensagem: `human` = lead, `ai` = sistema/IA
- Paginação de queries (lotes de 1000)
- Timezone: America/Sao_Paulo

**10. Pontos de Atenção para Desenvolvimento**
- Tabela `[FLUXO] • IA` com caracteres especiais — sempre usar aspas
- Campo `ATENDENTE` case-sensitive (`IA` ou `HUMANO`)
- Soft delete em leads (filtrar `deleted_at IS NULL`)
- Real-time requer `REPLICA IDENTITY FULL`
- Limite de 1000 rows do Supabase — usar paginação

### Execução
1. Gerar o documento Markdown completo com todas as informações acima
2. Salvar em `/mnt/documents/documentacao_plataforma_rfn.md`

