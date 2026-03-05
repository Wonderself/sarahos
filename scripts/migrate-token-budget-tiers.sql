-- ═══════════════════════════════════════════════════════════════════
-- Token Budget Tiers — Proportional limits based on credit balance
-- ═══════════════════════════════════════════════════════════════════

-- Admin-adjustable multiplier per user (1.0 = standard, 2.0 = double limits)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'token_budget_multiplier') THEN
    ALTER TABLE users ADD COLUMN token_budget_multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.0;
  END IF;
END $$;

COMMENT ON COLUMN users.token_budget_multiplier IS 'Multiplier for token budget limits (1.0 = standard). Admin-adjustable.';
