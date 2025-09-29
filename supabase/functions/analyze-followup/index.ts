import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { telefone, nomeLeads } = await req.json();
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar histórico de conversas
    const { data: historico, error: historicoError } = await supabase
      .from('n8n_chat_histories_roger')
      .select('*')
      .eq('session_id', `${telefone}roger`)
      .order('id', { ascending: false })
      .limit(20);

    if (historicoError) throw historicoError;

    // Buscar dados do lead
    const { data: leadData, error: leadError } = await supabase
      .from('leads_roger')
      .select('*')
      .eq('telefone', telefone)
      .single();

    if (leadError) throw leadError;

    // Buscar configuração de atendimento
    const { data: atendimentoData } = await supabase
      .from('[FLUXO] • IA')
      .select('*')
      .eq('"TELEFONE"', telefone)
      .single();

    // Analisar situação com IA
    const conversaResumo = historico?.slice(0, 10).map(msg => {
      const msgData = msg.message;
      const tipo = msgData.type === 'ai' ? 'IA' : 'Lead';
      return `${tipo}: ${msgData.content}`;
    }).join('\n') || 'Sem histórico disponível';

    const prompt = `
Analise esta conversa de WhatsApp com um lead e determine a situação atual para sugestões de follow-up:

DADOS DO LEAD:
- Nome: ${leadData?.nome_lead || 'Não informado'}
- Status: ${leadData?.status_qualificacao || 'Não informado'}  
- Categoria: ${leadData?.categoria_lead || 'Não informado'}
- Atendimento: ${atendimentoData?.ATENDENTE || 'IA'}

ÚLTIMAS MENSAGENS:
${conversaResumo}

REGRAS DE FOLLOW-UP:
1. Se lead parou de responder: 30min, 24h, 72h (apenas em horário comercial 8h-20h)
2. Se lead disse que vai retornar: 24h, 36h, 72h (apenas em horário comercial)
3. Se lead enviou documentos, foi desqualificado ou atendimento HUMANO: sem follow-up
4. Quando lead responde, zera contagem

Retorne apenas um JSON com:
{
  "situacao": "parou_responder" | "dar_retorno" | "documentos_enviados" | "desqualificado" | "atendimento_humano" | "ativo",
  "followups": [
    {
      "ordem": 1,
      "tempo_espera": "30 minutos",
      "texto": "Mensagem personalizada baseada no contexto",
      "horario_comercial": true
    }
  ],
  "contexto": "Resumo da situação em 1-2 frases"
}
`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Você é um especialista em análise de conversas para follow-up comercial. Responda sempre em JSON válido.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const analise = JSON.parse(aiResponse.choices[0].message.content);

    // Salvar ou atualizar follow-up na base
    const followUpData = {
      telefone,
      nome_lead: leadData?.nome_lead,
      tipo_situacao: analise.situacao,
      contexto_conversa: conversaResumo.slice(0, 1000),
      sugestoes_ia: analise,
      ultima_resposta_lead: new Date().toISOString(),
    };

    const { data: followUpResult, error: followUpError } = await supabase
      .from('follow_ups_inteligentes')
      .upsert(followUpData, { onConflict: 'telefone' })
      .select()
      .single();

    if (followUpError) throw followUpError;

    return new Response(JSON.stringify({
      success: true,
      analise,
      followUpId: followUpResult.id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na análise de follow-up:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});