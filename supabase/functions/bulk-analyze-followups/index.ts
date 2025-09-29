import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey || !lovableApiKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { forceUpdate = false } = await req.json().catch(() => ({}));

    console.log('Iniciando análise em lote de follow-ups...');

    // Buscar leads que não têm follow-up ou que precisam de atualização
    let query = supabase
      .from('leads_roger')
      .select('telefone, nome_lead');

    if (!forceUpdate) {
      // Buscar apenas leads que não têm follow-up
      const { data: existingFollowUps } = await supabase
        .from('follow_ups_inteligentes')
        .select('telefone');
      
      const existingPhones = existingFollowUps?.map(f => f.telefone) || [];
      
      if (existingPhones.length > 0) {
        query = query.not('telefone', 'in', `(${existingPhones.map(p => `"${p}"`).join(',')})`);
      }
    }

    const { data: leads, error: leadsError } = await query;

    if (leadsError) {
      console.error('Erro ao buscar leads:', leadsError);
      throw leadsError;
    }

    if (!leads || leads.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Nenhum lead para processar',
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processando ${leads.length} leads...`);

    const results = [];
    let processed = 0;
    let errors = 0;

    // Processar leads em lotes para evitar rate limits
    const batchSize = 5;
    for (let i = 0; i < leads.length; i += batchSize) {
      const batch = leads.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (lead) => {
        try {
          // Chamar a função de análise individual
          const { data: result, error } = await supabase.functions.invoke('analyze-followup', {
            body: { 
              telefone: lead.telefone,
              nomeLeads: lead.nome_lead 
            }
          });

          if (error) {
            console.error(`Erro ao analisar lead ${lead.telefone}:`, error);
            errors++;
            return { telefone: lead.telefone, success: false, error: error.message };
          }

          processed++;
          console.log(`Lead ${lead.telefone} processado com sucesso`);
          return { telefone: lead.telefone, success: true, result };
        } catch (error) {
          console.error(`Erro ao processar lead ${lead.telefone}:`, error);
          errors++;
          return { telefone: lead.telefone, success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Aguardar um pouco entre lotes para evitar rate limits
      if (i + batchSize < leads.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Processamento concluído. Sucessos: ${processed}, Erros: ${errors}`);

    return new Response(JSON.stringify({
      success: true,
      message: `Processamento concluído`,
      total: leads.length,
      processed,
      errors,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no processamento em lote:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});