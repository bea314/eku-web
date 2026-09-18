import { apiFetch } from './api';
import type {
  Category,
  CheckoutConfirmRequest,
  CheckoutConfirmResult,
  CheckoutPreviewRequest,
  CreateEventPayload,
  CreateInviteResult,
  EventItem,
  TicketType,
} from './types';

export interface ListPublicEventsParams {
  /** Nest-as-shipped — text search (NOT `q`). */
  search?: string | null;
  /**
   * Nest-as-shipped — category id(s) as ints, comma-separated
   * e.g. `"1"` or `"1,2"` (NOT `categoryId`, NOT UUIDs).
   */
  categoryIds?: string | number | Array<string | number> | null;
}

function normalizeCategoryIds(
  value: ListPublicEventsParams['categoryIds'],
): string | undefined {
  if (value == null || value === '') return undefined;
  if (Array.isArray(value)) {
    const joined = value
      .map((v) => String(v).trim())
      .filter(Boolean)
      .join(',');
    return joined || undefined;
  }
  const s = String(value).trim();
  return s || undefined;
}

/** A3 / U13 — public discovery. Nest: `GET /events?search=&categoryIds=`. */
export function listPublicEvents(params: ListPublicEventsParams = {}) {
  return apiFetch<EventItem[] | { items?: EventItem[] }>('/events', {
    searchParams: {
      search: params.search || undefined,
      categoryIds: normalizeCategoryIds(params.categoryIds),
    },
  });
}

/** U13 — Nest-as-shipped chips: `GET /catalog/categories`. */
export function listCategories() {
  return apiFetch<Category[] | { items?: Category[] }>('/catalog/categories');
}

/** A4/A5/A6 — detail; pass invite for private. */
export function getEvent(id: string, invite?: string | null) {
  return apiFetch<EventItem>(`/events/${encodeURIComponent(id)}`, {
    searchParams: { invite: invite || undefined },
  });
}

export function listTicketTypes(eventId: string, invite?: string | null) {
  return apiFetch<TicketType[] | { items?: TicketType[] }>(
    `/events/${encodeURIComponent(eventId)}/ticket-types`,
    { searchParams: { invite: invite || undefined } },
  );
}

export function listMyEvents(token: string) {
  return apiFetch<EventItem[] | { items?: EventItem[] }>('/events/mine', {
    token,
  });
}

/** A1 */
export function createEvent(token: string, payload: CreateEventPayload) {
  return apiFetch<EventItem>('/events', {
    method: 'POST',
    token,
    body: payload,
  });
}

/** A2 */
export function updateEvent(
  token: string,
  id: string,
  payload: Partial<CreateEventPayload>,
) {
  return apiFetch<EventItem>(`/events/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    token,
    body: payload,
  });
}

/** A6 */
export function createInvite(token: string, eventId: string, body?: unknown) {
  return apiFetch<CreateInviteResult>(
    `/events/${encodeURIComponent(eventId)}/invites`,
    {
      method: 'POST',
      token,
      body: body ?? {},
    },
  );
}

/** A7b */
export function previewCheckout(payload: CheckoutPreviewRequest) {
  return apiFetch<unknown>('/checkout/preview', {
    method: 'POST',
    body: payload,
  });
}

/** A7 — guest, no Bearer */
export function confirmCheckout(payload: CheckoutConfirmRequest) {
  return apiFetch<CheckoutConfirmResult>('/checkout/confirm', {
    method: 'POST',
    body: payload,
  });
}

/** Crop auth: POST /auth/sign-in → data.items.{ accessToken, refreshToken } */
export function signIn(email: string, password: string) {
  return apiFetch<{
    accessToken?: string;
    access_token?: string;
    refreshToken?: string;
    token?: string;
  }>('/auth/sign-in', {
    method: 'POST',
    body: { email, password },
  });
}

/** Crop auth: POST /auth/sign-up `{ email, password, … }` */
export function signUp(body: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
}) {
  return apiFetch<{
    accessToken?: string;
    refreshToken?: string;
  }>('/auth/sign-up', {
    method: 'POST',
    body,
  });
}

/** Crop auth: POST /auth/refresh-token `{ refreshToken }` */
export function refreshToken(refreshToken: string) {
  return apiFetch<{
    accessToken?: string;
    refreshToken?: string;
  }>('/auth/refresh-token', {
    method: 'POST',
    body: { refreshToken },
  });
}
