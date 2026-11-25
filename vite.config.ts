import { readdirSync, readFileSync } from 'node:fs'
import { relative } from 'node:path'
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { cloudflare } from '@cloudflare/vite-plugin'
import contentCollections from '@content-collections/vite'

// Every page is prerendered to a static file at its exact legacy path.
const postPaths = readdirSync('_posts')
  .filter((f) => /^\d{4}-\d{2}-\d{2}-.+\.md$/.test(f))
  .map((f) => readFileSync(`_posts/${f}`, 'utf8').match(/^permalink:\s*(\S+)/m)![1])

// Static pages from older versions of the site, listed in the sitemap like before.
const oldsitePages = (readdirSync('public/oldsite', { recursive: true }) as string[])
  .filter((f) => f.endsWith('.html'))
  .map((f) => '/' + relative('public', `public/oldsite/${f}`).replaceAll('\\', '/'))
  .sort()

const pages = ['/', '/work.html', '/about.html', '/game.html', '/thanks.html', '/log/', '/feed.xml', '/sitemap.xml', ...postPaths]

export default defineConfig({
  define: {
    __BUILD_TIME__: JSON.stringify(Math.floor(Date.now() / 1000)),
    __OLDSITE_PAGES__: JSON.stringify(oldsitePages),
  },
  build: { assetsDir: '_build' },
  plugins: [
    contentCollections(),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tanstackStart({
      prerender: { enabled: true, crawlLinks: false, failOnError: true },
      pages: pages.map((path) => ({ path })),
    }),
    viteReact(),
  ],
})
