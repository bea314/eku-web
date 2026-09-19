import { escapeHtml } from './safe-display';

export function loaderHtml(label = 'Cargando eventos'): string {
  return `<div class="page-loader" role="status" aria-live="polite" aria-label="${escapeHtml(label)}">
    <div class="page-loader__shape" aria-hidden="true"></div>
    <p class="page-loader__label">${escapeHtml(label)}</p>
  </div>`;
}
