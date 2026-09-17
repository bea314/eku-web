/** Browser-safe API helpers (inlined concepts from src/lib for client scripts). */

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

export async function clientApi<T>(
  path: string,
  options: {
    method?: string;
    token?: string | null;
    body?: unknown;
    searchParams?: Record<string, string | undefined | null>;
  } = {},
): Promise<T> {
  const base = getPublicApiBase();
  if (!base) {
    throw new ClientApiError(
      'Falta PUBLIC_API_BASE_URL. Copia .env.example → .env y reinicia `astro dev`.',
      0,
    );
  }

  const normalized = path.startsWith('/') ? path : `/${path}`;
  const withApi = normalized.startsWith('/api/') ? normalized : `/api${normalized}`;
  let url = `${base}${withApi}`;

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
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch (err) {
    throw new ClientApiError(
      `No se pudo conectar a Nest en ${base}. ¿Está corriendo? ¿CORS habilitado? (${err instanceof Error ? err.message : 'red'})`,
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

  return parsed as T;
}

export const AUTH_KEY = 'eku_org_token';

export function getStoredToken(): string {
  try {
    return localStorage.getItem(AUTH_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredToken(token: string) {
  localStorage.setItem(AUTH_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(AUTH_KEY);
}
