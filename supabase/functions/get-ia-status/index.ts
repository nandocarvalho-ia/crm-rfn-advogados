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

    // Buscar todos os status de IA bloqueada
    const { data, error } = await supabase
      .from('ia_bloqueada')
      .select('telefone, ia_bloqueada')

    if (error) {
      console.error('Erro ao buscar status IA:', error)
      throw error
    }

    // Criar mapa de status por telefone
    const statusMap: Record<string, boolean> = {}
    
    if (data) {
      data.forEach((item: any) => {
        statusMap[item.telefone] = item.ia_bloqueada === 'true' || item.ia_bloqueada === true
      })
    }

    return new Response(
      JSON.stringify({ success: true, statusMap }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na função get-ia-status:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})