#!/usr/bin/env node
// Mailing list admin. Talks to the Worker's /admin/mail endpoints (src/mail/mail.ts)
// and to D1 through wrangler.
//
//   node scripts/mail.mjs stats
//   node scripts/mail.mjs test /2024/02/01/arc-alignment.html you@example.com
//   node scripts/mail.mjs send /2024/02/01/arc-alignment.html          (asks before sending)
//   node scripts/mail.mjs import ~/Downloads/mailchimp-export/*.csv     (add --dry-run to preview)
//
// Env: ADMIN_TOKEN (same value as the Worker secret), MAIL_BASE (default https://www.zhayitong.com).
// The post is fetched from MAIL_BASE, so what gets emailed is exactly what's published.
import { execFileSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs'
import { basename, join } from 'node:path'
import { tmpdir } from 'node:os'
import { createInterface } from 'node:readline/promises'
import { parse } from 'node-html-parser'

const BASE = (process.env.MAIL_BASE || 'https://www.zhayitong.com').replace(/\/$/, '')
const [command, ...args] = process.argv.slice(2)

async function api(method, path, body) {
  if (!process.env.ADMIN_TOKEN) throw new Error('Set ADMIN_TOKEN (the Worker secret) first.')
  const res = await fetch(`${BASE}/admin/mail${path}`, {
    method,
    headers: { authorization: `Bearer ${process.env.ADMIN_TOKEN}`, 'content-type': 'application/json' },
    body: body && JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
  if (!res.ok && !('ok' in data)) throw new Error(`${method} ${path}: ${JSON.stringify(data)}`)
  return data
}

/** Fetches a published post and turns it into email-safe HTML and plain text. */
async function loadPost(path) {
  const url = new URL(path, BASE).toString()
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`)
  const doc = parse(await res.text())
  const title = doc.querySelector('.post-title-box h1')?.text.trim()
  const post = doc.querySelector('.post')
  if (!title || !post) throw new Error(`${url} doesn't look like a post`)

  post.querySelectorAll('script, style, .modalBackground').forEach((el) => el.remove())
  for (const el of post.querySelectorAll('[src], [href]')) {
    for (const attr of ['src', 'href']) {
      const value = el.getAttribute(attr)
      if (value && !value.startsWith('#') && !/^(mailto|tel):/.test(value)) el.setAttribute(attr, new URL(value, url).toString())
    }
  }
  for (const img of post.querySelectorAll('img')) {
    img.setAttribute('style', 'max-width:100%;height:auto;')
    img.removeAttribute('loading')
  }
  // Footnote back-links (#fnref) don't work in most mail clients; drop them.
  post.querySelectorAll('a[href^="#fnref"], a.footnote-backref, a[data-footnote-backref]').forEach((el) => el.remove())
  const canonical = new URL(path, 'https://www.zhayitong.com').toString()
  return { key: new URL(path, BASE).pathname, title, url: canonical, html: post.innerHTML, text: post.structuredText.replace(/\n+/g, "\n\n") }
}

async function confirm(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answer = await rl.question(`${question} [y/N] `)
  rl.close()
  return answer.trim().toLowerCase() === 'y'
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const commands = {
  async stats() {
    console.log(JSON.stringify(await api('GET', '/stats'), null, 2))
  },

  async test(path, to) {
    if (!path || !to) throw new Error('usage: test <post path> <to address>')
    const result = await api('POST', '/test', { to, ...(await loadPost(path)) })
    console.log(result.ok ? `Sent test to ${to} (${result.messageId})` : `Failed: ${result.code ?? ''} ${result.error}`)
  },

  async send(path) {
    if (!path) throw new Error('usage: send <post path>')
    const post = await loadPost(path)
    const { subscribers } = await api('GET', '/stats')
    if (!(await confirm(`Send "${post.title}" to ${subscribers.active ?? 0} active subscribers via ${BASE}?`))) return
    let state = await api('POST', '/sends', post)
    if (state.remaining === 0 && state.counts.sent) return console.log(`Already sent to ${state.counts.sent} people. Nothing to do.`)
    console.log(`Send #${state.id}: ${state.remaining} queued`)
    while (state.remaining > 0) {
      state = await api('POST', `/sends/${state.id}/batch`)
      console.log(`  sent ${state.counts.sent ?? 0}, failed ${state.counts.failed ?? 0}, remaining ${state.remaining}`)
      if (state.paused) {
        console.log(`  Cloudflare said ${state.paused}. Waiting a minute, then resuming. (Ctrl-C is safe; re-run to resume.)`)
        await sleep(60_000)
      }
    }
    console.log('Done.')
  },

  // Mailchimp: Audience -> Export audience gives a zip of subscribed_*.csv,
  // unsubscribed_*.csv and cleaned_*.csv. Pass any of them. Unsubscribed and
  // cleaned (bounced) addresses are imported too, so they're never mailed.
  async import(...files) {
    const dryRun = files.includes('--dry-run')
    files = files.filter((f) => !f.startsWith('--'))
    if (!files.length) throw new Error('usage: import <mailchimp csv files...> [--dry-run]')
    const rows = new Map()
    for (const file of files) {
      const name = basename(file).toLowerCase()
      const status = name.startsWith('unsubscribed') ? 'unsubscribed' : name.startsWith('cleaned') ? 'bounced' : name.startsWith('subscribed') ? 'active' : null
      if (!status) throw new Error(`${file}: expected a subscribed_/unsubscribed_/cleaned_ export from Mailchimp`)
      const [header, ...records] = parseCsv(readFileSync(file, 'utf8'))
      const col = header.findIndex((h) => h.trim().toLowerCase() === 'email address')
      if (col < 0) throw new Error(`${file}: no "Email Address" column`)
      for (const r of records) {
        const email = (r[col] ?? '').trim().toLowerCase()
        // An opt-out wins over a subscription if an address shows up twice.
        if (email.includes('@') && (!rows.has(email) || status !== 'active')) rows.set(email, status)
      }
    }
    const counts = {}
    for (const s of rows.values()) counts[s] = (counts[s] ?? 0) + 1
    console.log(`Importing ${rows.size} addresses:`, counts)
    if (dryRun) return

    // Existing rows are left alone, so re-running the import is safe and
    // never re-subscribes someone who unsubscribed here.
    const q = (s) => `'${s.replace(/'/g, "''")}'`
    const sql = [...rows]
      .map(([email, status]) => {
        const token = randomBytes(24).toString('base64url')
        const confirmed = status === 'active' ? "datetime('now')" : 'NULL'
        return `INSERT INTO subscribers (email, status, token, source, confirmed_at) VALUES (${q(email)}, ${q(status)}, ${q(token)}, 'mailchimp', ${confirmed}) ON CONFLICT (email) DO NOTHING;`
      })
      .join('\n')
    const file = join(mkdtempSync(join(tmpdir(), 'mail-import-')), 'import.sql')
    writeFileSync(file, sql + '\n')
    const remote = process.argv.includes('--local') ? '--local' : '--remote'
    execFileSync('npx', ['wrangler', 'd1', 'execute', 'zhayitong-mail', remote, '--file', file, '--yes'], { stdio: 'inherit' })
  },
}

/** Minimal RFC 4180 CSV parser (quoted fields, doubled quotes, newlines in quotes). */
function parseCsv(input) {
  const rows = [[]]
  let field = ''
  let quoted = false
  for (let i = 0; i < input.length; i++) {
    const c = input[i]
    if (quoted) {
      if (c === '"' && input[i + 1] === '"') (field += '"'), i++
      else if (c === '"') quoted = false
      else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') rows.at(-1).push(field), (field = '')
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && input[i + 1] === '\n') i++
      rows.at(-1).push(field), (field = ''), rows.push([])
    } else field += c
  }
  rows.at(-1).push(field)
  return rows.filter((r) => r.length > 1 || r[0] !== '')
}

if (!commands[command]) {
  console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 12).join('\n'))
  process.exit(command ? 1 : 0)
}
await commands[command](...args).catch((err) => {
  console.error(err.message)
  process.exit(1)
})
