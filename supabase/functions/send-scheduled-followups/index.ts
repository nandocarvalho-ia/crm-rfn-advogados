import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FollowUpSuggestion {
  texto: string;
  data_envio?: string;
  status?: 'pendente' | 'enviado' | 'cancelado' | 'erro';
  horario_comercial?: boolean;
  tentativa?: number;
}

interface FollowUpRecord {
  id: string;
  telefone: string;
  nome_lead: string;
  proximo_followup_1?: FollowUpSuggestion | null;
  proximo_followup_2?: FollowUpSuggestion | null;
  proximo_followup_3?: FollowUpSuggestion | null;
  status_envio: string;
  tentativas_envio: number;
  webhook_n8n_url?: string;
  horario_comercial_inicio: string;
  horario_comercial_fim: string;
  log_envio: any[];
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

    // Buscar follow-ups pendentes
    const { data: followUps, error } = await supabase
      .from('follow_ups_inteligentes')
      .select('*')
      .eq('status', 'ativo')
      .in('status_envio', ['pendente', 'erro'])
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

        // Determinar qual follow-up enviar (1, 2 ou 3)
        const agora = new Date();
        let mensagemParaEnviar: FollowUpSuggestion | null = null;
        let numeroFollowUp = 0;

        // Verificar follow-up 1
        if (followUp.proximo_followup_1?.status === 'pendente' && 
            followUp.proximo_followup_1?.data_envio &&
            new Date(followUp.proximo_followup_1.data_envio) <= agora) {
          mensagemParaEnviar = followUp.proximo_followup_1;
          numeroFollowUp = 1;
        }
        // Verificar follow-up 2 (só se 1 foi enviado)
        else if (followUp.proximo_followup_2?.status === 'pendente' && 
                 followUp.proximo_followup_2?.data_envio &&
                 new Date(followUp.proximo_followup_2.data_envio) <= agora) {
          mensagemParaEnviar = followUp.proximo_followup_2;
          numeroFollowUp = 2;
        }
        // Verificar follow-up 3 (só se 2 foi enviado)
        else if (followUp.proximo_followup_3?.status === 'pendente' && 
                 followUp.proximo_followup_3?.data_envio &&
                 new Date(followUp.proximo_followup_3.data_envio) <= agora) {
          mensagemParaEnviar = followUp.proximo_followup_3;
          numeroFollowUp = 3;
        }

        if (!mensagemParaEnviar) {
          console.log(`Nenhuma mensagem pronta para envio para ${followUp.telefone}`);
          continue;
        }

        console.log(`Enviando follow-up ${numeroFollowUp}`);

        // URL do webhook N8N (usar o configurado no follow-up ou um padrão)
        const webhookUrl = followUp.webhook_n8n_url || Deno.env.get('N8N_WEBHOOK_URL');
        
        if (!webhookUrl) {
          console.error(`Webhook URL não configurado para ${followUp.telefone}`);
          
          // Registrar erro no log
          const novoLog = [
            ...followUp.log_envio,
            {
              timestamp: new Date().toISOString(),
              numero_followup: numeroFollowUp,
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
          numero_followup: numeroFollowUp,
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

          // Preparar update do campo específico
          const updateData: any = {
            data_envio_real: new Date().toISOString(),
            tentativas_envio: followUp.tentativas_envio + 1,
            log_envio: [
              ...followUp.log_envio,
              {
                timestamp: new Date().toISOString(),
                numero_followup: numeroFollowUp,
                status: 'enviado',
                webhook_response: responseText,
                tentativa: followUp.tentativas_envio + 1
              }
            ],
            updated_at: new Date().toISOString()
          };

          // Atualizar o campo específico do follow-up
          const fieldName = `proximo_followup_${numeroFollowUp}`;
          updateData[fieldName] = {
            ...mensagemParaEnviar,
            status: 'enviado',
            tentativa: (mensagemParaEnviar.tentativa || 0) + 1
          };

          // Verificar se todos foram enviados
          const f1Status = numeroFollowUp === 1 ? 'enviado' : (followUp.proximo_followup_1?.status || null);
          const f2Status = numeroFollowUp === 2 ? 'enviado' : (followUp.proximo_followup_2?.status || null);
          const f3Status = numeroFollowUp === 3 ? 'enviado' : (followUp.proximo_followup_3?.status || null);

          const allSent = 
            (!followUp.proximo_followup_1 || f1Status === 'enviado') &&
            (!followUp.proximo_followup_2 || f2Status === 'enviado') &&
            (!followUp.proximo_followup_3 || f3Status === 'enviado');

          updateData.status_envio = allSent ? 'finalizado' : 'enviado';

          await supabase
            .from('follow_ups_inteligentes')
            .update(updateData)
            .eq('id', followUp.id);

          processed++;
        } else {
          console.error(`Erro no webhook para ${followUp.telefone}:`, responseText);
          
          // Registrar erro no log
          const novoLog = [
            ...followUp.log_envio,
            {
              timestamp: new Date().toISOString(),
              numero_followup: numeroFollowUp,
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