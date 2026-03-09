-- Email Sequence Tracking
-- Tracks which onboarding emails (J+0/J+2/J+5) have been sent to each user

CREATE TABLE IF NOT EXISTS email_sequence_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step        VARCHAR(10) NOT NULL CHECK (step IN ('j0', 'j2', 'j5')),
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, step)
);

CREATE INDEX IF NOT EXISTS idx_email_sequence_user ON email_sequence_log(user_id);
CREATE INDEX IF NOT EXISTS idx_email_sequence_step ON email_sequence_log(step);
