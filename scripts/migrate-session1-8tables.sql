-- ═══════════════════════════════════════════════════════
-- FREENZY.IO — SESSION 1 : 8 TABLES MIGRATION
-- Date : 14 mars 2026
-- ═══════════════════════════════════════════════════════

BEGIN;

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════
-- TABLE 1 : user_profiles
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  profession VARCHAR(50) NOT NULL,
  sub_profession VARCHAR(100),
  company_name VARCHAR(200),
  company_size VARCHAR(20),
  pain_points TEXT[] DEFAULT '{}',
  goals TEXT[] DEFAULT '{}',
  ai_level VARCHAR(20) DEFAULT 'beginner',
  tools_used TEXT[] DEFAULT '{}',
  notification_pref VARCHAR(30) DEFAULT 'email',
  telegram_chat_id VARCHAR(50),
  whatsapp_number VARCHAR(20),
  custom_request TEXT,
  onboarding_completed_at TIMESTAMPTZ,
  dashboard_config JSONB DEFAULT '{}',
  quiz_answers JSONB DEFAULT '{}',
  welcome_email_sent_at TIMESTAMPTZ,
  profile_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_profession ON user_profiles(profession);

-- ═══════════════════════════════════════════════════════
-- TABLE 2 : business_info
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS business_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  siret VARCHAR(14),
  siren VARCHAR(9),
  forme_juridique VARCHAR(50),
  date_creation DATE,
  capital_social NUMERIC,
  naf_code VARCHAR(10),
  naf_label VARCHAR(200),
  adresse_complete TEXT,
  rue VARCHAR(200),
  ville VARCHAR(100),
  code_postal VARCHAR(10),
  pays VARCHAR(50) DEFAULT 'France',
  site_web VARCHAR(200),
  google_my_business_url VARCHAR(300),
  gmb_rating NUMERIC(2,1),
  gmb_review_count INTEGER DEFAULT 0,
  linkedin_url VARCHAR(300),
  facebook_url VARCHAR(300),
  instagram_url VARCHAR(300),
  concurrents JSONB DEFAULT '[]',
  opportunites JSONB DEFAULT '[]',
  activite_detectee TEXT,
  raw_intelligence JSONB DEFAULT '{}',
  sources_used TEXT[] DEFAULT '{}',
  intelligence_gathered_at TIMESTAMPTZ,
  validated_by_user_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_info_user_id ON business_info(user_id);
CREATE INDEX IF NOT EXISTS idx_business_info_siret ON business_info(siret);

-- ═══════════════════════════════════════════════════════
-- TABLE 3 : approval_queue (DROP + RECREATE)
-- ═══════════════════════════════════════════════════════

DROP TABLE IF EXISTS approval_queue CASCADE;

CREATE TABLE approval_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  action_title VARCHAR(300) NOT NULL,
  action_payload JSONB NOT NULL,
  modified_payload JSONB,
  status VARCHAR(20) DEFAULT 'pending',
  target VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  postpone_until TIMESTAMPTZ,
  postpone_count INTEGER DEFAULT 0,
  notification_sent_via TEXT[] DEFAULT '{}',
  reminder_count INTEGER DEFAULT 0,
  last_reminder_at TIMESTAMPTZ,
  auto_approved BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_approval_queue_user_id ON approval_queue(user_id);
CREATE INDEX idx_approval_queue_status ON approval_queue(status);
CREATE INDEX idx_approval_queue_expires_at ON approval_queue(expires_at);
CREATE INDEX idx_approval_queue_target ON approval_queue(target);

-- ═══════════════════════════════════════════════════════
-- TABLE 4 : user_approval_settings
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_approval_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  expiry_hours INTEGER DEFAULT 48,
  auto_approve_types TEXT[] DEFAULT '{}',
  notification_channels TEXT[] DEFAULT '{email,inapp}',
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  reminder_after_hours INTEGER DEFAULT 24,
  max_postpones INTEGER DEFAULT 3
);

-- ═══════════════════════════════════════════════════════
-- TABLE 5 : email_sequence_log (DROP + RECREATE)
-- ═══════════════════════════════════════════════════════

DROP TABLE IF EXISTS email_sequence_log CASCADE;

CREATE TABLE email_sequence_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sequence_type VARCHAR(30) NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'scheduled',
  approval_id UUID REFERENCES approval_queue(id) ON DELETE SET NULL,
  email_subject VARCHAR(300),
  email_preview TEXT,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  open_count INTEGER DEFAULT 0,
  personalization_data JSONB DEFAULT '{}'
);

CREATE INDEX idx_email_sequence_user_id ON email_sequence_log(user_id);
CREATE INDEX idx_email_sequence_status ON email_sequence_log(status);
CREATE INDEX idx_email_sequence_scheduled ON email_sequence_log(scheduled_for);

-- ═══════════════════════════════════════════════════════
-- TABLE 6 : user_agents_config
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_agents_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id VARCHAR(100) NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  use_count INTEGER DEFAULT 0,
  custom_instructions TEXT,
  UNIQUE (user_id, agent_id)
);

CREATE INDEX IF NOT EXISTS idx_user_agents_config_user_id ON user_agents_config(user_id);
CREATE INDEX IF NOT EXISTS idx_user_agents_config_agent_id ON user_agents_config(agent_id);

-- ═══════════════════════════════════════════════════════
-- TABLE 7 : cron_logs
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS cron_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cron_name VARCHAR(100) NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'running',
  summary TEXT,
  actions_created INTEGER DEFAULT 0,
  errors TEXT[] DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_cron_logs_name ON cron_logs(cron_name);
CREATE INDEX IF NOT EXISTS idx_cron_logs_started ON cron_logs(started_at);

-- ═══════════════════════════════════════════════════════
-- TABLE 8 : product_improvements
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS product_improvements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE DEFAULT CURRENT_DATE,
  title VARCHAR(300) NOT NULL,
  observation TEXT NOT NULL,
  hypothesis TEXT NOT NULL,
  solution TEXT NOT NULL,
  effort VARCHAR(5) NOT NULL,
  impact VARCHAR(10) NOT NULL,
  priority_score NUMERIC(5,2),
  is_quick_win BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'proposed',
  approved_at TIMESTAMPTZ,
  implemented_at TIMESTAMPTZ,
  results TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_improvements_status ON product_improvements(status);
CREATE INDEX IF NOT EXISTS idx_product_improvements_priority ON product_improvements(priority_score DESC);

-- ═══════════════════════════════════════════════════════
-- TRIGGERS updated_at
-- ═══════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_user_profiles_updated ON user_profiles;
CREATE TRIGGER trg_user_profiles_updated BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_business_info_updated ON business_info;
CREATE TRIGGER trg_business_info_updated BEFORE UPDATE ON business_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
