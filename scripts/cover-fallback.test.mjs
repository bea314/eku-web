/**
 * Cover fallback: valid URL keeps <img>; empty → placeholder; broken → ü via error handler.
 */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
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

const VALID =
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400';

async function runtime() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setContent(`<!doctype html><html><head>
<script>
(function () {
  function applyCoverFallback(img) {
    if (!img || img.getAttribute('data-cover-fallback-done') === '1') return;
    if (img.complete && img.naturalWidth > 0) return;
    img.setAttribute('data-cover-fallback-done', '1');
    var size = img.getAttribute('data-cover-fallback') || 'card';
    var cls = size === 'thumb'
      ? 'profile-event__thumb profile-event__thumb--ph'
      : 'cover-ph cover-ph--card';
    var div = document.createElement(size === 'thumb' ? 'span' : 'div');
    div.className = cls;
    div.setAttribute('aria-hidden', 'true');
    div.innerHTML = '<span class="cover-ph__mark" aria-hidden="true"></span>';
    if (img.parentNode) img.parentNode.replaceChild(div, img);
  }
  document.addEventListener('error', function (ev) {
    var t = ev.target;
    if (!t || t.tagName !== 'IMG') return;
    if (!t.getAttribute || !t.getAttribute('data-cover-fallback')) return;
    applyCoverFallback(t);
  }, true);
})();
</script></head><body>
  <img id="ok" src="${VALID}" alt="" data-cover-fallback="thumb" loading="eager" />
  <img id="bad" src="https://example.invalid/missing-cover.jpg" alt="" data-cover-fallback="thumb" loading="eager" />
</body></html>`);

  await page.waitForFunction(() => {
    const ok = document.getElementById('ok');
    return ok && ok.complete && ok.naturalWidth > 0;
  }, { timeout: 15000 });
  await page.waitForSelector('.profile-event__thumb--ph', { timeout: 10000 });

  const state = await page.evaluate(() => {
    const ok = document.getElementById('ok');
    return {
      okStillImg: !!ok && ok.tagName === 'IMG',
      okNatural: ok?.naturalWidth || 0,
      okFallbackDone: ok?.getAttribute('data-cover-fallback-done'),
      badPh: !!document.querySelector('.profile-event__thumb--ph .cover-ph__mark'),
      badImgGone: !document.getElementById('bad'),
    };
  });
  await browser.close();

  check('runtime: valid coverUrl does not apply fallback', () => {
    assert.equal(state.okStillImg, true);
    assert.ok(state.okNatural > 0);
    assert.equal(state.okFallbackDone, null);
  });
  check('runtime: broken cover applies ü thumb fallback', () => {
    assert.equal(state.badPh, true);
    assert.equal(state.badImgGone, true);
  });
}

await runtime();

if (failed) {
  console.error(`\n${failed} cover-fallback test(s) failed`);
  process.exit(1);
}
console.log('\ncover-fallback OK');
