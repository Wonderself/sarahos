-- Migration: Row-Level Security policies for tenant isolation
-- Date: 2026-03-15
-- Description: Enables RLS on all user data tables and creates per-user access policies
-- Requires: PostgreSQL 16+
-- Usage: SET app.current_user_id = '<uuid>' before queries (done by isolation middleware)

-- ─── Roles ──────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'freenzy_admin') THEN
    CREATE ROLE freenzy_admin WITH LOGIN BYPASSRLS;
    RAISE NOTICE 'Created role freenzy_admin (BYPASSRLS)';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'freenzy_app') THEN
    CREATE ROLE freenzy_app WITH LOGIN;
    RAISE NOTICE 'Created role freenzy_app (subject to RLS)';
  END IF;
END
$$;

-- Grant freenzy_app basic table access (SELECT/INSERT/UPDATE/DELETE)
-- RLS policies will restrict which rows are visible
GRANT USAGE ON SCHEMA public TO freenzy_app;
GRANT USAGE ON SCHEMA public TO freenzy_admin;

-- ─── Helper: set default for app.current_user_id ───────────────────────────────
-- Prevents errors when current_setting is called without a prior SET
ALTER DATABASE freenzy SET app.current_user_id = '00000000-0000-0000-0000-000000000000';

-- ─── Tables with user_id column ─────────────────────────────────────────────────

-- 1. user_profiles (PK = id, also has user_id — match on id for self-access)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_profiles_select_own ON user_profiles;
CREATE POLICY user_profiles_select_own ON user_profiles
  FOR SELECT
  USING (id = current_setting('app.current_user_id', true)::uuid);

