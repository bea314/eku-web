import type { Category } from './types';

/** Nest id that matches nothing — keeps an empty top from falling back to “all events”. */
export const EMPTY_CATEGORY_ID = '-1';

export type TopCategoryId =
  | 'musica'
  | 'show'
  | 'arte'
  | 'talleres'
  | 'fiesta'
  | 'teatro'
  | 'deportes'
  | 'gaming';

export type TopCategoryTone =
  | 'ink'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'coral'
  | 'blue-mid'
  | 'green-deep'
  | 'ink-deep'
  | 'muted';

export interface TopCategoryDef {
  id: TopCategoryId;
  name: string;
  tone: TopCategoryTone;
  /** Folded catalog-name needles (accents stripped). */
  match: readonly string[];
  icon: string;
}

export interface ResolvedTop extends TopCategoryDef {
  categoryIds: string[];
}

const ICON = {
  music: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9.2 16.8c0 1.5-1.3 2.7-2.8 2.7S3.6 18.3 3.6 16.8s1.3-2.7 2.8-2.7c.4 0 .8.1 1.1.2V6.2c0-.5.3-.9.8-1l9.2-2.1c.7-.2 1.3.4 1.3 1.1v9.9c0 1.5-1.3 2.7-2.8 2.7s-2.8-1.2-2.8-2.7 1.3-2.7 2.8-2.7c.4 0 .8.1 1.1.2V7.4L9.2 9.2v7.6Z" fill="currentColor"/></svg>`,
  mic: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.2a3.2 3.2 0 0 1 3.2 3.2v5.2a3.2 3.2 0 1 1-6.4 0V6.4A3.2 3.2 0 0 1 12 3.2Z" fill="currentColor"/><path d="M6.4 11.2a.8.8 0 0 1 .8.8 4.8 4.8 0 1 0 9.6 0 .8.8 0 1 1 1.6 0 6.4 6.4 0 0 1-5.6 6.35V20h2.4a.8.8 0 1 1 0 1.6H8.8a.8.8 0 1 1 0-1.6h2.4v-1.65A6.4 6.4 0 0 1 5.6 12a.8.8 0 0 1 .8-.8Z" fill="currentColor"/></svg>`,
  palette: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.2a8.8 8.8 0 1 0 0 17.6c1.3 0 2-.7 2-1.6 0-.5-.2-.9-.6-1.2-.4-.3-.6-.7-.6-1.2 0-.9.7-1.6 1.6-1.6h1.9A4.3 4.3 0 0 0 20.8 11 8.8 8.8 0 0 0 12 3.2Zm-4.4 8.2a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Zm2-4a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Zm4.8 0a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Zm2 4a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z" fill="currentColor"/></svg>`,
  bulb: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2.8A6.2 6.2 0 0 0 5.8 9c0 2.3 1.2 4.3 3 5.5v1.3c0 .8.6 1.4 1.4 1.4h3.6c.8 0 1.4-.6 1.4-1.4v-1.3c1.8-1.2 3-3.2 3-5.5A6.2 6.2 0 0 0 12 2.8ZM9.8 19.4c0-.4.4-.8.8-.8h2.8c.4 0 .8.4.8.8s-.4.8-.8.8h-2.8c-.4 0-.8-.4-.8-.8Zm.6 2c0-.4.4-.8.8-.8h1.6c.4 0 .8.4.8.8s-.4.8-.8.8h-1.6c-.4 0-.8-.4-.8-.8Z" fill="currentColor"/></svg>`,
  party: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.2 20.6 8.8 8.4a.8.8 0 0 1 1.1-.4L16 10.8a.8.8 0 0 1 .3 1.1L11.7 21a.8.8 0 0 1-.8.4H4.8a.8.8 0 0 1-.6-.8Z" fill="currentColor"/><path d="M14.2 4.4c.3-.5 1.1-.4 1.3.2l.5 1.5 1.5.2c.6.1.8.9.3 1.3l-1.2.9.4 1.5c.2.6-.5 1.1-1 .8l-1.3-.8-1.3.8c-.5.3-1.2-.2-1-.8l.4-1.5-1.2-.9c-.5-.4-.3-1.2.3-1.3l1.5-.2.5-1.5Z" fill="currentColor"/><path d="M19.2 9.2c.2-.4.8-.3.9.1l.2.8.8.1c.4 0 .6.6.2.8l-.7.5.2.8c.1.4-.4.7-.7.5l-.7-.4-.7.4c-.3.2-.8-.1-.7-.5l.2-.8-.7-.5c-.4-.2-.2-.8.2-.8l.8-.1.2-.8Z" fill="currentColor"/></svg>`,
  masks: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.4 6.6c2.1-.8 4.6-.8 6.6.2 1.1.5 1.8 1.4 2 2.5v.1c.2-1.1.9-2 2-2.5 2-.1 4.5.9 6.6.2.7-.3 1.4.3 1.3 1.1C22.6 12 20.4 18 16.6 18c-1.5 0-2.6-.7-3.3-1.7-.7 1-1.8 1.7-3.3 1.7C6.3 18 4.1 12 3.1 7.7c-.1-.8.6-1.4 1.3-1.1Zm3.2 4.1a1.05 1.05 0 1 0 0 2.1 1.05 1.05 0 0 0 0-2.1Zm8.8 0a1.05 1.05 0 1 0 0 2.1 1.05 1.05 0 0 0 0-2.1ZM8.4 14.6c.6.5 1.4.8 2.2.8.4 0 .7 0 1-.2-.4-.6-1.1-1-2-1-.7 0-1.3.2-1.8.5l.6-.1Zm5 0c.5-.3 1.1-.5 1.8-.5.9 0 1.6.4 2 1-.3.1-.6.2-1 .2-.8 0-1.6-.3-2.2-.8l-.6.1Z" fill="currentColor"/></svg>`,
  pad: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7.2 7.2h9.6A4.4 4.4 0 0 1 21.2 11.6v2.8A4.4 4.4 0 0 1 16.8 18.8H7.2A4.4 4.4 0 0 1 2.8 14.4v-2.8A4.4 4.4 0 0 1 7.2 7.2Zm1.6 3.2a.8.8 0 0 0-.8.8v1.2H6.8a.8.8 0 1 0 0 1.6h1.2v1.2a.8.8 0 1 0 1.6 0v-1.2h1.2a.8.8 0 1 0 0-1.6H9.6V11.2a.8.8 0 0 0-.8-.8Zm7.6.2a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm2.2 2.4a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" fill="currentColor"/></svg>`,
  ball: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.2a8.8 8.8 0 1 1 0 17.6 8.8 8.8 0 0 1 0-17.6Zm0 1.6a7.2 7.2 0 0 0-6.9 5.2c1.7.3 3.7.3 5.6-.2 1.7-.5 3.2-1.3 4.3-2.3A7.2 7.2 0 0 0 12 4.8Zm5.9 2.3c-1.4 1.2-3.2 2.2-5.2 2.8-2.2.6-4.5.6-6.5.2A7.2 7.2 0 0 0 12 19.2a7.2 7.2 0 0 0 7.1-6.1c-.8.2-1.6.2-2.4.1-1.4-.2-2.8-.8-3.9-1.7 1.8-.3 3.6-1.1 5.1-2.4Z" fill="currentColor"/></svg>`,
  ticket: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.4 8.2A2.2 2.2 0 0 1 6.6 6h10.8A2.2 2.2 0 0 1 19.6 8.2v1.1a2.1 2.1 0 0 0 0 4.2v1.1A2.2 2.2 0 0 1 17.4 16.8H6.6A2.2 2.2 0 0 1 4.4 14.6v-1.1a2.1 2.1 0 0 0 0-4.2V8.2Zm4.4.6a.8.8 0 0 0-.8.8v5.2a.8.8 0 0 0 1.6 0V9.6a.8.8 0 0 0-.8-.8Z" fill="currentColor"/></svg>`,
} as const;

