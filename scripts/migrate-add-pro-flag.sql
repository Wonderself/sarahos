-- Migration: Add is_pro flag to user_preferences
-- v0.14.x — Sidebar customization + MON ENTREPRISE section

ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT false;

COMMENT ON COLUMN user_preferences.is_pro IS 'True if user has activated the enterprise/pro account type (unlocks MON ENTREPRISE sidebar section)';
