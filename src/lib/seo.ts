import { OG_IMAGE, SITE_URL, isoMidnight } from './site'

type Seo = {
  title: string
  path: string
  description?: string
  post?: { ymd: string; author?: string | null }
}

/** Head tags for a page: what jekyll-seo-tag and the old opengraph include produced, minus duplicates. */
/** jekyll-seo-tag falls back to the site description ("Yitong") when a page has none. */
const SITE_NAME = 'Yitong'

export function seo({ title, path, description = SITE_NAME, post }: Seo) {
  const url = SITE_URL + path
  const published = post && isoMidnight(post.ymd)
  const meta: Array<Record<string, string> | false | '' | undefined | null> = [
    { title },
    description && { name: 'description', content: description },
    post?.author && { name: 'author', content: post.author },
    { property: 'og:locale', content: 'en_US' },
    { property: 'og:type', content: post ? 'article' : 'website' },
    { property: 'og:title', content: title },
    description && { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:image', content: OG_IMAGE },
    { property: 'og:image:width', content: '637' },
    { property: 'og:image:height', content: '403' },
    published && { property: 'article:published_time', content: published },
    published && { property: 'article:modified_time', content: published },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: title },
    description && { name: 'twitter:description', content: description },
  ]

  const jsonLd = post
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        author: post.author ? { '@type': 'Person', name: post.author } : undefined,
        dateModified: published,
        datePublished: published,
        description,
        headline: title,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        url,
      }
    : { '@context': 'https://schema.org', '@type': 'WebPage', description, headline: title, url }

  return {
    meta: meta.filter((m): m is Record<string, string> => Boolean(m)),
    links: [{ rel: 'canonical', href: url }],
    scripts: [{ type: 'application/ld+json', children: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }],
  }
}
