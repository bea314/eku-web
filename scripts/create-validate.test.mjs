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
    startLocal: '2026-12-01T20:00',
    endLocal: '2026-12-01T23:00',
    startDate: '2026-12-01T20:00:00.000Z',
    endDate: '2026-12-01T23:00:00.000Z',
    placeTba: false,
    ticketTypes: [{ name: 'General', price: 0, quantity: '40' }],
    ...over,
  };
}

check('empty name → UX copy', () => {
  const e = validateCreateEvent(base({ name: '' }));
  assert.equal(e.name, 'Escribí un nombre de 3 a 100 caracteres');
});

check('spaces-only name → same copy', () => {
  const e = validateCreateEvent(base({ name: '   ' }));
  assert.equal(e.name, 'Escribí un nombre de 3 a 100 caracteres');
});

check('2 code points → corto', () => {
  const e = validateCreateEvent(base({ name: 'ab' }));
  assert.equal(e.name, 'Escribí un nombre de 3 a 100 caracteres');
});

check('3 code points ok', () => {
  const e = validateCreateEvent(base({ name: 'abc' }));
  assert.equal(e.name, undefined);
});

check('100 code points ok; 101 fail (emoji)', () => {
  const hundred = 'a'.repeat(98) + '☺️'; // ☺️ = 2 code points → 100
  assert.equal(codePointLength(hundred), 100);
  assert.equal(validateCreateEvent(base({ name: hundred })).name, undefined);
  const tooLong = hundred + 'x';
  assert.equal(codePointLength(tooLong), 101);
  assert.equal(
    validateCreateEvent(base({ name: tooLong })).name,
    'Escribí un nombre de 3 a 100 caracteres',
  );
});

check('empty place', () => {
  const e = validateCreateEvent(base({ place: '  ' }));
  assert.equal(e.place, 'Escribí la dirección del lugar');
});

check('placeTba skips place requirement (future)', () => {
  const e = validateCreateEvent(base({ place: '', placeTba: true }));
  assert.equal(e.place, undefined);
  assert.equal(placeRule.validate(base({ place: '', placeTba: true })), null);
});

check('missing start/end', () => {
  const e = validateCreateEvent(
    base({ startLocal: '', endLocal: '', startDate: null, endDate: null }),
  );
  assert.equal(e.startDate, 'Elegí fecha y hora de inicio');
  assert.equal(e.endDate, 'Elegí fecha y hora de fin');
});

check('end before start', () => {
  const e = validateCreateEvent(
    base({
      startLocal: '2026-12-01T20:00',
      endLocal: '2026-12-01T18:00',
      startDate: '2026-12-01T20:00:00.000Z',
      endDate: '2026-12-01T18:00:00.000Z',
    }),
  );
  assert.equal(e.endDate, 'El fin tiene que ser después del inicio');
});

check('ticket without name', () => {
  const e = validateCreateEvent(
    base({ ticketTypes: [{ name: '', price: 10, quantity: '' }] }),
  );
  assert.equal(e.tickets[0].name, 'Escribí el nombre del tipo de entrada');
});

check('negative price', () => {
  const e = validateCreateEvent(
    base({ ticketTypes: [{ name: 'VIP', price: -1, quantity: '' }] }),
  );
  assert.equal(e.tickets[0].price, 'Poné un precio de 0 o más');
});

check('cupo 0 invalid', () => {
  const e = validateCreateEvent(
    base({ ticketTypes: [{ name: 'VIP', price: 10, quantity: '0' }] }),
  );
  assert.equal(e.tickets[0].quantity, 'El cupo tiene que ser 1 o más, o dejalo vacío');
});

check('cupo empty = unlimited ok', () => {
  const e = validateCreateEvent(
    base({ ticketTypes: [{ name: 'VIP', price: 10, quantity: '' }] }),
  );
  assert.ok(!hasCreateErrors(e));
});

check('priceStatus at_door skips price (future)', () => {
  const e = validateCreateEvent(
    base({
      ticketTypes: [{ name: 'Puerta', price: '', quantity: '', priceStatus: 'at_door' }],
    }),
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
  const state = base();
  assert.equal(
    validateTicketField('price', { name: 'X', price: -3, quantity: '' }, state, 0),
    'Poné un precio de 0 o más',
  );
});

if (failed) {
  console.error(`\n${failed} create-validate test(s) failed`);
  process.exit(1);
}
console.log('\ncreate-validate OK');
