import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { NotFound } from './components/NotFound'

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    // Legacy URLs mix "/log/" and "/work.html"; keep each exactly as written.
    trailingSlash: 'preserve',
    defaultNotFoundComponent: NotFound,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
