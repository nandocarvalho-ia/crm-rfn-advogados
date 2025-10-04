import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageCircle } from 'lucide-react';

interface ObservacoesHistoryProps {
  leadId: string;
}

export const ObservacoesHistory = ({ leadId }: ObservacoesHistoryProps) => {
  const { data: observacoes, isLoading } = useQuery({
    queryKey: ['lead-observacoes', leadId],
    queryFn: async () => {
      const { data } = await supabase
        .from('interacoes')
        .select('*')
        .eq('lead_id', leadId)
        .eq('tipo', 'nota')
        .order('created_at', { ascending: false });
      return data;
    },
    enabled: !!leadId,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 bg-slate-700" />
        <Skeleton className="h-20 w-full bg-slate-700" />
      </div>
    );
  }

  if (!observacoes || observacoes.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-lg p-4 text-center">
        <MessageCircle className="h-8 w-8 text-slate-600 mx-auto mb-2" />
        <p className="text-slate-400 text-sm">Nenhuma observação registrada ainda</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-300">Histórico de Observações</h4>
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {observacoes.map((obs) => (
          <div key={obs.id} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <p className="text-slate-100 text-sm leading-relaxed mb-2">{obs.conteudo}</p>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{obs.enviada_por}</span>
              <span>
                {formatDate(new Date(obs.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
