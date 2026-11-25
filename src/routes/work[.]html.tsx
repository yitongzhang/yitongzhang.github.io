import { createFileRoute } from '@tanstack/react-router'
import { Page } from '../components/Page'
import { getWork } from '../lib/content'
import { seo } from '../lib/seo'
import { monthYear } from '../lib/site'

export const Route = createFileRoute('/work.html')({
  loader: () => getWork(),
  head: () => seo({ title: 'Work', path: '/work.html' }),
  component: Work,
})

function Work() {
  const items = Route.useLoaderData()
  return (
    <Page current="/work.html">
      <h1 className="pageHeader">Work</h1>
      {items.map((item) => (
        <section key={item.name} className="section-wide no-hover-section project-image-wrapper">
          <picture className="fixed-ratio fixed-ratio-1600-800">
            <img src={item.images[0]} className="project-image fixed-ratio-content" />
          </picture>
          <div className="main-title-box work-title-box">
            <h2>{item.name}</h2>
            <h5>
              {monthYear(String(item.startDate))} to {item.endDate === 'Now' ? 'Today' : monthYear(String(item.endDate))}
            </h5>
          </div>
          <p>{item.description}</p>
        </section>
      ))}
    </Page>
  )
}
