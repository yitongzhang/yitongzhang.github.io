// Markdown pipeline tuned to match what kramdown (Jekyll's renderer on GitHub
// Pages) produced, so existing posts render the same after the move:
// GFM, inline HTML passed through, smart quotes/dashes, heading ids and
// kramdown-style footnote markup.
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkSmartypants from 'remark-smartypants'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import { visit, SKIP } from 'unist-util-visit'
import type { Root, Element, ElementContent } from 'hast'

const el = (tagName: string, properties: Element['properties'], children: ElementContent[] = []): Element =>
  ({ type: 'element', tagName, properties, children })

/** Rewrite GFM footnotes into kramdown's markup (ids, classes, roles, ↩ link). */
function rehypeKramdownFootnotes() {
  return (tree: Root) => {
    const index = new Map<string, number>()
    visit(tree, 'element', (node, i, parent) => {
      const props = node.properties ?? {}
      if (node.tagName === 'sup' && node.children[0]?.type === 'element' && (node.children[0] as Element).properties?.dataFootnoteRef !== undefined) {
        const a = node.children[0] as Element
        const id = String(a.properties.href).replace('#user-content-fn-', '')
        const n = index.get(id) ?? index.size + 1
        index.set(id, n)
        parent!.children[i!] = el('sup', { id: `fnref:${n}`, role: 'doc-noteref' }, [
          el('a', { href: `#fn:${n}`, className: ['footnote'], rel: ['footnote'] }, [{ type: 'text', value: String(n) }]),
        ])
        return SKIP
      }
      if (node.tagName === 'section' && props.dataFootnotes !== undefined) {
        const list = node.children.find((c): c is Element => c.type === 'element' && c.tagName === 'ol')!
        const items = list.children.filter((c): c is Element => c.type === 'element' && c.tagName === 'li')
        const lis: ElementContent[] = []
        for (const li of items) {
          const id = String(li.properties.id).replace('user-content-fn-', '')
          const n = index.get(id)!
          const paras = li.children.filter((c): c is Element => c.type === 'element')
          for (const p of paras) {
            p.children = p.children.filter((c) => !(c.type === 'element' && c.properties?.dataFootnoteBackref !== undefined))
            while (p.children.length && p.children.at(-1)!.type === 'text' && !(p.children.at(-1) as { value: string }).value.trim()) p.children.pop()
          }
          const last = paras.at(-1)!
          last.children.push({ type: 'text', value: ' ' }, el('a', { href: `#fnref:${n}`, className: ['reversefootnote'], role: 'doc-backlink' }, [{ type: 'text', value: '↩' }]))
          lis.push({ type: 'text', value: '\n    ' }, el('li', { id: `fn:${n}`, role: 'doc-endnote' }, [{ type: 'text', value: '\n      ' }, ...paras.flatMap((p) => [p, { type: 'text' as const, value: '\n    ' }])]))
        }
        parent!.children[i!] = el('div', { className: ['footnotes'], role: 'doc-endnotes' }, [
          { type: 'text', value: '\n  ' }, el('ol', {}, [...lis, { type: 'text', value: '\n  ' }]), { type: 'text', value: '\n' },
        ])
        return SKIP
      }
    })
  }
}

/** kramdown marked inline code spans with these classes; the stylesheet may rely on them. */
function rehypeInlineCodeClasses() {
  return (tree: Root) => {
    visit(tree, 'element', (node, _i, parent) => {
      if (node.tagName === 'code' && !(parent && parent.type === 'element' && parent.tagName === 'pre')) {
        node.properties = { ...node.properties, className: ['language-plaintext', 'highlighter-rouge'] }
      }
    })
  }
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkSmartypants, { dashes: 'oldschool' })
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSlug)
  .use(rehypeKramdownFootnotes)
  .use(rehypeInlineCodeClasses)
  .use(rehypeStringify)

export async function renderMarkdown(source: string): Promise<string> {
  return String(await processor.process(source))
}

/** Plain text of an HTML fragment, whitespace collapsed (Jekyll's strip_html + normalize_whitespace). */
export function stripHtml(html: string): string {
  return html
    .replace(/<script.*?<\/script>|<!--.*?-->|<style.*?<\/style>/gs, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}
