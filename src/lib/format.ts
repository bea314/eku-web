import type { EventItem, HostInfo, TicketType } from './types';
import {
  coerceDate,
  formatPlace,
  formatTitle,
  formatWhenLong,
  pickStartRaw,
  safeString,
} from './safe-display';

export function eventTitle(event: EventItem): string {
  return formatTitle(event);
}

export function eventStartsAt(event: EventItem): string | undefined {
  const d = coerceDate(pickStartRaw(event));
  return d ? d.toISOString() : undefined;
}

export function eventPlace(event: EventItem): string {
  return formatPlace(event);
}

export function hostFromEvent(event: EventItem): HostInfo | null {
  if (typeof event.hostedBy === 'string' && event.hostedBy.trim()) {
    return { name: event.hostedBy };
  }
  if (event.hostedBy && typeof event.hostedBy === 'object') {
    return event.hostedBy as HostInfo;
  }
  return event.host || event.organizer || null;
}

export function hostDisplayName(host: HostInfo | null): string {
  if (!host) return '';
  return (
    safeString(host.businessName) ||
    safeString(host.displayName) ||
    safeString(host.name) ||
    ''
  );
}

export function hostAvatar(host: HostInfo | null): string | undefined {
  return safeString(host?.avatarUrl) || safeString(host?.imageUrl) || undefined;
}

export function formatDateTime(iso?: string | unknown): string {
  return formatWhenLong(iso);
}

export function formatPrice(price: number, currency = 'USD'): string {
  if (price === 0) return 'Gratis';
  try {
    return new Intl.NumberFormat('es', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${currency} ${price}`;
  }
}

export function remainingStock(tt: TicketType): number | null {
  const candidates = [tt.remaining, tt.available, tt.quantityAvailable];
  for (const c of candidates) {
    if (typeof c === 'number') return c;
  }
  if (typeof tt.capacity === 'number' && typeof tt.sold === 'number') {
    return Math.max(0, tt.capacity - tt.sold);
  }
  if (typeof tt.capacity === 'number') return tt.capacity;
  return null;
}

export function normalizeTicketTypes(
  raw: { items?: TicketType[] } | TicketType[] | undefined,
  embedded?: TicketType[],
): TicketType[] {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.items)) return raw.items;
  if (Array.isArray(embedded)) return embedded;
  return [];
}

export function inviteLink(origin: string, eventId: string, token: string): string {
  const base = String(origin || '').replace(/\/+$/, '');
  return `${base}/eventos/${encodeURIComponent(String(eventId))}?invite=${encodeURIComponent(String(token))}`;
}

export function extractInviteToken(result: {
  token?: string;
  inviteToken?: string;
  url?: string;
  inviteUrl?: string;
  link?: string;
}): string | null {
  if (result.token) return String(result.token);
  if (result.inviteToken) return String(result.inviteToken);
  const url = result.url || result.inviteUrl || result.link;
  if (!url) return null;
  try {
    const u = new URL(String(url), 'http://local');
    return u.searchParams.get('invite');
  } catch {
    return null;
  }
}
