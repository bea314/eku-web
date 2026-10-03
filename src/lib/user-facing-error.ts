/**
 * User-facing API errors — never paint Nest/HTTP/Prisma/URLs in the DOM.
 * Technical detail → console only.
 *
 * 400/422: NEVER pass through the raw `message`. Only mapped Spanish copy,
 * otherwise the generic fallback.
 */

const DEFAULT =
  'Algo salió mal. Intentá de nuevo en un momento.';

type ApiErrLike = { name?: string; status?: number; message?: string };

function asApiErr(err: unknown): ApiErrLike | null {
  if (!err || typeof err !== 'object') return null;
  const e = err as ApiErrLike;
  if (e.name === 'ClientApiError' || typeof e.status === 'number') return e;
  return null;
}

/** True if message looks like infra / Nest / stack — never show to users. */
export function looksTechnicalApiMessage(raw: unknown): boolean {
  const msg = String(raw || '');
  if (!msg.trim()) return true;
  const m = msg.toLowerCase();
  return (
    /https?:\/\//i.test(msg) ||
    /localhost/i.test(m) ||
    /\bcors\b/i.test(m) ||
    /\bnest\b/i.test(m) ||
    /\bprisma\b/i.test(m) ||
    /internal server/i.test(m) ||
    /error http\s*\d/i.test(m) ||
    /\bhttp\s*[45]\d\d\b/i.test(m) ||
    /econnrefused|enotfound|etimedout|fetch failed/i.test(m) ||
    /public_api|api_base/i.test(m) ||
    /\/src\/|\/node_modules\//i.test(m) ||
    /\bat\s+\S+\s+\(/i.test(msg) ||
    /stack trace/i.test(m) ||
    /column\s+\w+|relation\s+".+"/i.test(m)
  );
}

/**
 * Map known Nest/class-validator / client copy → short Spanish.
 * Returns null when there is no safe mapping (caller uses fallback).
 */
export function mapApiValidationMessage(raw: unknown): string | null {
  const msg = String(raw || '').trim();
  if (!msg) return null;

  if (
    /email must be an email/i.test(msg) ||
    /must be an email/i.test(msg) ||
    /email must be an? email/i.test(msg)
  ) {
    return 'Revisá el correo, parece que no es válido.';
  }

  if (
    /items\.\d+\.quantity/i.test(msg) ||
    /quantity must not be greater than/i.test(msg) ||
    /must not be greater than\s*10/i.test(msg)
  ) {
    return 'Podés llevar hasta 10 por tipo de entrada.';
  }

  // Already-Spanish Nest max-per-order (and EN → ES).
  const esMax = msg.match(/m[aá]ximo\s+(\d+)\s+por\s+orden(?:\s+para\s+(.+))?/i);
  if (esMax) {
    const n = esMax[1];
    const name = (esMax[2] || '').trim();
    return name ? `Máximo ${n} por orden para ${name}` : `Máximo ${n} por orden`;
  }
  const enMax = msg.match(
    /max(?:imum)?\s+(\d+)\s+(?:tickets?\s+)?(?:per\s+)?order(?:\s+for\s+(.+))?/i,
  );
  if (enMax) {
    const n = enMax[1];
    const name = (enMax[2] || '').trim();
    return name ? `Máximo ${n} por orden para ${name}` : `Máximo ${n} por orden`;
  }

  if (
    /confirm ok pero sin orderid/i.test(msg) ||
    /sin orderid\/tickets/i.test(msg) ||
    /sin orderid/i.test(msg)
  ) {
    return 'No pudimos confirmar tu compra. Intentá de nuevo en un momento.';
  }

  return null;
}

/**
 * Map any thrown client/API error to a short Spanish line for the UI.
 * Never paints raw Nest 400 English / class-validator strings.
 */
export function userFacingApiError(
  err: unknown,
  fallback: string = DEFAULT,
): string {
  console.error('[eku-api]', err);

  const api = asApiErr(err);
  if (api) {
    const status = Number(api.status) || 0;
    const msg = String(api.message || '').trim();

    if (status === 0 || status >= 500) return fallback;
    if (looksTechnicalApiMessage(msg)) return fallback;

    if (status === 401 || status === 403) {
      return 'Tenés que iniciar sesión para continuar.';
    }

    // 400/422/404 and odd 2xx client throws: mapped ES only, else generic.
    const mapped = mapApiValidationMessage(msg);
    if (mapped) return mapped;

    if (status === 400 || status === 422 || status === 404) {
      return fallback;
    }

    // Non-validation statuses: still never leak English Nest copy.
    if (msg && !looksTechnicalApiMessage(msg) && !/[A-Za-z].*\bmust\b|\bgreater than\b/i.test(msg)) {
      // Allow only if it already looks like short Spanish UI copy we control.
      if (/[áéíóúñ¿¡]/i.test(msg) || /^(No pudimos|Tenés|Revisá|Máximo|Podés|Algo salió)/i.test(msg)) {
        return msg;
      }
    }
    return fallback;
  }

  if (err instanceof Error) {
    if (looksTechnicalApiMessage(err.message)) return fallback;
    const mapped = mapApiValidationMessage(err.message);
    if (mapped) return mapped;
  }

  return fallback;
}

export const USER_ERR = {
  tickets: 'No pudimos cargar las entradas. Intentá de nuevo en un momento.',
  events: 'No pudimos cargar los eventos. Intentá de nuevo en un momento.',
  event: 'No pudimos abrir el evento. Intentá de nuevo en un momento.',
  checkout: 'No pudimos completar la compra. Intentá de nuevo en un momento.',
  confirm: 'No pudimos confirmar tu compra. Intentá de nuevo en un momento.',
  waitlist: 'No pudimos unirte a la lista. Intentá de nuevo en un momento.',
  create: 'No pudimos publicar el evento. Revisá los datos e intentá de nuevo.',
  wallet: 'No pudimos cargar tus entradas. Intentá de nuevo en un momento.',
  profile: 'No pudimos cargar tu perfil. Intentá de nuevo en un momento.',
  generic: DEFAULT,
} as const;
