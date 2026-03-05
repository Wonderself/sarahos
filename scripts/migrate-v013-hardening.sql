-- =====================================================================
-- FREENZY.IO v0.13 — Hardening Migration
-- Performance indexes, FK cascades for GDPR, balance safety constraint
-- =====================================================================

-- ── 1. Composite Indexes for Common Query Patterns ──

-- wallet_transactions: frequently queried by user + ordered by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wtx_user_created
  ON wallet_transactions(user_id, created_at DESC);

-- wallet_transactions: frequently queried by wallet + ordered by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wtx_wallet_created
  ON wallet_transactions(wallet_id, created_at DESC);

-- notifications: queried by user + type + recent date (low balance alerts dedup)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_type_created
  ON notifications(user_id, type, created_at);

-- llm_usage_log: queried by user + date range (usage summaries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_llm_usage_user_created
  ON llm_usage_log(user_id, created_at);

-- referrals: queried by referred_id (lookup during registration)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referrals_referred
  ON referrals(referred_id);

-- cron_history: queried by job_name + status (last successful run check)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cron_history_job_status
  ON cron_history(job_name, status);

-- ── 2. Balance Safety Constraint ──
-- Prevents negative balance at the database level (safety net for race conditions)
ALTER TABLE wallets ADD CONSTRAINT chk_balance_nonnegative CHECK (balance_credits >= 0);

-- ── 3. FK Cascade Updates for GDPR User Deletion Support ──
-- These allow DELETE FROM users WHERE id = $1 to cascade cleanly.

-- wallets -> CASCADE on user deletion
ALTER TABLE wallets DROP CONSTRAINT IF EXISTS wallets_user_id_fkey;
ALTER TABLE wallets ADD CONSTRAINT wallets_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- wallet_transactions -> CASCADE on user deletion
ALTER TABLE wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_user_id_fkey;
ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- wallet_transactions -> CASCADE on wallet deletion (cascades from user)
ALTER TABLE wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_wallet_id_fkey;
ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_wallet_id_fkey
  FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE;

-- llm_usage_log -> CASCADE on user deletion
ALTER TABLE llm_usage_log DROP CONSTRAINT IF EXISTS llm_usage_log_user_id_fkey;
ALTER TABLE llm_usage_log ADD CONSTRAINT llm_usage_log_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- llm_usage_log -> CASCADE on wallet deletion
ALTER TABLE llm_usage_log DROP CONSTRAINT IF EXISTS llm_usage_log_wallet_id_fkey;
ALTER TABLE llm_usage_log ADD CONSTRAINT llm_usage_log_wallet_id_fkey
  FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE SET NULL;

-- notifications -> CASCADE on user deletion
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- campaigns -> CASCADE on user deletion
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_user_id_fkey;
ALTER TABLE campaigns ADD CONSTRAINT campaigns_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- campaign_posts -> CASCADE on user deletion
ALTER TABLE campaign_posts DROP CONSTRAINT IF EXISTS campaign_posts_user_id_fkey;
ALTER TABLE campaign_posts ADD CONSTRAINT campaign_posts_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- referrals -> CASCADE on user deletion (both sides)
ALTER TABLE referrals DROP CONSTRAINT IF EXISTS referrals_referrer_id_fkey;
ALTER TABLE referrals ADD CONSTRAINT referrals_referrer_id_fkey
  FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE referrals DROP CONSTRAINT IF EXISTS referrals_referred_id_fkey;
ALTER TABLE referrals ADD CONSTRAINT referrals_referred_id_fkey
  FOREIGN KEY (referred_id) REFERENCES users(id) ON DELETE CASCADE;

-- ── 4. Update cron_history status constraint to include 'success' ──
-- The code writes 'success'/'error' but the constraint says 'started'/'completed'/'failed'
ALTER TABLE cron_history DROP CONSTRAINT IF EXISTS cron_history_status_check;
ALTER TABLE cron_history ADD CONSTRAINT cron_history_status_check
  CHECK (status IN ('started', 'completed', 'failed', 'success', 'error'));
