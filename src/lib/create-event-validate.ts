/**
 * Declarative create-event field rules (organizador).
 *
 * Architecture (Jefe): each rule receives the full form state so later features
 * can gate validation without rewriting rules — e.g. «Lugar por confirmar»
 * (place not required when active) and priceStatus per ticket type (price only
 * when status is «Monto»). Those features are NOT implemented here; the shape
 * accepts conditions.
 *
 * Code-point length via [...str].length (Nest-aligned).
 */

export const CREATE_NAME_MIN = 3;
export const CREATE_NAME_MAX = 100;

/** Form state passed into every rule (extensible). */
export type CreateFormState = {
  name: string;
  place: string;
  /** datetime-local raw */
  startLocal: string;
  endLocal: string;
  /** ISO from local input, or null */
  startDate: string | null;
  endDate: string | null;
  description?: string;
  /**
   * Future: when true, place is not required.
   * Rules should check this — default false in this HEAD.
   */
  placeTba?: boolean;
  ticketTypes: CreateTicketState[];
};

export type CreateTicketState = {
  name: string;
  price: string | number;
  quantity: string | number | null | undefined;
  /**
   * Future: 'fixed' | 'at_door' | 'tba' — price validated only when 'fixed'/'Monto'.
   * Absent → treat as fixed (validate price).
   */
  priceStatus?: 'fixed' | 'at_door' | 'tba' | string | null;
};

export type TicketFieldErrors = {
  name?: string;
  price?: string;
  quantity?: string;
};

export type CreateFieldErrors = {
  name?: string;
  place?: string;
  startDate?: string;
  endDate?: string;
  tickets?: TicketFieldErrors[];
  ticketsGeneral?: string;
};

export type FieldRule<K extends keyof CreateFormState = keyof CreateFormState> = {
  field: K;
  /** Return error message or null/undefined when valid. */
  validate: (state: CreateFormState) => string | null | undefined;
};

export type TicketFieldRule = {
  field: keyof TicketFieldErrors;
  validate: (ticket: CreateTicketState, state: CreateFormState, index: number) => string | null | undefined;
};

export function codePointLength(value: string): number {
  return [...value].length;
}

/** Name: one UX message for empty / short / long. */
export const nameRule: FieldRule<'name'> = {
  field: 'name',
  validate(state) {
    const trimmed = String(state.name ?? '').trim();
    const len = codePointLength(trimmed);
    if (!trimmed || len < CREATE_NAME_MIN || len > CREATE_NAME_MAX) {
      return 'Escribí un nombre de 3 a 100 caracteres';
    }
    return null;
  },
};

/** Place: required unless future placeTba. */
export const placeRule: FieldRule<'place'> = {
  field: 'place',
  validate(state) {
    if (state.placeTba) return null;
    if (!String(state.place ?? '').trim()) {
      return 'Escribí la dirección del lugar';
    }
    return null;
  },
};

export const startDateRule: FieldRule<'startLocal'> = {
  field: 'startLocal',
  validate(state) {
    if (!String(state.startLocal ?? '') || !state.startDate) {
      return 'Elegí fecha y hora de inicio';
    }
    return null;
  },
};

export const endDateRule: FieldRule<'endLocal'> = {
  field: 'endLocal',
  validate(state) {
    if (!String(state.endLocal ?? '') || !state.endDate) {
      return 'Elegí fecha y hora de fin';
    }
    if (state.startDate && state.endDate) {
      const startMs = new Date(state.startDate).getTime();
      const endMs = new Date(state.endDate).getTime();
      if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
        return 'El fin tiene que ser después del inicio';
      }
    }
    return null;
  },
};

export const ticketNameRule: TicketFieldRule = {
  field: 'name',
  validate(ticket) {
    if (!String(ticket.name ?? '').trim()) {
      return 'Escribí el nombre del tipo de entrada';
    }
    return null;
  },
};

/**
 * Price: validated when priceStatus is absent or 'fixed' (Monto).
 * Future at_door / tba → skip.
 */
export const ticketPriceRule: TicketFieldRule = {
  field: 'price',
  validate(ticket) {
    const status = ticket.priceStatus ?? 'fixed';
    if (status !== 'fixed' && status !== 'Monto') return null;
    const priceStr = String(ticket.price ?? '').trim();
    if (priceStr === '') {
      return 'Poné un precio de 0 o más';
    }
    const price = Number(ticket.price);
    if (!Number.isFinite(price) || price < 0) {
      return 'Poné un precio de 0 o más';
    }
    return null;
  },
};

export const ticketQuantityRule: TicketFieldRule = {
  field: 'quantity',
  validate(ticket) {
    const qtyRaw = ticket.quantity;
    const qtyStr = qtyRaw === null || qtyRaw === undefined ? '' : String(qtyRaw).trim();
    if (qtyStr === '') return null;
    const qty = Number(qtyRaw);
    if (!Number.isFinite(qty) || !Number.isInteger(qty) || qty < 1) {
      return 'El cupo tiene que ser 1 o más, o dejalo vacío';
    }
    return null;
  },
};

