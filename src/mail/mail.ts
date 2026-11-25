// Self-hosted mailing list on Cloudflare: subscribers in D1, email through
// Cloudflare Email Sending. No outside vendors.
//
// Public:
//   POST /subscribe                 form post with `email` -> sends a confirm link (double opt-in)
//   GET  /subscribe/confirm?t=...   activates the subscriber -> /thanks.html
//   GET  /unsubscribe?t=...         page with an "Unsubscribe" button
//   POST /unsubscribe?t=...         unsubscribes. Also the RFC 8058 one-click target
//                                   that Gmail and Apple Mail call from List-Unsubscribe.
// Admin (Authorization: Bearer $ADMIN_TOKEN), driven by scripts/mail.mjs:
//   GET  /admin/mail/stats
//   POST /admin/mail/test           send one post email to one address
//   POST /admin/mail/sends          create a send for every active subscriber (idempotent by key)
//   POST /admin/mail/sends/:id/batch  send the next batch; call until remaining is 0
import { confirmEmail, escapeHtml, postEmail, UNSUBSCRIBE_PLACEHOLDER } from './templates'

export interface MailEnv {
  ASSETS: Fetcher
  DB: D1Database
  EMAIL: SendEmail
  /** "Name <address>" on a domain onboarded to Cloudflare Email Sending. */
  MAIL_FROM: string
  MAIL_REPLY_TO?: string
  /** Origin used in links inside emails. Defaults to the origin of the request. */
  PUBLIC_ORIGIN?: string
  ADMIN_TOKEN?: string
}

type Subscriber = { id: number; email: string; status: string; token: string; confirm_sent_at: string | null }

const BATCH_SIZE = 25
const CONFIRM_RESEND_MINUTES = 10
const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]+$/

export async function handleMail(request: Request, env: MailEnv): Promise<Response | null> {
  const url = new URL(request.url)
  const { pathname } = url
  const method = request.method

  if (pathname === '/subscribe' && method === 'POST') return subscribe(request, env)
  if (pathname === '/subscribe/confirm' && method === 'GET') return confirm(url, env)
  if (pathname === '/unsubscribe' && (method === 'GET' || method === 'POST')) return unsubscribe(request, url, env)
  if (pathname.startsWith('/admin/mail/')) return admin(request, url, env)
  return null
}

// ---------------------------------------------------------------- public

async function subscribe(request: Request, env: MailEnv) {
  const form = await request.formData().catch(() => null)
  const email = String(form?.get('email') ?? '').trim().toLowerCase()
  // Honeypot: a hidden field that only bots fill in. Pretend it worked.
  if (form?.get('website')) return page(env, request, checkInboxMessage, 200)
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return page(env, request, message('That doesn’t look like an email address.', 'Go back and try again?'), 400)
  }

  const existing = await env.DB.prepare('SELECT id, email, status, token, confirm_sent_at FROM subscribers WHERE email = ?')
    .bind(email)
    .first<Subscriber>()

  // Already subscribed: say the same thing as for a new signup, so the form
  // can't be used to find out who is on the list.
  if (existing?.status === 'active') return page(env, request, checkInboxMessage, 200)

  let token: string
  if (existing?.status === 'pending') {
    if (existing.confirm_sent_at && minutesSince(existing.confirm_sent_at) < CONFIRM_RESEND_MINUTES) {
      return page(env, request, checkInboxMessage, 200)
    }
    token = existing.token
  } else if (existing) {
    // Unsubscribed or bounced before and signing up again: needs a fresh confirm.
    token = newToken()
    await env.DB.prepare("UPDATE subscribers SET status = 'pending', token = ?, unsubscribed_at = NULL WHERE id = ?")
      .bind(token, existing.id)
      .run()
  } else {
    token = newToken()
    await env.DB.prepare("INSERT INTO subscribers (email, status, token, source) VALUES (?, 'pending', ?, 'site')").bind(email, token).run()
  }

  const confirmUrl = `${origin(env, request)}/subscribe/confirm?t=${token}`
  try {
    await env.EMAIL.send({ to: email, from: env.MAIL_FROM, replyTo: env.MAIL_REPLY_TO, ...confirmEmail(confirmUrl) })
  } catch (err) {
    console.error('confirm email failed', email, errorCode(err), String(err))
    return page(env, request, message('Something went wrong sending your confirmation email.', 'Please try again in a little while.'), 502)
  }
  await env.DB.prepare("UPDATE subscribers SET confirm_sent_at = datetime('now') WHERE email = ?").bind(email).run()
  return page(env, request, checkInboxMessage, 200)
}

