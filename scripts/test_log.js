// Dependency-free event behavior tests; run: node scripts/test_log.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
class Target {
  constructor() { this.events = {}; }
  addEventListener(name, fn) { (this.events[name] ||= []).push(fn); }
  fire(name, event = {}) { for (const fn of this.events[name] || []) fn(event); }
}
const document = new Target();
const window = new Target(); window.innerWidth = 390; window.innerHeight = 800;
const tips = [0, 1].map(() => {
  const tip = new Target(), button = new Target();
  const panel = { hidden: true, style: {}, getBoundingClientRect: () => ({ width: 250, height: 140 }) };
  button.attrs = {}; button.setAttribute = (k, v) => button.attrs[k] = v;
  button.getBoundingClientRect = () => ({ left: 210, bottom: 400 });
  tip.querySelector = s => s === 'button' ? button : panel;
  return Object.assign(tip, { button, panel });
});
document.querySelectorAll = () => tips;
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname, '../assets/js/log.js'), 'utf8'), { document, window, setTimeout, clearTimeout });
const [one, two] = tips;
one.fire('pointerenter', { pointerType: 'mouse' }); assert.equal(one.panel.hidden, false);
assert.equal(one.panel.style.left, '116px'); // Fits within a 390px viewport.
document.fire('keydown', { key: 'Escape' }); assert.equal(one.panel.hidden, true);
one.button.fire('focus'); assert.equal(one.button.attrs['aria-expanded'], 'true');
one.button.fire('click'); assert.equal(one.panel.hidden, false); // Tap after focus pins, not closes.
one.button.fire('click'); assert.equal(one.panel.hidden, true);
one.button.fire('focus'); one.button.fire('click');
two.button.fire('focus'); assert.equal(one.panel.hidden, true); assert.equal(two.panel.hidden, false);
document.fire('pointerdown', { target: { closest: () => null } }); assert.equal(two.panel.hidden, true);
two.button.fire('focus'); window.fire('resize'); assert.equal(two.panel.hidden, true);
one.button.fire('focus'); document.fire('scroll'); assert.equal(one.panel.hidden, true);
one.fire('pointerenter', { pointerType: 'touch' }); assert.equal(one.panel.hidden, true);
console.log('PASS: hover, focus, tap pin/unpin, Escape, outside dismissal, exclusive opening, viewport clamp, resize/scroll and touch handling');
