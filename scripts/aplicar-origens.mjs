// WRITE. Aplica classificação de origens em leads_roger.campanha.
// Só atualiza onde campanha IS NULL (jamais sobrescreve). Idempotente.
// Uso: node scripts/aplicar-origens.mjs
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mugrbcstwkkhvpsvuhjp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11Z3JiY3N0d2traHZwc3Z1aGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNDQzNzMsImV4cCI6MjA2NTYyMDM3M30.Pc7pKY_hAgLxh4BzLPmQ_HXSChYmmZD4E9gV56I-Rmg';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const FETCH_CHUNK = 200;
const UPDATE_PARALLEL = 12;

function normalize(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function classify(content) {
  if (!content || !content.trim()) return null;
  const t = normalize(content);
  const hasCod = /\(cod\.?\s*\w+\.?\)/i.test(t);

  if (hasCod) {
    if (t.includes('cotas de resort')) return 'meta_cota';
    if (t.includes('tenho interesse')) return 'meta_lote';
    return 'meta_lote';
  }
  if (t.includes('tenho interesse') && t.includes('informac')) return 'meta_lote';
  if (t.includes('atraves do site')) {
    if (t.includes('cotas') || t.includes('cota ')) return 'google_cota';
    if (t.includes('lote') || t.includes('imovel')) return 'google_lote';
    return 'google_cota';
  }
  return 'organico';
}

async function fetchAllLeads() {
  const all = [];
  let from = 0;
  const page = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('leads_roger')
      .select('id, telefone, phone_last_8, campanha')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(from, from + page - 1);
    if (error) throw error;
    all.push(...(data || []));
    if ((data?.length ?? 0) < page) break;
    from += page;
  }
  return all;
}

async function fetchFirstHumanMessages(telefones) {
  const firstBySession = new Map();
  for (let i = 0; i < telefones.length; i += FETCH_CHUNK) {
    const chunk = telefones.slice(i, i + FETCH_CHUNK);
    const { data, error } = await supabase
      .from('n8n_chat_histories_roger')
      .select('session_id, message, timestamp')
      .in('session_id', chunk)
      .filter('message->>type', 'eq', 'human')
      .order('timestamp', { ascending: true })
      .limit(10000);
    if (error) throw error;
    for (const m of data || []) {
      if (!firstBySession.has(m.session_id)) firstBySession.set(m.session_id, m);
    }
    process.stdout.write(`\r  fetch ${i / FETCH_CHUNK + 1}/${Math.ceil(telefones.length / FETCH_CHUNK)} · cobertos ${firstBySession.size}   `);
  }
  process.stdout.write('\n');
  return firstBySession;
}

async function fillFallback(leads, firstBySession) {
  const missing = leads.filter((l) => !firstBySession.has(String(l.telefone)));
  if (!missing.length) return 0;
  let added = 0;
  for (let i = 0; i < missing.length; i++) {
    const l = missing[i];
    if (!l.phone_last_8) continue;
    const { data } = await supabase
      .from('n8n_chat_histories_roger')
      .select('session_id, message, timestamp')
      .ilike('session_id', `%${l.phone_last_8}%`)
      .filter('message->>type', 'eq', 'human')
      .order('timestamp', { ascending: true })
      .limit(3);
    const h = (data || [])[0];
    if (h) {
      firstBySession.set(String(l.telefone), h);
      added++;
    }
    if (i % 50 === 49) process.stdout.write(`\r  fallback ${i + 1}/${missing.length}   `);
  }
  process.stdout.write('\n');
  return added;
}

async function updateOne(id, campanha) {
  const { error } = await supabase
    .from('leads_roger')
    .update({ campanha })
    .eq('id', id)
    .is('campanha', null); // guard: só escreve se estiver NULL
  return error;
}

async function runUpdates(tasks) {
  const totals = { ok: 0, fail: 0 };
  const errors = [];
  for (let i = 0; i < tasks.length; i += UPDATE_PARALLEL) {
    const batch = tasks.slice(i, i + UPDATE_PARALLEL);
    const results = await Promise.allSettled(batch.map((t) => updateOne(t.id, t.campanha)));
    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      if (r.status === 'fulfilled' && !r.value) totals.ok++;
      else {
        totals.fail++;
        errors.push({ id: batch[j].id, err: r.status === 'rejected' ? r.reason?.message : r.value?.message });
      }
    }
    process.stdout.write(`\r  update ${Math.min(i + UPDATE_PARALLEL, tasks.length)}/${tasks.length} · ok=${totals.ok} fail=${totals.fail}   `);
  }
  process.stdout.write('\n');
  return { totals, errors };
}

async function verify() {
  const { data, error } = await supabase
    .from('leads_roger')
    .select('campanha')
    .is('deleted_at', null);
  if (error) throw error;
  const counts = new Map();
  for (const r of data) {
    const k = r.campanha ?? '(null)';
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

async function main() {
  console.log('1) Fetch leads...');
  const leads = await fetchAllLeads();
  console.log(`   ${leads.length} leads ativos.`);

  console.log(`2) Fetch primeiras mensagens...`);
  const first = await fetchFirstHumanMessages(leads.map((l) => String(l.telefone)));
  const fb = await fillFallback(leads, first);
  console.log(`   cobertura: ${first.size}/${leads.length} (fallback +${fb})`);

  console.log('3) Planejando UPDATEs...');
  const tasks = [];
  const totals = new Map();
  for (const l of leads) {
    const content = first.get(String(l.telefone))?.message?.content ?? '';
    const classe = classify(content);
    if (classe && l.campanha === null) {
      tasks.push({ id: l.id, campanha: classe });
      totals.set(classe, (totals.get(classe) ?? 0) + 1);
    }
  }
  console.log(`   UPDATEs planejados: ${tasks.length}`);
  for (const [k, v] of [...totals.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`     ${k.padEnd(14)} ${v}`);
  }

  if (!tasks.length) {
    console.log('Nada a atualizar. Saindo.');
    return;
  }

  console.log(`\n4) Aplicando (paralelismo=${UPDATE_PARALLEL})...`);
  const { totals: t, errors } = await runUpdates(tasks);
  console.log(`   OK: ${t.ok} · Falhas: ${t.fail}`);
  if (errors.length) {
    console.log('   Primeiras falhas:');
    for (const e of errors.slice(0, 5)) console.log(`     ${e.id}: ${e.err}`);
  }

  console.log('\n5) Verificação pós-UPDATE (distribuição real no banco):');
  const dist = await verify();
  for (const [k, v] of dist) console.log(`   ${k.padEnd(14)} ${v}`);
}

main().catch((e) => {
  console.error('Falha:', e);
  process.exit(1);
});
