import { ApiError, type ApiErrorBody, type ApiEnvelope } from './types';

/**
 * Nest base URL — Crop contract: already includes `/api`
 * e.g. PUBLIC_API_BASE_URL=http://localhost:3000/api
 */
export function getApiBaseUrl(): string {
  const raw =
    import.meta.env.PUBLIC_API_BASE_URL ||
    import.meta.env.API_BASE_URL ||
    '';

  if (!raw || typeof raw !== 'string') {
    return '';
  }

  return raw.replace(/\/+$/, '');
}

/**
 * Join path onto PUBLIC_API_BASE_URL.
 * Base already has `/api` — do NOT prepend `/api` again.
 */
export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  if (!base) {
    throw new ApiError(
      'Falta PUBLIC_API_BASE_URL (ej. http://localhost:3000/api). Copia .env.example → .env.',
      0,
    );
  }

  let normalized = path.startsWith('/') ? path : `/${path}`;
  // Tolerate callers that still pass `/api/...` when base already ends with /api
  if (base.endsWith('/api') && normalized.startsWith('/api/')) {
    normalized = normalized.slice(4);
  }

  return `${base}${normalized}`;
}

export function formatErrorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return fallback;
  const b = body as ApiErrorBody & ApiEnvelope<unknown>;
  if (Array.isArray(b.message)) return b.message.join(' · ');
  if (typeof b.message === 'string' && b.message.trim()) return b.message;
  if (typeof b.error === 'string' && b.error.trim()) return b.error;
  return fallback;
}

/**
 * Crop envelope: `{ code, message, data: { items: <payload> } }`
 * Returns `data.items`. Falls back to `data` or raw body if shape differs.
 */
export function unwrapEnvelope<T>(parsed: unknown): T {
  if (!parsed || typeof parsed !== 'object') {
    return parsed as T;
  }
  const env = parsed as ApiEnvelope<T> & { data?: { items?: T } | T };
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

export interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  token?: string | null;
  body?: unknown;
  searchParams?: Record<string, string | undefined | null>;
  /** When true, return raw envelope (default unwraps data.items). */
  raw?: boolean;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { token, body, searchParams, headers: initHeaders, raw, ...rest } =
    options;

  let url = apiUrl(path);
  if (searchParams) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v != null && v !== '') qs.set(k, v);
    }
    const s = qs.toString();
    if (s) url += (url.includes('?') ? '&' : '?') + s;
  }

  const headers = new Headers(initHeaders);
  if (body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    const jwt = String(token).trim().replace(/^Bearer\s+/i, '').trim();
    if (jwt) headers.set('Authorization', `Bearer ${jwt}`);
  }

  let res: Response;
  try {
    res = await fetch(url, {
      ...rest,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : 'Error de red al llamar la API';
    throw new ApiError(
      `No se pudo conectar a Nest (${getApiBaseUrl() || 'sin base'}): ${msg}`,
      0,
      err,
    );
  }

  const text = await res.text();
  let parsed: unknown = undefined;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!res.ok) {
    throw new ApiError(
      formatErrorMessage(parsed, `Error HTTP ${res.status} en ${path}`),
      res.status,
      parsed,
    );
  }

  if (raw) return parsed as T;
  return unwrapEnvelope<T>(parsed);
}

export function getConfiguredApiBase(): string {
  try {
    return getApiBaseUrl();
  } catch {
    return '';
  }
}
