import { createFileRoute } from '@tanstack/react-router'
import { Page } from '../components/Page'
import { MailingList } from '../components/MailingList'
import { getPostList } from '../lib/content'
import { seo } from '../lib/seo'
import { monthYear } from '../lib/site'

export const Route = createFileRoute('/')({
  loader: () => getPostList(),
  head: () => seo({ title: 'Blog', path: '/' }),
  component: Writing,
})

function Writing() {
  const posts = Route.useLoaderData()
  return (
    <Page current="/">
      <h1 className="pageHeader">Writing</h1>
      {posts.map((post) => (
        <section key={post.permalink}>
          <a href={post.permalink}>
            <div className="main-title-box">
              <h2>{post.title}</h2>
              <h5>{monthYear(post.ymd)}</h5>
            </div>
            <div dangerouslySetInnerHTML={{ __html: post.excerptHtml }} />
          </a>
        </section>
      ))}
      <MailingList />
    </Page>
  )
}
