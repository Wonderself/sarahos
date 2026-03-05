-- Migration: user_feature_flags table
-- Admin can toggle features per individual user

CREATE TABLE IF NOT EXISTS user_feature_flags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  enabled     BOOLEAN NOT NULL DEFAULT true,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, feature_name)
);

CREATE INDEX IF NOT EXISTS idx_user_feature_flags_user ON user_feature_flags (user_id);

-- Default features (can be seeded per user as needed)
-- Features: studio, visio, documents, repondeur, personal_agents, marketplace, reveil, formations, video_pro, social
