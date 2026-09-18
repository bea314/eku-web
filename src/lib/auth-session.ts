/**
 * Browser auth session — Crop Nest tip (PR #3):
 * POST /auth/sign-up · POST /auth/sign-in · GET /auth/me · POST /auth/refresh-token
 * Client stores accessToken (and refreshToken) in localStorage — never paste JWT UI.
 */

import {
  AUTH_KEY,
  clientApi,
  clearStoredToken,
  extractAccessToken,
  getStoredToken,
  normalizeJwt,
  setStoredToken,
} from './client-api';

export const REFRESH_KEY = 'eku_refresh_token';

export function getStoredRefreshToken(): string {
  try {
    return normalizeJwt(localStorage.getItem(REFRESH_KEY) || '');
  } catch {
    return '';
  }
}

export function setStoredRefreshToken(token: string) {
  const jwt = normalizeJwt(token);
  if (!jwt) {
    try {
      localStorage.removeItem(REFRESH_KEY);
    } catch {
      /* ignore */
    }
    return;
  }
  localStorage.setItem(REFRESH_KEY, jwt);
}

export function clearSession() {
  clearStoredToken();
  try {
    localStorage.removeItem(REFRESH_KEY);
  } catch {
    /* ignore */
  }
}

/** Pull refreshToken from Nest unwrap (`data.items`). */
export function extractRefreshToken(payload: unknown): string {
  if (payload == null) return '';
  if (typeof payload === 'string') return '';
  if (Array.isArray(payload)) {
    for (const entry of payload) {
      const found = extractRefreshToken(entry);
      if (found) return found;
    }
    return '';
  }
  if (typeof payload === 'object') {
    const o = payload as Record<string, unknown>;
    for (const key of ['refreshToken', 'refresh_token'] as const) {
      const v = o[key];
      if (typeof v === 'string' && v.trim()) return normalizeJwt(v);
    }
    if ('items' in o) return extractRefreshToken(o.items);
    if ('data' in o) return extractRefreshToken(o.data);
  }
  return '';
}

export function persistAuthTokens(payload: unknown): { accessToken: string; refreshToken: string } {
  const accessToken = extractAccessToken(payload);
  const refreshToken = extractRefreshToken(payload);
  if (accessToken) setStoredToken(accessToken);
  if (refreshToken) setStoredRefreshToken(refreshToken);
  return { accessToken, refreshToken };
}

export type SignInBody = { email: string; password: string };

/** Nest tip: POST /auth/sign-up `{ email, password, … }` */
export type SignUpBody = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
};

export async function signIn(body: SignInBody) {
  const res = await clientApi<unknown>('/auth/sign-in', {
    method: 'POST',
    body: { email: body.email.trim(), password: body.password },
  });
  const tokens = persistAuthTokens(res);
  if (!tokens.accessToken) {
    throw new Error('sign-in OK pero sin accessToken');
  }
  return tokens;
}

export async function signUp(body: SignUpBody) {
  const payload: Record<string, string> = {
    email: body.email.trim(),
    password: body.password,
  };
  if (body.firstName?.trim()) payload.firstName = body.firstName.trim();
  if (body.lastName?.trim()) payload.lastName = body.lastName.trim();
  if (body.displayName?.trim()) payload.displayName = body.displayName.trim();

  const res = await clientApi<unknown>('/auth/sign-up', {
    method: 'POST',
    body: payload,
  });
  // Some Nest builds return tokens on sign-up; others require a follow-up sign-in.
  const tokens = persistAuthTokens(res);
  if (tokens.accessToken) return tokens;

  return signIn({ email: payload.email, password: body.password });
}

/** Nest tip: POST /auth/refresh-token */
export async function refreshAccessToken() {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return null;
  const res = await clientApi<unknown>('/auth/refresh-token', {
    method: 'POST',
    body: { refreshToken },
  });
  const tokens = persistAuthTokens(res);
  return tokens.accessToken || null;
}

/** Nest tip: GET /auth/me Bearer */
export async function fetchMe<T = unknown>() {
  let token = getStoredToken();
  if (!token) return null;
  try {
    return await clientApi<T>('/auth/me', { token });
  } catch (err) {
    // Soft refresh once on 401
    const status = err && typeof err === 'object' && 'status' in err ? Number((err as { status: number }).status) : 0;
    if (status === 401) {
      const next = await refreshAccessToken().catch(() => null);
      if (next) return clientApi<T>('/auth/me', { token: next });
      clearSession();
    }
    throw err;
  }
}

export function isLoggedIn(): boolean {
  return Boolean(getStoredToken());
}

/** Safe next path after login (same-origin relative only). */
export function safeNextPath(raw: string | null | undefined, fallback = '/'): string {
  const v = String(raw || '').trim();
  if (!v.startsWith('/') || v.startsWith('//')) return fallback;
  return v;
}

/** Re-export storage key for diagnostics (do not surface in UI). */
export { AUTH_KEY, getStoredToken, setStoredToken };
