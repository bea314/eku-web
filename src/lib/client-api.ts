/** Browser API client — Crop Nest contracts (so-microservicio web MVP PR). */

export function getPublicApiBase(): string {
  const el = document.querySelector<HTMLMetaElement>('meta[name="eku-api-base"]');
  return (el?.content || '').replace(/\/+$/, '');
}

export class ClientApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'ClientApiError';
    this.status = status;
    this.body = body;
  }
}

function formatMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return fallback;
  const b = body as { message?: string | string[]; error?: string };
  if (Array.isArray(b.message)) return b.message.join(' · ');
  if (typeof b.message === 'string' && b.message.trim()) return b.message;
  if (typeof b.error === 'string' && b.error.trim()) return b.error;
  return fallback;
}

/** Unwrap `{ code, message, data: { items } }` → items (Crop). */
export function unwrapEnvelope<T>(parsed: unknown): T {
  if (!parsed || typeof parsed !== 'object') return parsed as T;
  const env = parsed as { data?: { items?: T } | T };
  if (env.data != null && typeof env.data === 'object') {
    if (
      'items' in (env.data as object) &&
      (env.data as { items?: T }).items !== undefined
    ) {
      return (env.data as { items: T }).items;
    }
    return env.data as T;
  }
  return parsed as T;
}

export async function clientApi<T>(
  path: string,
  options: {
    method?: string;
    token?: string | null;
    body?: unknown;
    searchParams?: Record<string, string | undefined | null>;
    raw?: boolean;
  } = {},
): Promise<T> {
  const base = getPublicApiBase();
  if (!base) {
    throw new ClientApiError(
      'Falta PUBLIC_API_BASE_URL (ej. http://localhost:3000/api). Copia .env.example → .env y reinicia `astro dev`.',
      0,
    );
  }

  let normalized = path.startsWith('/') ? path : `/${path}`;
  if (base.endsWith('/api') && normalized.startsWith('/api/')) {
    normalized = normalized.slice(4);
  }
  let url = `${base}${normalized}`;

  if (options.searchParams) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(options.searchParams)) {
      if (v != null && v !== '') qs.set(k, v);
    }
    const s = qs.toString();
    if (s) url += `?${s}`;
  }

  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.token) {
    headers.Authorization = `Bearer ${normalizeJwt(options.token)}`;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch (err) {
    throw new ClientApiError(
      `No se pudo conectar a Nest en ${base}. ¿Está corriendo en :3000? ¿CORS para :4321? (${err instanceof Error ? err.message : 'red'})`,
      0,
      err,
    );
  }

  const text = await res.text();
  let parsed: unknown;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!res.ok) {
    throw new ClientApiError(
      formatMessage(parsed, `Error HTTP ${res.status}`),
      res.status,
      parsed,
    );
  }

  if (options.raw) return parsed as T;
  return unwrapEnvelope<T>(parsed);
}

export const AUTH_KEY = 'eku_org_token';
const GUEST_SESSION_KEY = 'eku_guest_session_id';

/** Strip accidental `Bearer ` prefix — store/send raw JWT only. */
export function normalizeJwt(token: string): string {
  const t = String(token || '').trim();
  if (!t) return '';
  return t.replace(/^Bearer\s+/i, '').trim();
}

/**
 * Pull accessToken from Nest sign-in unwrap (`data.items`).
 * Accepts accessToken / access_token / token, or a one-item array.
 */
export function extractAccessToken(payload: unknown): string {
  if (payload == null) return '';
  if (typeof payload === 'string') return normalizeJwt(payload);
  if (Array.isArray(payload)) {
    for (const entry of payload) {
      const found = extractAccessToken(entry);
      if (found) return found;
    }
    return '';
  }
  if (typeof payload === 'object') {
    const o = payload as Record<string, unknown>;
    for (const key of ['accessToken', 'access_token', 'token'] as const) {
      const v = o[key];
      if (typeof v === 'string' && v.trim()) return normalizeJwt(v);
    }
    if ('items' in o) return extractAccessToken(o.items);
    if ('data' in o) return extractAccessToken(o.data);
  }
  return '';
}

export function getStoredToken(): string {
  try {
    return normalizeJwt(localStorage.getItem(AUTH_KEY) || '');
  } catch {
    return '';
  }
}

export function setStoredToken(token: string) {
  const jwt = normalizeJwt(token);
  if (!jwt) {
    localStorage.removeItem(AUTH_KEY);
    return;
  }
  localStorage.setItem(AUTH_KEY, jwt);
}

export function clearStoredToken() {
  localStorage.removeItem(AUTH_KEY);
}

/** Stable guest session id for Nest checkout guest.guestSessionId */
export function getOrCreateGuestSessionId(): string {
  try {
    const existing = sessionStorage.getItem(GUEST_SESSION_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? `astro-${crypto.randomUUID()}`
        : `astro-sess-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(GUEST_SESSION_KEY, id);
    return id;
  } catch {
    return `astro-sess-${Date.now()}`;
  }
}

/** Normalize list payloads after unwrap (array or { items }). */
export function asItemList<T>(payload: T[] | { items?: T[] } | null | undefined): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.items)) return payload.items;
  return [];
}
