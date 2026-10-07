/** Shared pase ticket markup + QR paint (U11). Pages only resolve data. */

import { paintQrCanvas } from './client-qr';
import { coverMediaHtml, escapeHtml, formatEventWhen, formatPlace, safeString } from './safe-display';
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

/**
 * When line under type: same-day / start-only like card; cross-midnight uses
 * the detail rule (`lun 12 oct, 21:00 – mar 13 oct, 02:00`).
 */
export function paseWhenLine(
  eventOrTicket: object | null | undefined,
  fallbackWhen = '',
): string {
  if (eventOrTicket && typeof eventOrTicket === 'object') {
    const w = formatEventWhen(eventOrTicket);
    if (w.detail && w.detail !== 'Fecha por confirmar') return w.detail;
    if (w.full && w.full !== 'Fecha por confirmar') return w.full;
  }
  return String(fallbackWhen || '').trim();
}

export function pasePlaceLine(
  eventOrTicket: object | null | undefined,
  fallbackPlace = '',
): string {
  if (eventOrTicket && typeof eventOrTicket === 'object') {
    const place = formatPlace(eventOrTicket as Parameters<typeof formatPlace>[0]);
    if (place && place !== 'Lugar por confirmar') return place;
  }
  return String(fallbackPlace || '').trim();
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
  const when = escapeHtml(opts.when || '');
  const place = escapeHtml(opts.place || '');
  // Shared wallet markup for /confirmacion + /entradas: ekü, cover, type, when, place.
  // No organizer. Code + QR stay fixed size (strip may shrink).
  const meta =
    variant === 'wallet'
      ? `<p class="pase-card__type">${type}</p>${
          when ? `<p class="pase-card__when">${when}</p>` : ''
        }${place ? `<p class="pase-card__place">${place}</p>` : ''}`
      : `<dl class="pase-card__facts">${[
          opts.when ? factRow('Cuándo', opts.when) : '',
          opts.place ? factRow('Dónde', opts.place) : '',
          factRow('Tipo', type),
        ].join('')}</dl>`;
  const cover = `<div class="pase-card__cover">${coverMediaHtml(
    opts.cover || '',
    'card',
    'loading="eager" decoding="async"',
  )}</div>`;
  const brand = '<div class="pase-card__brand">ekü</div>';

  return `
      <article class="pase-card${variant === 'pass' ? ' pase-card--pass' : ''}" data-pase-index="${index}">
        <div class="pase-card__body">
          ${brand}
          ${cover}
          <h2 class="pase-card__title">${title}</h2>
          ${meta}
          <p class="pase-card__code mono">${codeSafe}</p>
        </div>
        <div class="pase-card__perforation" aria-hidden="true"></div>
        <div class="pase-card__qr-wrap">
          <canvas class="pase-card__qr" data-qr-index="${index}" width="${qrSize}" height="${qrSize}" aria-label="Código QR de la entrada"></canvas>
          <p class="pase-card__qr-hint muted">Escaneá al ingresar</p>
        </div>
      </article>
    `;
}

function factRow(label: string, value: string): string {
  if (!value) return '';
  return `<div class="pase-card__fact">
      <dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(value)}</dd>
    </div>`;
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
