-- ═══════════════════════════════════════════════════════════════════
-- Guardrails & Optimization System — Migration
-- ═══════════════════════════════════════════════════════════════════

-- Token events (event sourcing for all LLM usage)
CREATE TABLE IF NOT EXISTS token_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  model VARCHAR(100) NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cache_read_tokens INTEGER NOT NULL DEFAULT 0,
  cache_creation_tokens INTEGER NOT NULL DEFAULT 0,
  cost_micro_credits BIGINT NOT NULL DEFAULT 0,
  agent_name VARCHAR(100),
  request_type VARCHAR(50) DEFAULT 'chat',
  chain_id UUID,
  mode VARCHAR(10) DEFAULT 'pro',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_token_events_user_day ON token_events (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_token_events_chain ON token_events (chain_id) WHERE chain_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_token_events_model ON token_events (model, created_at);

-- Conversation summaries (progressive summarization)
CREATE TABLE IF NOT EXISTS conversation_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  agent_id VARCHAR(100) NOT NULL,
  conversation_key VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  messages_summarized INTEGER NOT NULL DEFAULT 0,
  last_summarized_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_conv_summaries_key ON conversation_summaries (user_id, agent_id, conversation_key);

-- Guardrail alerts
CREATE TABLE IF NOT EXISTS guardrail_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  severity VARCHAR(20) NOT NULL DEFAULT 'low',
  type VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  user_id UUID REFERENCES users(id),
  agent_id VARCHAR(100),
  acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guardrail_alerts_severity ON guardrail_alerts (severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guardrail_alerts_unack ON guardrail_alerts (acknowledged, created_at DESC) WHERE acknowledged = FALSE;

-- Add agent_mode columns to users table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'agent_mode') THEN
    ALTER TABLE users ADD COLUMN agent_mode VARCHAR(10) NOT NULL DEFAULT 'pro';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'agent_mode_switched_at') THEN
    ALTER TABLE users ADD COLUMN agent_mode_switched_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'agent_mode_switch_count') THEN
    ALTER TABLE users ADD COLUMN agent_mode_switch_count INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Credit events coherence check view
CREATE OR REPLACE VIEW credit_coherence_check AS
SELECT
  u.id AS user_id,
  w.balance_credits AS wallet_balance,
  COALESCE(SUM(CASE WHEN wt.type = 'deposit' THEN wt.amount
                     WHEN wt.type = 'withdrawal' THEN wt.amount
                     WHEN wt.type = 'refund' THEN wt.amount
                     WHEN wt.type = 'bonus' THEN wt.amount
                     ELSE 0 END), 0) AS calculated_balance,
  w.balance_credits - COALESCE(SUM(CASE WHEN wt.type = 'deposit' THEN wt.amount
                                         WHEN wt.type = 'withdrawal' THEN wt.amount
                                         WHEN wt.type = 'refund' THEN wt.amount
                                         WHEN wt.type = 'bonus' THEN wt.amount
                                         ELSE 0 END), 0) AS drift
FROM users u
JOIN wallets w ON w.user_id = u.id
LEFT JOIN wallet_transactions wt ON wt.wallet_id = w.id
GROUP BY u.id, w.balance_credits
HAVING ABS(w.balance_credits - COALESCE(SUM(CASE WHEN wt.type = 'deposit' THEN wt.amount
                                                   WHEN wt.type = 'withdrawal' THEN wt.amount
                                                   WHEN wt.type = 'refund' THEN wt.amount
                                                   WHEN wt.type = 'bonus' THEN wt.amount
                                                   ELSE 0 END), 0)) > 0;
