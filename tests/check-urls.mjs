// Requests every URL the old site served (tests/fixtures/legacy-urls.json) and
// checks the new site answers the same way: same status, same redirect target,
// byte-identical files. Usage: node tests/check-urls.mjs [base-url]
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

const base = (process.argv[2] ?? 'http://localhost:4173').replace(/\/$/, '')
const { urls } = JSON.parse(readFileSync(new URL('./fixtures/legacy-urls.json', import.meta.url), 'utf8'))

async function check(entry) {
  const res = await fetch(base + encodeURI(entry.path), { redirect: 'manual' })
  const problems = []
  if (res.status !== entry.status) problems.push(`status ${res.status}, expected ${entry.status}`)
  if (entry.location) {
    const location = res.headers.get('location') ?? ''
    if (new URL(location, base).pathname !== entry.location) problems.push(`redirects to ${location}, expected ${entry.location}`)
  }
  if (entry.sha256 && res.status === 200) {
    const hash = createHash('sha256').update(Buffer.from(await res.arrayBuffer())).digest('hex')
    if (hash !== entry.sha256) problems.push('content differs from the original file')
  } else {
    await res.body?.cancel()
  }
  return problems.length ? `${entry.path}: ${problems.join('; ')}` : null
}

const failures = []
for (let i = 0; i < urls.length; i += 16) {
  for (const result of await Promise.all(urls.slice(i, i + 16).map(check))) if (result) failures.push(result)
}
for (const f of failures) console.log(`FAIL ${f}`)
console.log(failures.length ? `\n${failures.length} of ${urls.length} URLs failed` : `All ${urls.length} legacy URLs answer as before`)
process.exit(failures.length ? 1 : 0)
