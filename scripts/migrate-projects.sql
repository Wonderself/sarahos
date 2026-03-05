-- FREENZY.IO v0.12.0 — Migration: projects table for multi-project support
-- Run after init-db.sql and migrate-user-alarms.sql

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_default ON projects(user_id, is_default) WHERE is_default = TRUE;

-- Add project_id (nullable) to tables that should be scoped per project
-- NULL means legacy data, not scoped to any project
ALTER TABLE repondeur_configs ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
ALTER TABLE campaign_posts ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
ALTER TABLE user_alarms ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

-- WhatsApp tables
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'whatsapp_phone_links') THEN
        ALTER TABLE whatsapp_phone_links ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'whatsapp_conversations') THEN
        ALTER TABLE whatsapp_conversations ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
    END IF;
END
$$;

-- Indexes for project-scoped queries
CREATE INDEX IF NOT EXISTS idx_repondeur_project ON repondeur_configs(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activity_project ON activity_log(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_campaigns_project ON campaigns(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_alarms_project ON user_alarms(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_project ON notifications(project_id) WHERE project_id IS NOT NULL;
