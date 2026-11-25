// Worker entry. Serves prerendered files the way GitHub Pages did, so every
// existing URL keeps working, then hands anything else to TanStack Start.
//
//   /work.html      -> the file itself (200)
//   /work           -> work.html (200, no redirect)
//   /log            -> 301 /log/
//   /log/           -> log/index.html (200)
//   /feed           -> feed.xml (200)
//   /DIARY.html     -> 301 /log/ (old rendered copy of the diary docs)
import handler from '@tanstack/react-start/server-entry'
import { handleEmailEvents, handleMail, type MailEnv } from './mail/mail'

type Env = MailEnv

const REDIRECTS: Record<string, string> = {
  '/DIARY.html': '/log/',
}

const ALIASES: Record<string, string> = {
  '/feed': '/feed.xml',
}

async function asset(env: Pick<Env, 'ASSETS'>, request: Request, pathname: string): Promise<Response | null> {
  const url = new URL(request.url)
  url.pathname = pathname
  const response = await env.ASSETS.fetch(new Request(url, request))
  return response.ok ? response : null
}

export async function serveLegacy(request: Request, env: Pick<Env, 'ASSETS'>): Promise<Response | null> {
  if (request.method !== 'GET' && request.method !== 'HEAD') return null
  const url = new URL(request.url)
  const path = decodeURIComponent(url.pathname)

  const redirect = REDIRECTS[path]
  if (redirect) return Response.redirect(new URL(redirect, url).toString(), 301)

  const alias = ALIASES[path]
  if (alias) return asset(env, request, alias)

  if (path.endsWith('/')) return asset(env, request, `${path}index.html`)

  // Paths with an extension were already tried as static files before the Worker ran.
  if (/\.[A-Za-z0-9]+$/.test(path.split('/').pop()!)) return null

  const page = await asset(env, request, `${path}.html`)
  if (page) return page
  if (await asset(env, request, `${path}/index.html`)) {
    url.pathname = `${url.pathname}/`
    return Response.redirect(url.toString(), 301)
  }
  return null
}

export default {
  async fetch(request: Request, env: Env) {
    return (await handleMail(request, env)) ?? (await serveLegacy(request, env)) ?? handler.fetch(request)
  },
  // Bounce and complaint events from Cloudflare Email Sending.
  async queue(batch: MessageBatch, env: Env) {
    await handleEmailEvents(batch as Parameters<typeof handleEmailEvents>[0], env)
  },
}
