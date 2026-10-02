/** Nest PR #3 ticket stock / sold-out / list price helpers (a69f751: `available`). */

export type StockTicket = {
  price?: unknown;
  available?: number | null;
  remaining?: number | null;
  quantityAvailable?: number | null;
  quantity?: number | null;
  capacity?: number | null;
  sold?: number | null;
  isSoldOut?: boolean | null;
  maxPerOrder?: number | null;
};

export type PricedEvent = {
  startingPrice?: number | null;
  isSoldOut?: boolean | null;
  ticketTypes?: StockTicket[] | null;
  event_ticket_types?: StockTicket[] | null;
  eventTicketTypes?: StockTicket[] | null;
};

/**
 * Nest cupo remaining.
 * Prefer `available` (number or null = unlimited). `quantity` only as legacy fallback.
 */
export function stockOf(tt: StockTicket | null | undefined): number | null {
  if (!tt) return null;
  if (tt.available === null) return null;
  if (typeof tt.available === 'number' && Number.isFinite(tt.available)) return tt.available;

  if (typeof tt.remaining === 'number' && Number.isFinite(tt.remaining)) return tt.remaining;
  if (typeof tt.quantityAvailable === 'number' && Number.isFinite(tt.quantityAvailable)) {
    return tt.quantityAvailable;
  }

  const cap =
    typeof tt.quantity === 'number' && Number.isFinite(tt.quantity)
      ? tt.quantity
      : typeof tt.capacity === 'number' && Number.isFinite(tt.capacity)
        ? tt.capacity
        : null;
  if (cap == null) return null;
  if (typeof tt.sold === 'number' && Number.isFinite(tt.sold)) {
    return Math.max(0, cap - tt.sold);
  }
  return cap;
}

/** Agotado = isSoldOut if present, else available !== null && available <= 0. */
export function isTicketSoldOut(tt: StockTicket | null | undefined): boolean {
  if (!tt) return false;
  if (tt.isSoldOut === true) return true;
  if (tt.isSoldOut === false) return false;
  const available = stockOf(tt);
  return available !== null && available <= 0;
}

export function ticketTypesOf(event: PricedEvent | null | undefined): StockTicket[] {
  if (!event) return [];
  if (Array.isArray(event.event_ticket_types) && event.event_ticket_types.length) {
    return event.event_ticket_types;
  }
  if (Array.isArray(event.eventTicketTypes) && event.eventTicketTypes.length) {
    return event.eventTicketTypes;
  }
  if (Array.isArray(event.ticketTypes) && event.ticketTypes.length) {
    return event.ticketTypes;
  }
  return [];
}

export function isEventSoldOut(
  event: PricedEvent | null | undefined,
  tickets?: StockTicket[] | null,
): boolean {
  if (event?.isSoldOut === true) return true;
  if (event?.isSoldOut === false) return false;
  const list = tickets && tickets.length ? tickets : ticketTypesOf(event);
  if (!list.length) return false;
  return list.every((t) => isTicketSoldOut(t));
}

export function minTicketPrice(event: PricedEvent | null | undefined): number | null {
  if (event && typeof event.startingPrice === 'number' && Number.isFinite(event.startingPrice)) {
    return event.startingPrice;
  }
  const prices = ticketTypesOf(event)
    .map((t) => Number(t.price))
    .filter((n) => Number.isFinite(n));
  if (!prices.length) return null;
  return Math.min(...prices);
}

/** «Gratis» only when min price is 0; else «Desde X,XX US$». Never «$0». */
export function eventPriceLabel(event: PricedEvent | null | undefined): string {
  const min = minTicketPrice(event);
  if (min == null) return 'Gratis';
  if (min <= 0) return 'Gratis';
  try {
    const amount = new Intl.NumberFormat('es', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(min);
    return `Desde ${amount} US$`;
  } catch {
    return `Desde ${min} US$`;
  }
}

export function formatDesdeUsd(price: number): string {
  if (!Number.isFinite(price) || price <= 0) return 'Gratis';
  try {
    const amount = new Intl.NumberFormat('es', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
    return `Desde ${amount} US$`;
  } catch {
    return `Desde ${price} US$`;
  }
}
