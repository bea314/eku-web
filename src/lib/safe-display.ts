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
 * Nest may send camelCase or snake_case. Read both from a plain record.
 * Prefer startDate / start_date (then startsAt / startAt / start).
 */
export function pickStartRaw(e: object | null | undefined): unknown {
  if (!e || typeof e !== 'object') return null;
  const o = e as Record<string, unknown>;
  return firstCoerceable(
    o.startDate,
    o.start_date,
    o.startsAt,
    o.start_at,
    o.startAt,
    o.start,
  );
}

/** Nest endDate | end_date | endsAt | end_at | endAt | end. */
export function pickEndRaw(e: object | null | undefined): unknown {
  if (!e || typeof e !== 'object') return null;
  const o = e as Record<string, unknown>;
  return firstCoerceable(
    o.endDate,
    o.end_date,
    o.endsAt,
    o.end_at,
    o.endAt,
    o.end,
  );
}

/** Fold for place dedupe: lowercase, no accents/diacritics. */
function foldPlacePart(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim();
}

/**
 * Dedupe Nest place strings without truncating by part count.
 * Only drops a comma-separated segment when it is identical (after folding
 * case/accents/spaces) to an already-kept segment — never substring matches.
 * «Av. San Salvador 45, San Salvador» stays unchanged.
 * Length display is handled by CSS line-clamp 2.
 */
export function normalizePlaceLabel(raw: string): string {
  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const out: string[] = [];
  for (const part of parts) {
    const key = foldPlacePart(part);
    if (!key) continue;
    if (out.some((o) => foldPlacePart(o) === key)) continue;
    out.push(part);
  }
  return out.join(', ');
}

export function formatPlace(e: {
  isVirtual?: boolean;
  virtual?: boolean;
  place?: unknown;
  placeText?: unknown;
  locationText?: unknown;
  locationLabel?: unknown;
  location_label?: unknown;
  location?: unknown;
  /** Nest wallet: street/venue address (prefer over geo `venue`). */
  address?: unknown;
  venue?: unknown;
}): string {
  if (e.isVirtual || e.virtual) return 'Virtual';
  const loc = e.location;
  const fromLocObj =
    loc && typeof loc === 'object'
      ? safeString((loc as Record<string, unknown>).label) ||
        safeString((loc as Record<string, unknown>).name) ||
        safeString((loc as Record<string, unknown>).address) ||
        safeString((loc as Record<string, unknown>).formattedAddress) ||
        safeString((loc as Record<string, unknown>).formatted_address)
      : '';
  // Prefer event location / place labels over Nest wallet geo `venue`
  // («Teatro, San Salvador Centro…»). Wallet `address` matches detail when present.
  const candidates = [
    fromLocObj || null,
    e.locationLabel,
    e.location_label,
    e.place,
    e.placeText,
    e.locationText,
    typeof loc === 'string' ? loc : null,
    e.address,
    e.venue,
  ];
  for (const c of candidates) {
    const s = normalizePlaceLabel(safeString(c));
    if (s) return s;
  }
  return 'Lugar por confirmar';
}

export function formatTitle(e: { name?: unknown; title?: unknown }): string {
  return safeString(e.name) || safeString(e.title) || 'Evento sin título';
}

const SV_TZ = 'America/El_Salvador';

