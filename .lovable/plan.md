

## Plano de Ajustes no CRM Dashboard

### Problema 1: Limite de 1.000 leads
O Supabase tem limite padrão de 1.000 rows por query. Com 2.753 leads, estamos perdendo dados.

**Solução:** Em `src/hooks/useLeadsRoger.ts`, implementar paginação para buscar todos os leads usando múltiplas chamadas com `.range()` até esgotar os resultados.

```typescript
// Buscar leads em lotes de 1000
let allLeads: any[] = [];
let from = 0;
const pageSize = 1000;
let hasMore = true;

while (hasMore) {
  const { data, error } = await supabase
    .from('leads_roger')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1);

  if (error) throw error;
  allLeads = [...allLeads, ...(data || [])];
  hasMore = (data?.length || 0) === pageSize;
  from += pageSize;
}
```

---

### Problema 2: Filtro de datas não funciona
O `useMemo` do `filteredLeads` lista `dateFilter` e `customDateRange` nas dependências, mas `getDateFilterRange()` é uma função interna que **não** está memoizada — isso pode causar problemas. Além disso, quando `customDateRange` muda, o `useMemo` pode não recalcular corretamente porque `customDateRange` é um objeto.

**Solução:** Mover `getDateFilterRange` para dentro do `useMemo` ou extrair os valores primitivos como dependências. Também garantir que `customDateRange.from` e `customDateRange.to` estejam nas dependências corretamente.

---

### Problema 3: Coluna "Tipo de Caso" (LOTE/COTA)
Valores no banco: `lote`, `cota`, `lote e cota`, `null`.

**Solução:** Adicionar uma coluna "Tipo" na tabela de leads entre "Lead" e "Estado", exibindo um Badge:
- `lote` → Badge "LOTE"
- `cota` → Badge "COTA" 
- `lote e cota` → Badge "LOTE E COTA"
- `null` → Badge "INDEFINIDO" (cinza)

---

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/hooks/useLeadsRoger.ts` | Paginação para buscar todos os leads (>1000) |
| `src/components/CRMDashboardReal.tsx` | Corrigir filtro de datas; adicionar coluna "Tipo" na tabela |

