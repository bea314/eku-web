/**
 * User-facing API errors — never paint Nest/HTTP/Prisma/URL/stack.
 * Run: npm run test:user-facing-error
 */
import assert from 'node:assert/strict';
import { ClientApiError } from '../src/lib/client-api.ts';
import {
  extractMaxPerOrderN,
  formatMaxPerOrderMessage,
  looksTechnicalApiMessage,
  mapApiValidationMessage,
  userFacingApiError,
  USER_ERR,
} from '../src/lib/user-facing-error.ts';
import { formatPlace, normalizePlaceLabel } from '../src/lib/safe-display.ts';

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

check('400 raw English never passes through', () => {
  const msg = userFacingApiError(
    new ClientApiError('email must be an email', 400),
    USER_ERR.waitlist,
  );
  assert.equal(msg, 'Revisá el correo, parece que no es válido.');
  assert.doesNotMatch(msg, /must be an email/i);
});

check('400 quantity ES con 10 + tipo cliente', () => {
  const msg = userFacingApiError(
    new ClientApiError('Máximo 10 por orden para Libre QA', 400),
    USER_ERR.checkout,
    { ticketTypeName: 'Libre QA' },
  );
  assert.equal(msg, 'Podés llevar hasta 10 entradas de Libre QA.');
  assert.doesNotMatch(msg, /Máximo 10 por orden/i);
});

check('400 quantity ES con 4 + tipo cliente VIP', () => {
  const msg = userFacingApiError(
    new ClientApiError('Máximo 4 por orden para VIP', 400),
    USER_ERR.checkout,
    { ticketTypeName: 'VIP' },
  );
  assert.equal(msg, 'Podés llevar hasta 4 entradas de VIP.');
});

check('400 quantity EN greater than → N + tipo', () => {
  const msg = userFacingApiError(
    new ClientApiError('items.0.quantity must not be greater than 10', 400),
    USER_ERR.checkout,
    { ticketTypeName: 'General' },
  );
  assert.equal(msg, 'Podés llevar hasta 10 entradas de General.');
  assert.doesNotMatch(msg, /items\.|must not/i);
});

check('400 quantity sin número → genérico confirm', () => {
  const msg = userFacingApiError(
    new ClientApiError('Máximo por orden para VIP', 400),
    USER_ERR.checkout,
    { ticketTypeName: 'VIP' },
  );
  // No N extractable → confirm generic (never Nest text)
  assert.equal(msg, USER_ERR.confirm);
  assert.doesNotMatch(msg, /Máximo por orden|VIP/i);
});

check('400 quantity con N sin tipo → este tipo', () => {
  assert.equal(
    formatMaxPerOrderMessage(5, null),
    'Podés llevar hasta 5 entradas de este tipo.',
  );
  const msg = userFacingApiError(
    new ClientApiError('Máximo 5 por orden para Entrada libre', 400),
    USER_ERR.checkout,
  );
  assert.equal(msg, 'Podés llevar hasta 5 entradas de este tipo.');
  assert.doesNotMatch(msg, /Entrada libre|Máximo 5 por orden/i);
});

check('400 quantity 0 → Elegí al menos 1', () => {
  const msg = userFacingApiError(
    new ClientApiError('items.0.quantity must not be less than 1', 400),
    USER_ERR.checkout,
  );
  assert.equal(msg, 'Elegí al menos 1 entrada.');
  assert.doesNotMatch(msg, /hasta 10|greater|less than/i);
});

check('extractMaxPerOrderN from body structure', () => {
  assert.equal(extractMaxPerOrderN('', { maxPerOrder: 4 }), 4);
  assert.equal(extractMaxPerOrderN('', { meta: { max_per_order: 7 } }), 7);
  assert.equal(extractMaxPerOrderN('Máximo 10 por orden para X'), 10);
  assert.equal(extractMaxPerOrderN('must not be greater than 4'), 4);
  assert.equal(extractMaxPerOrderN('no number here'), null);
});

check('400 Nest Spanish never passes through raw', () => {
  const msg = userFacingApiError(
    new ClientApiError('Máximo 10 por orden para Libre QA', 400),
    USER_ERR.checkout,
    { ticketTypeName: 'Libre QA' },
  );
  assert.notEqual(msg, 'Máximo 10 por orden para Libre QA');
  assert.equal(msg, 'Podés llevar hasta 10 entradas de Libre QA.');
});

