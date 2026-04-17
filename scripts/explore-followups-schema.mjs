// Read-only. Investiga follow_ups_inteligentes + campos de follow-up em leads_roger.
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mugrbcstwkkhvpsvuhjp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11Z3JiY3N0d2traHZwc3Z1aGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNDQzNzMsImV4cCI6MjA2NTYyMDM3M30.Pc7pKY_hAgLxh4BzLPmQ_HXSChYmmZD4E9gV56I-Rmg';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('== 1) follow_ups_inteligentes — contagem e amostra ==');
  const { count: total } = await supabase
    .from('follow_ups_inteligentes')
    .select('id', { count: 'exact', head: true });
  console.log(`  total de linhas: ${total}`);

  const { count: scheduled } = await supabase
    .from('follow_ups_inteligentes')
    .select('id', { count: 'exact', head: true })
    .not('proximo_followup_1', 'is', null);
  console.log(`  com proximo_followup_1: ${scheduled}`);

  const { count: sched2 } = await supabase
    .from('follow_ups_inteligentes')
    .select('id', { count: 'exact', head: true })
    .not('proximo_followup_2', 'is', null);
  console.log(`  com proximo_followup_2: ${sched2}`);

  const { data: sample } = await supabase
    .from('follow_ups_inteligentes')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(5);
  console.log(`\n-- Amostra de 5 registros mais recentes --`);
  for (const r of sample || []) {
    console.log(`\n  id: ${r.id}`);
    console.log(`  telefone: ${r.telefone}`);
    console.log(`  nome_lead: ${r.nome_lead}`);
    console.log(`  status: ${r.status}`);
    console.log(`  status_envio: ${r.status_envio}`);
    console.log(`  tentativas_envio: ${r.tentativas_envio}`);
    console.log(`  tipo_situacao: ${r.tipo_situacao}`);
    console.log(`  proximo_followup_1: ${JSON.stringify(r.proximo_followup_1)}`);
    console.log(`  proximo_followup_2: ${JSON.stringify(r.proximo_followup_2)}`);
    console.log(`  proximo_followup_3: ${JSON.stringify(r.proximo_followup_3)}`);
    console.log(`  data_envio_real: ${r.data_envio_real}`);
    console.log(`  ultima_resposta_lead: ${r.ultima_resposta_lead}`);
    console.log(`  updated_at: ${r.updated_at}`);
  }

  console.log('\n== 2) Valores distintos em status / status_envio / tipo_situacao ==');
  for (const col of ['status', 'status_envio', 'tipo_situacao']) {
    const { data } = await supabase.from('follow_ups_inteligentes').select(col).limit(2000);
    const vals = new Map();
    for (const r of data || []) {
      const k = r[col] ?? '(null)';
      vals.set(k, (vals.get(k) ?? 0) + 1);
    }
    console.log(`\n  ${col}:`);
    for (const [k, v] of [...vals.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`    ${k.padEnd(25)} ${v}`);
    }
  }

  console.log('\n== 3) leads_roger — quantos têm followup_1/2/3 preenchido ==');
  for (const col of ['followup_1', 'followup_2', 'followup_3']) {
    const { count } = await supabase
      .from('leads_roger')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null)
      .not(col, 'is', null);
    console.log(`  ${col}: ${count}`);
  }

  const { count: withLast } = await supabase
    .from('leads_roger')
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null)
    .not('last_interaction', 'is', null);
  console.log(`  last_interaction preenchido: ${withLast}`);

  console.log('\n== 4) Join: leads com follow-up agendado futuro em follow_ups_inteligentes ==');
  const { data: future } = await supabase
    .from('follow_ups_inteligentes')
    .select('telefone, proximo_followup_1, proximo_followup_2, tentativas_envio, status_envio')
    .or('proximo_followup_1.not.is.null,proximo_followup_2.not.is.null')
    .limit(20);
  console.log(`  amostra: ${future?.length ?? 0} registros`);
  for (const r of future || []) {
    console.log(`    ${r.telefone} tentativas=${r.tentativas_envio} status=${r.status_envio}`);
    console.log(`       next1: ${JSON.stringify(r.proximo_followup_1)}`);
    console.log(`       next2: ${JSON.stringify(r.proximo_followup_2)}`);
  }
}

main().catch((e) => {
  console.error('Falha:', e);
  process.exit(1);
});
