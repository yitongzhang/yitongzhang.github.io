import { createFileRoute } from '@tanstack/react-router'
import { Page } from '../../../../components/Page'
import { MailingList } from '../../../../components/MailingList'
import { getPost } from '../../../../lib/content'
import { seo } from '../../../../lib/seo'

// Posts live at their Jekyll-era URLs: /YYYY/MM/DD/slug.html
export const Route = createFileRoute('/$year/$month/$day/{$slug}.html')({
  loader: ({ params }) => getPost({ data: `/${params.year}/${params.month}/${params.day}/${params.slug}.html` }),
  head: ({ loaderData }) =>
    loaderData ? seo({ title: loaderData.smartTitle, path: loaderData.permalink, description: loaderData.excerptText, post: loaderData }) : {},
  component: Post,
})

function Post() {
  const post = Route.useLoaderData()
  return (
    <Page byline={post}>
      <div className="modalBackground" />
      <div className="post-title-box">
        <h1>{post.title}</h1>
      </div>
      <div className="spacer16" />
      <div className="post" dangerouslySetInnerHTML={{ __html: post.html }} />
      <script src="/assets/js/modal.js" />
      <MailingList />
    </Page>
  )
}
