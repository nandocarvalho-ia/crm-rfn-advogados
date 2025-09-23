import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { telefone, nome, block } = await req.json()

    if (!telefone) {
      return new Response(
        JSON.stringify({ error: 'Telefone é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (block) {
      // Bloquear IA - fazer upsert
      const { error } = await supabase
        .from('ia_bloqueada')
        .upsert({
          telefone: telefone,
          nome: nome || '',
          instancia: 'roger',
          ia_bloqueada: 'true',
          chatID: crypto.randomUUID(),
          update_at: new Date().toISOString()
        }, {
          onConflict: 'telefone'
        })

      if (error) {
        console.error('Erro ao bloquear IA:', error)
        throw error
      }

      console.log(`IA bloqueada para ${telefone} (${nome})`)
    } else {
      // Desbloquear IA - UPDATE para 'false'
      const { error } = await supabase
        .from('ia_bloqueada')
        .update({
          ia_bloqueada: 'false',
          update_at: new Date().toISOString()
        })
        .eq('telefone', telefone)

      if (error) {
        console.error('Erro ao desbloquear IA:', error)
        throw error
      }

      console.log(`IA desbloqueada para ${telefone} (${nome})`)
    }

    return new Response(
      JSON.stringify({ success: true, telefone, block }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na função toggle-ia-block:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})