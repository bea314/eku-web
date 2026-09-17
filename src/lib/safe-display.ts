/** Null-safe display helpers for Nest payloads (dates, location objects, etc.). */

export function safeString(value: unknown, fallback = ''): string {
  if (value == null) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? fallback : value.toISOString();
  }
  if (typeof value === 'object') {
    const o = value as Record<string, unknown>;
    for (const key of [
      'name',
      'address',
      'label',
      'text',
      'placeText',
      'locationText',
      'formattedAddress',
      'title',
      'displayName',
      'businessName',
    ]) {
      if (typeof o[key] === 'string' && (o[key] as string).trim()) {
        return o[key] as string;
      }
    }
  }
  return fallback;
}

export function escapeHtml(value: unknown): string {
  return safeString(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function coerceDate(value: unknown): Date | null {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'string') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'object') {
    const o = value as Record<string, unknown>;
    if (typeof o.$date === 'string' || typeof o.$date === 'number') {
      return coerceDate(o.$date);
    }
    if (typeof o.toISOString === 'function') {
      try {
        return coerceDate((o as { toISOString: () => string }).toISOString());
      } catch {
        return null;
      }
    }
  }
  return null;
}

/** First Nest date field that coerces to a real Date (never invent). */
function firstCoerceable(...candidates: unknown[]): unknown {
  for (const c of candidates) {
    if (c == null || c === '') continue;
    if (coerceDate(c)) return c;
  }
  return null;
}

/**
 * Nest / Flutter explore: prefer startDate, also start / startsAt / startAt.
 * Returns raw value; empty only when none coerce.
 */
export function pickStartRaw(e: {
  startsAt?: unknown;
  startAt?: unknown;
  startDate?: unknown;
  start?: unknown;
}): unknown {
  return firstCoerceable(e.startDate, e.startsAt, e.startAt, e.start);
}

/** Nest endDate / end / endsAt / endAt — empty only when truly missing. */
export function pickEndRaw(e: {
  endsAt?: unknown;
  endAt?: unknown;
  endDate?: unknown;
  end?: unknown;
}): unknown {
  return firstCoerceable(e.endDate, e.endsAt, e.endAt, e.end);
}

export function formatPlace(e: {
  isVirtual?: boolean;
  virtual?: boolean;
  place?: unknown;
  placeText?: unknown;
  locationText?: unknown;
  location?: unknown;
  venue?: unknown;
}): string {
  if (e.isVirtual || e.virtual) return 'Virtual';
  const fromLocation = safeString(e.location);
  const candidates = [
    e.place,
    e.placeText,
    e.locationText,
    fromLocation || null,
    e.venue,
  ];
  for (const c of candidates) {
    const s = safeString(c);
    if (s) return s;
  }
  return 'Lugar por confirmar';
}

export function formatTitle(e: { name?: unknown; title?: unknown }): string {
  return safeString(e.name) || safeString(e.title) || 'Evento sin título';
}

const timeFmt = () =>
  new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit' });

