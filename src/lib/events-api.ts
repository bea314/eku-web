import { apiFetch } from './api';
import type {
  CheckoutConfirmRequest,
  CheckoutConfirmResult,
  CheckoutPreviewRequest,
  CreateEventPayload,
  CreateInviteResult,
  EventItem,
  ListResponse,
  TicketType,
} from './types';

export function listPublicEvents() {
  return apiFetch<ListResponse<EventItem>>('/events');
}

export function getEvent(id: string, invite?: string | null) {
  return apiFetch<EventItem>(`/events/${encodeURIComponent(id)}`, {
    searchParams: { invite: invite || undefined },
  });
}

export function listTicketTypes(eventId: string, invite?: string | null) {
  return apiFetch<ListResponse<TicketType> | TicketType[]>(
    `/events/${encodeURIComponent(eventId)}/ticket-types`,
    { searchParams: { invite: invite || undefined } },
  );
}

export function listMyEvents(token: string) {
  return apiFetch<ListResponse<EventItem>>('/events/mine', { token });
}

export function createEvent(token: string, payload: CreateEventPayload) {
  return apiFetch<EventItem>('/events', {
    method: 'POST',
    token,
    body: payload,
  });
}

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

export function previewCheckout(payload: CheckoutPreviewRequest) {
  return apiFetch<unknown>('/checkout/preview', {
    method: 'POST',
    body: payload,
  });
}

export function confirmCheckout(payload: CheckoutConfirmRequest) {
  return apiFetch<CheckoutConfirmResult>('/checkout/confirm', {
    method: 'POST',
    body: payload,
  });
}

/** Best-effort login if Nest exposes email/password auth. */
export function loginWithPassword(email: string, password: string) {
  return apiFetch<{ accessToken?: string; access_token?: string; token?: string }>(
    '/auth/login',
    {
      method: 'POST',
      body: { email, password },
    },
  );
}
