import { createFileRoute } from '@tanstack/react-router'
import { posts } from '../lib/posts'
import { SITE_URL, isoMidnight } from '../lib/site'

const PAGES = ['/about.html', '/game.html', '/log/', '/', '/thanks.html', '/work.html']

function renderSitemap() {
  const url = (path: string, lastmod?: string) =>
    `<url>\n<loc>${SITE_URL}${encodeURI(path)}</loc>\n${lastmod ? `<lastmod>${lastmod}</lastmod>\n` : ''}</url>\n`
  const byDate = [...posts].sort((a, b) => (a.sortKey < b.sortKey ? -1 : 1))
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    byDate.map((p) => url(p.permalink, isoMidnight(p.ymd))).join('') +
    PAGES.map((p) => url(p)).join('') +
    __OLDSITE_PAGES__.map((p) => url(p)).join('') +
    '</urlset>\n'
  )
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () => new Response(renderSitemap(), { headers: { 'content-type': 'application/xml; charset=utf-8' } }),
    },
  },
})
