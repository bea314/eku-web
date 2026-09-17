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

export function pickStartRaw(e: {
  startsAt?: unknown;
  startAt?: unknown;
  startDate?: unknown;
}): unknown {
  return e.startsAt ?? e.startAt ?? e.startDate;
}

export function pickEndRaw(e: {
  endsAt?: unknown;
  endAt?: unknown;
  endDate?: unknown;
}): unknown {
  return e.endsAt ?? e.endAt ?? e.endDate;
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

export function formatWhenParts(raw: unknown): {
  month: string;
  day: string;
  time: string;
  full: string;
} {
  const d = coerceDate(raw);
  if (!d) {
    return { month: '—', day: '?', time: '', full: 'Fecha por confirmar' };
  }
  return {
    month: new Intl.DateTimeFormat('es', { month: 'short' })
      .format(d)
      .replace('.', ''),
    day: String(d.getDate()),
    time: new Intl.DateTimeFormat('es', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(d),
    full: new Intl.DateTimeFormat('es', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d),
  };
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

export function coverUrlOf(e: {
  coverUrl?: unknown;
  imageUrl?: unknown;
  cover?: unknown;
}): string {
  return (
    safeString(e.coverUrl) ||
    safeString(e.imageUrl) ||
    safeString(e.cover) ||
    ''
  );
}
