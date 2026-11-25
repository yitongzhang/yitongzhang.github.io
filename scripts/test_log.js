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
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname, '../public/assets/js/log.js'), 'utf8'), { document, window, setTimeout, clearTimeout });
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
const css = fs.readFileSync(path.join(__dirname, '../public/assets/css/log.css'), 'utf8');
// The /log/ table is rendered by src/lib/diary-view.mjs (an ES module), loaded below.
// Assertions run against its real HTML output for small fixture diaries.
const { renderDiaryTable, shortDate } = require('../src/lib/diary-view.mjs');
const day = (date) => ({ date, timezone: 'America/Los_Angeles', food_log_status: 'incomplete' });
const food = (id, date, title) => ({ id, date, title, nutrition: { calories_kcal: 100, protein_g: 10 } });
const foodHtml = renderDiaryTable(
  { days: [day('2026-10-26')], meals: [food('a', '2026-10-26', 'Fish & <chips>'), food('b', '2026-10-26', 'Protein shake'), food('c', '2026-10-26', 'Evening protein shake')], workouts: [] },
  { labels: { 'Protein shake': 'protein shake', 'Evening protein shake': 'protein shake' }, emojis: { 'protein shake': ['🥤'], 'Fish & <chips>': ['🐟'] } });
assert(!css.includes('text-decoration: underline'));
assert(css.includes('gap: .2em;'));
assert(css.includes('.food-tip + .food-tip { margin: 0; }'));
assert(css.includes(':focus-visible'));
assert(foodHtml.includes('class="training-tip food-tip"'));
assert(foodHtml.includes('aria-label="Fish &amp; &lt;chips&gt;"') && !foodHtml.includes('<chips>')); // Canonical names, escaped.
assert(foodHtml.includes('aria-label="2 entries: Protein shake, Evening protein shake"'));
console.log('PASS: food uses shared accessible tooltip, canonical names/counts, uniform emoji spacing, no underline, visible keyboard focus');

assert.equal(foodHtml.split('<span aria-hidden="true">🥤</span>').length - 1, 2); // One emoji per entry.
assert(!foodHtml.includes('food-count'));
assert(!foodHtml.includes('×'));
console.log('PASS: repeated foods use emoji repetitions, not numeric multipliers');

const display = fs.readFileSync(path.join(__dirname, '../_data/diary_display.yml'), 'utf8');
// Read the deliberately small, one-line mapping format used by labels/emojis.
// This is a coverage check, not a general YAML parser; unexpected syntax fails closed.
const unquote = value => value.startsWith('"') ? JSON.parse(value) :
  value.startsWith("'") ? value.slice(1, -1).replace(/''/g, "'") : value;
function inlineMap(section, parseValue = unquote) {
  const result = new Map(); let active = false;
  for (const line of display.split('\n')) {
    if (/^\S/.test(line) && !line.startsWith('#')) active = line === `${section}:`;
    if (!active || !line.trim() || line.trimStart().startsWith('#') || line === `${section}:`) continue;
    const separator = line.lastIndexOf(': ');
    assert(line.startsWith('  ') && separator > 2, `Expected one-line ${section} entry: ${line}`);
    const key = unquote(line.slice(2, separator));
    assert(!result.has(key), `Duplicate ${section} key: ${key}`);
    result.set(key, parseValue(line.slice(separator + 2)));
  }
  return result;
}
const foodLabels = inlineMap('labels');
const foodEmojis = inlineMap('emojis', JSON.parse);
const diary = JSON.parse(fs.readFileSync(path.join(__dirname, '../_data/diary.json'), 'utf8'));
for (const meal of diary.meals) {
  const label = foodLabels.get(meal.title) || meal.title;
  const icons = foodEmojis.get(label);
  assert(icons, `Missing food emoji mapping for ${JSON.stringify(label)}; choose from the actual meal, not an automatic plate`);
  assert(Array.isArray(icons) && icons.length > 0 && icons.every(icon => typeof icon === 'string' && icon.trim()),
    `Expected a nonempty emoji array for ${JSON.stringify(label)}`);
}
console.log(`PASS: all ${diary.meals.length} canonical meals have deliberate, nonempty emoji mappings`);

assert(/hyrox_race:.*Hyrox Race/.test(display));
assert(/hyrox_sim:.*Hyrox Sim/.test(display));
console.log('PASS: Hyrox Race and Hyrox Sim remain distinct categories');