const cardWhenFmt = () =>
  new Intl.DateTimeFormat('es', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export function formatWhenParts(raw: unknown): {
  month: string;
  day: string;
  time: string;
  full: string;
} {
  const d = coerceDate(raw);
  if (!d) {
    return { month: '—', day: '—', time: '', full: 'Fecha por confirmar' };
  }
  return {
    month: new Intl.DateTimeFormat('es', { month: 'short' })
      .format(d)
      .replace('.', ''),
    day: String(d.getDate()),
    time: timeFmt().format(d),
    full: cardWhenFmt().format(d),
  };
}

/**
 * Explore/Flutter-style when line from Nest start/end (or *Date).
 * Shows real date+time(s); “por confirmar” only if start is truly missing.
 */
export function formatEventWhen(e: {
  startsAt?: unknown;
  startAt?: unknown;
  startDate?: unknown;
  start?: unknown;
  endsAt?: unknown;
  endAt?: unknown;
  endDate?: unknown;
  end?: unknown;
}): {
  month: string;
  day: string;
  time: string;
  full: string;
} {
  const start = coerceDate(pickStartRaw(e));
  if (!start) {
    return { month: '—', day: '—', time: '', full: 'Fecha por confirmar' };
  }
  const parts = formatWhenParts(start);
  const end = coerceDate(pickEndRaw(e));
  if (!end || end.getTime() === start.getTime()) return parts;

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();
  const endBit = sameDay ? timeFmt().format(end) : cardWhenFmt().format(end);
  return { ...parts, full: `${parts.full} – ${endBit}` };
}

export function formatWhenLong(raw: unknown): string {
  const d = coerceDate(raw);
  if (!d) return 'Fecha por confirmar';
  return new Intl.DateTimeFormat('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function toLocalInputValue(raw: unknown): string {
  const d = coerceDate(raw);
  if (!d) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalInputValue(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString();
}

/** Add hours to a local datetime-local string → ISO. */
export function endIsoFromStartLocal(startLocal: string, hours = 2): string {
  const d = new Date(startLocal);
  if (Number.isNaN(d.getTime())) return '';
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

export function hostLabel(e: {
  hostedBy?: unknown;
  host?: unknown;
  organizer?: unknown;
  hosts?: unknown;
}): string {
  if (typeof e.hostedBy === 'string') return e.hostedBy;
  const fromObj = (v: unknown) => {
    if (!v || typeof v !== 'object') return '';
    const o = v as Record<string, unknown>;
    return (
      safeString(o.businessName) ||
      safeString(o.displayName) ||
      safeString(o.name) ||
      ''
    );
  };
  if (e.hostedBy && typeof e.hostedBy === 'object') {
    const s = fromObj(e.hostedBy);
    if (s) return s;
  }
  const direct = fromObj(e.host) || fromObj(e.organizer);
  if (direct) return direct;
  if (Array.isArray(e.hosts) && e.hosts.length) {
    return fromObj(e.hosts[0]);
  }
  return '';
}

export function hostAvatarUrl(e: {
  hostedBy?: unknown;
  host?: unknown;
  organizer?: unknown;
  hosts?: unknown;
}): string {
  const pick = (v: unknown) => {
    if (!v || typeof v !== 'object') return '';
    const o = v as Record<string, unknown>;
    return safeString(o.avatarUrl) || safeString(o.imageUrl);
  };
  return (
    pick(e.hostedBy) ||
    pick(e.host) ||
    pick(e.organizer) ||
    (Array.isArray(e.hosts) ? pick(e.hosts[0]) : '')
  );
}

/**
 * N1 — Nest PR #3 covers (same as Flutter).
 * Prefer `coverImageUrl`, then `image_url`. Returns '' when null → honeycomb SVG.
 */
export function coverUrlOf(e: {
  coverImageUrl?: unknown;
  image_url?: unknown;
  imageUrl?: unknown;
  coverUrl?: unknown;
  cover?: unknown;
  coverImage?: unknown;
  bannerUrl?: unknown;
  posterUrl?: unknown;
  mediaUrl?: unknown;
  media?: unknown;
  images?: unknown;
}): string {
  const pickUrl = (v: unknown): string => {
    if (v == null) return '';
    if (typeof v === 'string') {
      const s = v.trim();
      if (!s || s === 'null' || s === 'undefined') return '';
      return s;
    }
    return '';
  };

  const fromMedia = (m: unknown): string => {
    if (!m) return '';
    if (typeof m === 'string') return pickUrl(m);
    if (Array.isArray(m) && m.length) return fromMedia(m[0]);
    if (typeof m === 'object') {
      const o = m as Record<string, unknown>;
      return (
        pickUrl(o.coverImageUrl) ||
        pickUrl(o.image_url) ||
        pickUrl(o.url) ||
        pickUrl(o.src) ||
        pickUrl(o.href) ||
        pickUrl(o.path)
      );
    }
    return '';
  };

  // Nest contract order — coverImageUrl then image_url (Flutter parity)
  return (
    pickUrl(e.coverImageUrl) ||
    pickUrl(e.image_url) ||
    pickUrl(e.imageUrl) ||
    pickUrl(e.coverUrl) ||
    fromMedia(e.coverImage) ||
    fromMedia(e.cover) ||
    fromMedia(e.media) ||
    fromMedia(e.images) ||
    pickUrl(e.bannerUrl) ||
    pickUrl(e.posterUrl) ||
    pickUrl(e.mediaUrl) ||
    ''
  );
}

/** No-cover: centered favicon honeycomb SVG mark — never text glyph “ü”, never stretched. */
export function brandCoverPlaceholderHtml(size: 'card' | 'detail' | 'banner' = 'card'): string {
  const cls =
    size === 'detail'
      ? 'cover-ph cover-ph--detail'
      : size === 'banner'
        ? 'cover-ph cover-ph--banner'
        : 'cover-ph cover-ph--card';
  const dim = size === 'detail' || size === 'banner' ? 88 : 72;
  return `<div class="${cls}" aria-hidden="true"><img class="cover-ph__favicon" src="/eku-favicon-mark.svg" width="${dim}" height="${dim}" alt="" decoding="async" /></div>`;
}
