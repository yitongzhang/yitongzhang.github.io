import { defineCollection, defineConfig } from '@content-collections/core'
import { z } from 'zod'
import { renderMarkdown, stripHtml } from './src/lib/markdown'

const SEPARATOR = '<!--more-->'

const posts = defineCollection({
  name: 'posts',
  // Jekyll only published files named YYYY-MM-DD-slug.md; undated drafts stay unpublished.
  directory: '_posts',
  include: '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-*.md',
  schema: z.object({
    title: z.string(),
    // Kept verbatim from the Jekyll era (some values are malformed, e.g. "2021-10-30ss -0700").
    // Only the leading YYYY-MM-DD is used, exactly as GitHub Pages did.
    date: z.union([z.string(), z.date()]),
    // Explicit URL. Never derived, so old links can't drift.
    permalink: z.string().regex(/^\/\d{4}\/\d{2}\/\d{2}\/[a-z0-9-]+\.html$/),
    location: z.string().optional(),
    author: z.string().optional(),
    excerpt_separator: z.string().optional(),
    layout: z.string().optional(),
    content: z.string(),
  }),
  transform: async (doc) => {
    const raw = doc.date instanceof Date ? doc.date.toISOString() : doc.date
    const ymd = raw.match(/^\d{4}-\d{2}-\d{2}/)?.[0]
    if (!ymd) throw new Error(`${doc._meta.filePath}: unparseable date ${raw}`)
    if (!doc.permalink.startsWith(`/${ymd.replaceAll('-', '/')}/`)) {
      throw new Error(`${doc._meta.filePath}: permalink ${doc.permalink} does not match date ${ymd}`)
    }
    const separator = doc.excerpt_separator ?? SEPARATOR
    const html = await renderMarkdown(doc.content)
    const cut = doc.content.indexOf(separator)
    const excerptHtml = await renderMarkdown(cut === -1 ? doc.content.split(/\n\s*\n/)[0] : doc.content.slice(0, cut))
    return {
      title: doc.title,
      // Typographic title (’ instead of '), as jekyll-feed's smartify produced.
      smartTitle: stripHtml(await renderMarkdown(doc.title)),
      permalink: doc.permalink,
      location: doc.location,
      author: doc.author,
      ymd,
      sortKey: `${ymd} ${doc._meta.fileName}`,
      html,
      excerptHtml,
      excerptText: stripHtml(excerptHtml),
    }
  },
})

export default defineConfig({ content: [posts] })