const timeFmt = () =>
  new Intl.DateTimeFormat('es', {
    timeZone: SV_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

const cardWhenFmt = () =>
  new Intl.DateTimeFormat('es', {
    timeZone: SV_TZ,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

function svParts(d: Date): {
  weekday: string;
  day: string;
  month: string;
  year: string;
  time: string;
  dayKey: string;
} {
  const parts = new Intl.DateTimeFormat('es', {
    timeZone: SV_TZ,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value || '';
  let hour = get('hour');
  if (hour === '24') hour = '00';
  const weekday = get('weekday').replace(/\.$/, '');
  const month = get('month').replace(/\.$/, '');
  const day = get('day');
  const year = get('year');
  const dayKey = new Intl.DateTimeFormat('en-CA', {
    timeZone: SV_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
  return {
    weekday,
    day,
    month,
    year,
    time: `${hour}:${get('minute')}`,
    dayKey,
  };
}

/** «lun 12 oct» or «lun 12 oct 2026» when showYear. */
function formatSvDayLabel(p: ReturnType<typeof svParts>, showYear: boolean): string {
  return showYear
    ? `${p.weekday} ${p.day} ${p.month} ${p.year}`
    : `${p.weekday} ${p.day} ${p.month}`;
}

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
  const parts = new Intl.DateTimeFormat('es', {
    timeZone: SV_TZ,
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value || '';
  let hour = get('hour');
  if (hour === '24') hour = '00';
  const time = `${hour}:${get('minute')}`;
  return {
    month: get('month').replace('.', ''),
    day: get('day'),
    time,
    full: cardWhenFmt().format(d),
  };
}

/**
 * Explore/Flutter-style when line from Nest start/end (snake or camel).
 * - `full` → card: same day «lun 12 oct · 21:00 – 23:00»; cross-day start only.
 * - `detail` → detail: same day as card; cross-day
 *   «lun 12 oct, 21:00 – mar 13 oct, 02:00» (year only if years differ).
 * Null end → start only (no dash / no «Fin por confirmar»).
 */
export function formatEventWhen(e: object | null | undefined): {
  month: string;
  day: string;
  time: string;
  full: string;
  detail: string;
} {
  const start = coerceDate(pickStartRaw(e));
  if (!start) {
    return { month: '—', day: '—', time: '', full: 'Fecha por confirmar', detail: 'Fecha por confirmar' };
  }
  const parts = formatWhenParts(start);
  const startP = svParts(start);
  const startSameDay = `${formatSvDayLabel(startP, false)} · ${startP.time}`;

  const end = coerceDate(pickEndRaw(e));
  if (!end || end.getTime() === start.getTime()) {
    return { ...parts, time: startP.time, full: startSameDay, detail: startSameDay };
  }

  const endP = svParts(end);
  const sameDay = startP.dayKey === endP.dayKey;
  if (sameDay) {
    const line = `${formatSvDayLabel(startP, false)} · ${startP.time} – ${endP.time}`;
    return { ...parts, time: startP.time, full: line, detail: line };
  }

  // Cross midnight (or more): card = start only; detail = both days
  const showYear = startP.year !== endP.year;
  const detail = `${formatSvDayLabel(startP, showYear)}, ${startP.time} – ${formatSvDayLabel(endP, showYear)}, ${endP.time}`;
  return { ...parts, time: startP.time, full: startSameDay, detail };
}

export function formatWhenLong(raw: unknown): string {
  const d = coerceDate(raw);
  if (!d) return 'Fecha por confirmar';
  return new Intl.DateTimeFormat('es', {
    timeZone: SV_TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

/**
 * Past = end (or start when no end) is strictly before `now`.
 * Nest dates are ISO instants; display TZ is America/El_Salvador (SV_TZ).
 * Inject `now` for tests. Missing both start and end → not past.
 */
export function isEventPast(
  e: object | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!e || Number.isNaN(now.getTime())) return false;
  const end = coerceDate(pickEndRaw(e));
  if (end) return end.getTime() < now.getTime();
  const start = coerceDate(pickStartRaw(e));
  if (start) return start.getTime() < now.getTime();
  return false;
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
 * Nest wallet (`wallet.service.ts`) injects this Unsplash mic URL when
 * `cover_media` is null — not a real event cover. Treat as empty → ü.
 */
export const NEST_WALLET_COVER_PLACEHOLDER =
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4';

function isNestWalletCoverPlaceholder(url: string): boolean {
  return url.includes('photo-1511671782779-c97d3d27a1d4');
}

/**
 * N1 — Nest covers (Flutter parity).
 * Prefer coverImageUrl | cover_image_url | eventCoverUrl | image_url. '' → white SVG ü mask.
 * Strips Nest wallet synthetic placeholder so coverless events stay coverless.
 */
export function coverUrlOf(e: object | null | undefined): string {
  if (!e || typeof e !== 'object') return '';
  const rec = e as Record<string, unknown>;

  const pickUrl = (v: unknown): string => {
    if (v == null) return '';
    if (typeof v === 'string') {
      const s = v.trim();
      if (!s || s === 'null' || s === 'undefined') return '';
      if (isNestWalletCoverPlaceholder(s)) return '';
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
        pickUrl(o.cover_image_url) ||
        pickUrl(o.image_url) ||
        pickUrl(o.url) ||
        pickUrl(o.src) ||
        pickUrl(o.href) ||
        pickUrl(o.path)
      );
    }
    return '';
  };

  return (
    pickUrl(rec.coverImageUrl) ||
    pickUrl(rec.cover_image_url) ||
    pickUrl(rec.eventCoverUrl) ||
    pickUrl(rec.event_cover_url) ||
    pickUrl(rec.image_url) ||
    pickUrl(rec.imageUrl) ||
    pickUrl(rec.coverUrl) ||
    fromMedia(rec.coverImage) ||
    fromMedia(rec.cover) ||
    fromMedia(rec.media) ||
    fromMedia(rec.images) ||
    pickUrl(rec.bannerUrl) ||
    pickUrl(rec.posterUrl) ||
    pickUrl(rec.mediaUrl) ||
    ''
  );
}

/** Official ü mark SVG (`/eku-icon.svg`, 1080×1080 artboard). Rendered white via CSS mask. */
export const COVER_MARK_SVG = '/eku-icon.svg';

/** Inner mark only — CSS-masked white glyph (for create-preview / no-cover). */
export function coverMarkHtml(): string {
  return `<span class="cover-ph__mark" aria-hidden="true"></span>`;
}

/** No-cover: official `/eku-icon.svg` as mask → white ü on gradient (~72px). Not favicon-32 upscale. */
export function brandCoverPlaceholderHtml(size: 'card' | 'detail' | 'banner' = 'card'): string {
  const cls =
    size === 'detail'
      ? 'cover-ph cover-ph--detail'
      : size === 'banner'
        ? 'cover-ph cover-ph--banner'
        : 'cover-ph cover-ph--card';
  return `<div class="${cls}" aria-hidden="true">${coverMarkHtml()}</div>`;
}

export type CoverFallbackSize = 'card' | 'detail' | 'banner';

/**
 * Cover <img> that falls back to brand ü placeholder on load error / missing asset.
 * Same markup path for cards and detail.
 */
export function coverImageWithFallbackHtml(
  url: string,
  size: CoverFallbackSize = 'card',
  extraAttrs = '',
): string {
  const src = escapeHtml(url);
  const sizeAttr = escapeHtml(size);
  const attrs = extraAttrs ? ` ${extraAttrs.trim()}` : '';
  return `<img src="${src}" alt="" data-cover-fallback="${sizeAttr}"${attrs} />`;
}

/** Media block for cards/detail: real URL with onerror fallback, or placeholder if empty. */
export function coverMediaHtml(
  url: string,
  size: CoverFallbackSize = 'card',
  extraAttrs = '',
): string {
  const trimmed = String(url || '').trim();
  if (!trimmed) return brandCoverPlaceholderHtml(size);
  return coverImageWithFallbackHtml(trimmed, size, extraAttrs);
}
