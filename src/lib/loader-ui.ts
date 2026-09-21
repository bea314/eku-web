import { escapeHtml } from './safe-display';

const LABEL_ATTR = 'data-label';

export function loaderShapeHtml(extraClass = ''): string {
  const className = ['loader-shape', extraClass].filter(Boolean).join(' ');
  return `<span class="${className}" aria-hidden="true"></span>`;
}

export function loaderHtml(label = 'Cargando eventos'): string {
  return `<div class="page-loader" role="status" aria-live="polite" aria-label="${escapeHtml(label)}">
    ${loaderShapeHtml('page-loader__shape')}
    <p class="page-loader__label">${escapeHtml(label)}</p>
  </div>`;
}

export function setButtonLabel(button: HTMLButtonElement, label: string): void {
  button.setAttribute(LABEL_ATTR, label);
  const labelEl = button.querySelector<HTMLElement>('.btn__label');
  if (labelEl) {
    labelEl.textContent = label;
    return;
  }
  button.textContent = label;
}

export function setButtonLoading(button: HTMLButtonElement, loading: boolean): void {
  if (loading) {
    prepareButton(button);
    button.classList.add('is-loading');
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    const label = button.getAttribute(LABEL_ATTR) || button.textContent?.trim() || '';
    if (label) button.setAttribute('aria-label', label);
    return;
  }

  button.classList.remove('is-loading');
  button.disabled = false;
  button.removeAttribute('aria-busy');
  button.removeAttribute('aria-label');
  restoreButton(button);
}

export async function withButtonLoading<T>(
  button: HTMLButtonElement,
  task: () => Promise<T>,
  options: { keepOnSuccess?: boolean } = {},
): Promise<T> {
  setButtonLoading(button, true);
  try {
    const result = await task();
    if (!options.keepOnSuccess) setButtonLoading(button, false);
    return result;
  } catch (error) {
    setButtonLoading(button, false);
    throw error;
  }
}

function prepareButton(button: HTMLButtonElement): void {
  if (button.querySelector('.btn__label')) return;

  const label =
    button.getAttribute(LABEL_ATTR) ||
    button.textContent?.trim() ||
    button.getAttribute('aria-label') ||
    '';

  button.setAttribute(LABEL_ATTR, label);
  button.innerHTML = `${loaderShapeHtml('btn__loader')}<span class="btn__label">${escapeHtml(label)}</span>`;
}

function restoreButton(button: HTMLButtonElement): void {
  const label =
    button.getAttribute(LABEL_ATTR) ||
    button.querySelector('.btn__label')?.textContent?.trim() ||
    '';
  if (!label) return;
  button.textContent = label;
}
