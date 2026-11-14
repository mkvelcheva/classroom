const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const code = fs.readFileSync('assets/progress.js', 'utf8');
function fixture({ blocked = false, empty = false, stored = new Map() } = {}) {
  const element = props => ({ ...props, events: {}, addEventListener(name, fn) { this.events[name] = fn; } });
  const boxes = empty ? [] : ['cpp-sample-01:theory', 'cpp-sample-02:tasks'].map(id => element({ dataset: { resource: id }, checked: false }));
  const meter = {}, text = {}, note = {}, toggle = element({ hidden: true });
  const units = [element({ open: true }), element({ open: true })];
  const course = { dataset: { course: 'grade9' }, querySelectorAll: selector => selector === 'details' ? units : boxes, querySelector: selector => ({ progress: meter, '[data-progress-text]': text, '[data-storage-note]': note, '[data-toggle-all]': toggle })[selector] };
  const window = element({});
  const storage = { getItem(k) { if (blocked) throw Error('blocked'); return stored.get(k) ?? null; }, setItem(k, v) { if (blocked) throw Error('blocked'); stored.set(k, v); } };
  vm.runInNewContext(code, { document: { querySelector: () => course }, window, localStorage: storage });
  return { boxes, meter, text, note, toggle, units, stored, window };
}
test('progress persists, restores, unchecks and survives reordering', () => {
  const f = fixture();
  f.boxes[0].checked = true; f.boxes[0].events.change();
  assert.equal(f.meter.value, 50);
  assert.equal(f.stored.get('classroom:v1:grade9:cpp-sample-01:theory'), '1');
  const restored = fixture({ stored: f.stored });
  assert.equal(restored.boxes[0].checked, true);
  restored.boxes.reverse();
  assert.equal(restored.boxes[1].checked, true);
  restored.boxes[1].checked = false; restored.boxes[1].events.change();
  assert.equal(restored.meter.value, 0);
});
test('blocked localStorage keeps session progress usable', () => {
  const f = fixture({ blocked: true });
  f.boxes[0].checked = true; f.boxes[0].events.change();
  assert.equal(f.meter.value, 50);
  assert.match(f.note.textContent, /недостъпно/);
});
test('empty course never divides by zero', () => assert.equal(fixture({ empty: true }).meter.value, 0));
test('collapse and expand all sections', () => {
  const f = fixture();
  assert.equal(f.toggle.hidden, false);
  f.toggle.events.click(); assert.ok(f.units.every(unit => !unit.open));
  f.toggle.events.click(); assert.ok(f.units.every(unit => unit.open));
});
test('cross-tab updates and storage clear refresh progress', () => {
  const f = fixture();
  const key = 'classroom:v1:grade9:cpp-sample-01:theory';
  f.stored.set(key, '1'); f.window.events.storage({ key });
  assert.equal(f.meter.value, 50);
  f.stored.clear(); f.window.events.storage({ key: null });
  assert.equal(f.meter.value, 0);
});
test('home page without a course is safe', () => vm.runInNewContext(code, { document: { querySelector: () => null } }));
