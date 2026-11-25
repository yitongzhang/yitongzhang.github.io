import { Page } from './Page'

export function NotFound() {
  return (
    <Page>
      <h1 className="pageHeader">Page not found</h1>
      <p>
        Nothing lives at this address. Try the <a href="/">writing</a> page instead.
      </p>
    </Page>
  )
}
