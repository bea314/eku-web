/**
 * User-facing API errors — never paint Nest/HTTP/Prisma/URLs in the DOM.
 * Technical detail → console only.
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
 * Map any thrown client/API error to a short Spanish line for the UI.
 * Keeps clean 400 validation copy (e.g. máx. por orden, email) when present.
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
    if (status === 404) {
      return msg && !looksTechnicalApiMessage(msg) ? msg : fallback;
    }

    if ((status === 400 || status === 422) && msg) return msg;

    if (msg) return msg;
    return fallback;
  }

  if (err instanceof Error) {
    if (looksTechnicalApiMessage(err.message)) return fallback;
    const msg = err.message.trim();
    if (msg) return msg;
  }

  return fallback;
}

export const USER_ERR = {
  tickets: 'No pudimos cargar las entradas. Intentá de nuevo en un momento.',
  events: 'No pudimos cargar los eventos. Intentá de nuevo en un momento.',
  event: 'No pudimos abrir el evento. Intentá de nuevo en un momento.',
  checkout: 'No pudimos completar la compra. Intentá de nuevo en un momento.',
  waitlist: 'No pudimos unirte a la lista. Intentá de nuevo en un momento.',
  create: 'No pudimos publicar el evento. Revisá los datos e intentá de nuevo.',
  wallet: 'No pudimos cargar tus entradas. Intentá de nuevo en un momento.',
  generic: DEFAULT,
} as const;
