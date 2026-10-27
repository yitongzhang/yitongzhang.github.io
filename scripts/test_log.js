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

const path = require('node:path');
const css = fs.readFileSync(path.join(__dirname, '../assets/css/log.css'), 'utf8');
const template = fs.readFileSync(path.join(__dirname, '../log/index.html'), 'utf8');
assert(!css.includes('text-decoration: underline'));
assert(css.includes('gap: .2em;'));
assert(css.includes('.food-tip + .food-tip { margin: 0; }'));
assert(css.includes(':focus-visible'));
assert(template.includes('class="training-tip food-tip"'));
assert(template.includes('actual_names | escape'));
console.log('PASS: food uses shared accessible tooltip, canonical names/counts, uniform emoji spacing, no underline, visible keyboard focus');

assert(template.includes('{% for occurrence in (1..count) %}'));
assert(!template.includes('food-count'));
assert(!template.includes('×'));
console.log('PASS: repeated foods use emoji repetitions, not numeric multipliers');

const display = fs.readFileSync(path.join(__dirname, '../_data/diary_display.yml'), 'utf8');
assert(/hyrox_race:.*Hyrox Race/.test(display));
assert(/hyrox_sim:.*Hyrox Sim/.test(display));
console.log('PASS: Hyrox Race and Hyrox Sim remain distinct categories');

const { summarize, describe } = require('../assets/js/log-chart.js');
const months = summarize({
  workouts: [
    { date: '2026-06-02', status: 'completed', duration_minutes: 45 },
    { date: '2026-06-09', status: 'completed', duration_minutes: 60 },
    { date: '2026-06-10', status: 'planned', duration_minutes: 60 },
    { date: '2026-10-03', status: 'completed', duration_minutes: 90 }
  ],
  meals: ['2026-10-25', '2026-10-26']
}, '2026-10-26');
assert.equal(months[5].hours, 1.75); // Only completed sessions count, by duration.
assert.equal(months[5].share, 0); assert.equal(months[5].tracked, false); // Months before meal logging read 0%.
assert.equal(months[9].logged, 2); assert.equal(months[9].sofar, 26); // Current month counts days so far.
assert.equal(months[10].future, true);
assert.equal(describe(months[9]), 'October — 1.5h trained across 1 session · meals logged 2 of 26 days');
assert(template.includes("date: '%b %-d'"));
console.log('PASS: monthly chart counts training by duration, meals as share of days so far, and dates are short');
