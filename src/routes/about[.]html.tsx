import { createFileRoute } from '@tanstack/react-router'
import { Page } from '../components/Page'
import { seo } from '../lib/seo'

export const Route = createFileRoute('/about.html')({
  head: () => seo({ title: 'About', path: '/about.html' }),
  component: About,
})

function About() {
  return (
    <Page current="/about.html">
      <h1 className="pageHeader">About Yitong</h1>
      <div className="spacer16" />
      <p>
        Hi! I'm Yitong, a designer in San Francisco. I grew up in Montreal, Canada – a very cold place my family moved to when I was young. Immigration is a big
        part of my story. You can listen to me talk about it on <a href="https://designdetails.fm/episodes/1xROYMXj">Design Details</a>. I currently work on{' '}
        <a href="https://nounsagora.com/">Agora, a public protocol governance app</a> and <a href="https://vectordao.com/">Vector, coop-style agency</a>. Before
        that, I spent almost four years at Coinbase as a product designer.
      </p>
      <p>
        In my spare time, I work on a bunch of side projects like <a href="https://www.flowchart.design/">Autoflow</a>, a marketing page pattern library called{' '}
        <a href="http://goodweb.design/">Goodweb.design</a>, a collection of <a href="https://www.buildgpt3.com/">GPT3 prompts</a>, and this vegetable
        seasonality <a href="http://howfresh.co/">website</a>. Most of these could really use a bit of maintenance. Oh and I also tend to a beautiful{' '}
        <a href="https://twitter.com/zhayitong/status/1238957144604467201">vegetable garden</a>.
      </p>
      <div className="masonry">
        <img className="masonry-item" src="/assets/img/Frame 1.jpg" />
        <img className="masonry-item" src="/assets/img/Frame 2.jpg" />
        <img className="masonry-item" src="/assets/img/Frame 3.jpg" />
        <img className="masonry-item" src="/assets/img/Frame 4.jpg" />
        <img className="masonry-item" src="/assets/img/Frame 5.jpg" />
        <img className="masonry-item" src="/assets/img/Frame 6.jpg" />
        <img className="masonry-item" src="/assets/img/Frame 7.jpg" />
        <img className="masonry-item" src="/assets/img/Frame 8.jpg" />
        <img className="masonry-item" src="/assets/img/Frame 9.jpg" />
        <img className="masonry-item" src="/assets/img/Frame 10.jpg" />
        <img className="masonry-item" src="/assets/img/Frame 11.jpg" />
        <img className="masonry-item" src="/assets/img/Frame 12.jpg" />
      </div>
    </Page>
  )
}
