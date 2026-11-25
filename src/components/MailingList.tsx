// Which signup form the build ships. Mailchimp stays the default until the
// sending domain is set up in Cloudflare; build with VITE_MAILING_LIST=cloudflare
// to switch to the self-hosted list (src/mail/mail.ts).
const SELF_HOSTED = import.meta.env.VITE_MAILING_LIST === 'cloudflare'

export function MailingList() {
  return SELF_HOSTED ? <SelfHosted /> : <Mailchimp />
}

// Same markup and ids as the Mailchimp form, so the existing styles apply.
function SelfHosted() {
  return (
    <div className="mailinglist">
      <div className="whySignUp">
        <h6>
          This blog rarely updates. Subscribe to get new posts by email or via <a href="/feed.xml">RSS</a>.
        </h6>
      </div>
      <div id="mc_embed_signup">
        <form action="/subscribe" method="post">
          <div id="mc_embed_signup_scroll">
            <div className="mc-field-group">
              <input type="email" name="email" placeholder="your@email.com" required autoComplete="email" aria-label="Email address" />
            </div>
            {/* Honeypot: real people never fill this in. */}
            <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true">
              <input type="text" name="website" tabIndex={-1} defaultValue="" autoComplete="off" />
            </div>
            <div className="clear button-outer">
              <input type="submit" value="Subscribe" className="button" />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function Mailchimp() {
  return (
    <div className="mailinglist">
      <div className="whySignUp">
        <h6>
          This blog rarely updates. Subscribe to get new posts by email or via <a href="/feed.xml">RSS</a>.
        </h6>
      </div>
      <div id="mc_embed_signup">
        <form
          action="https://zhayitong.us6.list-manage.com/subscribe/post?u=b57d3ec382d73739279bb5c4a&id=f75b8ef793"
          method="post"
          id="mc-embedded-subscribe-form"
          name="mc-embedded-subscribe-form"
          className="validate"
          target="_blank"
          noValidate
        >
          <div id="mc_embed_signup_scroll">
            <div className="mc-field-group">
              <input type="email" defaultValue="" name="EMAIL" placeholder="your@email.com" className="required email" id="mce-EMAIL" />
            </div>
            <div id="mce-responses" className="clear">
              <div className="response" id="mce-error-response" style={{ display: 'none' }} />
              <div className="response" id="mce-success-response" style={{ display: 'none' }} />
            </div>
            {/* Honeypot: real people never fill this in. */}
            <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true">
              <input type="text" name="b_b57d3ec382d73739279bb5c4a_f75b8ef793" tabIndex={-1} defaultValue="" />
            </div>
            <div className="clear button-outer">
              <input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" className="button" />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