async function confirm(url: URL, env: MailEnv) {
  const token = url.searchParams.get('t') ?? ''
  const row = token ? await env.DB.prepare('SELECT id, status FROM subscribers WHERE token = ?').bind(token).first<{ id: number; status: string }>() : null
  if (!row || (row.status !== 'pending' && row.status !== 'active')) {
    return page(env, url, message('That confirmation link has expired.', 'Sign up again from any post and you’ll get a fresh one.'), 404)
  }
  if (row.status === 'pending') {
    await env.DB.prepare("UPDATE subscribers SET status = 'active', confirmed_at = datetime('now') WHERE id = ?").bind(row.id).run()
  }
  return Response.redirect(new URL('/thanks.html', url).toString(), 303)
}

async function unsubscribe(request: Request, url: URL, env: MailEnv) {
  const token = url.searchParams.get('t') ?? ''
  const row = token ? await env.DB.prepare('SELECT id, email, status FROM subscribers WHERE token = ?').bind(token).first<{ id: number; email: string; status: string }>() : null
  if (!row) return page(env, url, message('That unsubscribe link doesn’t work.', 'Reply to any email from me and I’ll take you off by hand.'), 404)

  if (request.method === 'GET') {
    // A button rather than unsubscribing on GET: link scanners in corporate
    // mail filters open every link, and would unsubscribe people by accident.
    if (row.status !== 'active' && row.status !== 'pending') return page(env, url, unsubscribedMessage(row.email), 200)
    return page(
      env,
      url,
      `<h2>Unsubscribe ${escapeHtml(row.email)}?</h2>
<form method="post" action="/unsubscribe?t=${escapeHtml(token)}"><input type="submit" class="button" value="Unsubscribe"></form>`,
      200,
    )
  }

  if (row.status === 'active' || row.status === 'pending') {
    await env.DB.prepare("UPDATE subscribers SET status = 'unsubscribed', unsubscribed_at = datetime('now') WHERE id = ?").bind(row.id).run()
  }
  return page(env, url, unsubscribedMessage(row.email), 200)
}

const checkInboxMessage = message('Almost there. Check your inbox.', 'I sent you a link to confirm your subscription.')
const unsubscribedMessage = (email: string) => message('You’re unsubscribed.', `${escapeHtml(email)} won’t get any more posts. Sorry to see you go!`)

function message(title: string, body: string) {
  return `<h2>${title}</h2><p>${body}</p>`
}

/** Renders a message inside the site's own chrome (the prerendered /mail.html). */
async function page(env: MailEnv, from: Request | URL, html: string, status: number) {
  const base = from instanceof URL ? from : new URL(from.url)
  const shell = await env.ASSETS.fetch(new URL('/mail.html', base))
  const headers = { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }
  if (!shell.ok) return new Response(`<!doctype html><meta charset="utf-8">${html}`, { status, headers })
  // Drop the app's scripts: the client router would hydrate, see a URL it has
  // no route for (/unsubscribe), and swap the message for its 404 page.
  const rewritten = new HTMLRewriter()
    .on('#mail-message', { element: (el) => void el.setInnerContent(html, { html: true }) })
    .on('script, link[rel="modulepreload"]', { element: (el) => void el.remove() })
    .transform(shell)
  return new Response(rewritten.body, { status, headers })
}

// ---------------------------------------------------------------- admin

