-- ── Custom Agents — User-created AI agents ─────────────────────────────────
-- Sprint 4: Allow users to create their own agents with custom prompts

CREATE TABLE IF NOT EXISTS custom_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(255),
  emoji VARCHAR(10) DEFAULT '🤖',
  color VARCHAR(20) DEFAULT '#6366f1',
  domain VARCHAR(50),
  capabilities JSONB DEFAULT '[]',
  autonomy_level INTEGER DEFAULT 50 CHECK (autonomy_level BETWEEN 0 AND 100),
  tone VARCHAR(50) DEFAULT 'professional',
  always_do TEXT[] DEFAULT '{}',
  never_do TEXT[] DEFAULT '{}',
  company_context TEXT,
  system_prompt TEXT,
  is_active BOOLEAN DEFAULT true,
  visible_in_sidebar BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_agents_user_id ON custom_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_agents_active ON custom_agents(user_id, is_active);
