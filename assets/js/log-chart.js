// Monthly summary above the log: hours trained, and the share of days with meals logged.
(function () {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const RAMP = ['#e9ebed', '#cfd3d7', '#a9aeb4', '#7c8288', '#4d535a'];
  const INK = '#000', EMPTY = '#F0F0F0', WASH = '#FAFAFA';

  const shortDate = d => MONTHS[Number(d.slice(5, 7)) - 1] + ' ' + Number(d.slice(8, 10));
  const length = min => { const m = Math.round(min); return m < 60 ? m + ' min' : Math.floor(m / 60) + 'h' + (m % 60 ? ' ' + (m % 60) + 'm' : ''); };

  // Dates are local YYYY-MM-DD strings, so plain string comparison orders them.
  function summarize(data, today) {
    const year = Number(today.slice(0, 4)), month = Number(today.slice(5, 7)) - 1, day = Number(today.slice(8, 10));
    const types = data.types || {}, labels = data.labels || {};
    const byDay = {};
    for (const meal of data.meals) {
      const d = byDay[meal.date] ||= { date: meal.date, kcal: 0, protein: 0 };
      d.kcal += meal.nutrition.calories_kcal; d.protein += meal.nutrition.protein_g;
    }
    const firstMeal = Object.keys(byDay).sort()[0];
    return MONTHS.map((_, m) => {
      const prefix = year + '-' + String(m + 1).padStart(2, '0');
      const future = m > month;
      const sofar = future ? 0 : m === month ? day : new Date(year, m + 1, 0).getDate();
      const sessions = data.workouts
        .filter(w => w.status === 'completed' && w.date.startsWith(prefix))
        .sort((a, b) => a.date < b.date ? -1 : 1)
        .map(w => {
          const type = labels[(types[w.id] || {}).type || 'gym'] || {};
          const meters = type.exercise ? w.details.filter(x => x.exercise === type.exercise).reduce((sum, x) => sum + (x.distance_meters || 0), 0) : 0;
          return { date: w.date, label: type.label || 'Gym', km: meters / 1000, minutes: w.duration_minutes || 0 };
        });
      const minutes = sessions.reduce((sum, s) => sum + s.minutes, 0);
      const mealDays = Object.values(byDay).filter(d => d.date.startsWith(prefix) && d.date <= today).sort((a, b) => a.date < b.date ? -1 : 1);
      const tracked = Boolean(firstMeal) && firstMeal.slice(0, 7) <= prefix;
      return { m, current: m === month, future, sessions, hours: minutes / 60, mealDays, logged: mealDays.length, sofar, share: tracked && sofar ? mealDays.length / sofar : 0, tracked, firstMeal };
    });
  }

  const hours = h => h ? (h < 10 ? (Math.round(h * 10) / 10).toFixed(1) : String(Math.round(h))) : '0';
  const percent = (v, bare) => Math.round(v * 100) + (bare ? '' : '%');

  // What went into one square: a heading, then one line per session or logged day.
  function explain(o, row) {
    if (row === 'training') {
      const head = LONG[o.m] + ' · ' + hours(o.hours) + ' hours';
      if (!o.sessions.length) return { head, lines: ['No training logged.'] };
      return { head, lines: o.sessions.map(s => shortDate(s.date) + ' — ' + s.label + (s.km ? ' ' + (Math.round(s.km * 10) / 10) + ' km' : '') + ' · ' + length(s.minutes)) };
    }
    if (!o.tracked) return { head: LONG[o.m] + ' · 0%', lines: ['No meals logged. Meal logging started ' + shortDate(o.firstMeal) + '.'] };
    const head = LONG[o.m] + ' · ' + percent(o.share) + ', ' + o.logged + ' of ' + o.sofar + ' days';
    if (!o.logged) return { head, lines: ['No meals logged.'] };
    return { head, lines: o.mealDays.map(d => shortDate(d.date) + ' — ' + Math.round(d.kcal).toLocaleString('en-US') + ' kcal / ' + Math.round(d.protein) + ' g') };
  }

  function tooltip() {
    const panel = document.createElement('div');
    panel.className = 'training-tooltip log-chart-tip';
    panel.setAttribute('role', 'tooltip');
    panel.hidden = true;
    document.body.appendChild(panel);
    let pinned = null;
    const hide = () => { panel.hidden = true; pinned = null; };
    const show = (target, info) => {
      panel.textContent = '';
      const head = document.createElement('strong'); head.textContent = info.head; panel.appendChild(head);
      for (const line of info.lines) { const row = document.createElement('span'); row.textContent = line; panel.appendChild(row); }
      panel.hidden = false;
      const rect = target.getBoundingClientRect(), width = panel.getBoundingClientRect().width;
      panel.style.left = `${Math.max(24, Math.min(rect.left, window.innerWidth - width - 24))}px`;
      const height = panel.getBoundingClientRect().height;
      panel.style.top = `${Math.max(8, Math.min(rect.bottom + 8, window.innerHeight - height - 8))}px`;
    };
    const bind = (target, info) => {
      target.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && !pinned) show(target, info); });
      target.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && !pinned) hide(); });
      target.addEventListener('focus', () => show(target, info));
      target.addEventListener('blur', () => { if (pinned !== target) hide(); });
      target.addEventListener('click', () => { if (pinned === target) hide(); else { show(target, info); pinned = target; } });
    };
    window.addEventListener('resize', hide);
    document.addEventListener('scroll', hide, true);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
    document.addEventListener('pointerdown', e => { if (!e.target.closest('.log-chart')) hide(); });
    return bind;
  }

  function render(host, months, year, bind) {
    const NS = 'http://www.w3.org/2000/svg';
    const el = (tag, attrs, parent) => {
      const node = document.createElementNS(NS, tag);
      for (const k in attrs) k === 'text' ? (node.textContent = attrs[k]) : node.setAttribute(k, attrs[k]);
      parent.appendChild(node);
      return node;
    };
    host.textContent = '';
    // Every square, the label squares included, sits g apart.
    const w = host.clientWidth, g = 3, padL = w < 520 ? 78 : 96, cw = (w - padL + g) / 12, ch = 40, top = 24, H = top + 2 * ch + g;
    const cell = cw - g, labelled = cell >= 34;
    const maxHours = Math.max(1, ...months.map(o => o.hours));
    const rows = [
      { key: 'training', name: 'Training', value: o => o.hours, level: o => Math.min(4, Math.ceil(o.hours / maxHours * 4)), text: o => hours(o.hours) },
      { key: 'meals', name: 'Meals', value: o => o.share, level: o => Math.min(4, Math.ceil(o.share * 4)), text: (o, bare) => percent(o.share, bare) }
    ];
    const svg = el('svg', { viewBox: `0 0 ${w} ${H}`, width: w, height: H, role: 'img', 'aria-label': `Hours trained and share of days with meals logged, per month of ${year}` }, host);
    el('text', { x: 8, y: top - 9, text: year }, svg);
    months.forEach(o => el('text', { x: padL + o.m * cw + cell / 2, y: top - 9, 'text-anchor': 'middle', class: o.current ? 'dark' : '', text: cw < 34 ? MONTHS[o.m][0] : MONTHS[o.m] }, svg));
    rows.forEach((r, ri) => {
      const y = top + ri * (ch + g), values = [];
      el('rect', { x: 0, y, width: padL - g, height: ch, rx: 3, fill: WASH }, svg);
      el('text', { x: 8, y: y + ch / 2 + 5, class: 'name', text: r.name }, svg);
      months.forEach(o => {
        const x = padL + o.m * cw, v = r.value(o), level = v ? r.level(o) : 0;
        const square = el('rect', { x, y, width: cell, height: ch, rx: 3, fill: o.future || !v ? EMPTY : RAMP[level] }, svg);
        if (o.future) return;
        if (labelled) values.push({ o, node: el('text', { x: x + cell / 2, y: y + ch / 2 + 5, 'text-anchor': 'middle', class: 'value', ...(v ? { style: `fill:${level >= 3 ? '#fff' : INK}` } : {}), text: r.text(o) }, svg) });
        const info = explain(o, r.key);
        square.setAttribute('tabindex', '0');
        square.setAttribute('aria-label', info.head);
        bind(square, info);
      });
      // Drop the % for the whole row if any value would crowd its square.
      if (values.some(v => v.node.getComputedTextLength() > cell - 10)) values.forEach(v => { v.node.textContent = r.text(v.o, true); });
    });
  }

  if (typeof module !== 'undefined') { module.exports = { summarize, explain }; return; }

  const host = document.getElementById('log-chart'), source = document.getElementById('log-chart-data');
  if (!host || !source) return;
  const data = JSON.parse(source.textContent);
  const now = new Date();
  const today = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  const months = summarize(data, today), bind = tooltip();
  let width = 0;
  const draw = () => { if (host.clientWidth !== width) { width = host.clientWidth; render(host, months, now.getFullYear(), bind); } };
  draw();
  window.addEventListener('resize', draw);
})();
