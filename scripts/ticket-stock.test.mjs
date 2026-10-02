/**
 * Unit tests: stockOf / sold-out / price labels (no false Gratis).
 */
import assert from 'node:assert/strict';

const mod = await import(new URL('../src/lib/ticket-stock.ts', import.meta.url).href);
const {
  stockOf,
  isTicketSoldOut,
  isEventSoldOut,
  minTicketPrice,
  eventPriceLabel,
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

check('stockOf: available 40 → 40', () => {
  assert.equal(stockOf({ available: 40 }), 40);
});

check('stockOf: available 0 → 0', () => {
  assert.equal(stockOf({ available: 0 }), 0);
});

check('stockOf: available null → null (unlimited)', () => {
  assert.equal(stockOf({ available: null, quantity: 100 }), null);
});

check('stockOf: prefers available over quantity', () => {
  assert.equal(stockOf({ available: 7, quantity: 40, sold: 0 }), 7);
});

check('stockOf: quantity fallback when available absent', () => {
  assert.equal(stockOf({ quantity: 20, sold: 5 }), 15);
  assert.equal(stockOf({ quantity: 20 }), 20);
});

check('isTicketSoldOut: available 0', () => {
  assert.equal(isTicketSoldOut({ available: 0 }), true);
});

check('isTicketSoldOut: available null not sold out', () => {
  assert.equal(isTicketSoldOut({ available: null }), false);
});

check('isTicketSoldOut: available 40 not sold out', () => {
  assert.equal(isTicketSoldOut({ available: 40 }), false);
});

check('isTicketSoldOut: isSoldOut true wins', () => {
  assert.equal(isTicketSoldOut({ available: 40, isSoldOut: true }), true);
});

check('isTicketSoldOut: isSoldOut false wins over available 0', () => {
  assert.equal(isTicketSoldOut({ available: 0, isSoldOut: false }), false);
});

check('isEventSoldOut: all available 0', () => {
  assert.equal(
    isEventSoldOut({}, [
      { available: 0, price: 10 },
      { available: 0, price: 0 },
    ]),
    true,
  );
});

check('isEventSoldOut: mix with null unlimited → not sold out', () => {
  assert.equal(
    isEventSoldOut({}, [
      { available: 0, price: 10 },
      { available: null, price: 0 },
    ]),
    false,
  );
});

check('isEventSoldOut: event.isSoldOut true', () => {
  assert.equal(isEventSoldOut({ isSoldOut: true }, [{ available: 40 }]), true);
});

check('minTicketPrice: paid only → min paid', () => {
  assert.equal(
    minTicketPrice({
      ticketTypes: [
        { price: 12, available: 10 },
        { price: 35, available: 5 },
      ],
    }),
    12,
  );
});

check('minTicketPrice: mix free+paid → 0', () => {
  assert.equal(
    minTicketPrice({
      event_ticket_types: [
        { price: 0, available: 40 },
        { price: 15, available: 20 },
      ],
    }),
    0,
  );
});

check('minTicketPrice: no price data → null', () => {
  assert.equal(minTicketPrice({ id: 'x', name: 'Solo lista' }), null);
});

check('eventPriceLabel: no price data → null (never Gratis)', () => {
  assert.equal(eventPriceLabel({ name: 'U20r Solo pago' }), null);
  assert.equal(eventPriceLabel({}), null);
});

check('eventPriceLabel: startingPrice null → null', () => {
  assert.equal(eventPriceLabel({ startingPrice: null }), null);
});

check('eventPriceLabel: startingPrice null + isSoldOut → Agotado', () => {
  assert.equal(eventPriceLabel({ startingPrice: null, isSoldOut: true }), 'Agotado');
});

check('eventPriceLabel: gratis when min 0', () => {
  assert.equal(eventPriceLabel({ ticketTypes: [{ price: 0 }, { price: 15 }] }), 'Gratis');
});

check('eventPriceLabel: Desde for paid-only', () => {
  assert.match(eventPriceLabel({ ticketTypes: [{ price: 12 }, { price: 35 }] }), /^Desde 12,00 US\$/);
});

check('eventPriceLabel: never $0 string', () => {
  const label = eventPriceLabel({ ticketTypes: [{ price: 0 }] });
  assert.equal(label, 'Gratis');
  assert.doesNotMatch(label, /\$0/);
});

check('eventPriceLabel: startingPrice 20 → Desde', () => {
  assert.match(
    eventPriceLabel({ startingPrice: 20, ticketTypes: [{ price: 99 }] }),
    /^Desde 20,00 US\$/,
  );
});

if (failed) {
  console.error(`\n${failed} ticket-stock test(s) failed`);
  process.exit(1);
}
console.log('\nticket-stock OK');
