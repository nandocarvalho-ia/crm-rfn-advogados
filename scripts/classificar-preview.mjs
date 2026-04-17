// Read-only. Classifica TODOS os leads e gera CSV de preview. Não faz UPDATE.
// Uso: node scripts/classificar-preview.mjs
import { createClient } from '@supabase/supabase-js';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SUPABASE_URL = 'https://mugrbcstwkkhvpsvuhjp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11Z3JiY3N0d2traHZwc3Z1aGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNDQzNzMsImV4cCI6MjA2NTYyMDM3M30.Pc7pKY_hAgLxh4BzLPmQ_HXSChYmmZD4E9gV56I-Rmg';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CHUNK = 200;
const OUT_DIR = 'scripts/output';
const OUT_FILE = 'preview-origens.csv';

function normalize(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Regra AGRESSIVA (decisão do Roger):
 *  - (cod.XX) => Meta (cota se 'cotas de resort'; caso contrário lote)
 *  - "tenho interesse ... informacoes" SEM cod => meta_lote (assume Meta com cod removido)
 *  - "atraves do site" + cotas => google_cota; + lote/imovel => google_lote
 *  - Texto vazio => null (mantém)
 *  - Qualquer outro texto não-vazio => organico
 */
function classify(content) {
  if (!content || !content.trim()) return null;
  const t = normalize(content);
  const hasCod = /\(cod\.?\s*\w+\.?\)/i.test(t);

  if (hasCod) {
    if (t.includes('cotas de resort')) return 'meta_cota';
    if (t.includes('tenho interesse')) return 'meta_lote';
    return 'meta_lote';
  }

  if (t.includes('tenho interesse') && t.includes('informac')) {
    return 'meta_lote';
  }

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
      .select('id, nome_lead, telefone, phone_last_8, campanha, created_at')
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
  // em chunks, puxa só mensagens 'human' ordenadas por timestamp
  const firstBySession = new Map();
  for (let i = 0; i < telefones.length; i += CHUNK) {
    const chunk = telefones.slice(i, i + CHUNK);
    const { data, error } = await supabase
      .from('n8n_chat_histories_roger')
      .select('session_id, message, timestamp')
      .in('session_id', chunk)
      .filter('message->>type', 'eq', 'human')
      .order('timestamp', { ascending: true })
      .limit(10000);
    if (error) throw error;
    for (const m of data || []) {
      if (!firstBySession.has(m.session_id)) {
        firstBySession.set(m.session_id, m);
      }
    }
    process.stdout.write(`\r  batch ${i / CHUNK + 1}/${Math.ceil(telefones.length / CHUNK)} — sessions cobertas: ${firstBySession.size}   `);
  }
  process.stdout.write('\n');
  return firstBySession;
}

async function fillFallback(leads, firstBySession) {
  // leads que não acharam via telefone → tenta ilike por phone_last_8
  const missing = leads.filter((l) => !firstBySession.has(String(l.telefone)));
  if (missing.length === 0) return 0;
  console.log(`Fallback ilike: ${missing.length} leads sem match direto, tentando por phone_last_8...`);
  let cobertos = 0;
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
      cobertos++;
    }
    if (i % 50 === 49) process.stdout.write(`\r  fallback ${i + 1}/${missing.length}   `);
  }
  process.stdout.write('\n');
  return cobertos;
}

function csvEscape(v) {
  if (v === null || v === undefined) return '';
  const s = String(v).replace(/"/g, '""');
  return `"${s}"`;
}

async function main() {
  console.log('1) Buscando todos os leads ativos...');
  const leads = await fetchAllLeads();
  console.log(`   ${leads.length} leads ativos.`);

  const telefones = leads.map((l) => String(l.telefone));
  console.log(`2) Buscando primeira mensagem 'human' por session (chunks de ${CHUNK})...`);
  const first = await fetchFirstHumanMessages(telefones);
  console.log(`   cobertura direta: ${first.size}/${leads.length}`);

  const fallback = await fillFallback(leads, first);
  if (fallback > 0) console.log(`   fallback adicionou: ${fallback}`);
  console.log(`   cobertura total: ${first.size}/${leads.length}`);

  console.log('3) Classificando e gerando CSV...');
  mkdirSync(OUT_DIR, { recursive: true });
  const rows = [
    ['id', 'nome_lead', 'telefone', 'campanha_atual', 'classificacao_proposta', 'mudanca', 'primeira_mensagem'].join(','),
  ];

  const totals = new Map();
  const mudancas = new Map(); // de → para
  let semMensagem = 0;
  let conflitos = 0;

  for (const l of leads) {
    const msg = first.get(String(l.telefone));
    const content = msg?.message?.content ?? '';
    const classe = classify(content);

    if (!msg) semMensagem++;

    totals.set(classe ?? '(null)', (totals.get(classe ?? '(null)') ?? 0) + 1);

    const atual = l.campanha ?? null;
    let mudanca = 'nova';
    if (atual === null && classe !== null) mudanca = 'nova';
    else if (atual === null && classe === null) mudanca = 'permanece_null';
    else if (atual !== null && classe === null) mudanca = 'manter_atual_sem_classe';
    else if (atual === classe) mudanca = 'ja_correta';
    else mudanca = 'conflito';
    if (mudanca === 'conflito') conflitos++;

    const contentClean = content.replace(/\n/g, ' ').slice(0, 300);
    rows.push(
      [
        csvEscape(l.id),
        csvEscape(l.nome_lead ?? ''),
        csvEscape(l.telefone),
        csvEscape(atual ?? ''),
        csvEscape(classe ?? ''),
        csvEscape(mudanca),
        csvEscape(contentClean),
      ].join(','),
    );
  }

  const outPath = join(OUT_DIR, OUT_FILE);
  writeFileSync(outPath, '\uFEFF' + rows.join('\n'), 'utf8');
  console.log(`   CSV: ${outPath}  (${rows.length - 1} linhas)`);

  console.log('\n== Totais classificados ==');
  const sortedTotals = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  for (const [k, v] of sortedTotals) {
    const pct = ((v / leads.length) * 100).toFixed(1);
    console.log(`  ${k.padEnd(14)} ${String(v).padStart(5)}  (${pct}%)`);
  }
  console.log(`\nSem mensagem no chat: ${semMensagem}`);
  console.log(`Conflitos (campanha atual ≠ proposta): ${conflitos}`);

  if (conflitos > 0) {
    console.log('\n== Top 20 conflitos ==');
    const conflictRows = [];
    for (const l of leads) {
      const msg = first.get(String(l.telefone));
      const classe = classify(msg?.message?.content ?? '');
      if (l.campanha && classe && l.campanha !== classe) {
        conflictRows.push({ nome: l.nome_lead, telefone: l.telefone, atual: l.campanha, proposta: classe, msg: (msg?.message?.content ?? '').slice(0, 120) });
      }
    }
    for (const c of conflictRows.slice(0, 20)) {
      console.log(`  ${String(c.telefone).padEnd(14)} ${c.atual} → ${c.proposta}  | ${c.nome ?? '?'} | ${c.msg}`);
    }
  }
}

main().catch((e) => {
  console.error('Falha:', e);
  process.exit(1);
});
