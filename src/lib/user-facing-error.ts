/**
 * User-facing API errors — never paint Nest/HTTP/Prisma/URLs in the DOM.
 * Technical detail → console only.
 *
 * 400/422: NEVER pass through the raw `message`. Only mapped Spanish copy,
 * otherwise the generic fallback.
 */

const DEFAULT =
  'Algo salió mal. Intentá de nuevo en un momento.';

type ApiErrLike = { name?: string; status?: number; message?: string; body?: unknown };

export type UserFacingOpts = {
  /** Selected ticket type name from client state (never from Nest text). */
  ticketTypeName?: string | null;
};

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
    /column\s+\w+|relation\s+".+"/i.test(m) ||
    /\bapi\b.*\b(tickets|qr|data\.|payload)/i.test(m) ||
    /qrpayloads|data\.items/i.test(m)
  );
}

function positiveInt(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.floor(n);
}

/**
 * Pull max-per-order N from Nest body structure when present, else regex on
 * English/Spanish message text. Never returns type names from the backend.
 */
export function extractMaxPerOrderN(raw: unknown, body?: unknown): number | null {
  const dig = (obj: unknown): number | null => {
    if (!obj || typeof obj !== 'object') return null;
    const o = obj as Record<string, unknown>;
    for (const key of ['maxPerOrder', 'max_per_order', 'max', 'limit']) {
      const n = positiveInt(o[key]);
      if (n != null) return n;
    }
    if (o.meta != null) {
      const nested = dig(o.meta);
      if (nested != null) return nested;
    }
    if (o.data != null) {
      const nested = dig(o.data);
      if (nested != null) return nested;
    }
    return null;
  };

  const fromBody = dig(body);
  if (fromBody != null) return fromBody;

  const msg = String(raw || '').trim();
  if (!msg) return null;

  const patterns = [
    /m[aá]ximo\s+(\d+)\s+por\s+orden/i,
    /must not be greater than\s+(\d+)/i,
    /quantity must not be greater than\s+(\d+)/i,
    /max(?:imum)?\s+(\d+)\s+(?:tickets?\s+)?(?:per\s+)?order/i,
    /greater than\s+(\d+)/i,
  ];
  for (const re of patterns) {
    const m = msg.match(re);
    if (m) {
      const n = positiveInt(m[1]);
      if (n != null) return n;
    }
  }
  return null;
}

function looksLikeMaxPerOrder(raw: unknown): boolean {
  const msg = String(raw || '');
  return (
    /m[aá]ximo(?:\s+\d+)?\s+por\s+orden/i.test(msg) ||
    /must not be greater than/i.test(msg) ||
    /max(?:imum)?(?:\s+\d+)?\s+(?:tickets?\s+)?(?:per\s+)?order/i.test(msg) ||
    (/items\.\d+\.quantity/i.test(msg) && /greater/i.test(msg))
  );
}

function looksLikeQtyZero(raw: unknown): boolean {
  const msg = String(raw || '');
  return (
    /must not be less than\s*1/i.test(msg) ||
    /quantity must not be less than/i.test(msg) ||
    /at least\s*1/i.test(msg) ||
    (/items\.\d+\.quantity/i.test(msg) && /less than/i.test(msg))
  );
}

/** User copy for max-per-order. `typeName` must come from client selection. */
export function formatMaxPerOrderMessage(
  n: number,
  typeName?: string | null,
): string {
  const tipo = String(typeName || '').trim();
  if (tipo) return `Podés llevar hasta ${n} entradas de ${tipo}.`;
  return `Podés llevar hasta ${n} entradas de este tipo.`;
}

/**
 * Map known Nest/class-validator / client copy → short Spanish.
 * Returns null when there is no safe mapping (caller uses fallback).
 * Backend text is never returned.
 */
export function mapApiValidationMessage(
  raw: unknown,
  opts: UserFacingOpts = {},
  body?: unknown,
): string | null {
  const msg = String(raw || '').trim();
  if (!msg) return null;

  if (
    /email must be an email/i.test(msg) ||
    /must be an email/i.test(msg) ||
    /email must be an? email/i.test(msg)
  ) {
    return 'Revisá el correo, parece que no es válido.';
  }

  if (looksLikeQtyZero(msg)) {
    return 'Elegí al menos 1 entrada.';
  }

  if (looksLikeMaxPerOrder(msg) || extractMaxPerOrderN(msg, body) != null) {
    const n = extractMaxPerOrderN(msg, body);
    if (n == null) return USER_ERR.confirm;
    return formatMaxPerOrderMessage(n, opts.ticketTypeName);
  }

  if (
    /confirm ok pero sin orderid/i.test(msg) ||
    /sin orderid\/tickets/i.test(msg) ||
    /sin orderid/i.test(msg) ||
    /no pudimos confirmar tu compra/i.test(msg)
  ) {
    return USER_ERR.confirm;
  }

  if (
    /api no devolvió/i.test(msg) ||
    /qrpayloads/i.test(msg) ||
    /data\.items/i.test(msg) ||
    /sin tickets ni qr/i.test(msg)
  ) {
    return USER_ERR.confirmTickets;
  }

  return null;
}

/**
 * Map any thrown client/API error to a short Spanish line for the UI.
 * Never paints raw Nest 400 English / class-validator / Nest Spanish strings.
 */
export function userFacingApiError(
  err: unknown,
  fallback: string = DEFAULT,
  opts: UserFacingOpts = {},
): string {
  console.error('[eku-api]', err);

  const api = asApiErr(err);
  if (api) {
    const status = Number(api.status) || 0;
    const msg = String(api.message || '').trim();
    const body = api.body;

    if (status === 0 || status >= 500) return fallback;
    if (looksTechnicalApiMessage(msg)) return fallback;

    if (status === 401 || status === 403) {
      return 'Tenés que iniciar sesión para continuar.';
    }

    const mapped = mapApiValidationMessage(msg, opts, body);
    if (mapped) return mapped;

    if (status === 400 || status === 422 || status === 404) {
      return fallback;
    }

    // Never leak Nest copy (EN or ES). Only allow our known UI prefixes.
    if (
      msg &&
      !looksTechnicalApiMessage(msg) &&
      /^(No pudimos|Tenés|Revisá|Podés|Elegí|Algo salió|Tu compra quedó)/i.test(msg)
    ) {
      return msg;
    }
    return fallback;
  }

  if (err instanceof Error) {
    if (looksTechnicalApiMessage(err.message)) return fallback;
    const mapped = mapApiValidationMessage(err.message, opts);
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
  confirmTickets:
    'Tu compra quedó registrada, pero no pudimos mostrar tus entradas. Las vas a encontrar en Mis entradas.',
  waitlist: 'No pudimos unirte a la lista. Intentá de nuevo en un momento.',
  create: 'No pudimos publicar el evento. Revisá los datos e intentá de nuevo.',
  wallet: 'No pudimos cargar tus entradas. Intentá de nuevo en un momento.',
  profile: 'No pudimos cargar tu perfil. Intentá de nuevo en un momento.',
  generic: DEFAULT,
} as const;
