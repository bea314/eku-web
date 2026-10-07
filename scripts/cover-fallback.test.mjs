/**
 * Cover fallback — pure unit tests (no browser / playwright).
 * Runtime broken-cover behavior is covered by the U20r shot script.
 */
import assert from 'node:assert/strict';
import {
  coverMediaHtml,
  coverUrlOf,
  brandCoverPlaceholderHtml,
} from '../src/lib/safe-display.ts';

let failed = 0;
function check(name, fn) {
  try {
    fn();
    console.log('ok ', name);
  } catch (err) {
    failed += 1;
    console.error('FAIL', name, err);
  }
}

check('coverUrlOf reads coverImageUrl / image_url', () => {
  assert.equal(
    coverUrlOf({
      coverImageUrl: 'https://images.unsplash.com/photo-x?w=1200',
    }),
    'https://images.unsplash.com/photo-x?w=1200',
  );
  assert.equal(
    coverUrlOf({ image_url: 'https://cdn.example/a.jpg' }),
    'https://cdn.example/a.jpg',
  );
  assert.equal(coverUrlOf({}), '');
});

check('coverUrlOf reads eventCoverUrl (Nest wallet sibling)', () => {
  assert.equal(
    coverUrlOf({ eventCoverUrl: 'https://cdn.example/event-cover.jpg' }),
    'https://cdn.example/event-cover.jpg',
  );
  // coverImageUrl wins when both present
  assert.equal(
    coverUrlOf({
      coverImageUrl: 'https://cdn.example/a.jpg',
      eventCoverUrl: 'https://cdn.example/b.jpg',
    }),
    'https://cdn.example/a.jpg',
  );
});

check('coverUrlOf strips Nest wallet mic placeholder → empty (ü)', () => {
  assert.equal(
    coverUrlOf({
      coverImageUrl:
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1600&auto=format&fit=crop',
      eventCoverUrl:
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1600&auto=format&fit=crop',
    }),
    '',
  );
  // Real DJ cover (different Unsplash) kept
  assert.equal(
    coverUrlOf({
      coverImageUrl:
        'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200',
    }),
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200',
  );
});

check('coverMediaHtml with valid coverUrl keeps <img>, no placeholder', () => {
  const html = coverMediaHtml('https://images.unsplash.com/photo-ok?w=200', 'card');
  assert.match(html, /<img /);
  assert.match(html, /data-cover-fallback="card"/);
  assert.equal(html.includes('cover-ph'), false);
  assert.equal(html.includes('cover-ph__mark'), false);
});

check('coverMediaHtml empty → brand placeholder (ü), no img', () => {
  const html = coverMediaHtml('', 'card');
  assert.equal(html.includes('<img'), false);
  assert.match(html, /cover-ph/);
  assert.equal(html, brandCoverPlaceholderHtml('card'));
});

check('coverMediaHtml whitespace → brand placeholder', () => {
  const html = coverMediaHtml('   ', 'card');
  assert.equal(html.includes('<img'), false);
  assert.match(html, /cover-ph__mark/);
});

check('coverMediaHtml keeps data-cover-fallback for onerror path', () => {
  const html = coverMediaHtml('https://cdn.example/cover.jpg', 'detail', 'loading="eager"');
  assert.match(html, /data-cover-fallback="detail"/);
  assert.match(html, /loading="eager"/);
  assert.match(html, /src="https:\/\/cdn\.example\/cover\.jpg"/);
});

if (failed) {
  console.error(`\n${failed} cover-fallback test(s) failed`);
  process.exit(1);
}
console.log('\ncover-fallback OK');
