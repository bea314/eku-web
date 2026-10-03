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
  coverMediaHtml,
  coverImageWithFallbackHtml,
  formatEventWhen,
  pickStartRaw,
  pickEndRaw,
} = await import(modUrl);

const mapUrl = new URL('../src/lib/event-map.ts', import.meta.url).href;
const {
  eventCoords,
  eventMapSectionHtml,
  isVirtualEvent,
  isWithinMapCoverage,
} = await import(mapUrl);

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
  assert.match(card, /coverMediaHtml/);
  assert.doesNotMatch(card, /favicon-32\.png/);
});

check('covers: coverImageUrl | cover_image_url | image_url', () => {
  assert.equal(coverUrlOf({ coverImageUrl: 'https://cdn.example/a.jpg' }), 'https://cdn.example/a.jpg');
  assert.equal(coverUrlOf({ cover_image_url: 'https://cdn.example/snake.jpg' }), 'https://cdn.example/snake.jpg');
  assert.equal(coverUrlOf({ image_url: 'https://cdn.example/b.jpg' }), 'https://cdn.example/b.jpg');
});

check('broken/missing cover → data-cover-fallback img (same card+detail path)', () => {
  const empty = coverMediaHtml('', 'card');
  assert.match(empty, /cover-ph cover-ph--card/);
  assert.doesNotMatch(empty, /<img\b/);

  const withUrl = coverMediaHtml('https://cdn.example/broken.jpg', 'detail');
  assert.match(withUrl, /data-cover-fallback="detail"/);
  assert.match(withUrl, /src="https:\/\/cdn\.example\/broken\.jpg"/);

  const imgOnly = coverImageWithFallbackHtml('https://x.test/a.png', 'card', 'loading="lazy"');
  assert.match(imgOnly, /data-cover-fallback="card"/);
  assert.match(imgOnly, /loading="lazy"/);

  const layout = readFileSync(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8');
  assert.match(layout, /data-cover-fallback/);
  assert.match(layout, /cover-ph__mark/);
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

check('null endDate shows start only — no dash / no Fin por confirmar', () => {
  const when = formatEventWhen({
    startDate: '2026-12-20T20:00:00.000Z',
    endDate: null,
    endsAt: null,
  });
  assert.ok(when.time);
  assert.doesNotMatch(when.full, /por confirmar/i);
  assert.doesNotMatch(when.full, /–/);
  assert.doesNotMatch(when.full, /—/);
  assert.match(when.full, /·/);
});

check('code-point length matches Nest [...str].length for emoji', () => {
  assert.equal([...'😀'].length, 1);
  assert.equal([...'☺️'].length, 2); // U+263A + U+FE0F
  assert.equal([...'👨‍👩‍👧'].length, 5); // ZWJ sequence
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
  // No coords → address + Abrir en Maps, never empty map canvas
  const textOnly = eventMapSectionHtml(
    { name: 'X', placeText: 'Café Central', location: { name: 'Café Central' } },
    'X',
  );
  assert.match(textOnly, /event-map--text/);
  assert.match(textOnly, /Café Central/);
  assert.match(textOnly, /Abrir en Maps/);
  assert.match(textOnly, /google\.com\/maps\/search\/\?api=1&amp;query=/);
  assert.doesNotMatch(textOnly, /event-map__canvas/);
  assert.equal(eventMapSectionHtml({ name: 'X' }, 'X'), '');
});

check('SV/GT coverage matches Flutter MapConfig; map HTML address-only while Leaflet OFF', () => {
  assert.equal(isWithinMapCoverage({ lat: 13.698, lng: -89.191 }), true);
  assert.equal(isWithinMapCoverage({ lat: 40.4, lng: -3.7 }), false);
  const html = eventMapSectionHtml(
    { name: 'Open Mic', placeText: 'Café Central', location: { latitude: 13.698, longitude: -89.191, name: 'Café Central' } },
    'Open Mic',
  );
  assert.match(html, /Ubicación/);
  assert.match(html, /Abrir en Maps/);
  assert.match(html, /Café Central/);
  assert.doesNotMatch(html, /event-map__canvas/);
  assert.doesNotMatch(html, /leaflet|carto|API KEY/i);
  const outside = eventMapSectionHtml(
    { name: 'Madrid', placeText: 'Madrid', location: { lat: 40.4, lng: -3.7, name: 'Madrid' } },
    'Madrid',
  );
  assert.match(outside, /Abrir en Maps/);
  assert.doesNotMatch(outside, /event-map__canvas/);
});

if (failed) {
  console.error(`\n${failed} smoke check(s) failed`);
  process.exit(1);
}
console.log('\nU4 smoke OK');
