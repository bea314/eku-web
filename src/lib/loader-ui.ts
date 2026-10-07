import { escapeHtml } from './safe-display.ts';

const LABEL_ATTR = 'data-label';
const LOADING_LABEL_ATTR = 'data-loading-label';
const MIN_WIDTH_ATTR = 'data-loading-min-width';

export type ButtonLoadingOptions = {
  /**
   * When set, loading shows spinner + this label (visible), keeps button width.
   * Used by create «Publicando…». Default = spinner only (label hidden).
   */
  loadingLabel?: string;
};

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

export function setButtonLoading(
  button: HTMLButtonElement,
  loading: boolean,
  options: ButtonLoadingOptions = {},
): void {
  if (loading) {
    const loadingLabel = options.loadingLabel?.trim() || '';
    if (loadingLabel) {
      button.setAttribute(LOADING_LABEL_ATTR, loadingLabel);
    } else {
      button.removeAttribute(LOADING_LABEL_ATTR);
    }

    // Keep idle width so the button does not shrink when label changes.
    if (!button.getAttribute(MIN_WIDTH_ATTR)) {
      const w = Math.ceil(button.getBoundingClientRect().width);
      if (w > 0) {
        button.setAttribute(MIN_WIDTH_ATTR, String(w));
        button.style.minWidth = `${w}px`;
      }
    }

    prepareButton(button, loadingLabel || undefined);
    button.classList.add('is-loading');
    button.classList.toggle('is-loading--labeled', Boolean(loadingLabel));
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    const aria =
      loadingLabel ||
      button.getAttribute(LABEL_ATTR) ||
      button.textContent?.trim() ||
      '';
    if (aria) button.setAttribute('aria-label', aria);
    return;
  }

  button.classList.remove('is-loading');
  button.classList.remove('is-loading--labeled');
  button.disabled = false;
  button.removeAttribute('aria-busy');
  button.removeAttribute('aria-label');
  button.removeAttribute(LOADING_LABEL_ATTR);
  const minW = button.getAttribute(MIN_WIDTH_ATTR);
  if (minW) {
    button.style.minWidth = '';
    button.removeAttribute(MIN_WIDTH_ATTR);
  }
  restoreButton(button);
}

export async function withButtonLoading<T>(
  button: HTMLButtonElement,
  task: () => Promise<T>,
  options: { keepOnSuccess?: boolean; loadingLabel?: string } = {},
): Promise<T> {
  setButtonLoading(button, true, { loadingLabel: options.loadingLabel });
  try {
    const result = await task();
    if (!options.keepOnSuccess) setButtonLoading(button, false);
    return result;
  } catch (error) {
    setButtonLoading(button, false);
    throw error;
  }
}

function prepareButton(button: HTMLButtonElement, loadingLabel?: string): void {
  const idleLabel =
    button.getAttribute(LABEL_ATTR) ||
    button.querySelector('.btn__label')?.textContent?.trim() ||
    button.textContent?.trim() ||
    button.getAttribute('aria-label') ||
    '';

  if (idleLabel) button.setAttribute(LABEL_ATTR, idleLabel);

  const visible = (loadingLabel || idleLabel || '').trim();
  const existingLabel = button.querySelector<HTMLElement>('.btn__label');
  if (button.querySelector('.btn__loader') && existingLabel) {
    if (loadingLabel) existingLabel.textContent = loadingLabel;
    else if (idleLabel) existingLabel.textContent = idleLabel;
    return;
  }

  button.innerHTML = `${loaderShapeHtml('btn__loader')}<span class="btn__label">${escapeHtml(visible)}</span>`;
}

function restoreButton(button: HTMLButtonElement): void {
  const label =
    button.getAttribute(LABEL_ATTR) ||
    button.querySelector('.btn__label')?.textContent?.trim() ||
    '';
  if (!label) return;
  button.textContent = label;
}
