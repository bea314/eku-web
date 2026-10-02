/**
 * Display times = America/El_Salvador via explicit Intl timeZone,
 * independent of process.env.TZ (Nest seed / preview / browser).
 *
 * Fixtures = ISO reales del Nest de QA (UTC−6 / TZ=America/El_Salvador):
 * - ESCINE  2026-10-24T01:00:00.000Z → «vie 23 oct · 19:00»
 * - waitlist 2026-10-12T02:00:00.000Z → «dom 11 oct · 20:00»
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

const ESCINE_ISO = '2026-10-24T01:00:00.000Z';
const WAITLIST_ISO = '2026-10-12T02:00:00.000Z';

function runUnderTz(tz, script) {
  const r = spawnSync(process.execPath, ['--experimental-strip-types', '--no-warnings', '-e', script], {
    env: { ...process.env, TZ: tz },
    cwd: root,
    encoding: 'utf8',
  });
  if (r.status !== 0) {
    throw new Error(`TZ=${tz} failed:\n${r.stderr || r.stdout}`);
  }
  return r.stdout.trim();
}

const script = `
import { formatEventWhen } from './src/lib/safe-display.ts';
import { parseSvDateTime, formatSvDateTime } from './src/lib/sv-datetime.ts';

const escine = formatEventWhen({
  start_date: '${ESCINE_ISO}',
  end_date: '2026-10-24T04:00:00.000Z',
  name: 'Festival de cortos ESCINE',
});
const waitlist = formatEventWhen({
  start_date: '${WAITLIST_ISO}',
  end_date: '2026-10-12T05:00:00.000Z',
  name: 'Sold Out Waitlist (seed)',
});
const createIso = parseSvDateTime('16/10/2026', '20:00');
const detail = formatEventWhen({
  startDate: createIso,
  endDate: parseSvDateTime('16/10/2026', '23:00'),
});
const parts = formatSvDateTime(createIso);
console.log(JSON.stringify({
  processTz: process.env.TZ,
  escineFull: escine.full,
  escineTime: escine.time,
  waitlistFull: waitlist.full,
  waitlistTime: waitlist.time,
  createIso,
  detailTime: detail.time,
  parts,
}));
`;

const zones = ['UTC', 'America/New_York'];
const results = zones.map((tz) => ({ tz, data: JSON.parse(runUnderTz(tz, script)) }));

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

check('ESCINE QA ISO → vie 23 oct · 19:00 under TZ=UTC and America/New_York', () => {
  for (const r of results) {
    assert.equal(r.data.escineTime, '19:00', `escineTime under ${r.tz}`);
    assert.match(r.data.escineFull, /vie\s*23\s*oct/i, `weekday/day under ${r.tz}: ${r.data.escineFull}`);
    assert.match(r.data.escineFull, /19:00/, `full under ${r.tz}: ${r.data.escineFull}`);
  }
  assert.equal(results[0].data.escineFull, results[1].data.escineFull);
});

check('waitlist QA ISO → dom 11 oct · 20:00 under TZ=UTC and America/New_York', () => {
  for (const r of results) {
    assert.equal(r.data.waitlistTime, '20:00', `waitlistTime under ${r.tz}`);
    assert.match(r.data.waitlistFull, /dom\s*11\s*oct/i, `weekday/day under ${r.tz}: ${r.data.waitlistFull}`);
    assert.match(r.data.waitlistFull, /20:00/, `full under ${r.tz}: ${r.data.waitlistFull}`);
  }
  assert.equal(results[0].data.waitlistFull, results[1].data.waitlistFull);
});

check('roundtrip create 20:00 SV → API UTC → detail 20:00 (both process TZ)', () => {
  for (const r of results) {
    assert.equal(r.data.createIso, '2026-10-17T02:00:00.000Z');
    assert.equal(r.data.detailTime, '20:00');
    assert.equal(r.data.parts.date, '16/10/2026');
    assert.equal(r.data.parts.time, '20:00');
  }
});

if (failed) {
  console.error(`\n${failed} sv-display-tz test(s) failed`);
  process.exit(1);
}
console.log('\nsv-display-tz OK');
for (const r of results) {
  console.log(r.tz, 'ESCINE=', r.data.escineFull, '| waitlist=', r.data.waitlistFull);
}
