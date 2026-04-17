import { cn } from '@/lib/utils';

export type LeadStatus = 'novo' | 'conversando' | 'convertido' | null | undefined;

interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  novo: {
    label: 'Novo',
    cls: 'bg-tag-info-bg text-tag-info',
  },
  conversando: {
    label: 'Conversando',
    cls: 'bg-tag-warning-bg text-tag-warning',
  },
  convertido: {
    label: 'Convertido',
    cls: 'bg-tag-success-bg text-tag-success',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const key = (status || '').toLowerCase();
  const entry = STATUS_MAP[key] ?? {
    label: 'Sem status',
    cls: 'bg-tag-neutral-bg text-tag-neutral',
  };

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
