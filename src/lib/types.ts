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

/** Nest-as-shipped — GET /catalog/categories chip payload (id is int). */
export interface Category {
  id: number | string;
  name: string;
  slug?: string | null;
  icon?: string | null;
}

/** Nest `location` row on GET /events/:id (Prisma decimals may arrive as strings). */
export interface EventLocation {
  name?: string;
  venue?: string;
  address?: string;
  formatted_address?: string;
  formattedAddress?: string;
  lat?: number | string | null;
  lng?: number | string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
}

export interface EventItem {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  /** Nest category id (int) when present. */
  categoryId?: number | string | null;
  categoryIds?: Array<number | string> | null;
  category?: string | Category | null;
  startsAt?: string;
  startAt?: string;
  startDate?: string;
  /** Nest snake_case alias */
  start_date?: string;
  endsAt?: string;
  endAt?: string;
  endDate?: string;
  /** Nest snake_case alias */
  end_date?: string;
  place?: string;
  placeText?: string;
  /** Nest returns the location row; some list payloads still send a label string. */
  location?: string | EventLocation;
  locationText?: string;
  venue?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  lat?: number | string | null;
  lng?: number | string | null;
  isVirtual?: boolean;
  virtual?: boolean;
  visibility?: EventVisibility;
  status?: EventStatus;
  published?: boolean;
  host?: HostInfo;
  organizer?: HostInfo;
  hostedBy?: HostInfo | string;
  ticketTypes?: TicketType[];
  /** Nest PR #3 — prefer this for covers */
  coverImageUrl?: string | null;
  /** Nest snake_case cover alias */
  cover_image_url?: string | null;
  /** Nest PR #3 — snake_case alias (nullable; media / imgproxy) */
  image_url?: string | null;
  imageUrl?: string | null;
  coverUrl?: string | null;
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

/** Nest PR #3 cart line — eventTicketTypeId is an integer */
export interface CheckoutLine {
  eventTicketTypeId: number;
  quantity: number;
}

export interface CheckoutGuest {
  email: string;
  guestSessionId: string;
  firstName?: string;
}

/** Nest POST /checkout/preview — same cart shape as confirm */
export interface CheckoutPreviewRequest {
  eventId: string;
  items: CheckoutLine[];
  acceptedTerms?: boolean;
  inviteToken?: string;
  guest?: CheckoutGuest;
  /** U20: required as `'mock'` when total > 0 */
  payment_method?: 'mock' | string;
  paymentMethod?: 'mock' | string;
}

/** Nest POST /checkout/confirm — Bearer when logged in; guest only if unauthenticated */
export interface CheckoutConfirmRequest {
  eventId: string;
  items: CheckoutLine[];
  acceptedTerms: boolean;
  inviteToken?: string;
  guest?: CheckoutGuest;
  /** U20: `'mock'` when price > 0 — simulation, no real charge */
  payment_method?: 'mock' | string;
  paymentMethod?: 'mock' | string;
}

export interface TicketEvidence {
  id?: string;
  code?: string;
  ticketCode?: string;
  qrPayload?: string;
  status?: string;
  ticketTypeName?: string;
}

/** Crop confirm unwrap: data.items → { tickets[], qrPayloads[], orderId? } */
export interface CheckoutConfirmResult {
  orderId?: string;
  id?: string;
  email?: string;
  total?: number;
  status?: string;
  tickets?: TicketEvidence[];
  /** Some envelopes nest tickets under items as array; prefer tickets[] */
  items?: TicketEvidence[];
  qrPayloads?: string[];
}

/** Auth wallet: GET /api/wallet/tickets Bearer — name + coverImageUrl */
export interface WalletTicket {
  id?: string;
  code?: string;
  ticketCode?: string;
  qrPayload?: string;
  ticketTypeName?: string;
  name?: string;
  eventName?: string;
  eventId?: string;
  status?: string;
  coverImageUrl?: string | null;
  image_url?: string | null;
  event?: {
    id?: string;
    name?: string;
    title?: string;
    coverImageUrl?: string | null;
    image_url?: string | null;
  };
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
  /** Nest PR #3 — feeds detail og:image when published */
  coverImageUrl?: string | null;
  image_url?: string | null;
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
