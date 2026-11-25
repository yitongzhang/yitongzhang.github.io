// Email bodies. Kept deliberately plain: a single column, system fonts, and
// inline styles, because email clients ignore most CSS.

export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

/** Replaced per recipient at send time. */
export const UNSUBSCRIBE_PLACEHOLDER = '%%UNSUBSCRIBE_URL%%'

function layout(bodyHtml: string, footerHtml: string) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;">
<div style="max-width:600px;margin:0 auto;padding:24px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#1a1a1a;">
${bodyHtml}
<hr style="border:none;border-top:1px solid #e5e5e5;margin:32px 0 16px;">
<p style="font-size:13px;color:#777;margin:0;">${footerHtml}</p>
</div>
</body></html>`
}

export function confirmEmail(confirmUrl: string) {
  const url = escapeHtml(confirmUrl)
  return {
    subject: 'Confirm your subscription to Yitong Zhang’s blog',
    html: layout(
      `<p>Hi! Someone (hopefully you) asked to get new posts from <a href="https://www.zhayitong.com">zhayitong.com</a> by email.</p>
<p><a href="${url}" style="display:inline-block;background:#1a1a1a;color:#ffffff;padding:10px 18px;border-radius:4px;text-decoration:none;">Yes, subscribe me</a></p>
<p style="font-size:14px;color:#555;">Or paste this link into your browser: ${url}</p>`,
      'If this wasn’t you, ignore this email and you won’t hear from me again.',
    ),
    text: `Hi! Someone (hopefully you) asked to get new posts from zhayitong.com by email.

Confirm here: ${confirmUrl}

If this wasn't you, ignore this email and you won't hear from me again.
`,
  }
}

/**
 * Wraps a post for the list. The unsubscribe placeholder is swapped for each
 * recipient's own link at send time.
 */
export function postEmail({ title, url, html, text }: { title: string; url: string; html: string; text: string }) {
  const footer = `You’re getting this because you subscribed at zhayitong.com. <a href="${UNSUBSCRIBE_PLACEHOLDER}" style="color:#777;">Unsubscribe</a>.`
  return {
    subject: title,
    html: layout(
      `<h1 style="font-size:26px;line-height:1.25;margin:0 0 8px;">${escapeHtml(title)}</h1>
<p style="font-size:14px;margin:0 0 24px;"><a href="${escapeHtml(url)}" style="color:#777;">Read on the web</a></p>
${html}`,
      footer,
    ),
    text: `${title}\n${url}\n\n${text.trim()}\n\n--\nYou're getting this because you subscribed at zhayitong.com.\nUnsubscribe: ${UNSUBSCRIBE_PLACEHOLDER}\n`,
  }
}
