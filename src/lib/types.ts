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
}

export interface CheckoutConfirmRequest extends CheckoutPreviewRequest {
  email: string;
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
  description?: string;
  startsAt: string;
  place?: string;
  placeText?: string;
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

export interface ApiErrorBody {
  message?: string | string[];
  error?: string;
  statusCode?: number;
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
