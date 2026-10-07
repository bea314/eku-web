import { getStoredToken } from './client-api.ts';
import { escapeHtml } from './safe-display.ts';

/** Default discovery empty (home + /eventos unfiltered). PO copy. */
export const EMPTY_UPCOMING_TITLE = 'Todavía no hay eventos próximos.';
export const EMPTY_CREATE_LABEL = 'Crear evento';

/** Neutral calendar/ticket glyph — not an error face. Color via CSS (#3368b1). */
function emptyIconSvg(): string {
  return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.25" stroke="currentColor" stroke-width="1.8"/>
      <path d="M3.5 10h17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M8 3.75v3.5M16 3.75v3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <rect x="7.25" y="13.25" width="3.1" height="3.1" rx="0.6" fill="currentColor"/>
      <rect x="13.65" y="13.25" width="3.1" height="3.1" rx="0.6" fill="currentColor"/>
    </svg>`;
}

function emptyEventsHtml(opts?: { title?: string; lead?: string }): string {
  const title = opts?.title ?? EMPTY_UPCOMING_TITLE;
  const lead = opts?.lead;
  const createHref = getStoredToken()
    ? '/organizador'
    : `/login?next=${encodeURIComponent('/organizador')}`;

  // Empty ≠ error: message + primary Crear evento only. No Reintentar.
  return `<div class="empty" role="status">
    <span class="empty__icon" aria-hidden="true">
      ${emptyIconSvg()}
    </span>
    <p><strong>${escapeHtml(title)}</strong></p>
    ${lead ? `<p class="muted">${escapeHtml(lead)}</p>` : ''}
    <div class="empty__actions">
      <a class="empty__cta" href="${escapeHtml(createHref)}">${EMPTY_CREATE_LABEL}</a>
    </div>
  </div>`;
}

/**
 * Discovery empty state (not an API error).
 * `onRetry` is accepted for call-site compatibility but unused — Reintentar
 * belongs only on real API error alerts.
 */
export function renderEmptyEvents(
  list: HTMLElement,
  _onRetry?: () => void,
  opts?: { title?: string; lead?: string },
): void {
  list.innerHTML = emptyEventsHtml(opts);
}
