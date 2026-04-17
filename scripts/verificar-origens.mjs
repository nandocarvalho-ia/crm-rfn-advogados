// Read-only. Verifica distribuição REAL de leads_roger.campanha após UPDATE.
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mugrbcstwkkhvpsvuhjp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11Z3JiY3N0d2traHZwc3Z1aGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNDQzNzMsImV4cCI6MjA2NTYyMDM3M30.Pc7pKY_hAgLxh4BzLPmQ_HXSChYmmZD4E9gV56I-Rmg';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function countWhere(filter) {
  let q = supabase.from('leads_roger').select('id', { count: 'exact', head: true }).is('deleted_at', null);
  q = filter(q);
  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
}

async function main() {
  const total = await countWhere((q) => q);
  console.log(`Total de leads ativos: ${total}\n`);

  const values = ['meta_cota', 'meta_lote', 'google_cota', 'google_lote', 'organico'];
  let sum = 0;
  for (const v of values) {
    const n = await countWhere((q) => q.eq('campanha', v));
    sum += n;
    console.log(`  ${v.padEnd(14)} ${String(n).padStart(5)}  (${((n / total) * 100).toFixed(1)}%)`);
  }
  const nulos = await countWhere((q) => q.is('campanha', null));
  console.log(`  (null)         ${String(nulos).padStart(5)}  (${((nulos / total) * 100).toFixed(1)}%)`);
  console.log(`\nSoma classificados: ${sum}`);
  console.log(`Soma total: ${sum + nulos}  (confere com ${total}? ${sum + nulos === total ? 'sim ✓' : 'NÃO ✗'})`);
}

main().catch((e) => {
  console.error('Falha:', e);
  process.exit(1);
});
