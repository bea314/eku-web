/** Domain types aligned to Nest `so-microservicio` contracts. Fields are optional where Crop may still be wiring. */

export type EventVisibility = 'public' | 'unlisted' | 'private';
export type EventStatus = 'draft' | 'published' | 'cancelled';

export interface HostInfo {
  id?: string;
  name?: string;
  displayName?: string;
  businessName?: string;
  avatarUrl?: string;
  imageUrl?: string;
}

export interface TicketType {
  id: string;
  name: string;
  description?: string;
  /** Price in major units (USD) or as returned by API; UI treats 0 as free. */
  price: number;
  currency?: string;
  capacity?: number | null;
  remaining?: number | null;
  available?: number | null;
  sold?: number | null;
  quantityAvailable?: number | null;
}

export interface EventItem {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  startsAt?: string;
  startAt?: string;
  startDate?: string;
  endsAt?: string;
  endAt?: string;
  place?: string;
  placeText?: string;
  location?: string;
  locationText?: string;
  venue?: string;
  isVirtual?: boolean;
  virtual?: boolean;
  visibility?: EventVisibility;
  status?: EventStatus;
  published?: boolean;
  host?: HostInfo;
  organizer?: HostInfo;
  hostedBy?: HostInfo | string;
  ticketTypes?: TicketType[];
  coverUrl?: string;
  imageUrl?: string;
}

export interface Pagination {
  page?: number;
  pageSize?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
}

export interface ListResponse<T> {
  items: T[];
  pagination?: Pagination;
}

export interface CheckoutLine {
  ticketTypeId: string;
  quantity: number;
}

export interface CheckoutPreviewRequest {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  invite?: string;
  guest?: { email: string };
}

/** Crop: guest checkout — no Bearer; use guest.email */
export interface CheckoutConfirmRequest {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  invite?: string;
  guest: { email: string };
}

export interface TicketEvidence {
  id?: string;
  code?: string;
  ticketCode?: string;
  qrPayload?: string;
  status?: string;
  ticketTypeName?: string;
}

export interface CheckoutConfirmResult {
  orderId?: string;
  id?: string;
  email?: string;
  total?: number;
  status?: string;
  tickets?: TicketEvidence[];
  items?: TicketEvidence[];
  qrPayloads?: string[];
}

export interface CreateInviteResult {
  token?: string;
  inviteToken?: string;
  url?: string;
  inviteUrl?: string;
  link?: string;
}

export interface CreateEventPayload {
  name: string;
  description: string;
  /** Crop Nest create contract (PR #3) */
  startDate: string;
  endDate: string;
  /** Aliases some Nest versions still accept */
  startsAt?: string;
  endsAt?: string;
  place?: string;
  placeText?: string;
  locationText?: string;
  location?: {
    name?: string;
    address?: string;
    lat: number;
    lng: number;
    latitude?: number;
    longitude?: number;
  };
  isVirtual?: boolean;
  visibility: EventVisibility;
  status?: EventStatus;
  publish?: boolean;
  ticketTypes: Array<{
    name: string;
    price: number;
    capacity?: number | null;
    description?: string;
  }>;
}

export interface ApiEnvelope<T = unknown> {
  code?: number;
  message?: string;
  data?: { items?: T; pagination?: Pagination } | T;
}

export interface ApiErrorBody {
  message?: string | string[];
  error?: string;
  statusCode?: number;
  code?: number;
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}
