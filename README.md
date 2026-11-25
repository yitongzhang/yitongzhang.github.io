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
