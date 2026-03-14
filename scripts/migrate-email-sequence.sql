-- ═══════════════════════════════════════════════════════════════
-- Freenzy.io — Email Sequence & Notification Preferences Migration
-- Run: docker exec <pg_container> psql -U freenzy -d freenzy -f -
-- ═══════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────
-- 1. email_sequence_log (replace old 3-step version)
--    Tracks full onboarding sequence: j0..j30
-- ─────────────────────────────────────────────────
DROP TABLE IF EXISTS email_sequence_log;

CREATE TABLE email_sequence_log (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email_step      VARCHAR(10) NOT NULL CHECK (email_step IN ('j0', 'j2', 'j5', 'j10', 'j15', 'j21', 'j30')),
    scheduled_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at         TIMESTAMPTZ,
    channel         VARCHAR(20) NOT NULL DEFAULT 'telegram' CHECK (channel IN ('telegram', 'email', 'whatsapp')),
    status          VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
    error_message   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_email_sequence_user_step_channel UNIQUE (user_id, email_step, channel)
);

CREATE INDEX idx_email_seq_user_id ON email_sequence_log(user_id);
CREATE INDEX idx_email_seq_status ON email_sequence_log(status);
CREATE INDEX idx_email_seq_scheduled ON email_sequence_log(scheduled_at);

-- ─────────────────────────────────────────────────
-- 2. user_notification_preferences
--    Configurable automated reports per user
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(30) NOT NULL CHECK (type IN (
                        'competitive_watch',
                        'news_digest',
                        'review_monitor',
                        'seo_tracker',
                        'social_media_digest',
                        'financial_summary',
                        'custom'
                    )),
    config          JSONB NOT NULL DEFAULT '{}',
    -- config examples per type:
    -- competitive_watch:   {"keywords": ["concurrent"], "companies": ["ACME"], "frequency": "daily"}
    -- news_digest:         {"topics": ["AI", "SaaS"], "sources": ["techcrunch"], "frequency": "daily"}
    -- review_monitor:      {"brands": ["Freenzy"], "platforms": ["google", "trustpilot"], "frequency": "daily"}
    -- seo_tracker:         {"keywords": ["freenzy crm"], "domain": "freenzy.io", "frequency": "weekly"}
    -- social_media_digest: {"accounts": ["@freenzy"], "platforms": ["twitter", "linkedin"], "frequency": "daily"}
    -- financial_summary:   {"metrics": ["revenue", "churn", "mrr"], "frequency": "daily"}
    -- custom:              {"keywords": ["mot-cle"], "sources": [], "frequency": "daily"}
    channel         VARCHAR(20) NOT NULL DEFAULT 'telegram' CHECK (channel IN ('telegram', 'email')),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_pref_user_id ON user_notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_pref_active ON user_notification_preferences(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_notif_pref_type ON user_notification_preferences(type);

-- ─────────────────────────────────────────────────
-- 3. Auto-update updated_at trigger
-- ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_notification_pref_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notif_pref_updated_at ON user_notification_preferences;
CREATE TRIGGER trg_notif_pref_updated_at
    BEFORE UPDATE ON user_notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_pref_updated_at();

COMMIT;
