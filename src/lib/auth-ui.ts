import { userFacingApiError } from './user-facing-error';

export type AuthMode = 'login' | 'signup';

export const AUTH_COPY = {
  login: {
    tab: 'Iniciar sesión',
    title: 'Bienvenido',
    lead: 'Entrá a tu cuenta',
    submit: 'Iniciar sesión',
    footer: '¿No tenés cuenta?',
    footerAction: 'Crear cuenta',
    pageTitle: 'Entrar · ekü',
    path: '/login',
  },
  signup: {
    tab: 'Crear cuenta',
    title: 'Crear cuenta',
    lead: 'Completá tus datos para registrarte',
    submit: 'Crear cuenta',
    footer: '¿Ya tenés cuenta?',
    footerAction: 'Iniciar sesión',
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

export function authErrorMessage(
  err: unknown,
  fallback = 'No pudimos entrar. Intentá de nuevo en un momento.',
): string {
  return userFacingApiError(err, fallback);
}
