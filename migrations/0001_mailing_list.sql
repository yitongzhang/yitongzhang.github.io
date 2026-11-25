-- Mailing list. One row per email address, ever. Rows are never deleted, so an
-- address that unsubscribed or bounced can't be mailed again by accident.
CREATE TABLE subscribers (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  -- pending: signed up, hasn't clicked the confirm link yet
  -- active: gets posts
  -- unsubscribed / bounced / complained: never mailed again unless they sign up anew
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'unsubscribed', 'bounced', 'complained')),
  -- Secret in the confirm and unsubscribe links. Rotated on every new signup.
  token TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT 'site',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  confirm_sent_at TEXT,
  confirmed_at TEXT,
  unsubscribed_at TEXT
);

-- A post (or any email) sent to the list. `key` makes sending idempotent:
-- re-running the send script for the same post resumes instead of re-sending.
CREATE TABLE sends (
  id INTEGER PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- One row per (send, subscriber). Created up front so a send can be resumed.
CREATE TABLE deliveries (
  send_id INTEGER NOT NULL REFERENCES sends(id),
  subscriber_id INTEGER NOT NULL REFERENCES subscribers(id),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed', 'skipped')),
  message_id TEXT,
  error TEXT,
  sent_at TEXT,
  PRIMARY KEY (send_id, subscriber_id)
);
CREATE INDEX deliveries_queued ON deliveries (send_id, status);

-- Delivery events from Cloudflare (bounces, complaints), kept for debugging.
CREATE TABLE email_events (
  id INTEGER PRIMARY KEY,
  received_at TEXT NOT NULL DEFAULT (datetime('now')),
  type TEXT NOT NULL,
  recipient TEXT,
  message_id TEXT,
  payload TEXT NOT NULL
);
