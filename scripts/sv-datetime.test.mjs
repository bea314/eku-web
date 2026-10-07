/**
 * Unit tests: SV datetime parse/format/mask + UX classify messages.
 */
import assert from 'node:assert/strict';

const mod = await import(new URL('../src/lib/sv-datetime.ts', import.meta.url).href);
const {
  parseSvDateTime,
  formatSvDateTime,
  classifySvDateTime,
  parseSvDatePart,
  parseSvTimePart,
  isValidCalendarDate,
  addHoursSv,
  maskDdMmYyyy,
  maskHhMm,
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

check('valid 20/12/2026 20:00 → ISO UTC', () => {
  assert.equal(parseSvDateTime('20/12/2026', '20:00'), '2026-12-21T02:00:00.000Z');
});

check('round-trip formatSvDateTime', () => {
  const iso = parseSvDateTime('01/12/2026', '20:00');
  assert.deepEqual(formatSvDateTime(iso), { date: '01/12/2026', time: '20:00' });
});

check('31/02 invalid date', () => {
  assert.equal(parseSvDatePart('31/02/2026').reason, 'invalid');
  assert.equal(classifySvDateTime('31/02/2026', '12:00').reason, 'bad_date');
  assert.equal(parseSvDateTime('31/02/2026', '12:00'), null);
});

check('29/02/2027 non-leap invalid; 29/02/2028 leap ok', () => {
  assert.equal(isValidCalendarDate(2027, 2, 29), false);
  assert.equal(parseSvDatePart('29/02/2027').reason, 'invalid');
  assert.equal(isValidCalendarDate(2028, 2, 29), true);
  assert.equal(parseSvDatePart('29/02/2028').ok, true);
  assert.ok(parseSvDateTime('29/02/2028', '12:00'));
});

check('00/13 invalid month', () => {
  assert.equal(classifySvDateTime('00/13/2026', '12:00').reason, 'bad_date');
});

check('25:00 and 12:60 invalid time; 23:59 and 00:00 ok', () => {
  assert.equal(parseSvTimePart('25:00').reason, 'invalid');
  assert.equal(classifySvDateTime('01/12/2026', '25:00').reason, 'bad_time');
  assert.equal(parseSvTimePart('12:60').reason, 'invalid');
  assert.equal(classifySvDateTime('01/12/2026', '12:60').reason, 'bad_time');
  assert.equal(parseSvTimePart('23:59').ok, true);
  assert.equal(parseSvTimePart('00:00').ok, true);
  assert.ok(parseSvDateTime('01/12/2026', '23:59'));
  assert.ok(parseSvDateTime('01/12/2026', '00:00'));
});

check('paste with and without separators', () => {
  assert.equal(maskDdMmYyyy('16102026'), '16/10/2026');
  assert.equal(maskDdMmYyyy('16/10/2026'), '16/10/2026');
  assert.equal(maskHhMm('2030'), '20:30');
  assert.equal(maskHhMm('20:30'), '20:30');
  assert.equal(parseSvDateTime(maskDdMmYyyy('16102026'), maskHhMm('2030')), parseSvDateTime('16/10/2026', '20:30'));
});

check('backspace-friendly partial mask', () => {
  assert.equal(maskDdMmYyyy('16'), '16');
  assert.equal(maskDdMmYyyy('161'), '16/1');
  assert.equal(maskDdMmYyyy('1610'), '16/10');
  assert.equal(maskHhMm('2'), '2');
  assert.equal(maskHhMm('20'), '20');
  assert.equal(maskHhMm('203'), '20:3');
});

check('addHoursSv +2', () => {
  const iso = addHoursSv('01/12/2026', '20:00', 2);
  assert.deepEqual(formatSvDateTime(iso), { date: '01/12/2026', time: '22:00' });
});

check('never mm/dd or am/pm in format', () => {
  const parts = formatSvDateTime('2026-07-04T18:00:00.000Z');
  assert.equal(parts.date, '04/07/2026');
  assert.equal(parts.time, '12:00');
});

if (failed) {
  console.error(`\n${failed} sv-datetime test(s) failed`);
  process.exit(1);
}
console.log('\nsv-datetime OK');
