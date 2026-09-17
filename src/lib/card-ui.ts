/** Shared client card markup (U4). Heart is UI stub only — no favorites persist. */

import { brandCoverPlaceholderHtml, coverUrlOf, escapeHtml, formatPlace, formatTitle, formatWhenParts, pickStartRaw, safeString } from './safe-display';

export function heartStubButtonHtml(): string {
  return `<button class="heart-stub" type="button" aria-label="Favorito (próximamente)" data-heart-stub>
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
    </svg>
  </button>`;
}

export function bindHeartStubs(root: ParentNode = document): void {
  root.querySelectorAll<HTMLButtonElement>('[data-heart-stub]').forEach((btn) => {
    if (btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const toast = document.getElementById('nav-toast');
      if (toast) {
        toast.hidden = false;
        toast.textContent = 'Favoritos próximamente — no se guardan todavía.';
        window.setTimeout(() => {
          toast.hidden = true;
        }, 2200);
      }
    });
  });
}

export function eventCardHtml(
  e: Record<string, unknown> & { id: string },
  i: number,
  extraAttrs = '',
): string {
  const when = formatWhenParts(pickStartRaw(e));
  const cover = coverUrlOf(e);
  const media = cover
    ? `<img src="${escapeHtml(cover)}" alt="" loading="lazy" />`
    : brandCoverPlaceholderHtml('card');
  const visibility = safeString(e.visibility);
  const badge =
    visibility && visibility !== 'public'
      ? `<span class="badge">${escapeHtml(visibility)}</span>`
      : '';
  const dateChip = when.time
    ? `<div class="event-card__date-chip" aria-label="${escapeHtml(when.full)}">
        <span class="month">${escapeHtml(when.month)}</span>
        <span class="day">${escapeHtml(when.day)}</span>
        <span class="time">${escapeHtml(when.time)}</span>
      </div>`
    : '';

  return `<a class="event-card" href="/eventos/${encodeURIComponent(String(e.id))}" style="animation-delay:${Math.min(i, 8) * 35}ms" ${extraAttrs}>
    <div class="event-card__media">
      ${media}
      <div class="event-card__media-top">${heartStubButtonHtml()}</div>
      ${dateChip}
    </div>
    <div class="event-card__body">
      <h2>${escapeHtml(formatTitle(e))}</h2>
      <div class="event-card__meta">
        <span class="event-card__place">${escapeHtml(formatPlace(e))}</span>
        <span class="event-card__when">${escapeHtml(when.full)}</span>
        ${badge}
      </div>
      <div class="event-card__cta">
        <span class="event-card__price">Gratis</span>
        <span class="event-card__action">Ver evento →</span>
      </div>
    </div>
  </a>`;
}
