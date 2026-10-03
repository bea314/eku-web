import { getStoredToken } from './client-api';
import { escapeHtml } from './safe-display';

function emptyEventsHtml(opts?: { title?: string; lead?: string }): string {
  const title = opts?.title ?? 'Todavía no hay eventos públicos.';
  const lead = opts?.lead ?? 'Cuando alguien publique uno, aparece acá.';
  const createHref = getStoredToken()
    ? '/organizador'
    : `/login?next=${encodeURIComponent('/organizador')}`;

  return `<div class="empty" role="status">
    <span class="empty__icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8.25" stroke="currentColor" stroke-width="1.8"/>
        <circle cx="9" cy="10" r="1.05" fill="currentColor"/>
        <circle cx="15" cy="10" r="1.05" fill="currentColor"/>
        <path d="M8.6 16.2c1.15-1.35 2.5-2 3.4-2s2.25.65 3.4 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    </span>
    <p><strong>${escapeHtml(title)}</strong></p>
    <p class="muted">${escapeHtml(lead)}</p>
    <div class="empty__actions">
      <button class="empty__link" type="button" data-empty-retry>Reintentar</button>
      <a class="empty__cta" href="${escapeHtml(createHref)}">Crear evento</a>
    </div>
  </div>`;
}

function bindEmptyEventsRetry(root: ParentNode, onRetry: () => void): void {
  root.querySelectorAll<HTMLButtonElement>('[data-empty-retry]').forEach((btn) => {
    if (btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      onRetry();
    });
  });
}

export function renderEmptyEvents(
  list: HTMLElement,
  onRetry: () => void,
  opts?: { title?: string; lead?: string },
): void {
  list.innerHTML = emptyEventsHtml(opts);
  bindEmptyEventsRetry(list, onRetry);
}
