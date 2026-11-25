import type { ReactNode } from 'react'
import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import stylesheet from '../styles/default.scss?url'
import { SITE_URL } from '../lib/site'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { title: 'Yitong Zhang' },
      { name: 'msapplication-config', content: '/img/favicon/browserconfig.xml' },
      { name: 'theme-color', content: '#000000' },
    ],
    links: [
      { rel: 'stylesheet', href: stylesheet },
      { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
      { rel: 'icon', type: 'image/png', href: '/img/favicon/favicon-32x32.png', sizes: '32x32' },
      { rel: 'icon', type: 'image/png', href: '/img/favicon/favicon-16x16.png', sizes: '16x16' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/img/favicon/apple-touch-icon.png' },
      { rel: 'mask-icon', href: '/img/favicon/safari-pinned-tab.svg', color: '#000000' },
      { rel: 'manifest', href: '/img/favicon/manifest.json' },
      { rel: 'alternate', type: 'application/atom+xml', href: `${SITE_URL}/feed.xml` },
    ],
    scripts: [{ src: 'https://plausible.io/js/plausible.js', async: true, defer: true, 'data-domain': 'zhayitong.com' }],
  }),
  shellComponent: Document,
  component: Outlet,
})

function Document({ children }: { children: ReactNode }) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
