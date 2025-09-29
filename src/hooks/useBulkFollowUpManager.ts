import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useBulkFollowUpManager = () => {
  const { toast } = useToast();

  const runBulkAnalysis = async (forceUpdate = false) => {
    try {
      toast({
        title: "Iniciando análise em lote",
        description: "Processando leads existentes...",
      });

      const { data, error } = await supabase.functions.invoke('bulk-analyze-followups', {
        body: { forceUpdate }
      });

      if (error) {
        console.error('Erro na análise em lote:', error);
        toast({
          title: "Erro na análise",
          description: error.message || "Falha ao processar leads",
          variant: "destructive",
        });
        return { success: false, error };
      }

      toast({
        title: "Análise concluída",
        description: `${data.processed} leads processados com sucesso. ${data.errors} erros.`,
      });

      return { success: true, data };
    } catch (error) {
      console.error('Erro na análise em lote:', error);
      toast({
        title: "Erro",
        description: "Falha ao conectar com o servidor",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const populateExistingLeads = () => runBulkAnalysis(false);
  const updateAllLeads = () => runBulkAnalysis(true);

  return {
    populateExistingLeads,
    updateAllLeads,
  };
};