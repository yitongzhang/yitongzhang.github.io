import { createFileRoute } from '@tanstack/react-router'
import { Page } from '../components/Page'
import { seo } from '../lib/seo'

// Where Mailchimp sends new subscribers after confirming.
export const Route = createFileRoute('/thanks.html')({
  head: () => seo({ title: 'Thanks', path: '/thanks.html' }),
  component: () => (
    <Page current="/thanks.html">
      <div className="thanks">
        <img src="https://i.giphy.com/media/6tHy8UAbv3zgs/giphy.webp" alt="" />
        <div className="text">
          <h2>You're subscribed!</h2>
          <p>New blog posts will be delivered to your inbox.</p>
        </div>
      </div>
    </Page>
  ),
})
