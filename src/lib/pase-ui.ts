/** Shared pase ticket markup + QR paint (U11). Pages only resolve data. */

import { paintQrCanvas } from './client-qr';
import { escapeHtml, safeString } from './safe-display';
import type { PaseTicket } from './pase';
import type { EventItem, TicketType } from './types';

export const PASE_QR_CONFIRM = 304;
export const PASE_QR_WALLET = 168;

export function ticketTypeName(ticket: PaseTicket, types: TicketType[] = []): string {
  if (ticket.eventTicketTypeId != null) {
    const found = types.find((t) => String(t.id) === String(ticket.eventTicketTypeId));
    const name = safeString(found?.name);
    if (name) return name;
  }
  return safeString(ticket.ticketTypeName) || 'General';
}

export function categoryLabel(event: EventItem | null | undefined): string {
  if (!event) return '';
  const rec = event as EventItem & { categories?: Array<{ name?: unknown }> };
  if (Array.isArray(rec.categories) && rec.categories[0]) {
    return safeString(rec.categories[0].name);
  }
  return safeString(rec.category);
}

function factRow(label: string, value: string): string {
  if (!value) return '';
  return `<div class="pase-card__fact">
      <dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(value)}</dd>
    </div>`;
}

export function paseCardHtml(opts: {
  ticket: PaseTicket;
  code: string;
  index: number;
  variant: 'pass' | 'wallet';
  title: string;
  type?: string;
  category?: string;
  when?: string;
  place?: string;
  host?: string;
  cover?: string;
}): string {
  const { ticket, code, index, variant } = opts;
  const title = escapeHtml(opts.title || ticket.name || ticket.eventName || 'Tu pase ekü');
  const type = escapeHtml(opts.type || ticketTypeName(ticket));
  const codeSafe = escapeHtml(code);
  const qrSize = variant === 'pass' ? PASE_QR_CONFIRM : PASE_QR_WALLET;
  const mark =
    variant === 'pass' ? '<span class="pase-card__mark"></span>' : '';
  const facts =
    variant === 'pass'
      ? `<dl class="pase-card__facts">${[
          factRow('Cuándo', opts.when || ''),
          factRow('Dónde', opts.place || ''),
          factRow('Tipo', type),
          opts.host ? factRow('Organiza', opts.host) : '',
        ].join('')}</dl>`
      : `<p class="pase-card__type">${type}</p>`;
  const categoryChip =
    variant === 'pass' && opts.category
      ? `<p class="pase-card__type">${escapeHtml(opts.category)}</p>`
      : '';
  const cover = variant === 'wallet' && opts.cover
    ? `<div class="pase-card__cover"><img src="${escapeHtml(opts.cover)}" alt="" loading="lazy" /></div>`
    : '';
  const brand = variant === 'wallet' ? '<div class="pase-card__brand">ekü</div>' : '';

  return `
      <article class="pase-card${variant === 'pass' ? ' pase-card--pass' : ''}" data-pase-index="${index}">
        <div class="pase-card__body">
          ${brand}
          ${cover}
          <h2 class="pase-card__title">${title}</h2>
          ${categoryChip}
          ${facts}
          <p class="pase-card__code mono">${codeSafe}</p>
        </div>
        <div class="pase-card__perforation" aria-hidden="true">${mark}</div>
        <div class="pase-card__qr-wrap">
          <canvas class="pase-card__qr" data-qr-index="${index}" width="${qrSize}" height="${qrSize}" aria-label="Código QR de la entrada"></canvas>
          <p class="pase-card__qr-hint muted">Escaneá al ingresar</p>
        </div>
      </article>
    `;
}

export async function paintPaseQrs(
  list: HTMLElement,
  rows: Array<{ qr: string; index: number }>,
  size: number,
): Promise<void> {
  await Promise.all(
    rows.map(async ({ qr, index }) => {
      const canvas = list.querySelector<HTMLCanvasElement>(`canvas[data-qr-index="${index}"]`);
      if (!canvas || !qr) return;
      try {
        await paintQrCanvas(canvas, qr, { size, dark: '#2c3441', light: '#ffffff' });
      } catch {
        canvas.replaceWith(
          Object.assign(document.createElement('p'), {
            className: 'muted',
            textContent: 'No se pudo generar el QR.',
          }),
        );
      }
    }),
  );
}
