-- ============================================================
-- Support Chat System Migration — Freenzy.io
-- Chat logs + support tickets (admin-only access, no RLS)
-- ============================================================

BEGIN;

-- ─── 1. Support Chat Logs ──────────────────────────────────

CREATE TABLE IF NOT EXISTS support_chat_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  VARCHAR(100) NOT NULL,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  role        VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_chat_session ON support_chat_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_support_chat_created ON support_chat_logs(created_at);

-- ─── 2. Support Tickets ────────────────────────────────────

CREATE TABLE IF NOT EXISTS support_tickets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    VARCHAR(100) NOT NULL,
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  visitor_email VARCHAR(255),
  subject       TEXT NOT NULL,
  status        VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'replied', 'closed')),
  priority      VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  admin_reply   TEXT,
  replied_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_session ON support_tickets(session_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created ON support_tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);

-- NO RLS on these tables — admin-only access via application layer

COMMIT;
