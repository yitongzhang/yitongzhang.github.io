# zhayitong.com

Yitong's personal site: writing, work, and a public food and workout log.

Built with [TanStack Start](https://tanstack.com/start) (React) and deployed to
Cloudflare Workers. Every page is prerendered to a static file at build time.

## Layout

| Path | What it is |
| --- | --- |
| `_posts/` | Blog posts in Markdown. Each has an explicit `permalink:` (keep the old `/YYYY/MM/DD/slug.html` form). |
| `_data/` | Site data: work history, navigation, and the diary (`diary.json`, `diary_display.yml`, see `DIARY.md`). |
| `src/routes/` | Pages. File names map to URLs, e.g. `work[.]html.tsx` is `/work.html`. |
| `src/lib/` | Markdown pipeline, content loading, feed/SEO helpers, the diary table renderer. |
| `src/server.ts` | Worker entry: serves files with GitHub Pages' URL rules, then hands off to TanStack Start. |
| `public/` | Files served as-is: images, fonts, scripts, and `/oldsite/`. |
| `tests/` | Checks that every old URL and the feed still behave as before. |

## Commands

```sh
npm install
npm run dev          # local dev server on :3000
npm run build        # prerender everything into dist/
npm run preview      # serve the build with the Workers runtime on :4173
npm test             # diary tests and validation
npm run check:feed   # feed ids/dates vs. the old feed (after a build)
npm run check:urls -- http://localhost:4173   # every old URL, against a running preview
npm run deploy       # build and deploy with wrangler
```

## Rules that keep old links and feed readers happy

- Never change a post's `permalink`. New posts must set one.
- Feed entry ids are `http://zhayitong.com` + the permalink without `.html`. Don't change `SITE_URL`.
- `tests/fixtures/` is a frozen snapshot of the old site. Don't regenerate it from the new one.

## Mailing list

Self-hosted on Cloudflare, no other vendors. Subscribers live in D1 (`zhayitong-mail`,
schema in `migrations/`), email goes out through Cloudflare Email Sending, and the
code is `src/mail/mail.ts`. Signup is double opt-in; every post email carries a
personal unsubscribe link plus one-click `List-Unsubscribe` headers.

The site still ships the Mailchimp form until you build with
`VITE_MAILING_LIST=cloudflare` (e.g. `VITE_MAILING_LIST=cloudflare npm run deploy`).

One-time setup, in the Cloudflare dashboard (account "Yitong Runner Personal"):

1. Workers plan: upgrade to Workers Paid ($5/mo). The free plan only mails addresses
   you've verified yourself. Paid includes 3,000 emails/month, then $0.35 per 1,000.
2. Add zhayitong.com as a zone and move its nameservers to Cloudflare.
3. Compute > Email Service > Email Sending > Onboard Domain > zhayitong.com. It adds the
   SPF/DKIM/DMARC records itself. Emails come from `MAIL_FROM` in `wrangler.jsonc`.
4. Admin token: `npx wrangler secret put ADMIN_TOKEN` (any long random string; keep a copy).
5. Bounces and complaints:
   `npx wrangler queues subscription create zhayitong-mail-events --source email.sending --zone-id <zhayitong.com zone id> --domain zhayitong.com --events message.bounced,message.complained`

Day to day (`ADMIN_TOKEN` set in your shell; `MAIL_BASE` defaults to https://www.zhayitong.com):

```
node scripts/mail.mjs import ~/Downloads/mailchimp/*.csv --dry-run   # Mailchimp audience export, then without --dry-run
node scripts/mail.mjs test /2024/02/01/arc-alignment.html you@example.com
node scripts/mail.mjs send /2024/02/01/arc-alignment.html             # asks first; safe to re-run, never double-sends
node scripts/mail.mjs stats
```