async function admin(request: Request, url: URL, env: MailEnv): Promise<Response> {
  if (!(await authorized(request, env))) return json({ error: 'unauthorized' }, 401)
  const path = url.pathname.slice('/admin/mail'.length)

  if (path === '/stats' && request.method === 'GET') {
    const { results } = await env.DB.prepare('SELECT status, COUNT(*) AS count FROM subscribers GROUP BY status').all()
    const sends = await env.DB.prepare(
      `SELECT s.id, s.key, s.subject, s.created_at,
              SUM(d.status = 'sent') AS sent, SUM(d.status = 'queued') AS queued, SUM(d.status = 'failed') AS failed
       FROM sends s LEFT JOIN deliveries d ON d.send_id = s.id GROUP BY s.id ORDER BY s.id DESC LIMIT 10`,
    ).all()
    return json({ subscribers: Object.fromEntries(results.map((r) => [r.status, r.count])), sends: sends.results })
  }

  if (path === '/test' && request.method === 'POST') {
    const body = await request.json<{ to: string; title: string; url: string; html: string; text: string }>()
    const email = postEmail(body)
    const unsub = `${origin(env, request)}/unsubscribe?t=test`
    try {
      const result = await env.EMAIL.send({
        to: body.to,
        from: env.MAIL_FROM,
        replyTo: env.MAIL_REPLY_TO,
        subject: `[Test] ${email.subject}`,
        html: email.html.replaceAll(UNSUBSCRIBE_PLACEHOLDER, unsub),
        text: email.text.replaceAll(UNSUBSCRIBE_PLACEHOLDER, unsub),
      })
      return json({ ok: true, messageId: result.messageId })
    } catch (err) {
      return json({ ok: false, code: errorCode(err), error: String(err) }, 502)
    }
  }

  if (path === '/sends' && request.method === 'POST') {
    const body = await request.json<{ key: string; title: string; url: string; html: string; text: string }>()
    if (!body.key || !body.title) return json({ error: 'key and title are required' }, 400)
    const email = postEmail(body)
    await env.DB.prepare('INSERT INTO sends (key, subject, html, text) VALUES (?, ?, ?, ?) ON CONFLICT (key) DO NOTHING')
      .bind(body.key, email.subject, email.html, email.text)
      .run()
    const send = await env.DB.prepare('SELECT id FROM sends WHERE key = ?').bind(body.key).first<{ id: number }>()
    // Only subscribers active right now. Anyone who confirms later won't get this post.
    await env.DB.prepare(
      `INSERT INTO deliveries (send_id, subscriber_id)
       SELECT ?, id FROM subscribers WHERE status = 'active' ON CONFLICT DO NOTHING`,
    )
      .bind(send!.id)
      .run()
    return json({ id: send!.id, ...(await sendCounts(env, send!.id)) })
  }

  const batch = path.match(/^\/sends\/(\d+)\/batch$/)
  if (batch && request.method === 'POST') return json(await sendBatch(env, request, Number(batch[1])))

  return json({ error: 'not found' }, 404)
}

