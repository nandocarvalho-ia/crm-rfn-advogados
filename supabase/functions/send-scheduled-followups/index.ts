import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FollowUpRecord {
  id: string;
  telefone: string;
  nome_lead: string;
  sugestoes_ia: any;
  status_envio: string;
  tentativas_envio: number;
  webhook_n8n_url?: string;
  horario_comercial_inicio: string;
  horario_comercial_fim: string;
  log_envio: any[];
}

interface FollowUpSuggestion {
  ordem: number;
  tempo_espera: string;
  texto: string;
  horario_comercial: boolean;
  data_envio?: string;
  status?: 'pendente' | 'enviado' | 'cancelado';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Iniciando processamento de follow-ups agendados...');

    // Verificar se é horário comercial
    const { data: isBusinessHours, error: businessHourError } = await supabase
      .rpc('is_business_hours');

    if (businessHourError) {
      console.error('Erro ao verificar horário comercial:', businessHourError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Erro ao verificar horário comercial' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!isBusinessHours) {
      console.log('Fora do horário comercial. Saindo sem processar.');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Fora do horário comercial',
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Buscar follow-ups pendentes que já passaram da data de envio
    const { data: followUps, error } = await supabase
      .from('follow_ups_inteligentes')
      .select('*')
      .eq('status_envio', 'pendente')
      .not('sugestoes_ia', 'is', null)
      .lt('updated_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Pelo menos 5 min desde última atualização
      .limit(10); // Processar no máximo 10 por vez

    if (error) {
      console.error('Erro ao buscar follow-ups:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Erro ao buscar follow-ups' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!followUps || followUps.length === 0) {
      console.log('Nenhum follow-up pendente encontrado.');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Nenhum follow-up pendente',
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Encontrados ${followUps.length} follow-ups para processar`);
    
    let processed = 0;
    let errors = 0;

    for (const followUp of followUps as FollowUpRecord[]) {
      try {
        console.log(`Processando follow-up para ${followUp.telefone} (${followUp.nome_lead})`);

        // Verificar se tem sugestões de follow-up
        const sugestoes = followUp.sugestoes_ia?.followups as FollowUpSuggestion[];
        if (!sugestoes || sugestoes.length === 0) {
          console.log(`Sem sugestões para ${followUp.telefone}`);
          continue;
        }

        // Encontrar primeira sugestão pendente que já passou do tempo
        const agora = new Date();
        let mensagemParaEnviar: FollowUpSuggestion | null = null;

        for (const sugestao of sugestoes) {
          if (sugestao.status === 'pendente' && sugestao.data_envio) {
            const dataEnvio = new Date(sugestao.data_envio);
            if (dataEnvio <= agora) {
              mensagemParaEnviar = sugestao;
              break;
            }
          }
        }

        if (!mensagemParaEnviar) {
          console.log(`Nenhuma mensagem pronta para envio para ${followUp.telefone}`);
          continue;
        }

        // URL do webhook N8N (usar o configurado no follow-up ou um padrão)
        const webhookUrl = followUp.webhook_n8n_url || Deno.env.get('N8N_WEBHOOK_URL');
        
        if (!webhookUrl) {
          console.error(`Webhook URL não configurado para ${followUp.telefone}`);
          
          // Registrar erro no log
          const novoLog = [
            ...followUp.log_envio,
            {
              timestamp: new Date().toISOString(),
              ordem: mensagemParaEnviar.ordem,
              erro: 'Webhook URL não configurado',
              status: 'erro'
            }
          ];

          await supabase
            .from('follow_ups_inteligentes')
            .update({
              tentativas_envio: followUp.tentativas_envio + 1,
              log_envio: novoLog,
              updated_at: new Date().toISOString()
            })
            .eq('id', followUp.id);

          errors++;
          continue;
        }

        // Preparar payload para o N8N
        const payload = {
          telefone: followUp.telefone,
          nome_lead: followUp.nome_lead,
          mensagem: mensagemParaEnviar.texto,
          ordem_followup: mensagemParaEnviar.ordem,
          followup_id: followUp.id,
          timestamp: new Date().toISOString()
        };

        console.log(`Enviando para N8N: ${webhookUrl}`);

        // Enviar para o N8N
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const responseText = await webhookResponse.text();
        
        if (webhookResponse.ok) {
          console.log(`Webhook enviado com sucesso para ${followUp.telefone}`);

          // Atualizar status da sugestão para 'enviado'
          const sugestoesAtualizadas = sugestoes.map(s => 
            s.ordem === mensagemParaEnviar!.ordem 
              ? { ...s, status: 'enviado' as const }
              : s
          );

          // Atualizar follow-up no banco
          const novoLog = [
            ...followUp.log_envio,
            {
              timestamp: new Date().toISOString(),
              ordem: mensagemParaEnviar.ordem,
              status: 'enviado',
              webhook_response: responseText,
              tentativa: followUp.tentativas_envio + 1
            }
          ];

          await supabase
            .from('follow_ups_inteligentes')
            .update({
              sugestoes_ia: {
                ...followUp.sugestoes_ia,
                followups: sugestoesAtualizadas
              },
              status_envio: 'enviado',
              data_envio_real: new Date().toISOString(),
              tentativas_envio: followUp.tentativas_envio + 1,
              log_envio: novoLog,
              updated_at: new Date().toISOString()
            })
            .eq('id', followUp.id);

          processed++;
        } else {
          console.error(`Erro no webhook para ${followUp.telefone}:`, responseText);
          
          // Registrar erro no log
          const novoLog = [
            ...followUp.log_envio,
            {
              timestamp: new Date().toISOString(),
              ordem: mensagemParaEnviar.ordem,
              erro: `Webhook falhou: ${webhookResponse.status} - ${responseText}`,
              tentativa: followUp.tentativas_envio + 1,
              status: 'erro'
            }
          ];

          await supabase
            .from('follow_ups_inteligentes')
            .update({
              tentativas_envio: followUp.tentativas_envio + 1,
              log_envio: novoLog,
              updated_at: new Date().toISOString()
            })
            .eq('id', followUp.id);

          errors++;
        }

        // Delay entre envios para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (err) {
        console.error(`Erro ao processar follow-up ${followUp.id}:`, err);
        
        // Registrar erro no log
        const novoLog = [
          ...followUp.log_envio,
          {
            timestamp: new Date().toISOString(),
            erro: err instanceof Error ? err.message : 'Erro desconhecido',
            tentativa: followUp.tentativas_envio + 1,
            status: 'erro'
          }
        ];

        await supabase
          .from('follow_ups_inteligentes')
          .update({
            tentativas_envio: followUp.tentativas_envio + 1,
            log_envio: novoLog,
            updated_at: new Date().toISOString()
          })
          .eq('id', followUp.id);

        errors++;
      }
    }

    console.log(`Processamento concluído. Sucessos: ${processed}, Erros: ${errors}`);

    return new Response(JSON.stringify({
      success: true,
      processed,
      errors,
      message: `${processed} follow-ups enviados, ${errors} erros`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Erro no processamento:', err);
    return new Response(JSON.stringify({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Erro desconhecido' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});