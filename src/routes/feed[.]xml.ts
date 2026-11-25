// Atom feed at /feed.xml, byte-compatible with what jekyll-feed served for
// years: same entry ids, links and timestamps, so feed readers see nothing new.
// tests/check-feed.mjs compares it against a snapshot of the old feed.
import { createFileRoute } from '@tanstack/react-router'
import { feedId, posts } from '../lib/posts'
import { SITE_URL, isoMidnight } from '../lib/site'

const xml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
const cdata = (s: string) => `<![CDATA[${s.replaceAll(']]>', ']]]]><![CDATA[>')}]]>`

export function renderFeed() {
  // jekyll-feed: newest 10 posts; same-day posts by filename.
  const recent = [...posts]
    .sort((a, b) => (a.ymd === b.ymd ? (a.sortKey < b.sortKey ? -1 : 1) : a.ymd < b.ymd ? 1 : -1))
    .slice(0, 10)
  const entries = recent.map((post) => {
    const url = SITE_URL + post.permalink
    const title = xml(post.smartTitle)
    const date = isoMidnight(post.ymd)
    return (
      `<entry><title type="html">${title}</title>` +
      `<link href="${url}" rel="alternate" type="text/html" title="${title}" />` +
      `<published>${date}</published><updated>${date}</updated><id>${feedId(post)}</id>` +
      `<content type="html" xml:base="${url}">${cdata(post.html)}</content>` +
      (post.author ? `<author><name>${xml(post.author)}</name></author>` : '') +
      `<summary type="html">${cdata(post.excerptText)}</summary></entry>`
    )
  })
  return (
    '<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom" >' +
    `<link href="${SITE_URL}/feed.xml" rel="self" type="application/atom+xml" />` +
    `<link href="${SITE_URL}/" rel="alternate" type="text/html" />` +
    `<updated>${isoMidnight(recent[0].ymd)}</updated><id>${SITE_URL}/feed.xml</id>` +
    entries.join('') +
    '</feed>'
  )
}

export const Route = createFileRoute('/feed.xml')({
  server: {
    handlers: {
      GET: () => new Response(renderFeed(), { headers: { 'content-type': 'application/xml; charset=utf-8' } }),
    },
  },
})
