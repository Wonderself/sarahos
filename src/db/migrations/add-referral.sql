-- Migration: Referral / Parrainage system
-- Run: psql -U freenzy -d freenzy -f src/db/migrations/add-referral.sql

BEGIN;

-- ─── Table ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referrals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  referral_code   VARCHAR(20) NOT NULL UNIQUE,
  referred_email  VARCHAR(255),
  status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'registered', 'activated', 'rewarded')),
  reward_referrer INT NOT NULL DEFAULT 20,
  reward_referred INT NOT NULL DEFAULT 20,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activated_at    TIMESTAMPTZ
);

-- ─── Indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals (referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals (referrer_id);

-- ─── RLS ────────────────────────────────────────────────────
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Each user can only see their own referrals (as referrer)
DROP POLICY IF EXISTS referrals_owner_policy ON referrals;
CREATE POLICY referrals_owner_policy ON referrals
  FOR ALL
  USING (referrer_id = current_setting('app.current_user_id')::UUID);

-- Allow inserts where the referrer_id matches the current user
DROP POLICY IF EXISTS referrals_insert_policy ON referrals;
CREATE POLICY referrals_insert_policy ON referrals
  FOR INSERT
  WITH CHECK (referrer_id = current_setting('app.current_user_id')::UUID);

COMMIT;
