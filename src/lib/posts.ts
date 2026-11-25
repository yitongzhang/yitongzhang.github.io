import { allPosts } from 'content-collections'
import { SITE_URL } from './site'

export type Post = (typeof allPosts)[number]

/** Newest first; same-day posts in reverse filename order, as Jekyll listed them. */
export const posts: Post[] = [...allPosts].sort((a, b) => (a.sortKey < b.sortKey ? 1 : -1))

export const postByPermalink = (permalink: string) => posts.find((p) => p.permalink === permalink)

/** Atom entry id, e.g. http://zhayitong.com/2024/02/01/arc-alignment (jekyll-feed's format). */
export const feedId = (post: Post) => SITE_URL + post.permalink.replace(/\.html$/, '')
