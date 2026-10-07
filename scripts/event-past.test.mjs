/**
 * isEventPast — end before now; else start before now (SV / Nest ISO).
 * Run: npm run test:event-past
 */
import assert from 'node:assert/strict';
import { isEventPast } from '../src/lib/safe-display.ts';

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

/** DJ PARTY Nest QA: 21:00 SV → 02:00 SV next day (cross midnight). */
const DJ_START = '2026-10-13T03:00:00.000Z'; // lun 12 oct 21:00 SV
const DJ_END = '2026-10-13T08:00:00.000Z'; // mar 13 oct 02:00 SV

check('end in the past → past', () => {
  const now = new Date('2026-10-07T18:00:00.000Z');
  assert.equal(
    isEventPast(
      {
        startDate: '2026-10-01T02:00:00.000Z',
        endDate: '2026-10-01T05:00:00.000Z',
      },
      now,
    ),
    true,
  );
});

check('no end, start in the past → past', () => {
  const now = new Date('2026-10-07T18:00:00.000Z');
  assert.equal(
    isEventPast({ startsAt: '2026-09-01T20:00:00.000Z' }, now),
    true,
  );
  assert.equal(
    isEventPast({ start_date: '2026-09-01T20:00:00.000Z' }, now),
    true,
  );
});

check('end in the future crossing midnight → not past (during event)', () => {
  // Midnight SV during DJ: 2026-10-13T06:00:00.000Z = 00:00 SV Oct 13
  const during = new Date('2026-10-13T06:00:00.000Z');
  assert.equal(
    isEventPast({ startDate: DJ_START, endDate: DJ_END }, during),
    false,
  );
  // Still before start
  const before = new Date('2026-10-12T20:00:00.000Z');
  assert.equal(
    isEventPast({ startDate: DJ_START, endDate: DJ_END }, before),
    false,
  );
  // After end → past
  const after = new Date('2026-10-13T09:00:00.000Z');
  assert.equal(
    isEventPast({ startDate: DJ_START, endDate: DJ_END }, after),
    true,
  );
});

check('event happening now (start before, end after) → not past', () => {
  const now = new Date('2026-10-17T03:30:00.000Z'); // 21:30 SV
  assert.equal(
    isEventPast(
      {
        startDate: '2026-10-17T02:00:00.000Z', // 20:00 SV
        endDate: '2026-10-17T05:00:00.000Z', // 23:00 SV
      },
      now,
    ),
    false,
  );
});

check('end equal to now → not past (strict before)', () => {
  const t = '2026-10-07T18:00:00.000Z';
  assert.equal(isEventPast({ endDate: t, startDate: '2026-10-07T16:00:00.000Z' }, new Date(t)), false);
});

check('no start and no end → not past', () => {
  assert.equal(isEventPast({}, new Date('2026-10-07T18:00:00.000Z')), false);
  assert.equal(isEventPast(null, new Date()), false);
});

check('no end, start in the future → not past', () => {
  const now = new Date('2026-10-07T18:00:00.000Z');
  assert.equal(isEventPast({ startDate: '2026-12-01T02:00:00.000Z' }, now), false);
});

if (failed) {
  console.error(`\n${failed} event-past test(s) failed`);
  process.exit(1);
}
console.log('\nevent-past OK');
