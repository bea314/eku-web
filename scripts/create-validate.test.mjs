/**
 * Unit tests: create-event declarative validator (UX copy).
 */
import assert from 'node:assert/strict';

const mod = await import(new URL('../src/lib/create-event-validate.ts', import.meta.url).href);
const {
  validateCreateEvent,
  validateCreateField,
  validateTicketField,
  codePointLength,
  hasCreateErrors,
  mapCreateApiError,
  placeRule,
  endDateRule,
} = mod;

let failed = 0;
function check(name, fn) {
  try {
    fn();
    console.log(`ok  ${name}`);
  } catch (err) {
    failed += 1;
    console.error(`FAIL ${name}:`, err instanceof Error ? err.message : err);
  }
}

function base(over = {}) {
  return {
    name: 'Noche de jazz',
    place: 'Café Central',
    startLocal: '01/12/2026 20:00',
    endLocal: '01/12/2026 23:00',
    startDateDay: '01/12/2026',
    startDateTime: '20:00',
    endDateDay: '01/12/2026',
    endDateTime: '23:00',
    startDate: '2026-12-02T02:00:00.000Z',
    endDate: '2026-12-02T05:00:00.000Z',
    placeTba: false,
    endDateRequired: true,
    ticketTypes: [{ name: 'General', price: 0, quantity: '40' }],
    ...over,
  };
}

check('empty name → UX copy', () => {
  assert.equal(validateCreateEvent(base({ name: '' })).name, 'Escribí un nombre de 3 a 100 caracteres');
});

check('spaces-only name → same copy', () => {
  assert.equal(validateCreateEvent(base({ name: '   ' })).name, 'Escribí un nombre de 3 a 100 caracteres');
});

check('2 code points → corto', () => {
  assert.equal(validateCreateEvent(base({ name: 'ab' })).name, 'Escribí un nombre de 3 a 100 caracteres');
});

check('3 code points ok', () => {
  assert.equal(validateCreateEvent(base({ name: 'abc' })).name, undefined);
});

check('100 code points ok; 101 fail (emoji)', () => {
  const hundred = 'a'.repeat(98) + '☺️';
  assert.equal(codePointLength(hundred), 100);
  assert.equal(validateCreateEvent(base({ name: hundred })).name, undefined);
  assert.equal(
    validateCreateEvent(base({ name: hundred + 'x' })).name,
    'Escribí un nombre de 3 a 100 caracteres',
  );
});

check('empty place', () => {
  assert.equal(validateCreateEvent(base({ place: '  ' })).place, 'Escribí la dirección del lugar');
});

check('placeTba skips place requirement (future)', () => {
  assert.equal(validateCreateEvent(base({ place: '', placeTba: true })).place, undefined);
  assert.equal(placeRule.validate(base({ place: '', placeTba: true })), null);
});

check('missing start → obligatory; empty optional Fin ok when required false', () => {
  const e = validateCreateEvent(
    base({
      startLocal: '',
      endLocal: '',
      startDateDay: '',
      startDateTime: '',
      endDateDay: '',
      endDateTime: '',
      startDate: null,
      endDate: null,
      endDateRequired: false,
    }),
  );
  assert.equal(e.startDate, 'Elegí fecha y hora de inicio');
  assert.equal(e.endDate, undefined);
});

check('missing Fin when still required → obligatory copy', () => {
  const e = validateCreateEvent(
    base({
      endLocal: '',
      endDateDay: '',
      endDateTime: '',
      endDate: null,
      endDateRequired: true,
    }),
  );
  assert.equal(e.endDate, 'Elegí fecha y hora de fin');
});

check('31/02 → Esa fecha no existe', () => {
  const e = validateCreateEvent(
    base({
      startDateDay: '31/02/2026',
      startDateTime: '20:00',
      startLocal: '31/02/2026 20:00',
      startDate: null,
    }),
  );
  assert.equal(e.startDate, 'Esa fecha no existe');
});

check('25:00 → Esa hora no es válida', () => {
  const e = validateCreateEvent(
    base({
      startDateDay: '01/12/2026',
      startDateTime: '25:00',
      startLocal: '01/12/2026 25:00',
      startDate: null,
    }),
  );
  assert.equal(e.startDate, 'Esa hora no es válida');
});

check('fin igual al inicio → error', () => {
  const e = validateCreateEvent(
    base({
      endDateDay: '01/12/2026',
      endDateTime: '20:00',
      endLocal: '01/12/2026 20:00',
      endDate: '2026-12-02T02:00:00.000Z',
      startDate: '2026-12-02T02:00:00.000Z',
    }),
  );
  assert.equal(e.endDate, 'El fin tiene que ser después del inicio');
});

check('endDateRequired false + empty end → ok (Fin opcional)', () => {
  const state = base({
    endDateRequired: false,
    endDateDay: '',
    endDateTime: '',
    endLocal: '',
    endDate: null,
  });
  assert.equal(endDateRule.validate(state), null);
});

check('Fin opcional with value still validates end > start', () => {
  const state = base({
    endDateRequired: false,
    endDateDay: '01/12/2026',
    endDateTime: '20:00',
    endLocal: '01/12/2026 20:00',
    endDate: '2026-12-02T02:00:00.000Z',
    startDate: '2026-12-02T02:00:00.000Z',
  });
  assert.equal(endDateRule.validate(state), 'El fin tiene que ser después del inicio');
});

check('ticket without name', () => {
  const e = validateCreateEvent(base({ ticketTypes: [{ name: '', price: 10, quantity: '' }] }));
  assert.equal(e.tickets[0].name, 'Escribí el nombre del tipo de entrada');
});

check('negative price', () => {
  const e = validateCreateEvent(base({ ticketTypes: [{ name: 'VIP', price: -1, quantity: '' }] }));
  assert.equal(e.tickets[0].price, 'Poné un precio de 0 o más');
});

check('cupo 0 invalid', () => {
  const e = validateCreateEvent(base({ ticketTypes: [{ name: 'VIP', price: 10, quantity: '0' }] }));
  assert.equal(e.tickets[0].quantity, 'El cupo tiene que ser 1 o más, o dejalo vacío');
});

check('cupo empty = unlimited ok', () => {
  assert.ok(!hasCreateErrors(validateCreateEvent(base({ ticketTypes: [{ name: 'VIP', price: 10, quantity: '' }] }))));
});

check('priceStatus at_door skips price (future)', () => {
  const e = validateCreateEvent(
    base({ ticketTypes: [{ name: 'Puerta', price: '', quantity: '', priceStatus: 'at_door' }] }),
  );
  assert.equal(e.tickets?.[0]?.price, undefined);
  assert.ok(!hasCreateErrors(e));
});

check('mapCreateApiError generic', () => {
  assert.match(mapCreateApiError('weird 500').message, /No pudimos publicar/);
});

check('validateCreateField name blur clear path', () => {
  assert.equal(validateCreateField('name', base({ name: 'Ok name' })), null);
  assert.ok(validateCreateField('name', base({ name: '' })));
});

check('validateTicketField price', () => {
  assert.equal(
    validateTicketField('price', { name: 'X', price: -3, quantity: '' }, base(), 0),
    'Poné un precio de 0 o más',
  );
});

if (failed) {
  console.error(`\n${failed} create-validate test(s) failed`);
  process.exit(1);
}
console.log('\ncreate-validate OK');
