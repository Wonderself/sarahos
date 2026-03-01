-- ═══════════════════════════════════════════════════════
-- SARAH OS — Migration: Add email/password auth columns
-- Run after init-db.sql
-- ═══════════════════════════════════════════════════════

-- Password hash (scrypt)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Email confirmation
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_confirm_token VARCHAR(64);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_confirm_expires TIMESTAMPTZ;

-- Password reset
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(64);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ;

-- Indexes for token lookups
CREATE INDEX IF NOT EXISTS idx_users_email_confirm_token ON users(email_confirm_token) WHERE email_confirm_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token) WHERE password_reset_token IS NOT NULL;