check('400 unmapped English → generic fallback', () => {
  const msg = userFacingApiError(
    new ClientApiError('someField must be a string', 400),
    USER_ERR.checkout,
  );
  assert.equal(msg, USER_ERR.checkout);
  assert.doesNotMatch(msg, /must be a string/i);
});

check('404 → generic (never raw)', () => {
  const msg = userFacingApiError(
    new ClientApiError('Waitlist not found', 404),
    USER_ERR.waitlist,
  );
  assert.equal(msg, USER_ERR.waitlist);
  assert.doesNotMatch(msg, /not found|tipos siguen/i);
});

check('confirm sin orderId mapped', () => {
  assert.equal(
    mapApiValidationMessage('Confirm OK pero sin orderId/tickets'),
    USER_ERR.confirm,
  );
  const msg = userFacingApiError(
    new ClientApiError('Confirm OK pero sin orderId/tickets', 200),
    USER_ERR.checkout,
  );
  assert.equal(msg, USER_ERR.confirm);
});

check('confirm sin tickets copy (not confirm generic)', () => {
  assert.equal(
    mapApiValidationMessage('La API no devolvió tickets ni qrPayloads. Revisá data.items del confirm.'),
    USER_ERR.confirmTickets,
  );
  assert.match(USER_ERR.confirmTickets, /Mis entradas/);
  assert.doesNotMatch(USER_ERR.confirmTickets, /API|qrPayloads|data\.items/i);
  assert.notEqual(USER_ERR.confirmTickets, USER_ERR.confirm);
});

check('looksTechnical detects Nest/HTTP/Prisma/API leak', () => {
  assert.equal(looksTechnicalApiMessage('Internal server error'), true);
  assert.equal(looksTechnicalApiMessage('Error HTTP 502'), true);
  assert.equal(looksTechnicalApiMessage('prisma.event.findMany'), true);
  assert.equal(looksTechnicalApiMessage('Revisá data.items del confirm'), true);
  assert.equal(looksTechnicalApiMessage('Escribí tu email'), false);
});

check('normalizePlaceLabel: exact segment dedupe only', () => {
  assert.equal(
    normalizePlaceLabel(
      'Teatro Nacional, Centro Histórico, San Salvador Centro, San Salvador',
    ),
    'Teatro Nacional, Centro Histórico, San Salvador Centro, San Salvador',
  );
});

check('normalizePlaceLabel: Av. San Salvador 45, San Salvador unchanged', () => {
  assert.equal(
    normalizePlaceLabel('Av. San Salvador 45, San Salvador'),
    'Av. San Salvador 45, San Salvador',
  );
});

check('normalizePlaceLabel: Café Central, San Salvador unchanged', () => {
  assert.equal(
    normalizePlaceLabel('Café Central, San Salvador'),
    'Café Central, San Salvador',
  );
});

check('normalizePlaceLabel: accent-insensitive duplicate', () => {
  assert.equal(
    normalizePlaceLabel('Café Central, cafe central, San Salvador'),
    'Café Central, San Salvador',
  );
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

check('formatPlace dedupes only identical segments', () => {
  assert.equal(
    formatPlace({
      locationLabel:
        'Teatro Nacional, Centro Histórico, San Salvador Centro, San Salvador',
    }),
    'Teatro Nacional, Centro Histórico, San Salvador Centro, San Salvador',
  );
  assert.equal(
    formatPlace({ locationLabel: 'Café Central, San Salvador, San Salvador' }),
    'Café Central, San Salvador',
  );
  assert.equal(
    formatPlace({ locationLabel: 'Plaza, Plaza, Centro' }),
    'Plaza, Centro',
  );
  assert.equal(
    formatPlace({ locationLabel: 'Av. San Salvador 45, San Salvador' }),
    'Av. San Salvador 45, San Salvador',
  );
});

console.error = origError;

if (failed) {
  console.error(`\n${failed} user-facing-error test(s) failed`);
  process.exit(1);
}
console.log('\nuser-facing-error OK');
