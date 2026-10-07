import { asItemList } from './client-api';
import {
  ALL_CATEGORY,
  browseHref,
  filterCategoryIds,
  findActiveTopId,
  resolveTopCategories,
  usableCatalog,
  type ResolvedTop,
  type TopCategoryTone,
} from './category-tops';
import { escapeHtml } from './safe-display';
import type { Category } from './types';

export function catalogFromResponse(data: Category[] | { items?: Category[] } | null | undefined): Category[] {
  return usableCatalog(asItemList(data));
}

function catDotHtml(opts: {
  tag: 'a' | 'button';
  name: string;
  tone: TopCategoryTone;
  icon: string;
  href?: string;
  top?: string;
  categoryIds?: string;
  active?: boolean;
}): string {
  const activeClass = opts.active ? ' is-active' : '';
  const href = opts.tag === 'a' ? ` href="${escapeHtml(opts.href || '#')}"` : '';
  const type = opts.tag === 'button' ? ' type="button"' : '';
  const pressed = opts.tag === 'button' ? ` aria-pressed="${opts.active ? 'true' : 'false'}"` : '';
  return `<${opts.tag} class="cat-dot${activeClass}"${type}${href} data-top="${escapeHtml(opts.top || '')}" data-category-ids="${escapeHtml(opts.categoryIds || '')}"${pressed}>
    <span class="cat-dot__orb" data-tone="${escapeHtml(opts.tone)}" aria-hidden="true">${opts.icon}</span>
    <span class="cat-dot__name">${escapeHtml(opts.name)}</span>
  </${opts.tag}>`;
}

export function homeCategoryRowHtml(catalog: readonly Category[]): string {
  return resolveTopCategories(catalog)
    .map((top) =>
      catDotHtml({
        tag: 'a',
        name: top.name,
        tone: top.tone,
        icon: top.icon,
        href: browseHref(top),
        top: top.id,
        categoryIds: top.categoryIds.length ? filterCategoryIds(top.categoryIds) : '',
      }),
    )
    .join('');
}

export function browseCategoryRowHtml(
  resolved: readonly ResolvedTop[],
  opts: { top?: string | null; categoryIds?: string | null },
): { html: string; activeTop: ReturnType<typeof findActiveTopId> } {
  const activeTop = findActiveTopId(resolved, opts);
  const html = [
    catDotHtml({
      tag: 'button',
      name: ALL_CATEGORY.name,
      tone: ALL_CATEGORY.tone,
      icon: ALL_CATEGORY.icon,
      active: !activeTop,
    }),
    ...resolved.map((top) =>
      catDotHtml({
        tag: 'button',
        name: top.name,
        tone: top.tone,
        icon: top.icon,
        top: top.id,
        categoryIds: filterCategoryIds(top.categoryIds),
        active: activeTop === top.id,
      }),
    ),
  ].join('');
  return { html, activeTop };
}
