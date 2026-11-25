// One-off migration check: compares every page of the new build with the same
// page from the old Jekyll build, element by element, ignoring whitespace,
// attribute order and <head>. Usage: node tests/check-parity.mjs <old-site-dir> [new-site-dir]
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'node-html-parser'

const [oldDir, newDir = 'dist/client'] = process.argv.slice(2)
const PAGES = ['index.html', 'about.html', 'work.html', 'game.html', 'thanks.html', 'log/index.html']
for (const line of readFileSync(join(oldDir, 'sitemap.xml'), 'utf8').matchAll(/<loc>http:\/\/zhayitong\.com\/(\d{4}\/[^<]+)<\/loc>/g)) PAGES.push(line[1])

const KEEP = ['class', 'href', 'src', 'id', 'alt', 'aria-label', 'aria-describedby', 'datetime', 'role', 'type', 'name', 'value', 'action']
const norm = (s) => s.replace(/\s+/g, ' ').trim()

function tokens(html) {
  const body = parse(html, { comment: false }).querySelector('body')
  body.querySelectorAll('script:not([type="application/json"]),style,link').forEach((n) => n.remove())
  const out = []
  const walk = (node) => {
    for (const child of node.childNodes) {
      if (child.nodeType === 3) {
        // React splits adjacent strings into separate text nodes; join them back up.
        const t = norm(child.text)
        if (!t) continue
        if (out.at(-1)?.startsWith('"')) out[out.length - 1] = `"${norm(out.at(-1).slice(1, -1) + ' ' + t)}"`
        else out.push(`"${t}"`)
      } else if (child.nodeType === 1 && child.rawTagName.toLowerCase() === 'script') {
        out.push(`<script json=${JSON.stringify(JSON.parse(child.text))}>`)
      } else if (child.nodeType === 1) {
        const attrs = KEEP.filter((k) => child.getAttribute(k) != null)
          .map((k) => `${k}=${norm(child.getAttribute(k).replace(/&#39;|&#x27;/g, "'").replace(/&amp;/g, '&'))}`)
        out.push(`<${child.rawTagName.toLowerCase()} ${attrs.join(' ')}>`)
        walk(child)
        out.push(`</${child.rawTagName.toLowerCase()}>`)
      }
    }
  }
  walk(body)
  return out
}

let failed = 0
for (const page of PAGES) {
  const newPath = join(newDir, page)
  if (!existsSync(newPath)) { console.log(`MISSING ${page}`); failed++; continue }
  const a = tokens(readFileSync(join(oldDir, page), 'utf8'))
  const b = tokens(readFileSync(newPath, 'utf8'))
  const i = a.findIndex((t, k) => t !== b[k])
  if (i === -1 && a.length === b.length) { console.log(`same    ${page}`); continue }
  failed++
  const at = i === -1 ? Math.min(a.length, b.length) : i
  console.log(`DIFF    ${page} at token ${at}\n   old: ${a.slice(at, at + 4).join(' ').slice(0, 300)}\n   new: ${b.slice(at, at + 4).join(' ').slice(0, 300)}`)
}
console.log(failed ? `\n${failed} page(s) differ` : '\nAll pages match')
process.exit(failed ? 1 : 0)
