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
  /** Nest Crop — text search over name/description. */
  q?: string | null;
  /** Nest Crop — optional category UUID filter. */
  categoryId?: string | null;
}

/** A3 / U13 — public discovery. Pass `q` + `categoryId` as Nest query params. */
export function listPublicEvents(params: ListPublicEventsParams = {}) {
  return apiFetch<EventItem[] | { items?: EventItem[] }>('/events', {
    searchParams: {
      q: params.q || undefined,
      categoryId: params.categoryId || undefined,
    },
  });
}

/** U13 — category chips from Nest. Caller handles 404 (hide chips, no mocks). */
export function listCategories() {
  return apiFetch<Category[] | { items?: Category[] }>('/categories');
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
