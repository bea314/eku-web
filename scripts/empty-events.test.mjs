/**
 * Discovery empty state — PO copy + guest create CTA.
 * Run: npm run test:empty-events
 */
import assert from 'node:assert/strict';

globalThis.localStorage = {
  store: Object.create(null),
  getItem(k) {
    return Object.prototype.hasOwnProperty.call(this.store, k) ? this.store[k] : null;
  },
  setItem(k, v) {
    this.store[k] = String(v);
  },
  removeItem(k) {
    delete this.store[k];
  },
};

const {
  EMPTY_UPCOMING_TITLE,
  EMPTY_CREATE_LABEL,
  renderEmptyEvents,
} = await import('../src/lib/empty-events-ui.ts');

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

function listStub() {
  return {
    innerHTML: '',
    querySelectorAll() {
      return [];
    },
  };
}

check('PO empty title + Crear evento label', () => {
  assert.equal(EMPTY_UPCOMING_TITLE, 'Todavía no hay eventos próximos.');
  assert.equal(EMPTY_CREATE_LABEL, 'Crear evento');
});

check('guest empty → login?next=/organizador (never 401 copy)', () => {
  localStorage.removeItem('eku_org_token');
  const el = listStub();
  renderEmptyEvents(el, () => {});
  assert.match(el.innerHTML, /Todavía no hay eventos próximos\./);
  assert.match(el.innerHTML, />Crear evento</);
  assert.match(el.innerHTML, /href="\/login\?next=%2Forganizador"/);
  assert.doesNotMatch(el.innerHTML, /401|Unauthorized|eventos públicos/i);
  assert.doesNotMatch(el.innerHTML, /Cuando alguien publique/);
});

check('authed empty → /organizador directly', () => {
  localStorage.setItem('eku_org_token', 'fake.jwt.token');
  const el = listStub();
  renderEmptyEvents(el, () => {});
  assert.match(el.innerHTML, /href="\/organizador"/);
  assert.doesNotMatch(el.innerHTML, /login\?next/);
  localStorage.removeItem('eku_org_token');
});

check('filtered empty keeps custom title + lead', () => {
  const el = listStub();
  renderEmptyEvents(el, () => {}, {
    title: 'No hay eventos con ese filtro.',
    lead: 'Probá otra búsqueda o categoría.',
  });
  assert.match(el.innerHTML, /No hay eventos con ese filtro/);
  assert.match(el.innerHTML, /Probá otra búsqueda/);
  assert.match(el.innerHTML, />Crear evento</);
});

if (failed) {
  console.error(`\nempty-events: ${failed} failed`);
  process.exit(1);
}
console.log('\nempty-events OK');
