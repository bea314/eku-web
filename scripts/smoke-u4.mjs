/**
 * U4 smoke: Nest snake+camel dates/covers; tab favicon no-cover (not text ü).
 * Run: npm run test:smoke
 */
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
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

check('no-cover uses tab favicon-32 — not text ü', () => {
  const html = brandCoverPlaceholderHtml('card');
  assert.match(html, /favicon-32\.png/);
  assert.match(html, /width="72"/);
  assert.doesNotMatch(html, />\s*ü\s*</);
  assert.doesNotMatch(html, /eku-favicon-mark/);
});

check('covers: coverImageUrl | cover_image_url | image_url', () => {
  assert.equal(
    coverUrlOf({ coverImageUrl: 'https://cdn.example/a.jpg', image_url: 'https://cdn.example/b.jpg' }),
    'https://cdn.example/a.jpg',
  );
  assert.equal(coverUrlOf({ cover_image_url: 'https://cdn.example/snake.jpg' }), 'https://cdn.example/snake.jpg');
  assert.equal(coverUrlOf({ coverImageUrl: null, image_url: 'https://cdn.example/b.jpg' }), 'https://cdn.example/b.jpg');
  assert.equal(coverUrlOf({ coverImageUrl: null, cover_image_url: null, image_url: null }), '');
});

check('camelCase startDate/endDate — never false por confirmar', () => {
  const when = formatEventWhen({
    startDate: '2026-10-20T20:00:00.000Z',
    endDate: '2026-10-20T23:00:00.000Z',
  });
  assert.ok(when.time);
  assert.doesNotMatch(when.full, /por confirmar/i);
});

check('snake_case start_date/end_date ONLY — never false por confirmar', () => {
  // Nest FAIL root cause: payload with ONLY snake keys
  const nest = {
    id: 'evt-1',
    name: 'Snake only',
    start_date: '2026-11-01T18:00:00.000Z',
    end_date: '2026-11-01T21:00:00.000Z',
  };
  assert.ok(pickStartRaw(nest));
  assert.ok(pickEndRaw(nest));
  const when = formatEventWhen(nest);
  assert.ok(when.time, 'expected parsed time from start_date');
  assert.doesNotMatch(when.full, /por confirmar/i);
  assert.match(when.full, /01|1/);
});

check('empty dates only when truly missing', () => {
  assert.equal(formatEventWhen({}).full, 'Fecha por confirmar');
});

check('tab favicon asset exists', () => {
  assert.equal(existsSync(new URL('../public/favicon-32.png', import.meta.url)), true);
});

if (failed) {
  console.error(`\n${failed} smoke check(s) failed`);
  process.exit(1);
}
console.log('\nU4 smoke OK');
