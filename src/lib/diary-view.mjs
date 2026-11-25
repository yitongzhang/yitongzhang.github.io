// Renders the /log/ diary table. A line-for-line port of the old Liquid
// template, kept as dependency-free JS so `node scripts/test_log.js` can test
// the real output without a build. Rules live in DIARY.md.

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
/** Liquid `escape`. */
export const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c])

/** How Ruby prints a number: floats keep a decimal ("10.0"), integers don't. */
const rubyNumber = (n, isFloat) => (isFloat && Number.isInteger(n) ? n.toFixed(1) : String(n))

/** Liquid `round: 2` on a float. */
const round2 = (n) => Math.sign(n) * Math.round(Math.abs(n) * 100) / 100

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "2026-10-26" -> "Oct 26th". Short date with an ordinal suffix. */
export function shortDate(ymd) {
  const day = Number(ymd.slice(8, 10))
  const suffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th'
  return `${MONTHS[Number(ymd.slice(5, 7)) - 1]} ${day}${suffix}`
}

const uniq = (items) => [...new Set(items)]
const EMPTY = '<span class="empty" aria-hidden="true">·</span>'

function foodCell(day, meals, display) {
  const labelOf = (meal) => display.labels?.[meal.title] || meal.title
  const labels = meals.map(labelOf)
  const tips = uniq(labels).map((label, i) => {
    const count = labels.filter((l) => l === label).length
    const names = escape(uniq(meals.filter((m) => labelOf(m) === label).map((m) => m.title)).join(', '))
    const prefix = count > 1 ? `${count} entries: ` : ''
    const icons = display.emojis?.[label] || ['🍽️']
    // One emoji group per entry: repeated foods repeat the emoji, never a "×2" count.
    const emoji = Array.from({ length: count }, () => icons.map((icon) => `<span aria-hidden="true">${icon}</span>`).join('')).join('')
    const tipId = `food-tip-${day.date}-${i + 1}`
    return `<span class="training-tip food-tip"><button type="button" class="training-trigger food-emoji" aria-label="${prefix}${names}" aria-expanded="false" aria-describedby="${tipId}">${emoji}</button><span role="tooltip" class="training-tooltip" id="${tipId}" hidden>${prefix}${names}</span></span>`
  })
  return `<td class="food-cell"><span class="food-list">${tips.join('')}${meals.length === 0 ? EMPTY : ''}</span></td>`
}

function trainingCell(workouts, display) {
  const tips = workouts.map((workout) => {
    const typeKey = display.training?.[workout.id]?.type || 'gym'
    const type = display.training_types?.[typeKey] || {}
    let distance = 0
    if (type.exercise) {
      for (const detail of workout.details || []) {
        if (String(detail.exercise).toLowerCase() === String(type.exercise).toLowerCase()) distance += detail.distance_meters || 0
      }
    }
    const km = distance > 0 ? ` · ${rubyNumber(round2(distance / 1000), true)} km` : ''
    const status = workout.status !== 'completed' ? ` (${escape(workout.status)})` : ''
    const minutes = workout.duration_minutes
    // Unknown (null) stays unknown; an explicit 0 is a real value.
    const duration =
      minutes !== null && minutes !== undefined && typeKey !== 'hyrox_race'
        ? `<span class="tip-duration">${rubyNumber(minutes, !Number.isInteger(minutes))} minutes total</span>`
        : (minutes === null || minutes === undefined) && workout.status === 'completed'
          ? '<span class="tip-duration">Duration unknown</span>'
          : ''
    return `<span class="training-tip"><button type="button" class="training-trigger" aria-expanded="false" aria-describedby="tip-${escape(workout.id)}">${escape(type.label || 'Gym')}${km}${status}</button><span role="tooltip" class="training-tooltip" id="tip-${escape(workout.id)}" hidden>${escape(workout.description)}${duration}</span></span>`
  })
  return `<td>${tips.join('')}${workouts.length === 0 ? EMPTY : ''}</td>`
}

/** The diary table, newest day first. */
export function renderDiaryTable(diary, display) {
  const days = [...diary.days].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  const rows = days.map((day) => {
    const meals = diary.meals.filter((m) => m.date === day.date)
    const workouts = diary.workouts.filter((w) => w.date === day.date)
    const calories = meals.reduce((sum, m) => sum + (m.nutrition?.calories_kcal || 0), 0)
    const protein = meals.reduce((sum, m) => sum + (m.nutrition?.protein_g || 0), 0)
    const date = escape(day.date)
    const nutrition = meals.length > 0 ? `<span class="total">${Math.round(calories)} / ${Math.round(protein)} g</span>` : EMPTY
    return `<tr id="day-${date}"><th scope="row"><a href="#day-${date}"><time datetime="${date}">${shortDate(day.date)}</time></a></th>${foodCell(day, meals, display)}${trainingCell(workouts, display)}<td class="nutrition">${nutrition}</td></tr>`
  })
  return `<table class="diary-table"><thead><tr><th scope="col">Date</th><th scope="col">Food</th><th scope="col">Training</th><th scope="col" class="nutrition">kcal / protein</th></tr></thead><tbody>${rows.join('')}</tbody></table>${days.length === 0 ? '<p class="diary-caption">No entries yet.</p>' : ''}`
}

/** Data island read by /assets/js/log-chart.js. `<` is escaped so the JSON can't close its script tag. */
export function chartData(diary, display) {
  return JSON.stringify({ workouts: diary.workouts, meals: diary.meals, types: display.training, labels: display.training_types }).replace(/</g, '\\u003c')
}
