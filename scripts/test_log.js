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

const { summarize, explain } = require('../assets/js/log-chart.js');
const meal = (date, kcal, protein) => ({ date, nutrition: { calories_kcal: kcal, protein_g: protein } });
const months = summarize({
  workouts: [
    { id: 'a', date: '2026-06-02', status: 'completed', duration_minutes: 45, details: [] },
    { id: 'r', date: '2026-06-09', status: 'completed', duration_minutes: 60, details: [{ exercise: 'Run', distance_meters: 10000 }] },
    { id: 'p', date: '2026-06-10', status: 'planned', duration_minutes: 60, details: [] },
    { id: 'h', date: '2026-10-03', status: 'completed', duration_minutes: 105, details: [] }
  ],
  meals: [meal('2026-10-25', 1000, 80), meal('2026-10-25', 760, 69), meal('2026-10-26', 1930, 133)],
  types: { r: { type: 'run' }, h: { type: 'hyrox_race' } },
  labels: { gym: { label: 'Gym' }, run: { label: 'Run', exercise: 'Run' }, hyrox_race: { label: 'Hyrox Race' } }
}, '2026-10-26');
assert.equal(months[5].hours, 1.75); // Only completed sessions count, by duration.
assert.equal(months[5].share, 0); assert.equal(months[5].tracked, false); // Months before meal logging read 0%.
assert.equal(months[9].logged, 2); assert.equal(months[9].sofar, 26); // Current month counts days so far.
assert.equal(months[10].future, true);
assert.deepEqual(explain(months[5], 'training'), { head: 'June · 1.8 hours', lines: ['Jun 2 — Gym · 45 min', 'Jun 9 — Run 10 km · 1h'] });
assert.deepEqual(explain(months[9], 'training').lines, ['Oct 3 — Hyrox Race · 1h 45m']);
assert.deepEqual(explain(months[9], 'meals'), { head: 'October · 8%, 2 of 26 days', lines: ['Oct 25 — 1,760 kcal / 149 g', 'Oct 26 — 1,930 kcal / 133 g'] });
assert.deepEqual(explain(months[5], 'meals').lines, ['No meals logged. Meal logging started Oct 25.']);
assert(template.includes("date: '%b %-d'"));
console.log('PASS: monthly chart counts training by duration, meals as share of days so far, each square explains itself, and dates are short');
