-- Migration: Add user_preferences table + activity_log table + agent_templates table
-- Run: psql -U freenzy -d freenzy -f scripts/migrate-user-preferences.sql

-- User Preferences (replaces localStorage)
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    dark_mode BOOLEAN NOT NULL DEFAULT FALSE,
    compact_mode BOOLEAN NOT NULL DEFAULT FALSE,
    language VARCHAR(10) NOT NULL DEFAULT 'fr',
    notify_email BOOLEAN NOT NULL DEFAULT TRUE,
    notify_sms BOOLEAN NOT NULL DEFAULT FALSE,
    notify_whatsapp BOOLEAN NOT NULL DEFAULT TRUE,
    notify_in_app BOOLEAN NOT NULL DEFAULT TRUE,
    notify_low_balance BOOLEAN NOT NULL DEFAULT TRUE,
    notify_daily_report BOOLEAN NOT NULL DEFAULT FALSE,
    notify_weekly_report BOOLEAN NOT NULL DEFAULT TRUE,
    default_agent VARCHAR(50) DEFAULT 'fz-assistante',
    voice_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    preferred_voice VARCHAR(50) DEFAULT 'sarah',
    company_profile JSONB NOT NULL DEFAULT '{}',
    gamification_data JSONB NOT NULL DEFAULT '{}',
    team_data JSONB NOT NULL DEFAULT '[]',
    agent_configs JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);

-- Activity Log (replaces file-based audit logger)
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(255),
    details JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at);

-- Agent Templates (marketplace)
CREATE TABLE IF NOT EXISTS agent_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    icon VARCHAR(10) NOT NULL DEFAULT '🤖',
    default_config JSONB NOT NULL DEFAULT '{}',
    tier_required VARCHAR(20) NOT NULL DEFAULT 'free',
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    install_count INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_templates_category ON agent_templates(category);
CREATE INDEX IF NOT EXISTS idx_agent_templates_tier ON agent_templates(tier_required);

-- Sessions tracking table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    jti VARCHAR(64) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_jti ON user_sessions(jti);
