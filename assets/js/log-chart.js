// Monthly summary above the log: hours trained, and the share of days with meals logged.
(function () {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const RAMP = ['#e9ebed', '#cfd3d7', '#a9aeb4', '#7c8288', '#4d535a'];
  const INK = '#000', TER = '#abb0b6', EMPTY = '#F0F0F0', WASH = '#FAFAFA';

  // Dates are local YYYY-MM-DD strings, so plain string comparison orders them.
  function summarize(data, today) {
    const year = Number(today.slice(0, 4)), month = Number(today.slice(5, 7)) - 1, day = Number(today.slice(8, 10));
    const mealDates = new Set(data.meals);
    const firstMeal = [...mealDates].sort()[0];
    return MONTHS.map((_, m) => {
      const prefix = year + '-' + String(m + 1).padStart(2, '0');
      const length = new Date(year, m + 1, 0).getDate();
      const future = m > month;
      const sofar = future ? 0 : m === month ? day : length;
      const sessions = data.workouts.filter(w => w.status === 'completed' && w.date.startsWith(prefix));
      const minutes = sessions.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
      const logged = [...mealDates].filter(d => d.startsWith(prefix) && d <= today).length;
      const tracked = Boolean(firstMeal) && firstMeal.slice(0, 7) <= prefix;
      return { m, current: m === month, future, sessions: sessions.length, hours: minutes / 60, logged, sofar, share: tracked && sofar ? logged / sofar : 0, tracked };
    });
  }

  const hours = (h, narrow) => (h ? (h < 10 ? (Math.round(h * 10) / 10).toFixed(1) : String(Math.round(h))) : '0') + (narrow ? '' : 'h');
  const percent = (v, narrow) => Math.round(v * 100) + (narrow ? '' : '%');
  function describe(o) {
    if (o.future) return LONG[o.m] + ' — still to come';
    const trained = o.sessions ? hours(o.hours) + ' trained across ' + o.sessions + ' session' + (o.sessions > 1 ? 's' : '') : 'no training';
    return LONG[o.m] + ' — ' + trained + ' · ' + (o.tracked ? 'meals logged ' + o.logged + ' of ' + o.sofar + ' days' : 'meals not tracked yet');
  }

  function render(host, months, year) {
    const NS = 'http://www.w3.org/2000/svg';
    const el = (tag, attrs, parent) => {
      const node = document.createElementNS(NS, tag);
      for (const k in attrs) k === 'text' ? (node.textContent = attrs[k]) : node.setAttribute(k, attrs[k]);
      parent.appendChild(node);
      return node;
    };
    host.textContent = '';
    const w = host.clientWidth, padL = w < 520 ? 78 : 96, cw = (w - padL) / 12, g = 3, ch = 40, top = 24, H = top + 2 * ch + g;
    const narrow = cw < 44, labelled = cw - g >= 34;
    const maxHours = Math.max(1, ...months.map(o => o.hours));
    const rows = [
      { name: 'Training', sub: 'hours', value: o => o.hours, level: o => Math.min(4, Math.ceil(o.hours / maxHours * 4)), text: o => hours(o.hours, narrow) },
      { name: 'Meals', sub: '% of days', value: o => o.share, level: o => Math.min(4, Math.ceil(o.share * 4)), text: o => percent(o.share, narrow) }
    ];
    const svg = el('svg', { viewBox: `0 0 ${w} ${H}`, width: w, height: H, role: 'img', 'aria-label': `Hours trained and share of days with meals logged, per month of ${year}` }, host);
    el('text', { x: 8, y: top - 9, text: year }, svg);
    rows.forEach((r, ri) => {
      const y = top + ri * (ch + g);
      el('rect', { x: 0, y, width: padL - g * 1.5, height: ch, rx: 3, fill: WASH }, svg);
      el('text', { x: 8, y: y + ch / 2 - 2, class: 'dark', text: r.name }, svg);
      el('text', { x: 8, y: y + ch / 2 + 12, text: r.sub }, svg);
      months.forEach(o => {
        const x = padL + o.m * cw + g / 2, cell = cw - g, v = r.value(o);
        if (o.future || !v) {
          el('rect', { x, y, width: cell, height: ch, rx: 3, fill: EMPTY }, svg);
          if (!o.future && labelled) el('text', { x: x + cell / 2, y: y + ch / 2 + 4, 'text-anchor': 'middle', text: r.text(o) }, svg);
          return;
        }
        const level = r.level(o);
        el('rect', { x, y, width: cell, height: ch, rx: 3, fill: RAMP[level] }, svg);
        if (labelled) el('text', { x: x + cell / 2, y: y + ch / 2 + 4, 'text-anchor': 'middle', style: `fill:${level >= 3 ? '#fff' : INK}`, text: r.text(o) }, svg);
      });
    });
    months.forEach(o => {
      el('text', { x: padL + o.m * cw + cw / 2, y: top - 9, 'text-anchor': 'middle', class: o.current ? 'dark' : '', text: cw < 34 ? MONTHS[o.m][0] : MONTHS[o.m] }, svg);
      const hit = el('rect', { x: padL + o.m * cw, y: 0, width: cw, height: H, fill: 'transparent' }, svg);
      el('title', { text: describe(o) }, hit);
    });
  }

  if (typeof module !== 'undefined') { module.exports = { summarize, describe }; return; }

  const host = document.getElementById('log-chart'), source = document.getElementById('log-chart-data');
  if (!host || !source) return;
  const data = JSON.parse(source.textContent);
  const now = new Date();
  const today = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  const months = summarize(data, today);
  let width = 0;
  const draw = () => { if (host.clientWidth !== width) { width = host.clientWidth; render(host, months, now.getFullYear()); } };
  draw();
  window.addEventListener('resize', draw);
})();