export const TOP_CATEGORIES: readonly TopCategoryDef[] = [
  { id: 'musica', name: 'Música', tone: 'ink', match: ['musica', 'concierto', 'karaoke'], icon: ICON.music },
  { id: 'show', name: 'Show', tone: 'blue', match: ['show', 'festival', 'gala', 'desfile'], icon: ICON.mic },
  { id: 'arte', name: 'Arte', tone: 'green', match: ['arte', 'exposicion', 'cine'], icon: ICON.palette },
  { id: 'talleres', name: 'Talleres / cursos', tone: 'yellow', match: ['taller', 'curso', 'seminario', 'conferencia', 'charla'], icon: ICON.bulb },
  { id: 'fiesta', name: 'Fiesta', tone: 'coral', match: ['fiesta'], icon: ICON.party },
  { id: 'teatro', name: 'Teatro', tone: 'blue-mid', match: ['teatro'], icon: ICON.masks },
  { id: 'deportes', name: 'Deportes', tone: 'green-deep', match: ['deporte', 'futbol', 'partido', 'competencia'], icon: ICON.ball },
  { id: 'gaming', name: 'Gaming', tone: 'ink-deep', match: ['gaming', 'juego', 'videojuego'], icon: ICON.pad },
];

export const ALL_CATEGORY = {
  id: 'todos',
  name: 'Todos',
  tone: 'muted' as const,
  icon: ICON.ticket,
};

