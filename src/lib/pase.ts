/** Guest post-confirm Pase handoff (sessionStorage). */

export const PASE_STORAGE_KEY = 'eku_pase_confirm';

export interface PaseTicket {
  id?: string;
  code?: string;
  ticketCode?: string;
  qrPayload?: string;
  ticketTypeName?: string;
  /** Crop wallet often returns event name on the ticket */
  name?: string;
  eventName?: string;
  eventId?: string;
  status?: string;
  coverImageUrl?: string | null;
  image_url?: string | null;
}

export interface PaseConfirmPayload {
  orderId: string;
  email?: string;
  eventId?: string;
  eventName?: string;
  tickets: PaseTicket[];
  qrPayloads: string[];
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
    const parsed = JSON.parse(raw) as PaseConfirmPayload;
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      orderId: String(parsed.orderId || ''),
      email: parsed.email ? String(parsed.email) : undefined,
      eventId: parsed.eventId ? String(parsed.eventId) : undefined,
      eventName: parsed.eventName ? String(parsed.eventName) : undefined,
      tickets: Array.isArray(parsed.tickets) ? parsed.tickets : [],
      qrPayloads: Array.isArray(parsed.qrPayloads) ? parsed.qrPayloads : [],
    };
  } catch {
    return null;
  }
}

/** Pair tickets[] with qrPayloads[] by index; fall back to ticket.qrPayload. */
export function paseRows(
  tickets: PaseTicket[],
  qrPayloads: string[],
): Array<{ ticket: PaseTicket; code: string; qr: string; index: number }> {
  const n = Math.max(tickets.length, qrPayloads.length, 1);
  const rows: Array<{ ticket: PaseTicket; code: string; qr: string; index: number }> = [];
  for (let i = 0; i < n; i++) {
    const ticket = tickets[i] || {};
    const code =
      ticket.code || ticket.ticketCode || ticket.id || (tickets.length ? `pase-${i + 1}` : '');
    const qr = qrPayloads[i] || ticket.qrPayload || code || '';
    if (!code && !qr) continue;
    rows.push({ ticket, code: code || `pase-${i + 1}`, qr, index: i });
  }
  return rows;
}
