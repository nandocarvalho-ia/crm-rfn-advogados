import { cn } from '@/lib/utils';

export type Platform = 'meta' | 'google' | 'organico' | 'desconhecido';
export type CreativeType = 'cota' | 'lote' | null;

interface PlatformBadgeProps {
  platform: Platform;
  className?: string;
  /** Se true, mostra apenas o ícone (útil em tabelas densas). */
  iconOnly?: boolean;
}

/**
 * Infere plataforma + tipo a partir do campo `campanha` de `leads_roger`.
 * Valores esperados: `meta_cota`, `meta_lote`, `google_cota`, `google_lote`, `organico`, null.
 */
export function parseCampanha(campanha: string | null | undefined): {
  platform: Platform;
  type: CreativeType;
} {
  if (!campanha) return { platform: 'desconhecido', type: null };
  const v = campanha.toLowerCase();
  if (v === 'organico' || v === 'orgânico') return { platform: 'organico', type: null };
  const type: CreativeType = v.includes('cota') ? 'cota' : v.includes('lote') ? 'lote' : null;
  if (v.startsWith('meta')) return { platform: 'meta', type };
  if (v.startsWith('google')) return { platform: 'google', type };
  return { platform: 'desconhecido', type };
}

function MetaLogo({ className }: { className?: string }) {
  // Logo oficial simplificado: símbolo de infinito/duplo-loop azul Meta.
  return (
    <svg
      viewBox="0 0 36 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M5.8 6.5c1.9-2.8 4.3-4.2 6.7-4.2 2.7 0 4.8 1.5 7 4.4l2.1 2.9c2.8 3.8 4.3 5.2 6.1 5.2 2 0 3.3-1.4 3.3-4 0-2.8-1.6-4.4-3.4-4.4-1.4 0-2.6.8-3.9 2.2l-1.7-2.4c1.7-2.1 3.5-3.2 5.8-3.2 3.6 0 6.3 2.7 6.3 7.8 0 4.8-2.4 7.5-6.1 7.5-2.5 0-4.3-1.1-6.5-4L19.3 11c-2.4-3.4-3.9-4.4-5.4-4.4-1.5 0-2.7.9-3.7 2.3-1.2 1.8-1.7 4.3-1.7 6.6 0 2.6 1.1 4 2.9 4 1.7 0 2.8-.8 4.3-2.7l1.5 2.3c-1.9 2.3-3.7 3.3-6 3.3C6.7 22.4 4 19.7 4 14.6c0-3.4.9-6.2 1.8-8.1z"
        fill="currentColor"
      />
    </svg>
  );
}

function GoogleLogo({ className }: { className?: string }) {
  // Logo oficial simplificado: "G" com as 4 cores Google.
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fill="#4285F4"
        d="M23.64 12.2c0-.82-.07-1.62-.21-2.4H12v4.55h6.52c-.28 1.5-1.13 2.77-2.4 3.62v3h3.89c2.28-2.1 3.6-5.2 3.6-8.77z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.92l-3.88-3c-1.08.72-2.46 1.15-4.05 1.15-3.12 0-5.76-2.1-6.7-4.94H1.29v3.1A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.3A7.2 7.2 0 0 1 4.92 12c0-.8.14-1.57.38-2.3V6.6H1.29A12 12 0 0 0 0 12c0 1.94.46 3.77 1.29 5.4l4.01-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.6 4.6 1.8l3.45-3.45C17.95 1.2 15.24 0 12 0A12 12 0 0 0 1.29 6.6L5.3 9.7C6.24 6.85 8.88 4.75 12 4.75z"
      />
    </svg>
  );
}

function OrganicLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 3c4 4 6 7 6 10a6 6 0 0 1-12 0c0-3 2-6 6-10z"
        fill="currentColor"
      />
    </svg>
  );
}

const LABELS: Record<Platform, string> = {
  meta: 'Meta',
  google: 'Google',
  organico: 'Orgânico',
  desconhecido: '—',
};

const STYLES: Record<Platform, string> = {
  meta: 'bg-tag-meta-bg text-tag-meta',
  google: 'bg-tag-google-bg text-tag-google',
  organico: 'bg-tag-organic-bg text-tag-organic',
  desconhecido: 'bg-tag-neutral-bg text-tag-neutral',
};

export function PlatformBadge({ platform, className, iconOnly }: PlatformBadgeProps) {
  const Icon =
    platform === 'meta' ? MetaLogo : platform === 'google' ? GoogleLogo : platform === 'organico' ? OrganicLogo : null;
  const label = LABELS[platform];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
        STYLES[platform],
        iconOnly && 'px-2',
        className,
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {!iconOnly && <span>{label}</span>}
    </span>
  );
}
