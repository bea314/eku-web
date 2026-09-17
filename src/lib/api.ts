import { ApiError, type ApiErrorBody } from './types';

/**
 * Resolves Nest base URL (no `/api` suffix).
 * Prefer PUBLIC_* so the same env works in browser and SSR.
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

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const withApi = normalized.startsWith('/api/')
    ? normalized
    : `/api${normalized}`;

  if (!base) {
    throw new ApiError(
      'Falta PUBLIC_API_BASE_URL (o API_BASE_URL). Copia .env.example → .env y apunta al Nest.',
      0,
    );
  }

  return `${base}${withApi}`;
}

function formatErrorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return fallback;
  const b = body as ApiErrorBody;
  if (Array.isArray(b.message)) return b.message.join(' · ');
  if (typeof b.message === 'string' && b.message.trim()) return b.message;
  if (typeof b.error === 'string' && b.error.trim()) return b.error;
  return fallback;
}

export interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  token?: string | null;
  body?: unknown;
  searchParams?: Record<string, string | undefined | null>;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { token, body, searchParams, headers: initHeaders, ...rest } = options;

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
    headers.set('Authorization', `Bearer ${token}`);
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

  return parsed as T;
}

export function getConfiguredApiBase(): string {
  try {
    return getApiBaseUrl();
  } catch {
    return '';
  }
}
