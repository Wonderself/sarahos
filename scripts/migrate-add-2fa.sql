-- Migration: Add 2FA TOTP columns to users table
-- Run once in production

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS totp_secret    TEXT,
  ADD COLUMN IF NOT EXISTS totp_enabled   BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS totp_backup_codes TEXT[];

-- Agent runtime config table
CREATE TABLE IF NOT EXISTS agent_runtime_config (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id      TEXT NOT NULL UNIQUE,
  temperature   NUMERIC(3,2) NOT NULL DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 1),
  max_tokens    INTEGER NOT NULL DEFAULT 4096,
  system_prompt TEXT,
  model         TEXT NOT NULL DEFAULT 'claude-sonnet-4-6',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by    TEXT
);

COMMENT ON TABLE agent_runtime_config IS 'Admin-editable runtime configuration for each AI agent';
