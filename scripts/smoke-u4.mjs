/**
 * Minimal U4 smoke: honeycomb SVG (not text ü), Nest covers, real dates.
 * Run: node scripts/smoke-u4.mjs
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

// Load TS helpers via Node strip-types
const require = createRequire(import.meta.url);
void require;
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

check('honeycomb SVG placeholder — not text glyph ü', () => {
  const html = brandCoverPlaceholderHtml('card');
  assert.match(html, /eku-favicon-mark\.svg/);
  assert.match(html, /cover-ph__favicon/);
  assert.doesNotMatch(html, />\s*ü\s*</);
  assert.doesNotMatch(html, /cover-ph__mark/);
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

check('real Nest startDate/endDate — never false por confirmar', () => {
  const e = {
    startDate: '2026-10-20T20:00:00.000Z',
    endDate: '2026-10-20T23:00:00.000Z',
  };
  const when = formatEventWhen(e);
  assert.ok(when.time, 'expected start time');
  assert.doesNotMatch(when.full, /por confirmar/i);
  assert.match(when.full, /20/);
  assert.match(when.full, /–/);
});

check('Nest start/end aliases coerce', () => {
  assert.ok(pickStartRaw({ start: '2026-11-01T18:00:00.000Z' }));
  assert.ok(pickEndRaw({ end: '2026-11-01T21:00:00.000Z' }));
  const when = formatEventWhen({ start: '2026-11-01T18:00:00.000Z', end: '2026-11-01T21:00:00.000Z' });
  assert.doesNotMatch(when.full, /por confirmar/i);
});

check('empty dates only when truly missing', () => {
  const when = formatEventWhen({});
  assert.equal(when.full, 'Fecha por confirmar');
});

check('favicon SVG asset exists', () => {
  const svg = readFileSync(new URL('../public/eku-favicon-mark.svg', import.meta.url), 'utf8');
  assert.match(svg, /<svg/);
  assert.doesNotMatch(svg, />ü</);
});

if (failed) {
  console.error(`\n${failed} smoke check(s) failed`);
  process.exit(1);
}
console.log('\nU4 smoke OK');
