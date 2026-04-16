export function initialsFromName(name: string | null | undefined): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_PALETTE: Array<{ bg: string; fg: string }> = [
  { bg: 'bg-tag-info-bg', fg: 'text-tag-info' },
  { bg: 'bg-tag-warning-bg', fg: 'text-tag-warning' },
  { bg: 'bg-tag-success-bg', fg: 'text-tag-success' },
  { bg: 'bg-tag-meta-bg', fg: 'text-tag-meta' },
  { bg: 'bg-tag-google-bg', fg: 'text-tag-google' },
  { bg: 'bg-tag-organic-bg', fg: 'text-tag-organic' },
  { bg: 'bg-brand-light', fg: 'text-brand' },
];

export function avatarColorFromKey(key: string): { bg: string; fg: string } {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
}

/**
 * Rótulo para separador de data: "Hoje", "Ontem" ou "DD/MM/YYYY".
 */
export function formatDayLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) return 'Hoje';
  if (sameDay(date, yesterday)) return 'Ontem';
  return date.toLocaleDateString('pt-BR');
}

export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function formatPhoneBR(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 13) {
    return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
  }
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}
