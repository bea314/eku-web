/**
 * Human ticket codes for /confirmacion + /entradas (never raw UUID).
 * Run: node --experimental-strip-types --no-warnings scripts/pase-code.test.mjs
 */
import assert from 'node:assert/strict';
import { paseRows, ticketDisplayCode } from '../src/lib/pase.ts';

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

check('confirm-style ticket.code EKU wins', () => {
  assert.equal(
    ticketDisplayCode({ id: 'bdd388d4-41cc-4d89-ac38-f1dcfd298e84', code: 'EKU-6-001' }),
    'EKU-6-001',
  );
});

check('wallet: no code → use qrPayload EKU (not UUID id)', () => {
  const id = 'bdd388d4-41cc-4d89-ac38-f1dcfd298e84';
  assert.equal(
    ticketDisplayCode({ id, qrPayload: 'EKU-1-001' }),
    'EKU-1-001',
  );
  const rows = paseRows([{ id, qrPayload: 'EKU-1-001' }], ['EKU-1-001']);
  assert.equal(rows[0].code, 'EKU-1-001');
  assert.notEqual(rows[0].code, id);
});

check('paseRows wallet UUID id alone → short 8-char fallback', () => {
  const id = '81fdd94b-aeb4-49f6-8a48-d2eca08e74d2';
  const rows = paseRows([{ id }], []);
  assert.equal(rows[0].code, '81FDD94B');
  assert.notEqual(rows[0].code, id);
});

check('UUID disguised as code is rejected in favor of qrPayload', () => {
  const id = 'afe2c8b9-bdae-4c4e-8d98-d2b9c0894cec';
  assert.equal(
    ticketDisplayCode({ id, code: id, qrPayload: 'EKU-2-001' }),
    'EKU-2-001',
  );
});

if (failed) {
  console.error(`\npase-code: ${failed} failed`);
  process.exit(1);
}
console.log('\npase-code OK');
