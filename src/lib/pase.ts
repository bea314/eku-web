/** Guest post-confirm Pase handoff (sessionStorage + hash backup). */

export const PASE_STORAGE_KEY = 'eku_pase_confirm';

export interface PaseTicket {
  id?: string;
  code?: string;
  number?: string;
  ticketCode?: string;
  qrPayload?: string;
  ticketTypeName?: string;
  eventTicketTypeId?: number | string;
  /** Crop wallet often returns event name on the ticket */
  name?: string;
  eventName?: string;
  eventId?: string;
  status?: string;
  coverImageUrl?: string | null;
  image_url?: string | null;
}

export interface PaseConfirmFallback {
  email?: string;
  eventId?: string;
  eventName?: string;
  startDate?: string;
  place?: string;
  coverImageUrl?: string | null;
  hostName?: string;
}

export interface PaseConfirmPayload extends PaseConfirmFallback {
  orderId: string;
  tickets: PaseTicket[];
  qrPayloads: string[];
}

function asTickets(value: unknown): PaseTicket[] {
  if (!Array.isArray(value)) return [];
  return value.filter((t) => t && typeof t === 'object') as PaseTicket[];
}

function asQrStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((q) => String(q || '').trim()).filter(Boolean);
}

/**
 * Pull tickets[] + qrPayloads[] from Nest confirm envelope or unwrapped items.
 * Supports:
 * - data.items.{ tickets, qrPayloads, orderId }
 * - data.{ tickets, qrPayloads, orderId }
 * - data.items = ticket[] with data.qrPayloads sibling
 */
export function extractConfirmPase(
  parsed: unknown,
  fallback: PaseConfirmFallback = {},
): PaseConfirmPayload | null {
  if (parsed == null) return null;

  let root: Record<string, unknown> =
    typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};

  // Full envelope
  if (root.data != null && typeof root.data === 'object') {
    root = root.data as Record<string, unknown>;
  }

  let items: unknown = root.items;
  let tickets: PaseTicket[] = [];
  let qrPayloads: string[] = asQrStrings(root.qrPayloads);
  let orderId = String(root.orderId || root.id || '');

  if (items != null && typeof items === 'object' && !Array.isArray(items)) {
    const obj = items as Record<string, unknown>;
    tickets = asTickets(obj.tickets);
    if (!tickets.length) tickets = asTickets(obj.items);
    const nestedQr = asQrStrings(obj.qrPayloads);
    if (nestedQr.length) qrPayloads = nestedQr;
    if (!orderId) orderId = String(obj.orderId || obj.id || '');
    if (!fallback.email && typeof obj.email === 'string') fallback.email = obj.email;
  } else if (Array.isArray(items)) {
    tickets = asTickets(items);
  }

  if (!tickets.length) tickets = asTickets(root.tickets);

  // qrPayload on each ticket
  if (!qrPayloads.length) {
    qrPayloads = tickets.map((t) => String(t.qrPayload || '').trim()).filter(Boolean);
  }

  if (!orderId && !tickets.length && !qrPayloads.length) return null;

  return {
    orderId: orderId || `pase-${Date.now()}`,
    email: fallback.email,
    eventId: fallback.eventId,
    eventName: fallback.eventName,
    startDate: fallback.startDate,
    place: fallback.place,
    coverImageUrl: fallback.coverImageUrl,
    hostName: fallback.hostName,
    tickets,
    qrPayloads,
  };
}

export function savePaseConfirm(payload: PaseConfirmPayload): void {
  try {
    sessionStorage.setItem(PASE_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota */
  }
}

export function loadPaseConfirm(): PaseConfirmPayload | null {
  try {
    const raw = sessionStorage.getItem(PASE_STORAGE_KEY);
    if (!raw) return null;
    return normalizePase(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Compact URL hash backup when sessionStorage is cleared mid-navigation. */
export function encodePaseHash(payload: PaseConfirmPayload): string {
  try {
    const json = JSON.stringify(payload);
    return `pase=${encodeURIComponent(btoa(unescape(encodeURIComponent(json))))}`;
  } catch {
    return '';
  }
}

export function loadPaseFromHash(hash = typeof location !== 'undefined' ? location.hash : ''): PaseConfirmPayload | null {
  try {
    const h = hash.startsWith('#') ? hash.slice(1) : hash;
    const params = new URLSearchParams(h);
    const b64 = params.get('pase');
    if (!b64) return null;
    const json = decodeURIComponent(escape(atob(decodeURIComponent(b64))));
    return normalizePase(JSON.parse(json));
  } catch {
    return null;
  }
}

function normalizePase(parsed: unknown): PaseConfirmPayload | null {
  if (!parsed || typeof parsed !== 'object') return null;
  const p = parsed as PaseConfirmPayload;
  return {
    orderId: String(p.orderId || ''),
    email: p.email ? String(p.email) : undefined,
    eventId: p.eventId ? String(p.eventId) : undefined,
    eventName: p.eventName ? String(p.eventName) : undefined,
    startDate: p.startDate ? String(p.startDate) : undefined,
    place: p.place ? String(p.place) : undefined,
    coverImageUrl: p.coverImageUrl ? String(p.coverImageUrl) : undefined,
    hostName: p.hostName ? String(p.hostName) : undefined,
    tickets: Array.isArray(p.tickets) ? p.tickets : [],
    qrPayloads: Array.isArray(p.qrPayloads) ? p.qrPayloads.map(String) : [],
  };
}

/** Pair tickets[] with qrPayloads[] by index; fall back to ticket.qrPayload. */
export function paseRows(
  tickets: PaseTicket[],
  qrPayloads: string[],
): Array<{ ticket: PaseTicket; code: string; qr: string; index: number }> {
  const n = Math.max(tickets.length, qrPayloads.length, 0);
  const rows: Array<{ ticket: PaseTicket; code: string; qr: string; index: number }> = [];
  for (let i = 0; i < n; i++) {
    const ticket = tickets[i] || {};
    const code =
      ticket.code ||
      ticket.number ||
      ticket.ticketCode ||
      ticket.id ||
      (tickets.length ? `pase-${i + 1}` : '');
    const qr = qrPayloads[i] || ticket.qrPayload || code || '';
    if (!code && !qr) continue;
    rows.push({ ticket, code: code || `pase-${i + 1}`, qr, index: i });
  }
  return rows;
}
