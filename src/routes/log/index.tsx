import { createFileRoute } from '@tanstack/react-router'
import { Page } from '../../components/Page'
import { getDiary } from '../../lib/content'
import { seo } from '../../lib/seo'

// Assets are fingerprinted per build so a new diary entry never shows with stale styles.
const VERSION = String(__BUILD_TIME__)

export const Route = createFileRoute('/log/')({
  loader: () => getDiary(),
  head: () => seo({ title: 'Food & workout log', path: '/log/', description: 'A simple daily food and workout log.' }),
  component: Log,
})

function Log() {
  const { table, chart } = Route.useLoaderData()
  return (
    <Page current="/log/">
      <link rel="stylesheet" href={`/assets/css/log.css?v=${VERSION}`} />
      <main
        className="diary"
        dangerouslySetInnerHTML={{
          __html: `<div class="log-chart" id="log-chart"></div><script type="application/json" id="log-chart-data">${chart}</script>${table}`,
        }}
      />
      <script src={`/assets/js/log.js?v=${VERSION}`} defer />
      <script src={`/assets/js/log-chart.js?v=${VERSION}`} defer />
    </Page>
  )
}
