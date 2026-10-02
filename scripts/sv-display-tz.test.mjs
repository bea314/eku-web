/**
 * Display times = America/El_Salvador via explicit Intl timeZone,
 * independent of process.env.TZ (Nest seed / preview / browser).
 *
 * Fixtures Nest QA (UTC−6):
 * - ESCINE  2026-10-24T01:00:00.000Z → «vie 23 oct · 19:00»
 * - waitlist 2026-10-12T02:00:00.000Z → «dom 11 oct · 20:00»
 * - DJ PARTY 2026-10-13T03:00:00.000Z → 2026-10-13T08:00:00.000Z
 *   card: «lun 12 oct · 21:00» | detail: «lun 12 oct, 21:00 – mar 13 oct, 02:00»
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

const ESCINE_ISO = '2026-10-24T01:00:00.000Z';
const WAITLIST_ISO = '2026-10-12T02:00:00.000Z';
const DJ_START = '2026-10-13T03:00:00.000Z';
const DJ_END = '2026-10-13T08:00:00.000Z';
/** 31 dic 2026 22:00 SV → 1 ene 2027 02:00 SV */
const NYE_START = '2027-01-01T04:00:00.000Z';
const NYE_END = '2027-01-01T08:00:00.000Z';

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
});
const waitlist = formatEventWhen({
  start_date: '${WAITLIST_ISO}',
  end_date: '2026-10-12T05:00:00.000Z',
});
const sameDay = formatEventWhen({
  start_date: '2026-10-17T02:00:00.000Z',
  end_date: '2026-10-17T05:00:00.000Z',
});
const dj = formatEventWhen({
  start_date: '${DJ_START}',
  end_date: '${DJ_END}',
  name: 'DJ PARTY - 80s Night',
});
const nye = formatEventWhen({
  start_date: '${NYE_START}',
  end_date: '${NYE_END}',
});
const createIso = parseSvDateTime('16/10/2026', '20:00');
const createDetail = formatEventWhen({
  startDate: createIso,
  endDate: parseSvDateTime('16/10/2026', '23:00'),
});
const parts = formatSvDateTime(createIso);
console.log(JSON.stringify({
  processTz: process.env.TZ,
  escineFull: escine.full,
  escineDetail: escine.detail,
  escineTime: escine.time,
  waitlistFull: waitlist.full,
  waitlistTime: waitlist.time,
  sameDayFull: sameDay.full,
  sameDayDetail: sameDay.detail,
  djFull: dj.full,
  djDetail: dj.detail,
  nyeFull: nye.full,
  nyeDetail: nye.detail,
  createIso,
  createDetailTime: createDetail.time,
  createDetailFull: createDetail.full,
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
    assert.match(r.data.escineFull, /vie\s*23\s*oct/i);
    assert.match(r.data.escineFull, /19:00/);
  }
  assert.equal(results[0].data.escineFull, results[1].data.escineFull);
});

check('waitlist QA ISO → dom 11 oct · 20:00 under TZ=UTC and America/New_York', () => {
  for (const r of results) {
    assert.equal(r.data.waitlistTime, '20:00', `waitlistTime under ${r.tz}`);
    assert.match(r.data.waitlistFull, /dom\s*11\s*oct/i);
    assert.match(r.data.waitlistFull, /20:00/);
  }
  assert.equal(results[0].data.waitlistFull, results[1].data.waitlistFull);
});

check('same day: card+detail «vie 16 oct · 20:00 – 23:00»', () => {
  const expect = 'vie 16 oct · 20:00 – 23:00';
  for (const r of results) {
    assert.equal(r.data.sameDayFull, expect, `full under ${r.tz}`);
    assert.equal(r.data.sameDayDetail, expect, `detail under ${r.tz}`);
  }
});

check('cross midnight DJ: card start-only; detail both days no weird comma', () => {
  const card = 'lun 12 oct · 21:00';
  const detail = 'lun 12 oct, 21:00 – mar 13 oct, 02:00';
  for (const r of results) {
    assert.equal(r.data.djFull, card, `card under ${r.tz}: ${r.data.djFull}`);
    assert.equal(r.data.djDetail, detail, `detail under ${r.tz}: ${r.data.djDetail}`);
    assert.doesNotMatch(r.data.djDetail, /mar,\s/);
    assert.doesNotMatch(r.data.djDetail, /2026/);
  }
});

check('cross year: card start-only; detail shows both years', () => {
  for (const r of results) {
    assert.equal(r.data.nyeFull, 'jue 31 dic · 22:00', `card under ${r.tz}: ${r.data.nyeFull}`);
    assert.equal(
      r.data.nyeDetail,
      'jue 31 dic 2026, 22:00 – vie 1 ene 2027, 02:00',
      `detail under ${r.tz}: ${r.data.nyeDetail}`,
    );
  }
});

check('roundtrip create 20:00 SV → API UTC → detail 20:00 (both process TZ)', () => {
  for (const r of results) {
    assert.equal(r.data.createIso, '2026-10-17T02:00:00.000Z');
    assert.equal(r.data.createDetailTime, '20:00');
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
  console.log(r.tz, 'DJ card=', r.data.djFull, '| detail=', r.data.djDetail);
  console.log(r.tz, 'NYE card=', r.data.nyeFull, '| detail=', r.data.nyeDetail);
}
