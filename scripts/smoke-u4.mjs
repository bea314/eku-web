/**
 * U4 smoke: white CSS-masked eku-icon.svg ü, Nest snake dates/covers.
 * Run: npm run test:smoke
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const modUrl = new URL('../src/lib/safe-display.ts', import.meta.url).href;
const {
  brandCoverPlaceholderHtml,
  coverMarkHtml,
  COVER_MARK_SVG,
  coverUrlOf,
  formatEventWhen,
  pickStartRaw,
  pickEndRaw,
  eventCoords,
  eventMapSectionHtml,
  isVirtualEvent,
  isWithinMapCoverage,
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

check('no-cover uses CSS-masked /eku-icon.svg — white ü, not favicon-32', () => {
  assert.equal(COVER_MARK_SVG, '/eku-icon.svg');
  const html = brandCoverPlaceholderHtml('card');
  assert.match(html, /cover-ph cover-ph--card/);
  assert.match(html, /cover-ph__mark/);
  assert.doesNotMatch(html, /favicon-32\.png/);
  assert.doesNotMatch(html, /<img\b/);
  assert.match(coverMarkHtml(), /cover-ph__mark/);
  assert.equal(existsSync(new URL('../public/eku-icon.svg', import.meta.url)), true);

  const icon = readFileSync(new URL('../public/eku-icon.svg', import.meta.url), 'utf8');
  assert.match(icon, /viewBox="0 0 1080 1080"/);
  assert.match(icon, /#3368B1/i);

  const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');
  assert.match(css, /mask:\s*url\('\/eku-icon\.svg'\)/);
  assert.match(css, /background:\s*#fff/);
  assert.doesNotMatch(css, /cover-ph__mark[^}]*favicon-32/);

  const card = readFileSync(new URL('../src/components/EventCard.astro', import.meta.url), 'utf8');
  assert.match(card, /brandCoverPlaceholderHtml/);
  assert.doesNotMatch(card, /favicon-32\.png/);
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

check('event coords from Nest location.latitude/longitude (decimal strings)', () => {
  const c = eventCoords({
    location: { address: 'Plaza Demo', latitude: '13.698000', longitude: '-89.191000' },
  });
  assert.ok(c);
  assert.equal(c.lat, 13.698);
  assert.equal(c.lng, -89.191);
});

check('event coords aliases lat/lng + Flutter-style nested location', () => {
  const c = eventCoords({ location: { lat: 13.7, lng: -89.2 } });
  assert.deepEqual(c, { lat: 13.7, lng: -89.2 });
});

check('virtual events and missing coords hide the map', () => {
  assert.equal(isVirtualEvent({ isVirtual: true }), true);
  assert.equal(eventCoords({ name: 'Sin lugar' }), null);
  assert.equal(eventMapSectionHtml({ isVirtual: true, location: { lat: 13.7, lng: -89.2 } }, 'X'), '');
  assert.equal(eventMapSectionHtml({ name: 'X' }, 'X'), '');
});

check('SV/GT coverage matches Flutter MapConfig; map HTML when in range', () => {
  assert.equal(isWithinMapCoverage({ lat: 13.698, lng: -89.191 }), true);
  assert.equal(isWithinMapCoverage({ lat: 40.4, lng: -3.7 }), false);
  const html = eventMapSectionHtml(
    { name: 'Open Mic', location: { latitude: 13.698, longitude: -89.191 } },
    'Open Mic',
  );
  assert.match(html, /Ubicación/);
  assert.match(html, /event-map__canvas/);
  assert.match(html, /google\.com\/maps/);
  const outside = eventMapSectionHtml(
    { name: 'Madrid', location: { lat: 40.4, lng: -3.7 } },
    'Madrid',
  );
  assert.match(outside, /Vista previa no disponible/);
});

if (failed) {
  console.error(`\n${failed} smoke check(s) failed`);
  process.exit(1);
}
console.log('\nU4 smoke OK');
