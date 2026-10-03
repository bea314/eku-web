/**
 * User-facing API errors — never paint Nest/HTTP/Prisma/URL/stack.
 * Run: npm run test:user-facing-error
 */
import assert from 'node:assert/strict';
import { ClientApiError } from '../src/lib/client-api.ts';
import {
  looksTechnicalApiMessage,
  userFacingApiError,
  USER_ERR,
} from '../src/lib/user-facing-error.ts';
import { formatPlace } from '../src/lib/safe-display.ts';

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

const origError = console.error;
console.error = () => {};

check('500 → generic, no HTTP/Nest in text', () => {
  const msg = userFacingApiError(new ClientApiError('Internal server error', 500), USER_ERR.tickets);
  assert.equal(msg, USER_ERR.tickets);
  assert.doesNotMatch(msg, /http|nest|500|internal/i);
});

check('502 → generic', () => {
  const msg = userFacingApiError(new ClientApiError('Error HTTP 502', 502), USER_ERR.tickets);
  assert.equal(msg, USER_ERR.tickets);
  assert.doesNotMatch(msg, /502|HTTP/i);
});

check('Prisma path error → generic', () => {
  const msg = userFacingApiError(
    new ClientApiError(
      'PrismaClientKnownRequestError: Invalid `prisma.event.findMany()` invocation in /src/events/events.service.ts:42',
      500,
    ),
    USER_ERR.tickets,
  );
  assert.equal(msg, USER_ERR.tickets);
  assert.doesNotMatch(msg, /prisma|\/src\//i);
});

check('network / CORS localhost → generic', () => {
  const msg = userFacingApiError(
    new ClientApiError(
      'No se pudo conectar a Nest en http://localhost:3000/api. ¿Está corriendo en :3000? ¿CORS para :4321?',
      0,
    ),
    USER_ERR.tickets,
  );
  assert.equal(msg, USER_ERR.tickets);
  assert.doesNotMatch(msg, /localhost|cors|nest|:3000|:4321/i);
});

check('400 validation clean Spanish stays', () => {
  const msg = userFacingApiError(
    new ClientApiError('Máximo 10 por orden para VIP', 400),
    USER_ERR.checkout,
  );
  assert.equal(msg, 'Máximo 10 por orden para VIP');
});

check('looksTechnical detects Nest/HTTP/Prisma', () => {
  assert.equal(looksTechnicalApiMessage('Internal server error'), true);
  assert.equal(looksTechnicalApiMessage('Error HTTP 502'), true);
  assert.equal(looksTechnicalApiMessage('prisma.event.findMany'), true);
  assert.equal(looksTechnicalApiMessage('Escribí tu email'), false);
});

check('formatPlace reads locationLabel before fallback', () => {
  assert.equal(
    formatPlace({ locationLabel: 'Café Central, San Salvador' }),
    'Café Central, San Salvador',
  );
  assert.equal(
    formatPlace({ location_label: 'Plaza Libertad' }),
    'Plaza Libertad',
  );
  assert.equal(
    formatPlace({ location: { name: 'Teatro Nacional', address: 'Centro' } }),
    'Teatro Nacional',
  );
  assert.equal(formatPlace({}), 'Lugar por confirmar');
  assert.equal(formatPlace({ isVirtual: true }), 'Virtual');
});

check('formatPlace dedupes city hierarchy to card/detail form', () => {
  assert.equal(
    formatPlace({
      locationLabel:
        'Teatro Nacional, Centro Histórico, San Salvador Centro, San Salvador',
    }),
    'Teatro Nacional, Centro Histórico',
  );
  assert.equal(
    formatPlace({
      location: { address: 'Teatro Nacional, Centro Histórico' },
      locationLabel:
        'Teatro Nacional, Centro Histórico, San Salvador Centro, San Salvador',
    }),
    'Teatro Nacional, Centro Histórico',
  );
  assert.equal(
    formatPlace({ locationLabel: 'Café Central, San Salvador, San Salvador' }),
    'Café Central, San Salvador',
  );
  assert.equal(
    formatPlace({ locationLabel: 'Plaza, Plaza, Centro' }),
    'Plaza, Centro',
  );
});

console.error = origError;

if (failed) {
  console.error(`\n${failed} user-facing-error test(s) failed`);
  process.exit(1);
}
console.log('\nuser-facing-error OK');