async function sendBatch(env: MailEnv, request: Request, sendId: number) {
  const send = await env.DB.prepare('SELECT subject, html, text FROM sends WHERE id = ?').bind(sendId).first<{ subject: string; html: string; text: string }>()
  if (!send) return { error: 'no such send' }
  const { results: queue } = await env.DB.prepare(
    `SELECT s.id, s.email, s.status, s.token FROM deliveries d JOIN subscribers s ON s.id = d.subscriber_id
     WHERE d.send_id = ? AND d.status = 'queued' LIMIT ?`,
  )
    .bind(sendId, BATCH_SIZE)
    .all<Subscriber>()

  const base = origin(env, request)
  let paused: string | undefined
  for (const sub of queue) {
    const mark = (status: string, extra: { messageId?: string; error?: string } = {}) =>
      env.DB.prepare("UPDATE deliveries SET status = ?, message_id = ?, error = ?, sent_at = datetime('now') WHERE send_id = ? AND subscriber_id = ?")
        .bind(status, extra.messageId ?? null, extra.error ?? null, sendId, sub.id)
        .run()

    // Unsubscribed (or bounced) after the send was created.
    if (sub.status !== 'active') {
      await mark('skipped')
      continue
    }
    const unsub = `${base}/unsubscribe?t=${sub.token}`
    try {
      const result = await env.EMAIL.send({
        to: sub.email,
        from: env.MAIL_FROM,
        replyTo: env.MAIL_REPLY_TO,
        subject: send.subject,
        html: send.html.replaceAll(UNSUBSCRIBE_PLACEHOLDER, unsub),
        text: send.text.replaceAll(UNSUBSCRIBE_PLACEHOLDER, unsub),
        headers: {
          'List-Unsubscribe': `<${unsub}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          'List-Id': 'Yitong Zhang <posts.zhayitong.com>',
          Precedence: 'bulk',
        },
      })
      await mark('sent', { messageId: result.messageId })
    } catch (err) {
      const code = errorCode(err)
      // Out of quota for now: leave the rest queued and let the script retry later.
      if (code === 'E_DAILY_LIMIT_EXCEEDED' || code === 'E_RATE_LIMIT_EXCEEDED') {
        paused = code
        break
      }
      if (code === 'E_RECIPIENT_SUPPRESSED') {
        await env.DB.prepare("UPDATE subscribers SET status = 'bounced' WHERE id = ?").bind(sub.id).run()
      }
      await mark('failed', { error: `${code ?? ''} ${String(err)}`.trim() })
    }
  }
  return { id: sendId, paused, ...(await sendCounts(env, sendId)) }
}

async function sendCounts(env: MailEnv, sendId: number) {
  const { results } = await env.DB.prepare('SELECT status, COUNT(*) AS count FROM deliveries WHERE send_id = ? GROUP BY status').bind(sendId).all<{ status: string; count: number }>()
  const counts = Object.fromEntries(results.map((r) => [r.status, r.count]))
  return { counts, remaining: counts.queued ?? 0 }
}

// ---------------------------------------------------------------- bounces and complaints

type EmailEvent = {
  type?: string
  payload?: { recipient?: string; messageId?: string; terminal?: boolean; bounce?: { type?: string; classification?: string } }
}

/**
 * Queue consumer for Cloudflare Email Sending event subscriptions. A bounce
 * that Cloudflare marks final, or a spam complaint, takes the address off the list.
 */
export async function handleEmailEvents(batch: MessageBatch<EmailEvent>, env: MailEnv) {
  for (const msg of batch.messages) {
    const event = msg.body ?? {}
    const type = event.type ?? 'unknown'
    const recipient = event.payload?.recipient?.toLowerCase()
    await env.DB.prepare('INSERT INTO email_events (type, recipient, message_id, payload) VALUES (?, ?, ?, ?)')
      .bind(type, recipient ?? null, event.payload?.messageId ?? null, JSON.stringify(event))
      .run()

    let status: string | null = null
    if (type.endsWith('message.complained')) status = 'complained'
    else if (type.endsWith('message.bounced') && event.payload?.terminal !== false) status = 'bounced'
    if (status && recipient) {
      await env.DB.prepare("UPDATE subscribers SET status = ? WHERE email = ? AND status IN ('active', 'pending')").bind(status, recipient).run()
    }
    msg.ack()
  }
}

// ---------------------------------------------------------------- helpers

function origin(env: MailEnv, request: Request) {
  return env.PUBLIC_ORIGIN || new URL(request.url).origin
}

function newToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function minutesSince(sqliteDate: string) {
  return (Date.now() - Date.parse(`${sqliteDate.replace(' ', 'T')}Z`)) / 60_000
}

function errorCode(err: unknown): string | undefined {
  return typeof err === 'object' && err && 'code' in err ? String((err as { code: unknown }).code) : undefined
}

async function authorized(request: Request, env: MailEnv) {
  const expected = env.ADMIN_TOKEN
  const given = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? ''
  if (!expected || !given) return false
  const [a, b] = await Promise.all([given, expected].map((s) => crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))))
  // Workers-only extension of SubtleCrypto; the DOM lib types don't know it.
  return (crypto.subtle as unknown as { timingSafeEqual(a: ArrayBuffer, b: ArrayBuffer): boolean }).timingSafeEqual(a, b)
}

const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'cache-control': 'no-store' } })