DROP POLICY IF EXISTS user_profiles_update_own ON user_profiles;
CREATE POLICY user_profiles_update_own ON user_profiles
  FOR UPDATE
  USING (id = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK (id = current_setting('app.current_user_id', true)::uuid);

-- 2. business_info
ALTER TABLE business_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_info FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS business_info_select_own ON business_info;
CREATE POLICY business_info_select_own ON business_info
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

DROP POLICY IF EXISTS business_info_update_own ON business_info;
CREATE POLICY business_info_update_own ON business_info
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

DROP POLICY IF EXISTS business_info_insert_own ON business_info;
CREATE POLICY business_info_insert_own ON business_info
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- 3. quiz_answers
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS quiz_answers_select_own ON quiz_answers;
CREATE POLICY quiz_answers_select_own ON quiz_answers
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

DROP POLICY IF EXISTS quiz_answers_update_own ON quiz_answers;
CREATE POLICY quiz_answers_update_own ON quiz_answers
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

DROP POLICY IF EXISTS quiz_answers_insert_own ON quiz_answers;
CREATE POLICY quiz_answers_insert_own ON quiz_answers
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- 4. approval_queue
ALTER TABLE approval_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_queue FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS approval_queue_select_own ON approval_queue;
CREATE POLICY approval_queue_select_own ON approval_queue
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

DROP POLICY IF EXISTS approval_queue_update_own ON approval_queue;
CREATE POLICY approval_queue_update_own ON approval_queue
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

DROP POLICY IF EXISTS approval_queue_insert_own ON approval_queue;
CREATE POLICY approval_queue_insert_own ON approval_queue
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- 5. email_sequence_log
ALTER TABLE email_sequence_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequence_log FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS email_sequence_log_select_own ON email_sequence_log;
CREATE POLICY email_sequence_log_select_own ON email_sequence_log
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

DROP POLICY IF EXISTS email_sequence_log_update_own ON email_sequence_log;
CREATE POLICY email_sequence_log_update_own ON email_sequence_log
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- 6. cron_logs (admin-only — no user_id, restrict all non-admin access)
ALTER TABLE cron_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cron_logs FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cron_logs_admin_only ON cron_logs;
CREATE POLICY cron_logs_admin_only ON cron_logs
  FOR ALL
  USING (false);
-- Admin access via freenzy_admin role (BYPASSRLS)

-- 7. credit_transactions
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS credit_transactions_select_own ON credit_transactions;
CREATE POLICY credit_transactions_select_own ON credit_transactions
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

DROP POLICY IF EXISTS credit_transactions_insert_own ON credit_transactions;
CREATE POLICY credit_transactions_insert_own ON credit_transactions
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- credit_transactions should be append-only (no UPDATE/DELETE for users)

-- 8. agent_usage_logs
ALTER TABLE agent_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_usage_logs FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS agent_usage_logs_select_own ON agent_usage_logs;
CREATE POLICY agent_usage_logs_select_own ON agent_usage_logs
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

DROP POLICY IF EXISTS agent_usage_logs_insert_own ON agent_usage_logs;
CREATE POLICY agent_usage_logs_insert_own ON agent_usage_logs
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- 9. notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notifications_select_own ON notifications;
CREATE POLICY notifications_select_own ON notifications
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

DROP POLICY IF EXISTS notifications_update_own ON notifications;
CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

DROP POLICY IF EXISTS notifications_insert_own ON notifications;
CREATE POLICY notifications_insert_own ON notifications
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

DROP POLICY IF EXISTS notifications_delete_own ON notifications;
CREATE POLICY notifications_delete_own ON notifications
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

-- 10. conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conversations_select_own ON conversations;
CREATE POLICY conversations_select_own ON conversations
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

DROP POLICY IF EXISTS conversations_update_own ON conversations;
CREATE POLICY conversations_update_own ON conversations
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

DROP POLICY IF EXISTS conversations_insert_own ON conversations;
CREATE POLICY conversations_insert_own ON conversations
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

DROP POLICY IF EXISTS conversations_delete_own ON conversations;
CREATE POLICY conversations_delete_own ON conversations
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

-- 11. user_approval_settings
ALTER TABLE user_approval_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_approval_settings FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_approval_settings_select_own ON user_approval_settings;
CREATE POLICY user_approval_settings_select_own ON user_approval_settings
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

DROP POLICY IF EXISTS user_approval_settings_update_own ON user_approval_settings;
CREATE POLICY user_approval_settings_update_own ON user_approval_settings
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

DROP POLICY IF EXISTS user_approval_settings_insert_own ON user_approval_settings;
CREATE POLICY user_approval_settings_insert_own ON user_approval_settings
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- 12. product_improvements
ALTER TABLE product_improvements ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_improvements FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_improvements_select_own ON product_improvements;
CREATE POLICY product_improvements_select_own ON product_improvements
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

DROP POLICY IF EXISTS product_improvements_update_own ON product_improvements;
CREATE POLICY product_improvements_update_own ON product_improvements
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

DROP POLICY IF EXISTS product_improvements_insert_own ON product_improvements;
CREATE POLICY product_improvements_insert_own ON product_improvements
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- ─── Table grants for freenzy_app ───────────────────────────────────────────────

GRANT SELECT, INSERT, UPDATE ON user_profiles TO freenzy_app;
GRANT SELECT, INSERT, UPDATE ON business_info TO freenzy_app;
GRANT SELECT, INSERT, UPDATE ON quiz_answers TO freenzy_app;
GRANT SELECT, INSERT, UPDATE ON approval_queue TO freenzy_app;
GRANT SELECT, UPDATE ON email_sequence_log TO freenzy_app;
-- cron_logs: no grant to freenzy_app (admin-only via BYPASSRLS)
GRANT SELECT, INSERT ON credit_transactions TO freenzy_app;
GRANT SELECT, INSERT ON agent_usage_logs TO freenzy_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO freenzy_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON conversations TO freenzy_app;
GRANT SELECT, INSERT, UPDATE ON user_approval_settings TO freenzy_app;
GRANT SELECT, INSERT, UPDATE ON product_improvements TO freenzy_app;

-- ─── Full access for freenzy_admin ──────────────────────────────────────────────

GRANT ALL ON ALL TABLES IN SCHEMA public TO freenzy_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO freenzy_admin;

-- ─── Verification ───────────────────────────────────────────────────────────────

DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'user_profiles', 'business_info', 'quiz_answers', 'approval_queue',
    'email_sequence_log', 'cron_logs', 'credit_transactions', 'agent_usage_logs',
    'notifications', 'conversations', 'user_approval_settings', 'product_improvements'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_tables
      WHERE tablename = tbl AND rowsecurity = true
    ) THEN
      RAISE WARNING 'RLS NOT enabled on table: %', tbl;
    ELSE
      RAISE NOTICE 'RLS verified on table: %', tbl;
    END IF;
  END LOOP;
END
$$;
