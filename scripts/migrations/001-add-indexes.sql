-- ═══════════════════════════════════════════════════════
-- SARAH OS — Migration 001: Performance Indexes
-- ═══════════════════════════════════════════════════════
-- Adds indexes for frequently queried columns to improve
-- read performance across core tables.
-- ═══════════════════════════════════════════════════════

-- ── Users ──
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ── Wallets ──
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallets_user_id_unique ON wallets(user_id);

-- ── Transactions ──
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- ── Notifications ──
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ── Usage Events ──
CREATE INDEX IF NOT EXISTS idx_usage_events_user_id ON usage_events(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_event ON usage_events(event);
CREATE INDEX IF NOT EXISTS idx_usage_events_created_at ON usage_events(created_at DESC);

-- ── Referrals ──
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(code);

-- ── Wallet Balance Constraint ──
ALTER TABLE wallets ADD CONSTRAINT IF NOT EXISTS positive_balance CHECK (balance_credits >= 0);
