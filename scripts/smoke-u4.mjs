/**
 * U4 smoke: honeycomb mark #3368B1, Nest snake dates/covers.
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

check('no-cover uses honeycomb mark SVG #3368B1 — not fake favicon-mark / text ü', () => {
  const html = brandCoverPlaceholderHtml('card');
  assert.match(html, /eku-honeycomb-mark\.svg/);
  assert.match(html, /cover-ph__mark/);
  assert.match(html, /width="72"/);
  assert.doesNotMatch(html, /eku-favicon-mark/);
  assert.doesNotMatch(html, /favicon-32\.png/);
  assert.doesNotMatch(html, />\s*ü\s*</);
  assert.equal(existsSync(new URL('../public/eku-favicon-mark.svg', import.meta.url)), false);
  const svg = readFileSync(new URL('../public/eku-honeycomb-mark.svg', import.meta.url), 'utf8');
  assert.match(svg, /#3368B1/i);
  assert.doesNotMatch(svg, /#0083EB/i);
  assert.doesNotMatch(svg, />ü</);
});

check('covers: coverImageUrl | cover_image_url | image_url', () => {
  assert.equal(coverUrlOf({ coverImageUrl: 'https://cdn.example/a.jpg' }), 'https://cdn.example/a.jpg');
  assert.equal(coverUrlOf({ cover_image_url: 'https://cdn.example/snake.jpg' }), 'https://cdn.example/snake.jpg');
  assert.equal(coverUrlOf({ image_url: 'https://cdn.example/b.jpg' }), 'https://cdn.example/b.jpg');
});

check('snake_case start_date/end_date ONLY — never false por confirmar', () => {
  const nest = {
    start_date: '2026-11-01T18:00:00.000Z',
    end_date: '2026-11-01T21:00:00.000Z',
  };
  assert.ok(pickStartRaw(nest));
  assert.ok(pickEndRaw(nest));
  const when = formatEventWhen(nest);
  assert.ok(when.time);
  assert.doesNotMatch(when.full, /por confirmar/i);
});

check('camelCase startDate/endDate still works', () => {
  const when = formatEventWhen({
    startDate: '2026-10-20T20:00:00.000Z',
    endDate: '2026-10-20T23:00:00.000Z',
  });
  assert.doesNotMatch(when.full, /por confirmar/i);
});

if (failed) {
  console.error(`\n${failed} smoke check(s) failed`);
  process.exit(1);
}
console.log('\nU4 smoke OK');
