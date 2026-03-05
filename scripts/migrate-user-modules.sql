-- ── User Modules — No-code module builder ───────────────────────────────────
-- Sprint 4: Allow users to create their own functional modules (forms, CRM, agents, dashboards)

CREATE TABLE IF NOT EXISTS user_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  emoji VARCHAR(10) DEFAULT '📋',
  color VARCHAR(20) DEFAULT '#6366f1',
  type VARCHAR(20) NOT NULL CHECK (type IN ('form', 'crm', 'agent', 'dashboard')),
  schema JSONB DEFAULT '{}',       -- field definitions, agent config, etc.
  settings JSONB DEFAULT '{}',     -- extra settings (confirmation msg, public url, etc.)
  is_published BOOLEAN DEFAULT false,
  public_access BOOLEAN DEFAULT false,
  record_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, slug)
);

CREATE TABLE IF NOT EXISTS module_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES user_modules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_modules_user_id ON user_modules(user_id);
CREATE INDEX IF NOT EXISTS idx_user_modules_slug ON user_modules(user_id, slug);
CREATE INDEX IF NOT EXISTS idx_module_records_module_id ON module_records(module_id);
CREATE INDEX IF NOT EXISTS idx_module_records_user_id ON module_records(module_id, user_id);

-- Auto-update record_count on insert/delete
CREATE OR REPLACE FUNCTION update_module_record_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_modules SET record_count = record_count + 1 WHERE id = NEW.module_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_modules SET record_count = GREATEST(0, record_count - 1) WHERE id = OLD.module_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_module_record_count ON module_records;
CREATE TRIGGER trg_module_record_count
  AFTER INSERT OR DELETE ON module_records
  FOR EACH ROW EXECUTE FUNCTION update_module_record_count();