// log-chart.js is a browser script that also exports for tests when `module` exists.
const chartModule = { exports: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../public/assets/js/log-chart.js'), 'utf8'), { module: chartModule, exports: chartModule.exports, console });
// Results come from another VM context; copy them into this one so deepEqual compares values only.
const plain = (fn) => (...args) => JSON.parse(JSON.stringify(fn(...args)));
const summarize = plain(chartModule.exports.summarize), explain = plain(chartModule.exports.explain);
const { trainingValue } = chartModule.exports;
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
assert.equal(shortDate('2026-10-26'), 'Oct 26th'); assert.equal(shortDate('2026-11-01'), 'Nov 1st'); assert.equal(shortDate('2026-11-22'), 'Nov 22nd');
console.log('PASS: monthly chart counts training by duration, meals as share of days so far, each square explains itself, and dates are short');

const durationMonths = summarize({
  workouts: [
    { id: 'known', date: '2026-10-02', status: 'completed', duration_minutes: 60, details: [] },
    { id: 'unknown', date: '2026-10-31', status: 'completed', duration_minutes: null, details: [] },
    { id: 'planned', date: '2026-10-31', status: 'planned', duration_minutes: null, details: [] },
    { id: 'only-unknown', date: '2026-09-02', status: 'completed', duration_minutes: null, details: [] },
    { id: 'also-unknown', date: '2026-09-03', status: 'completed', duration_minutes: null, details: [] },
    { id: 'actual-zero', date: '2026-08-02', status: 'completed', duration_minutes: 0, details: [] }
  ],
  meals: [], types: { unknown: { type: 'hyrox_sim' } }, labels: { gym: { label: 'Gym' }, hyrox_sim: { label: 'Hyrox Sim' } }
}, '2026-11-01');
assert.equal(durationMonths[9].sessions.length, 2); // Unknown completion counts; planned does not.
assert.equal(durationMonths[9].sessions[1].minutes, null);
assert.equal(durationMonths[9].hours, 1); // Known time only, with no invented default.
assert.equal(durationMonths[9].unknownDurations, 1);
assert.equal(trainingValue(durationMonths[9]), '1.0+');
assert.deepEqual(explain(durationMonths[9], 'training'), {
  head: 'October · 1.0 known hours · 1 session with unknown duration',
  lines: ['Oct 2 — Gym · 1h', 'Oct 31 — Hyrox Sim · Duration unknown']
});
assert.equal(durationMonths[8].unknownDurations, 2);
assert.equal(trainingValue(durationMonths[8]), '?');
assert.equal(explain(durationMonths[8], 'training').head, 'September · Duration unknown · 2 sessions with unknown duration');
assert(!explain(durationMonths[8], 'training').lines.some(line => line.includes('0 min')));
assert.equal(durationMonths[7].unknownDurations, 0); // An explicit zero is distinct from null.
assert.equal(trainingValue(durationMonths[7]), '0');
assert.equal(explain(durationMonths[7], 'training').lines[0], 'Aug 2 — Gym · 0 min');
assert.equal(trainingValue(durationMonths[10]), '0');
assert.deepEqual(explain(durationMonths[10], 'training'), { head: 'November · 0 hours', lines: ['No training logged.'] });
const workout = (id, status, duration_minutes) => ({ id, date: '2026-10-31', status, duration_minutes, description: id, details: [] });
const tipHtml = renderDiaryTable({ days: [day('2026-10-31')], meals: [], workouts: [workout('unknown', 'completed', null), workout('planned', 'planned', null), workout('zero', 'completed', 0)] }, { training: {}, training_types: { gym: { label: 'Gym' } } });
const tip = (id) => tipHtml.match(new RegExp(`id="tip-${id}" hidden>(.*?)</span>(?:<span class="training-tip"|</td>)`))[1];
assert(tip('unknown').includes('<span class="tip-duration">Duration unknown</span>'));
assert(!tip('planned').includes('tip-duration')); // Planned sessions claim nothing.
assert(tip('zero').includes('<span class="tip-duration">0 minutes total</span>'));
console.log('PASS: unknown completed durations remain unknown in daily/monthly tooltips, partial totals are marked, and known zero/planned/no-session states stay distinct');

