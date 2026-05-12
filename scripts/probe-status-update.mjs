// Read-mostly probe: tenta UPDATE proposta_enviada e captura o erro real.
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mugrbcstwkkhvpsvuhjp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11Z3JiY3N0d2traHZwc3Z1aGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNDQzNzMsImV4cCI6MjA2NTYyMDM3M30.Pc7pKY_hAgLxh4BzLPmQ_HXSChYmmZD4E9gV56I-Rmg';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Pega um lead 'conversando' para testar
const { data: leads } = await supabase
  .from('leads_roger')
  .select('id, status_lead, nome_lead')
  .is('deleted_at', null)
  .eq('status_lead', 'conversando')
  .limit(1);

if (!leads?.length) {
  console.log('Nenhum lead com status=conversando para testar.');
  process.exit(0);
}

const target = leads[0];
console.log(`Lead alvo: ${target.id} (${target.nome_lead}) — status atual: ${target.status_lead}\n`);

// Tenta UPDATE para proposta_enviada
const { error: updErr, data: updData, status, statusText } = await supabase
  .from('leads_roger')
  .update({ status_lead: 'proposta_enviada' })
  .eq('id', target.id)
  .select();

console.log('UPDATE proposta_enviada:');
console.log(`  HTTP: ${status} ${statusText}`);
if (updErr) {
  console.log('  ERROR FIELDS:');
  console.log(`    message: ${updErr.message}`);
  console.log(`    details: ${updErr.details}`);
  console.log(`    hint:    ${updErr.hint}`);
  console.log(`    code:    ${updErr.code}`);
} else {
  console.log(`  OK — afetou ${updData?.length ?? 0} linhas`);
  console.log('  REVERTENDO para conversando...');
  const { error: revErr } = await supabase
    .from('leads_roger')
    .update({ status_lead: 'conversando' })
    .eq('id', target.id);
  console.log(`  Revert: ${revErr ? 'FALHOU: ' + revErr.message : 'OK'}`);
}
