/**
 * Button loading UI — create «Publicando…» next to spinner.
 * Run: npm run test:loader-ui
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { setButtonLoading, withButtonLoading } from '../src/lib/loader-ui.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const organizador = readFileSync(`${root}/src/pages/organizador/index.astro`, 'utf8');
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

/** Minimal button stand-in for loader-ui (no jsdom). */
function makeButton(idleLabel = 'Publicar evento') {
  const attrs = new Map();
  const classSet = new Set();
  const style = { minWidth: '' };
  let innerHTML = idleLabel;
  let textContent = idleLabel;
  let disabled = false;

  const button = {
    get disabled() {
      return disabled;
    },
    set disabled(v) {
      disabled = Boolean(v);
    },
    style,
    getAttribute(name) {
      return attrs.has(name) ? attrs.get(name) : null;
    },
    setAttribute(name, value) {
      attrs.set(name, String(value));
    },
    removeAttribute(name) {
      attrs.delete(name);
    },
    classList: {
      add(...names) {
        for (const n of names) classSet.add(n);
      },
      remove(...names) {
        for (const n of names) classSet.delete(n);
      },
      toggle(name, force) {
        if (force === true) classSet.add(name);
        else if (force === false) classSet.delete(name);
        else if (classSet.has(name)) classSet.delete(name);
        else classSet.add(name);
        return classSet.has(name);
      },
      contains(name) {
        return classSet.has(name);
      },
    },
    getBoundingClientRect() {
      return { width: 180, height: 44, top: 0, left: 0, right: 180, bottom: 44 };
    },
    querySelector(sel) {
      if (sel === '.btn__label' || sel === 'HTMLElement') {
        const m = String(innerHTML).match(
          /<span class="btn__label">([\s\S]*?)<\/span>/,
        );
        if (!m) return null;
        return {
          get textContent() {
            return m[1]
              .replaceAll('&amp;', '&')
              .replaceAll('&lt;', '<')
              .replaceAll('&gt;', '>')
              .replaceAll('&quot;', '"');
          },
          set textContent(v) {
            innerHTML = String(innerHTML).replace(
              /(<span class="btn__label">)[\s\S]*?(<\/span>)/,
              `$1${v}$2`,
            );
          },
        };
      }
      if (sel === '.btn__loader') {
        return /btn__loader/.test(innerHTML) ? {} : null;
      }
      return null;
    },
    get textContent() {
      return textContent;
    },
    set textContent(v) {
      textContent = String(v ?? '');
      innerHTML = textContent;
    },
    get innerHTML() {
      return innerHTML;
    },
    set innerHTML(v) {
      innerHTML = String(v);
      textContent = innerHTML.replace(/<[^>]+>/g, '').trim();
    },
    _classes: classSet,
    _attrs: attrs,
  };
  return button;
}

check('create submit uses loadingLabel Publicando…', () => {
  assert.match(organizador, /loadingLabel:\s*['"]Publicando…['"]/);
  assert.match(organizador, /id="create-submit"/);
  assert.match(organizador, /Publicar evento/);
});

check('CSS labeled loading keeps spinner + visible label', () => {
  assert.match(css, /\.btn\.is-loading\.is-loading--labeled/);
  assert.match(css, /\.btn\.is-loading\.is-loading--labeled\s+\.btn__label\s*\{[^}]*visibility:\s*visible/s);
  assert.match(
    css,
    /\.btn\.is-loading\.is-loading--labeled\s+\.btn__loader[\s\S]*?position:\s*static/s,
  );
});

check('setButtonLoading with Publicando… shows label + labeled class', () => {
  const btn = makeButton('Publicar evento');
  setButtonLoading(btn, true, { loadingLabel: 'Publicando…' });
  assert.equal(btn.disabled, true);
  assert.equal(btn.classList.contains('is-loading'), true);
  assert.equal(btn.classList.contains('is-loading--labeled'), true);
  assert.match(btn.innerHTML, /btn__loader/);
  assert.match(btn.innerHTML, /Publicando…/);
  assert.equal(btn.getAttribute('aria-busy'), 'true');
  assert.equal(btn.getAttribute('aria-label'), 'Publicando…');
  assert.equal(btn.style.minWidth, '180px');
});

check('setButtonLoading without loadingLabel hides label path (default)', () => {
  const btn = makeButton('Confirmar');
  setButtonLoading(btn, true);
  assert.equal(btn.classList.contains('is-loading'), true);
  assert.equal(btn.classList.contains('is-loading--labeled'), false);
  assert.match(btn.innerHTML, /btn__label/);
});

check('withButtonLoading restores Publicar evento after task', async () => {
  const btn = makeButton('Publicar evento');
  const result = await withButtonLoading(
    btn,
    async () => {
      assert.equal(btn.classList.contains('is-loading--labeled'), true);
      assert.match(btn.innerHTML, /Publicando…/);
      return 42;
    },
    { loadingLabel: 'Publicando…' },
  );
  assert.equal(result, 42);
  assert.equal(btn.disabled, false);
  assert.equal(btn.classList.contains('is-loading'), false);
  assert.equal(btn.textContent, 'Publicar evento');
  assert.equal(btn.style.minWidth, '');
});

if (failed) {
  console.error(`\n${failed} loader-ui test(s) failed`);
  process.exit(1);
}
console.log('\nloader-ui OK');
