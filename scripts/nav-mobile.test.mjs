/**
 * Mobile nav ≤720 / 390px: Explorar in row (guest + authed),
 * avatar menu Mis entradas first, touch targets ≥44px.
 * Run: npm run test:nav-mobile
 * Runtime 390 (Playwright): needs preview up + /tmp/nest-token.txt
 *   NODE_PATH=/tmp/node_modules BASE=http://127.0.0.1:4321 npm run test:nav-mobile
 */
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const layout = readFileSync(`${root}/src/layouts/BaseLayout.astro`, 'utf8');
const css = readFileSync(`${root}/src/styles/global.css`, 'utf8');

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

check('avatar menu: Mis entradas first, then Perfil + Salir', () => {
  assert.match(layout, /id="nav-account-menu"/);
  assert.match(layout, /id="nav-account-btn"/);
  const menuBlock = layout.slice(layout.indexOf('nav-account-menu'), layout.indexOf('nav-account-menu') + 900);
  const mis = menuBlock.indexOf('Mis entradas');
  const perfil = menuBlock.indexOf('Perfil');
  const salir = menuBlock.indexOf('nav-logout');
  assert.ok(mis >= 0, 'Mis entradas missing');
  assert.ok(perfil > mis, 'Perfil should follow Mis entradas');
  assert.ok(salir > perfil, 'Salir should follow Perfil');
  assert.match(menuBlock, /href="\/entradas"/);
});

check('≤720 CSS: Explorar visible pill; Inicio+Entradas hidden; 44px targets', () => {
  const idx = css.indexOf('U5-style mobile');
  assert.ok(idx >= 0, 'mobile nav block missing');
  const mobile = css.slice(idx, idx + 3200);
  assert.match(mobile, /max-width:\s*720px/);
  assert.match(mobile, /a\[href='\/eventos'\][\s\S]*?display:\s*inline-flex\s*!important/);
  assert.match(mobile, /min-height:\s*44px/);
  assert.match(mobile, /nav-account__btn/);
  assert.match(mobile, /a\.nav-authed-only\[href='\/'\]/);
  assert.match(mobile, /a\.nav-authed-only\[href='\/entradas'\]/);
  const hideBlock =
    mobile.match(
      /\.nav\s*>\s*a\.nav-authed-only\[href='\/'\][\s\S]*?display:\s*none\s*!important/,
    )?.[0] || '';
  assert.doesNotMatch(hideBlock, /href='\/eventos'/);
});

check('footer registro gratis nowrap', () => {
  assert.match(css, /\.site-footer__copy\s+em\s*\{[^}]*white-space:\s*nowrap/s);
});

check('logo brand remains Inicio (no duplicate Inicio in mobile row)', () => {
  assert.match(layout, /aria-label="ekü, inicio"/);
});

async function runtime390() {
  const base = process.env.BASE || 'http://127.0.0.1:4321';
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    console.log('skip runtime 390 (playwright not installed)');
    return;
  }
  const tokenPath = '/tmp/nest-token.txt';
  if (!existsSync(tokenPath)) {
    console.log('skip runtime 390 (no /tmp/nest-token.txt)');
    return;
  }

  // Probe preview
  try {
    const r = await fetch(base + '/eventos');
    if (!r.ok) throw new Error(String(r.status));
  } catch {
    console.log('skip runtime 390 (preview not up at', base + ')');
    return;
  }

  const token = readFileSync(tokenPath, 'utf8').trim();
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });

  async function shotState(authed) {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      locale: 'es-SV',
      isMobile: true,
      hasTouch: true,
    });
    const page = await ctx.newPage();
    if (authed) await page.addInitScript((t) => localStorage.setItem('eku_org_token', t), token);
    await page.goto(`${base}/organizador`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(350);
    const data = await page.evaluate(() => {
      const explorar = document.querySelector('.nav > a[href="/eventos"]');
      const er = explorar?.getBoundingClientRect();
      const ecs = explorar ? getComputedStyle(explorar) : null;
      const targets = [];
      const add = (el, label) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || r.width === 0) return;
        targets.push({ label, w: +r.width.toFixed(1), h: +r.height.toFixed(1) });
      };
      add(document.querySelector('.brand'), 'brand');
      add(explorar, 'Explorar');
      add(document.querySelector('.nav > a[href="/organizador"]'), 'Crear');
      add(document.querySelector('#nav-notifications'), 'bell');
      add(document.querySelector('#nav-account-btn'), 'avatar');
      add(document.querySelector('#nav-signin'), 'signin');
      return {
        explorarVisible:
          !!explorar && ecs?.display !== 'none' && (er?.width || 0) > 0 && (er?.height || 0) >= 43.5,
        targets,
        undersized: targets.filter((t) => t.w < 43.5 || t.h < 43.5),
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        footerNowrap: getComputedStyle(document.querySelector('.site-footer__copy em')).whiteSpace,
      };
    });

    let menuFirst = null;
    if (authed) {
      await page.click('#nav-account-btn');
      await page.waitForTimeout(150);
      menuFirst = await page.evaluate(() => {
        const items = [...document.querySelectorAll('#nav-account-menu [role="menuitem"]')];
        return items.map((el) => ({
          text: (el.textContent || '').trim(),
          href: el.getAttribute('href'),
        }));
      });
    }
    await ctx.close();
    return { ...data, menuFirst };
  }

  const auth = await shotState(true);
  check('runtime 390 authed: Explorar in row, targets ≥44, no overflow', () => {
    assert.equal(auth.explorarVisible, true, 'Explorar not visible');
    assert.equal(auth.overflow, false, 'horizontal overflow');
    assert.deepEqual(auth.undersized, []);
  });
  check('runtime 390 authed: Mis entradas first in avatar menu', () => {
    assert.ok(auth.menuFirst?.length, 'menu empty');
    assert.equal(auth.menuFirst[0].text, 'Mis entradas');
    assert.equal(auth.menuFirst[0].href, '/entradas');
  });
  check('runtime 390 footer registro gratis nowrap', () => {
    assert.equal(auth.footerNowrap, 'nowrap');
  });

  const guest = await shotState(false);
  check('runtime 390 guest: Explorar visible, targets ≥44', () => {
    assert.equal(guest.explorarVisible, true);
    assert.equal(guest.overflow, false);
    assert.deepEqual(guest.undersized, []);
  });

  await browser.close();
  console.log('auth targets', JSON.stringify(auth.targets));
  console.log('guest targets', JSON.stringify(guest.targets));
}

await runtime390();

if (failed) {
  console.error(`\n${failed} nav-mobile test(s) failed`);
  process.exit(1);
}
console.log('\nnav-mobile OK');
