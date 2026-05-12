/**
 * Extrai uma mensagem legível de qualquer tipo de erro:
 * - PostgrestError do supabase-js (tem .message, .details, .hint, .code)
 * - Error padrão
 * - Strings ou unknowns soltos
 */
export function extractErrorMessage(err: unknown, fallback = 'Erro desconhecido'): string {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message || fallback;
  if (typeof err === 'object') {
    const o = err as { message?: unknown; details?: unknown; hint?: unknown };
    if (typeof o.message === 'string' && o.message.trim()) return o.message;
    if (typeof o.details === 'string' && o.details.trim()) return o.details;
    if (typeof o.hint === 'string' && o.hint.trim()) return o.hint;
  }
  return fallback;
}
