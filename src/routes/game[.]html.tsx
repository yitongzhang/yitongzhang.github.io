import { createFileRoute } from '@tanstack/react-router'
import { Page } from '../components/Page'
import { seo } from '../lib/seo'

export const Route = createFileRoute('/game.html')({
  head: () => seo({ title: 'Game', path: '/game.html' }),
  component: () => (
    <Page current="/game.html">
      <p>Some day, there will be a small game here</p>
    </Page>
  ),
})
