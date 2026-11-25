import type { ReactNode } from 'react'
import { navigation } from '../lib/data'
import { dayMonthYear } from '../lib/site'

type Byline = { author: string | null; ymd: string; location: string | null }

/**
 * Site chrome: navigation, the page, and the footer. Links are plain <a> tags
 * on purpose: pages load as full documents, like the old site, so page scripts
 * (image modal, diary tooltips) always run.
 */
export function Page({ current, byline, children }: { current?: string; byline?: Byline; children: ReactNode }) {
  return (
    <>
      <nav>
        <div className="name">
          <h5>
            <a href="/">Yitong Zhang</a>
          </h5>
        </div>
        <div className="links">
          {navigation.map((item) => (
            <h5 key={item.link}>
              <a href={item.link} className={current === item.link ? 'current' : undefined}>
                {item.name}
              </a>
            </h5>
          ))}
        </div>
      </nav>
      {children}
      <footer>
        <h6 className="footnote">
          {byline?.author && `This post was written by ${byline.author} on ${dayMonthYear(byline.ymd)} in ${byline.location}. `}
          Find me elsewhere on <a href="https://twitter.com/zhayitong">Twitter</a>, <a href="https://github.com/yitongzhang">Github</a>, and{' '}
          <a href="https://www.linkedin.com/in/yitongzhang/">Linkedin</a>. Email me at zha.yitong@gmail.com, especially about HCI, design tooling, game design, crypto,
          immigration, and finding hidden talent. This site was redesigned in 2021. View my old site <a href="/oldsite">here.</a>
        </h6>
      </footer>
    </>
  )
}
