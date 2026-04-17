// Read-only. Amostra 200 leads recentes, extrai 1ª msg do lead e agrega templates.
// Uso: node scripts/explore-padroes.mjs
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mugrbcstwkkhvpsvuhjp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11Z3JiY3N0d2traHZwc3Z1aGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNDQzNzMsImV4cCI6MjA2NTYyMDM3M30.Pc7pKY_hAgLxh4BzLPmQ_HXSChYmmZD4E9gV56I-Rmg';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const LIMIT = 200;

/**
 * Normaliza mensagem pra agrupar templates:
 *  - lowercase, trim
 *  - remove (cod.XX) e variações
 *  - remove acentos
 *  - colapsa whitespace
 */
function normalizeTemplate(s) {
  if (!s) return '';
  let t = s.toLowerCase().trim();
  t = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  t = t.replace(/\(cod\.?\s*\d+\.?\)/gi, '(cod.*)');
  t = t.replace(/\s+/g, ' ');
  return t;
}

async function main() {
  // 1) Busca 200 leads recentes
  const { data: leads, error: le } = await supabase
    .from('leads_roger')
    .select('id, telefone, phone_last_8, campanha, nome_lead, created_at')
    .is('deleted_at', null)
    .not('phone_last_8', 'is', null)
    .order('created_at', { ascending: false })
    .limit(LIMIT);
  if (le) throw le;
  console.log(`Lidos ${leads.length} leads recentes.`);

  // 2) Busca mensagens em lote (.in com telefones como session_id)
  const telefones = leads.map((l) => String(l.telefone));
  const { data: messages, error: me } = await supabase
    .from('n8n_chat_histories_roger')
    .select('session_id, message, timestamp')
    .in('session_id', telefones)
    .order('timestamp', { ascending: true });
  if (me) throw me;
  console.log(`Mensagens recebidas no lote: ${messages.length} (sessions: ${new Set(messages.map((m) => m.session_id)).size})`);

  // 3) Primeira 'human' msg por session
  const firstBySession = new Map();
  for (const m of messages) {
    const t = m?.message?.type;
    if (t === 'human' && !firstBySession.has(m.session_id)) {
      firstBySession.set(m.session_id, m);
    }
  }

  // 4) Fallback: pra leads sem match no .in, tenta .ilike
  const missing = leads.filter((l) => !firstBySession.has(String(l.telefone)));
  let fallbackUsed = 0;
  for (const l of missing) {
    const { data } = await supabase
      .from('n8n_chat_histories_roger')
      .select('session_id, message, timestamp')
      .ilike('session_id', `%${l.phone_last_8}%`)
      .order('timestamp', { ascending: true })
      .limit(5);
    const h = (data || []).find((m) => m?.message?.type === 'human');
    if (h) {
      firstBySession.set(String(l.telefone), h);
      fallbackUsed++;
    }
  }
  if (fallbackUsed > 0) console.log(`Fallback ilike cobriu mais ${fallbackUsed} leads.`);

  // 5) Agrega templates
  const templates = new Map(); // norm → { count, example, leads:[{nome, campanhaAtual, content}] }
  let withMsg = 0;
  let withoutMsg = 0;
  for (const l of leads) {
    const msg = firstBySession.get(String(l.telefone));
    if (!msg) {
      withoutMsg++;
      continue;
    }
    withMsg++;
    const content = msg.message?.content ?? '';
    const norm = normalizeTemplate(content);
    if (!templates.has(norm)) {
      templates.set(norm, { count: 0, example: content, leads: [] });
    }
    const entry = templates.get(norm);
    entry.count++;
    if (entry.leads.length < 3) {
      entry.leads.push({ nome: l.nome_lead, campanhaAtual: l.campanha, content });
    }
  }

  console.log(`\n== Cobertura ==`);
  console.log(`  Com mensagem:    ${withMsg} / ${leads.length}`);
  console.log(`  Sem mensagem:    ${withoutMsg} / ${leads.length}`);

  // 6) Ordena templates por frequência
  const sorted = [...templates.entries()].sort((a, b) => b[1].count - a[1].count);

  console.log(`\n== Templates únicos: ${sorted.length} ==\n`);
  for (const [norm, info] of sorted) {
    console.log(`[${info.count}×] ${norm.length > 180 ? norm.slice(0, 180) + '…' : norm}`);
    // mostra exemplo real (primeiro da lista) com cod original
    if (info.leads[0]) {
      console.log(`       ex: ${info.leads[0].content.length > 180 ? info.leads[0].content.slice(0, 180) + '…' : info.leads[0].content}`);
      const campAtual = info.leads[0].campanhaAtual ?? '(null)';
      console.log(`       primeira ocorrência — campanha atual no banco: ${campAtual}`);
    }
    console.log('');
  }
}

main().catch((err) => {
  console.error('Falha:', err);
  process.exit(1);
});
