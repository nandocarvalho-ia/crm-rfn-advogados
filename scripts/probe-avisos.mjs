import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mugrbcstwkkhvpsvuhjp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11Z3JiY3N0d2traHZwc3Z1aGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNDQzNzMsImV4cCI6MjA2NTYyMDM3M30.Pc7pKY_hAgLxh4BzLPmQ_HXSChYmmZD4E9gV56I-Rmg';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const now = Date.now();
const day = 24 * 3600_000;
const last24h = new Date(now - day).toISOString();
const twoHoursAgo = new Date(now - 2 * 3600_000).toISOString();
const sevenDaysAgo = new Date(now - 7 * day).toISOString();

console.log('Referências temporais:');
console.log(`  agora          ${new Date(now).toISOString()}`);
console.log(`  last24h        ${last24h}`);
console.log(`  twoHoursAgo    ${twoHoursAgo}`);
console.log(`  sevenDaysAgo   ${sevenDaysAgo}\n`);

const { count: novos, error: e1 } = await supabase
  .from('leads_roger').select('id', { count: 'exact', head: true })
  .is('deleted_at', null).gte('created_at', last24h);
console.log(`Novos 24h: ${novos} ${e1 ? '(ERR: ' + e1.message + ')' : ''}`);

const { count: aguardando, error: e2 } = await supabase
  .from('leads_roger').select('id', { count: 'exact', head: true })
  .is('deleted_at', null)
  .not('categoria_lead', 'is', null)
  .neq('categoria_lead', 'NÃO CLASSIFICADO')
  .neq('categoria_lead', 'DESQUALIFICADO')
  .neq('status_lead', 'convertido')
  .lte('updated_at', twoHoursAgo);
console.log(`Aguardando retorno >2h: ${aguardando} ${e2 ? '(ERR: ' + e2.message + ')' : ''}`);

const { count: conv, error: e3 } = await supabase
  .from('leads_roger').select('id', { count: 'exact', head: true })
  .is('deleted_at', null).eq('status_lead', 'convertido').gte('data_conversao', sevenDaysAgo);
console.log(`Convertidos 7d (via data_conversao): ${conv} ${e3 ? '(ERR: ' + e3.message + ')' : ''}`);

// Sanidade: quantos leads convertidos existem (não importa data)?
const { count: convTotal } = await supabase
  .from('leads_roger').select('id', { count: 'exact', head: true })
  .is('deleted_at', null).eq('status_lead', 'convertido');
console.log(`Convertidos TOTAL: ${convTotal}`);

// E quantos têm data_conversao preenchida?
const { count: convComData } = await supabase
  .from('leads_roger').select('id', { count: 'exact', head: true })
  .is('deleted_at', null).eq('status_lead', 'convertido').not('data_conversao', 'is', null);
console.log(`Convertidos com data_conversao: ${convComData}`);

// Updated_at mais antigo da base?
const { data: oldest } = await supabase
  .from('leads_roger').select('updated_at')
  .is('deleted_at', null).order('updated_at', { ascending: true }).limit(1);
console.log(`\nupdated_at mais antigo: ${oldest?.[0]?.updated_at ?? '—'}`);

// Distribuição categoria_lead
const { data: cats } = await supabase
  .from('leads_roger').select('categoria_lead').is('deleted_at', null).limit(5000);
const map = new Map();
for (const r of cats || []) { const k = r.categoria_lead ?? '(null)'; map.set(k, (map.get(k) ?? 0) + 1); }
console.log('\nDistribuição categoria_lead (amostra 5000):');
for (const [k,v] of [...map.entries()].sort((a,b) => b[1]-a[1])) console.log(`  ${k.padEnd(25)} ${v}`);
