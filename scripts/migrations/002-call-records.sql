-- ═══════════════════════════════════════════════════════
--   SARAH OS — Migration 002: Call Records
--   Tables for the Répondeur Intelligent (Camille)
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS calls (
  id SERIAL PRIMARY KEY,
  call_sid TEXT UNIQUE,
  user_id TEXT NOT NULL,
  direction TEXT NOT NULL DEFAULT 'inbound',
  caller_number TEXT,
  callee_number TEXT,
  status TEXT DEFAULT 'initiated',
  duration_seconds INT DEFAULT 0,
  agent_id TEXT DEFAULT 'sarah-repondeur',
  greeting_used TEXT,
  transcript TEXT,
  summary TEXT,
  sentiment TEXT,
  escalated BOOLEAN DEFAULT FALSE,
  escalation_reason TEXT,
  recording_url TEXT,
  cost_credits INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_calls_user_id ON calls(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);

CREATE TABLE IF NOT EXISTS call_messages (
  id SERIAL PRIMARY KEY,
  call_id INT REFERENCES calls(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  confidence FLOAT,
  tokens_used INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_call_messages_call_id ON call_messages(call_id);
