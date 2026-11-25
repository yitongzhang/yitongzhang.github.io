// Checks the Atom feed against a snapshot of the feed GitHub Pages served.
// Readers dedupe on <id>, and some re-surface entries whose dates change, so
// every entry still in the feed must keep its id, link and timestamps exactly.
// Usage: node tests/check-feed.mjs [feed-url-or-file]
import { readFileSync } from 'node:fs'

const source = process.argv[2] ?? 'dist/client/feed.xml'
const xml = source.startsWith('http') ? await (await fetch(source)).text() : readFileSync(source, 'utf8')
const snapshot = JSON.parse(readFileSync(new URL('./fixtures/feed-snapshot.json', import.meta.url), 'utf8'))

const pick = (s, re) => s.match(re)?.[1]
const entries = [...xml.matchAll(/<entry>(.*?)<\/entry>/gs)].map(([, e]) => ({
  id: pick(e, /<id>([^<]*)<\/id>/),
  link: pick(e, /<link href="([^"]*)"/),
  title: pick(e, /<title type="html">([^<]*)<\/title>/),
  published: pick(e, /<published>([^<]*)</),
  updated: pick(e, /<updated>([^<]*)</),
}))

const failures = []
if (pick(xml, /<id>([^<]*)<\/id>/) !== snapshot.id) failures.push(`feed id changed`)
if (pick(xml, /<link href="([^"]*)" rel="self"/) !== snapshot.self) failures.push(`self link changed`)
if (!/<feed xmlns="http:\/\/www\.w3\.org\/2005\/Atom"/.test(xml)) failures.push('not an Atom feed')
const byId = new Map(entries.map((e) => [e.id, e]))
const oldest = entries.at(-1)?.published ?? ''
for (const old of snapshot.entries) {
  const now = byId.get(old.id)
  if (!now) {
    // Fine only if newer posts pushed it out of the 10-entry window.
    if (old.published >= oldest) failures.push(`${old.id} is missing`)
    continue
  }
  for (const field of ['link', 'title', 'published', 'updated']) {
    if (now[field] !== old[field]) failures.push(`${old.id}: ${field} is "${now[field]}", was "${old[field]}"`)
  }
}
for (const f of failures) console.log(`FAIL ${f}`)
console.log(failures.length ? `\n${failures.length} feed problem(s)` : `Feed matches: ${entries.length} entries, ids and dates unchanged`)
process.exit(failures.length ? 1 : 0)
