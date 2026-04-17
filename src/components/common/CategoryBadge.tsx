import { cn } from '@/lib/utils';

export type CategoryGroup = 'sem-classificacao' | 'qualificado' | 'desqualificado';

interface CategoryBadgeProps {
  group: CategoryGroup;
  className?: string;
}

const CATEGORY_MAP: Record<CategoryGroup, { label: string; cls: string }> = {
  'sem-classificacao': {
    label: 'Sem Classificação',
    cls: 'bg-tag-neutral-bg text-tag-neutral',
  },
  qualificado: {
    label: 'Qualificado',
    cls: 'bg-tag-success-bg text-tag-success',
  },
  desqualificado: {
    label: 'Desqualificado',
    cls: 'bg-tag-danger-bg text-tag-danger',
  },
};

/**
 * Agrupa o campo `categoria_lead` (granular no banco) em 3 categorias de UI.
 * Mapeamento idêntico ao da seção 6.2 do guia Fase 2.
 */
export function classifyCategoria(categoria: string | null | undefined): CategoryGroup {
  if (!categoria || categoria === 'NÃO CLASSIFICADO') return 'sem-classificacao';
  if (categoria === 'DESQUALIFICADO') return 'desqualificado';
  return 'qualificado';
}

export function CategoryBadge({ group, className }: CategoryBadgeProps) {
  const entry = CATEGORY_MAP[group];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        entry.cls,
        className,
      )}
    >
      {entry.label}
    </span>
  );
}
