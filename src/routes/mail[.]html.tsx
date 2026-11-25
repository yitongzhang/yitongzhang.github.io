import { createFileRoute } from '@tanstack/react-router'
import { Page } from '../components/Page'
import { seo } from '../lib/seo'

// Shell for mailing list messages ("check your inbox", "unsubscribed"). The
// Worker fills #mail-message in at request time (src/mail/mail.ts).
export const Route = createFileRoute('/mail.html')({
  head: () => {
    const head = seo({ title: 'Mailing list', path: '/mail.html' })
    return { ...head, meta: [...head.meta, { name: 'robots', content: 'noindex' }] }
  },
  component: () => (
    <Page>
      <div className="thanks">
        <div className="text" id="mail-message" />
      </div>
    </Page>
  ),
})
