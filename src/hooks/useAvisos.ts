import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AvisosData {
  novos: number; // leads criados nas últimas 24h
  aguardando: number; // qualificados com status ≠ convertido parados há mais de 2h
  conversoes: number; // leads convertidos nos últimos 7 dias
}

export function useAvisos() {
  return useQuery<AvisosData>({
    queryKey: ['avisos'],
    queryFn: async () => {
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      const last24h = new Date(now - day).toISOString();
      const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000).toISOString();
      const sevenDaysAgo = new Date(now - 7 * day).toISOString();

      const [novos, aguardando, conversoes] = await Promise.all([
        supabase
          .from('leads_roger')
          .select('id', { count: 'exact', head: true })
          .is('deleted_at', null)
          .gte('created_at', last24h),
        supabase
          .from('leads_roger')
          .select('id', { count: 'exact', head: true })
          .is('deleted_at', null)
          .not('categoria_lead', 'is', null)
          .neq('categoria_lead', 'NÃO CLASSIFICADO')
          .neq('categoria_lead', 'DESQUALIFICADO')
          .neq('status_lead', 'convertido')
          .lte('updated_at', twoHoursAgo),
        supabase
          .from('leads_roger')
          .select('id', { count: 'exact', head: true })
          .is('deleted_at', null)
          .eq('status_lead', 'convertido')
          .gte('data_conversao', sevenDaysAgo),
      ]);

      for (const r of [novos, aguardando, conversoes]) {
        if (r.error) throw r.error;
      }

      return {
        novos: novos.count ?? 0,
        aguardando: aguardando.count ?? 0,
        conversoes: conversoes.count ?? 0,
      };
    },
    staleTime: 60_000,
  });
}
