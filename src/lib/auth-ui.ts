import { ClientApiError } from './client-api';

export type AuthMode = 'login' | 'signup';

export const AUTH_COPY = {
  login: {
    tab: 'Login',
    title: 'Bienvenido',
    lead: 'Entrá a tu cuenta',
    submit: 'Sign in',
    footer: '¿No tenés cuenta?',
    footerAction: 'Sign up',
    pageTitle: 'Entrar · ekü',
    path: '/login',
  },
  signup: {
    tab: 'Sign up',
    title: 'Crear cuenta',
    lead: 'Completá tus datos para registrarte',
    submit: 'Crear cuenta',
    footer: '¿Ya tenés cuenta?',
    footerAction: 'Login',
    pageTitle: 'Crear cuenta · ekü',
    path: '/register',
  },
} as const;

export const AUTH_MIN_PASSWORD = 8;

export function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith('/login') || pathname.startsWith('/register');
}

export function authHref(mode: AuthMode, next: string): string {
  return `${AUTH_COPY[mode].path}?next=${encodeURIComponent(next)}`;
}

export function authErrorMessage(err: unknown, fallback = 'Error'): string {
  if (err instanceof ClientApiError || err instanceof Error) {
    const msg = err.message.trim();
    if (msg) return msg;
  }
  return fallback;
}