export function foldCategoryText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function isUsableCategory(value: unknown): value is Category {
  if (!value || typeof value !== 'object') return false;
  const c = value as Category;
  return c.id != null && String(c.id) !== '' && typeof c.name === 'string' && Boolean(c.name);
}

export function usableCatalog(items: readonly unknown[]): Category[] {
  return items.filter(isUsableCategory);
}

function matchesTop(name: string, top: TopCategoryDef): boolean {
  const folded = foldCategoryText(name);
  if (!folded) return false;
  return top.match.some((needle) => folded.includes(needle));
}

export function resolveTopCategories(catalog: readonly unknown[]): ResolvedTop[] {
  const usable = usableCatalog(catalog);
  return TOP_CATEGORIES.map((top) => ({
    ...top,
    categoryIds: usable.filter((c) => matchesTop(c.name, top)).map((c) => String(c.id)),
  }));
}

/** Query value for Nest `categoryIds`. Empty tops send -1 so the list stays empty. */
export function filterCategoryIds(ids: readonly string[]): string {
  const clean = ids.map((id) => String(id).trim()).filter((id) => id && id !== EMPTY_CATEGORY_ID);
  return clean.length ? clean.join(',') : EMPTY_CATEGORY_ID;
}

export function browseHref(top: Pick<ResolvedTop, 'id' | 'categoryIds'>): string {
  const ids = top.categoryIds.length ? filterCategoryIds(top.categoryIds) : '';
  const q = new URLSearchParams();
  q.set('top', top.id);
  if (ids) q.set('categoryIds', ids);
  return `/eventos?${q.toString()}`;
}

export function findActiveTopId(
  resolved: readonly ResolvedTop[],
  opts: { top?: string | null; categoryIds?: string | null },
): TopCategoryId | '' {
  const slug = String(opts.top || '').trim();
  if (resolved.some((t) => t.id === slug)) return slug as TopCategoryId;

  const wanted = new Set(
    String(opts.categoryIds || '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && s !== EMPTY_CATEGORY_ID),
  );
  if (!wanted.size) return '';
  const hit = resolved.find((t) => t.categoryIds.some((id) => wanted.has(id)));
  return hit?.id ?? '';
}
