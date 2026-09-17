/**
 * U4 smoke: tab favicon no-cover mark, Nest covers, real dates (snake + camel).
 * Run: npm run test:smoke
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const modUrl = pathToFileURL(new URL('../src/lib/safe-display.ts', import.meta.url).pathname).href;
const {
  brandCoverPlaceholderHtml,
  coverUrlOf,
  formatEventWhen,
  pickStartRaw,
  pickEndRaw,
} = await import(modUrl);

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

check('no-cover uses tab favicon-32.png — not eku-favicon-mark / eku-icon.svg', () => {
  const html = brandCoverPlaceholderHtml('card');
  assert.match(html, /favicon-32\.png/);
  assert.match(html, /cover-ph__favicon/);
  assert.match(html, /width="72"/);
  assert.doesNotMatch(html, /eku-favicon-mark/);
  assert.doesNotMatch(html, /eku-icon\.svg/);
  assert.doesNotMatch(html, />\s*ü\s*</);
});

check('tab favicon assets exist', () => {
  assert.equal(existsSync(new URL('../public/favicon-32.png', import.meta.url)), true);
  assert.equal(existsSync(new URL('../public/favicon.ico', import.meta.url)), true);
  assert.equal(existsSync(new URL('../public/eku-favicon-mark.svg', import.meta.url)), false);
});

check('cover prefers coverImageUrl then image_url', () => {
  assert.equal(
    coverUrlOf({
      coverImageUrl: 'https://cdn.example/a.jpg',
      image_url: 'https://cdn.example/b.jpg',
    }),
    'https://cdn.example/a.jpg',
  );
  assert.equal(
    coverUrlOf({ coverImageUrl: null, image_url: 'https://cdn.example/b.jpg' }),
    'https://cdn.example/b.jpg',
  );
  assert.equal(coverUrlOf({ coverImageUrl: null, image_url: null }), '');
});

check('camelCase startDate/endDate — never false por confirmar', () => {
  const when = formatEventWhen({
    startDate: '2026-10-20T20:00:00.000Z',
    endDate: '2026-10-20T23:00:00.000Z',
  });
  assert.ok(when.time);
  assert.doesNotMatch(when.full, /por confirmar/i);
});

check('snake_case start_date/end_date — never false por confirmar', () => {
  assert.ok(pickStartRaw({ start_date: '2026-11-01T18:00:00.000Z' }));
  assert.ok(pickEndRaw({ end_date: '2026-11-01T21:00:00.000Z' }));
  const when = formatEventWhen({
    start_date: '2026-11-01T18:00:00.000Z',
    end_date: '2026-11-01T21:00:00.000Z',
  });
  assert.ok(when.time);
  assert.doesNotMatch(when.full, /por confirmar/i);
});

check('empty dates only when truly missing', () => {
  assert.equal(formatEventWhen({}).full, 'Fecha por confirmar');
});

if (failed) {
  console.error(`\n${failed} smoke check(s) failed`);
  process.exit(1);
}
console.log('\nU4 smoke OK');