/** Ordered top-level rules (extensible — push/replace without rewriting callers). */
export const CREATE_FIELD_RULES: FieldRule[] = [
  nameRule,
  placeRule,
  startDateRule,
  endDateRule,
];

export const CREATE_TICKET_RULES: TicketFieldRule[] = [
  ticketNameRule,
  ticketPriceRule,
  ticketQuantityRule,
];

export function hasCreateErrors(errors: CreateFieldErrors): boolean {
  if (errors.name || errors.place || errors.startDate || errors.endDate || errors.ticketsGeneral) {
    return true;
  }
  return Boolean(errors.tickets?.some((t) => t && (t.name || t.price || t.quantity)));
}

export type CreateFocusTarget =
  | 'name'
  | 'place'
  | 'startDate'
  | 'endDate'
  | { ticket: number; field: 'name' | 'price' | 'quantity' };

export function firstCreateFocus(errors: CreateFieldErrors): CreateFocusTarget | null {
  if (errors.name) return 'name';
  if (errors.place) return 'place';
  if (errors.startDate) return 'startDate';
  if (errors.endDate) return 'endDate';
  if (errors.tickets) {
    for (let i = 0; i < errors.tickets.length; i++) {
      const t = errors.tickets[i];
      if (!t) continue;
      if (t.name) return { ticket: i, field: 'name' };
      if (t.price) return { ticket: i, field: 'price' };
      if (t.quantity) return { ticket: i, field: 'quantity' };
    }
  }
  if (errors.ticketsGeneral) return { ticket: 0, field: 'name' };
  return null;
}

export function validateCreateEvent(
  state: CreateFormState,
  fieldRules: FieldRule[] = CREATE_FIELD_RULES,
  ticketRules: TicketFieldRule[] = CREATE_TICKET_RULES,
): CreateFieldErrors {
  const errors: CreateFieldErrors = {};

  for (const rule of fieldRules) {
    const msg = rule.validate(state);
    if (!msg) continue;
    if (rule.field === 'name') errors.name = msg;
    else if (rule.field === 'place') errors.place = msg;
    else if (rule.field === 'startLocal') errors.startDate = msg;
    else if (rule.field === 'endLocal') errors.endDate = msg;
  }

  const rows = Array.isArray(state.ticketTypes) ? state.ticketTypes : [];
  if (!rows.length) {
    errors.ticketsGeneral = 'Agregá al menos un tipo de ticket';
  } else {
    const ticketErrors = rows.map((ticket, index) => {
      const te: TicketFieldErrors = {};
      for (const rule of ticketRules) {
        const msg = rule.validate(ticket, state, index);
        if (msg) te[rule.field] = msg;
      }
      return te;
    });
    if (ticketErrors.some((t) => t.name || t.price || t.quantity)) {
      errors.tickets = ticketErrors;
    }
  }

  return errors;
}

/** Re-check a single top-level field (blur/change clear). */
export function validateCreateField(
  field: 'name' | 'place' | 'startDate' | 'endDate',
  state: CreateFormState,
): string | null {
  const rule =
    field === 'name'
      ? nameRule
      : field === 'place'
        ? placeRule
        : field === 'startDate'
          ? startDateRule
          : endDateRule;
  return rule.validate(state) || null;
}

export function validateTicketField(
  field: keyof TicketFieldErrors,
  ticket: CreateTicketState,
  state: CreateFormState,
  index: number,
): string | null {
  const rule = CREATE_TICKET_RULES.find((r) => r.field === field);
  if (!rule) return null;
  return rule.validate(ticket, state, index) || null;
}

/**
 * Map Nest/API errors to Spanish — never show raw backend strings.
 * Unmapped → banner above Publicar.
 */
export function mapCreateApiError(raw: string): {
  field?: 'name' | 'place' | 'startDate' | 'endDate';
  message: string;
} {
  const msg = String(raw || '').toLowerCase();
  const generic =
    'No pudimos publicar el evento. Revisá los datos e intentá de nuevo.';
  if (!msg) return { message: generic };
  if (msg.includes('coordenad') || msg.includes('ubicación') || msg.includes('ubicacion')) {
    return { field: 'place', message: 'Escribí la dirección del lugar' };
  }
  if ((msg.includes('nombre') || msg.includes('name')) && msg.includes('100')) {
    return { field: 'name', message: 'Escribí un nombre de 3 a 100 caracteres' };
  }
  if (msg.includes('startdate') || msg.includes('start_date')) {
    return { field: 'startDate', message: 'Elegí fecha y hora de inicio' };
  }
  if (msg.includes('enddate') || msg.includes('end_date')) {
    return { field: 'endDate', message: 'Elegí fecha y hora de fin' };
  }
  return { message: generic };
}
