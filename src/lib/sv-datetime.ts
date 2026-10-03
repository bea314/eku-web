/**
 * El Salvador (UTC-6) date/time helpers for create form.
 * Display: dd/mm/aaaa + hh:mm (24h). Nest payload: ISO UTC.
 */

const SV_OFFSET = '-06:00';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** True calendar day (rejects 31/02, 29/02 non-leap, 00/13, etc.). */
export function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (year < 1000 || year > 9999) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  const probe = new Date(Date.UTC(year, month - 1, day));
  return (
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day
  );
}

export function isValidTime24(hour: number, minute: number): boolean {
  return (
    Number.isInteger(hour) &&
    Number.isInteger(minute) &&
    hour >= 0 &&
    hour <= 23 &&
    minute >= 0 &&
    minute <= 59
  );
}

/** Normalize pasted/typed date → digit string (max 8). Accepts 16102026 or 16/10/2026. */
export function dateDigitsOnly(raw: string): string {
  return String(raw || '').replace(/\D/g, '').slice(0, 8);
}

/** Normalize pasted/typed time → digit string (max 4). Accepts 2030 or 20:30. */
export function timeDigitsOnly(raw: string): string {
  return String(raw || '').replace(/\D/g, '').slice(0, 4);
}

/**
 * Mask digits → dd/mm/aaaa. Safe for paste with/without separators and backspace
 * (reformats from digits only, so deleting a slash just drops the next digit slot).
 */
export function maskDdMmYyyy(raw: string): string {
  const digits = dateDigitsOnly(raw);
  const dd = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);
  let out = dd;
  if (digits.length >= 3) out += `/${mm}`;
  if (digits.length >= 5) out += `/${yyyy}`;
  return out;
}

/** Mask digits → hh:mm */
export function maskHhMm(raw: string): string {
  const digits = timeDigitsOnly(raw);
  const hh = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  if (digits.length <= 2) return hh;
  return `${hh}:${mm}`;
}

export type SvDateParse =
  | { ok: true; day: number; month: number; year: number; formatted: string }
  | { ok: false; reason: 'empty' | 'incomplete' | 'invalid' };

export type SvTimeParse =
  | { ok: true; hour: number; minute: number; formatted: string }
  | { ok: false; reason: 'empty' | 'incomplete' | 'invalid' };

/** Parse a date field (may be masked or pasted digits). */
export function parseSvDatePart(raw: string): SvDateParse {
  const trimmed = String(raw ?? '').trim();
  if (!trimmed) return { ok: false, reason: 'empty' };
  const digits = dateDigitsOnly(trimmed);
  if (digits.length < 8) return { ok: false, reason: 'incomplete' };
  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const year = Number(digits.slice(4, 8));
  if (!isValidCalendarDate(year, month, day)) return { ok: false, reason: 'invalid' };
  return {
    ok: true,
    day,
    month,
    year,
    formatted: `${pad2(day)}/${pad2(month)}/${year}`,
  };
}

/** Parse a time field (24h). */
export function parseSvTimePart(raw: string): SvTimeParse {
  const trimmed = String(raw ?? '').trim();
  if (!trimmed) return { ok: false, reason: 'empty' };
  const digits = timeDigitsOnly(trimmed);
  if (digits.length < 4) return { ok: false, reason: 'incomplete' };
  const hour = Number(digits.slice(0, 2));
  const minute = Number(digits.slice(2, 4));
  if (!isValidTime24(hour, minute)) return { ok: false, reason: 'invalid' };
  return {
    ok: true,
    hour,
    minute,
    formatted: `${pad2(hour)}:${pad2(minute)}`,
  };
}

export type SvDateTimeClassify =
  | { ok: true; iso: string }
  | {
      ok: false;
      /** empty = both blank; incomplete = missing half; bad_date / bad_time = exact UX copy */
      reason: 'empty' | 'incomplete' | 'bad_date' | 'bad_time';
    };

/**
 * Classify start/end pair for form validation messages.
 * - empty → obligatory copy
 * - incomplete → obligatory copy (still filling)
 * - bad_date → «Esa fecha no existe»
 * - bad_time → «Esa hora no es válida»
 */
export function classifySvDateTime(datePart: string, timePart: string): SvDateTimeClassify {
  const d = parseSvDatePart(datePart);
  const t = parseSvTimePart(timePart);
  if (d.reason === 'empty' && t.reason === 'empty') return { ok: false, reason: 'empty' };
  if (d.reason === 'invalid') return { ok: false, reason: 'bad_date' };
  if (t.reason === 'invalid') return { ok: false, reason: 'bad_time' };
  if (!d.ok || !t.ok) return { ok: false, reason: 'incomplete' };
  const isoLocal = `${d.year}-${pad2(d.month)}-${pad2(d.day)}T${pad2(t.hour)}:${pad2(t.minute)}:00${SV_OFFSET}`;
  const parsed = new Date(isoLocal);
  if (Number.isNaN(parsed.getTime())) return { ok: false, reason: 'bad_date' };
  return { ok: true, iso: parsed.toISOString() };
}

/** Parse dd/mm/aaaa + hh:mm as SV wall time → ISO UTC (null if invalid). */
export function parseSvDateTime(datePart: string, timePart: string): string | null {
  const c = classifySvDateTime(datePart, timePart);
  return c.ok ? c.iso : null;
}

/** Format ISO → { date: dd/mm/aaaa, time: hh:mm } in America/El_Salvador. */
export function formatSvDateTime(iso: string): { date: string; time: string } | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/El_Salvador',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value || '';
  let hour = get('hour');
  if (hour === '24') hour = '00';
  return {
    date: `${get('day')}/${get('month')}/${get('year')}`,
    time: `${hour}:${get('minute')}`,
  };
}

/** Add hours to an SV wall-time pair → new ISO. */
export function addHoursSv(datePart: string, timePart: string, hours: number): string | null {
  const iso = parseSvDateTime(datePart, timePart);
  if (!iso) return null;
  const d = new Date(iso);
  d.setUTCHours(d.getUTCHours() + hours);
  return d.toISOString();
}
