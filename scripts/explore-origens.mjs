// Read-only. Pega 20 leads recentes e imprime 1ª mensagem do lead.
// Uso: node scripts/explore-origens.mjs
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mugrbcstwkkhvpsvuhjp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11Z3JiY3N0d2traHZwc3Z1aGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNDQzNzMsImV4cCI6MjA2NTYyMDM3M30.Pc7pKY_hAgLxh4BzLPmQ_HXSChYmmZD4E9gV56I-Rmg';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const truncate = (s, n = 240) => (s && s.length > n ? s.slice(0, n) + '…' : s || '');

async function countCampanha() {
  const { count: total, error: e1 } = await supabase
    .from('leads_roger')
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null);
  if (e1) throw e1;

  const { count: withCamp, error: e2 } = await supabase
    .from('leads_roger')
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null)
    .not('campanha', 'is', null);
  if (e2) throw e2;

  return { total: total ?? 0, withCamp: withCamp ?? 0, withoutCamp: (total ?? 0) - (withCamp ?? 0) };
}

async function campanhaDistribution() {
  const { data, error } = await supabase
    .from('leads_roger')
    .select('campanha')
    .is('deleted_at', null);
  if (error) throw error;
  const map = new Map();
  for (const r of data || []) {
    const k = r.campanha ?? '(null)';
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

async function sampleLeads(n = 20) {
  const { data, error } = await supabase
    .from('leads_roger')
    .select('id, nome_lead, telefone, phone_last_8, campanha, created_at')
    .is('deleted_at', null)
    .not('phone_last_8', 'is', null)
    .order('created_at', { ascending: false })
    .limit(n);
  if (error) throw error;
  return data || [];
}

async function firstMessageForPhone(phoneLast8) {
  const { data, error } = await supabase
    .from('n8n_chat_histories_roger')
    .select('message, timestamp, session_id')
    .ilike('session_id', `%${phoneLast8}%`)
    .order('timestamp', { ascending: true })
    .limit(5);
  if (error) return { err: error.message };
  const firstHuman = (data || []).find((m) => m.message?.type === 'human');
  return {
    session: firstHuman?.session_id ?? data?.[0]?.session_id ?? null,
    firstHumanContent: firstHuman?.message?.content ?? null,
    firstAny: data?.[0]?.message ?? null,
    rows: data?.length ?? 0,
  };
}

async function main() {
  console.log('== Contagem geral ==');
  const c = await countCampanha();
  console.log(`Total leads ativos: ${c.total}`);
  console.log(`  Com 'campanha' preenchido: ${c.withCamp} (${((c.withCamp / (c.total || 1)) * 100).toFixed(1)}%)`);
  console.log(`  Sem 'campanha':            ${c.withoutCamp} (${((c.withoutCamp / (c.total || 1)) * 100).toFixed(1)}%)`);

  console.log('\n== Distribuição por campanha ==');
  const dist = await campanhaDistribution();
  for (const [k, v] of dist) console.log(`  ${k.padEnd(20)} ${v}`);

  console.log('\n== Amostra de 20 leads recentes + 1ª mensagem ==');
  const leads = await sampleLeads(20);
  for (let i = 0; i < leads.length; i++) {
    const l = leads[i];
    const m = await firstMessageForPhone(l.phone_last_8);
    console.log(`\n[${i + 1}] ${l.nome_lead || 'Sem nome'} · ${l.telefone} · last8=${l.phone_last_8}`);
    console.log(`    campanha: ${l.campanha ?? '(null)'}`);
    console.log(`    criado:   ${l.created_at}`);
    console.log(`    session:  ${m.session ?? '(nenhuma)'}`);
    if (m.err) {
      console.log(`    erro buscando mensagens: ${m.err}`);
    } else if (m.firstHumanContent) {
      console.log(`    1ª msg lead: ${truncate(m.firstHumanContent)}`);
    } else if (m.firstAny) {
      console.log(`    (sem msg 'human' — 1ª de qualquer tipo:) ${truncate(JSON.stringify(m.firstAny))}`);
    } else {
      console.log(`    (sem mensagens no chat)`);
    }
  }
}

main().catch((err) => {
  console.error('Falha:', err);
  process.exit(1);
});
