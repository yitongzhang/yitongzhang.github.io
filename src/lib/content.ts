// Server functions: content is read on the server (or at prerender time) and
// only the page's own data reaches the browser, never the whole archive.
import { createServerFn } from '@tanstack/react-start'
import { notFound } from '@tanstack/react-router'
import { postByPermalink, posts } from './posts'
import { diary, diaryDisplay, work } from './data'
import { chartData, renderDiaryTable } from './diary-view.mjs'

export const getPostList = createServerFn({ method: 'GET' }).handler(async () =>
  posts.map(({ title, permalink, ymd, excerptHtml }) => ({ title, permalink, ymd, excerptHtml })),
)

export const getPost = createServerFn({ method: 'GET' })
  .validator((permalink: string) => permalink)
  .handler(async ({ data }) => {
    const post = postByPermalink(data)
    if (!post) throw notFound()
    const { title, smartTitle, permalink, ymd, html, excerptText, author, location } = post
    return { title, smartTitle, permalink, ymd, html, excerptText, author: author ?? null, location: location ?? null }
  })

export const getWork = createServerFn({ method: 'GET' }).handler(async () => work)

export const getDiary = createServerFn({ method: 'GET' }).handler(async () => ({
  table: renderDiaryTable(diary, diaryDisplay),
  chart: chartData(diary, diaryDisplay),
}))
