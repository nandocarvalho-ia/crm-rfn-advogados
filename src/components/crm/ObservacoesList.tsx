import { useQuery } from '@tanstack/react-query';
import { MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface ObservacoesListProps {
  leadId: string;
}

interface Observacao {
  id: string;
  conteudo: string | null;
  enviada_por: string | null;
  created_at: string;
}

export function ObservacoesList({ leadId }: ObservacoesListProps) {
  const { data: observacoes = [], isLoading } = useQuery<Observacao[]>({
    queryKey: ['lead-observacoes', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interacoes')
        .select('id, conteudo, enviada_por, created_at')
        .eq('lead_id', leadId)
        .eq('tipo', 'nota')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as Observacao[]) ?? [];
    },
    enabled: !!leadId,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (observacoes.length === 0) {
    return (
      <div className="rounded-lg bg-app-bg border border-line-subtle p-4 text-center">
        <MessageCircle className="mx-auto mb-2 h-6 w-6 text-ink-muted" />
        <p className="text-sm text-ink-muted">Nenhuma observação registrada ainda.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
      {observacoes.map((obs) => (
        <li
          key={obs.id}
          className="rounded-lg bg-app-bg border border-line-subtle p-3"
        >
          <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
            {obs.conteudo}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-ink-muted">
            <span>{obs.enviada_por || '—'}</span>
            <span>
              {format(new Date(obs.created_at), "dd/MM/yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
