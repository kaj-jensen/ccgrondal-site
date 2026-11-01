import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../public/analytics-consent.js', import.meta.url), 'utf8');
function browser({ saved = null, unavailable = false } = {}) {
  const events = {};
  const deleted = [];
  const scripts = [];
  let reloads = 0;
  let focused = false;
  let stored = saved;
  const button = choice => ({ dataset: { analyticsChoice: choice }, addEventListener: (_event, handler) => { events[choice] = handler; }, focus() {} });
  const buttons = [button('denied'), button('granted')];
  const preferences = { hidden: true, addEventListener: (_event, handler) => { events.preferences = handler; }, focus: () => { focused = true; } };
  const panel = { hidden: true, querySelectorAll: () => buttons, querySelector: () => buttons[0] };
  const originals = [
    { attributes: [{ name: 'src', value: 'https://www.googletagmanager.com/gtag/js?id=G-EXAMPLE' }], textContent: '' },
    { attributes: [], textContent: 'analytics initialization' },
  ];
  const template = { content: { querySelectorAll: () => originals } };
  const document = {
    querySelector: selector => selector === '[data-analytics-panel]' ? panel : template,
    querySelectorAll: () => [preferences],
    createElement: () => ({ setAttribute() {} }),
    head: { appendChild: script => scripts.push(script) },
    get cookie() { return '_ga=old; _ga_EXAMPLE=old; cf_clearance=preserve'; },
    set cookie(value) { deleted.push(value); },
  };
  vm.runInNewContext(source, {
    document,
    location: { hostname: 'www.example.com', protocol: 'https:', reload: () => { reloads++; } },
    localStorage: {
      getItem() { if (unavailable) throw new Error('Blocked'); return stored; },
      setItem(_key, value) { if (unavailable) throw new Error('Blocked'); stored = value; },
    },
    window: { addEventListener: (name, handler) => { events[name] = handler; }, dispatchEvent() {} },
    CustomEvent: class {},
  });
  return { panel, events, scripts, deleted, preferences, stored: () => stored, reloads: () => reloads, focused: () => focused };
}
const preference = choice => JSON.stringify({ choice, expires: Date.now() + 60000 });

test('a fresh visitor gets a choice before any analytics script is appended', () => {
  const b = browser();
  assert.equal(b.scripts.length, 0);
  assert.equal(b.panel.hidden, false);
  assert.equal(b.preferences.hidden, false);
  assert.ok(b.deleted.length > 0);
  assert.ok(b.deleted.every(value => !value.startsWith('cf_clearance=')));
});
test('only explicit permission loads analytics, and repeated clicks do not load it again', () => {
  const b = browser();
  b.events.granted();
  assert.equal(b.scripts.length, 2);
  assert.equal(JSON.parse(b.stored()).choice, 'granted');
  b.events.granted();
  assert.equal(b.scripts.length, 2);
});
test('remembered rejection stays rejected across page loads', () => {
  const b = browser({ saved: preference('denied') });
  assert.equal(b.scripts.length, 0);
  assert.equal(b.panel.hidden, true);
});
test('remembered permission works and can be withdrawn from the footer', () => {
  const b = browser({ saved: preference('granted') });
  assert.equal(b.scripts.length, 2);
  b.events.preferences();
  assert.equal(b.panel.hidden, false);
  b.events.denied();
  assert.equal(JSON.parse(b.stored()).choice, 'denied');
  assert.equal(b.reloads(), 1);
});
test('expired, malformed and unavailable storage never grant implicit permission', () => {
  for (const options of [{ saved: '{broken' }, { saved: JSON.stringify({ choice: 'granted', expires: 1 }) }, { unavailable: true }]) {
    const b = browser(options);
    assert.equal(b.scripts.length, 0);
    assert.equal(b.panel.hidden, false);
  }
});
test('rejection returns keyboard focus and preference changes in another tab reload the page', () => {
  const b = browser();
  b.events.preferences();
  b.events.denied();
  assert.equal(b.focused(), true);
  b.events.storage({ key: 'analytics-consent-v1' });
  assert.equal(b.reloads(), 1);
});
