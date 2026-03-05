-- ═══════════════════════════════════════════════════
-- Freenzy.io — Studio fal.ai Migration
-- Tables: studio_generations + studio_model_config
-- ═══════════════════════════════════════════════════

-- Historique de toutes les générations (admin test + client futures)
CREATE TABLE IF NOT EXISTS studio_generations (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID         REFERENCES users(id) ON DELETE SET NULL,
  type           VARCHAR(10)  NOT NULL CHECK (type IN ('photo', 'video')),
  model          VARCHAR(150) NOT NULL,
  workflow       VARCHAR(100),
  prompt         TEXT,
  style          VARCHAR(100),
  dimensions     VARCHAR(50),
  result_url     TEXT,
  status         VARCHAR(20)  DEFAULT 'pending',
  cost           INTEGER      DEFAULT 0,
  duration_ms    INTEGER,
  fal_request_id VARCHAR(255),
  meta           JSONB        DEFAULT '{}',
  created_at     TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_studio_gen_user    ON studio_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_studio_gen_type    ON studio_generations(type);
CREATE INDEX IF NOT EXISTS idx_studio_gen_created ON studio_generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_studio_gen_status  ON studio_generations(status);

-- Configuration des modèles fal.ai (gérable par l'admin)
CREATE TABLE IF NOT EXISTS studio_model_config (
  model_id   VARCHAR(150) PRIMARY KEY,
  type       VARCHAR(10)  NOT NULL CHECK (type IN ('photo', 'video')),
  label      VARCHAR(200) NOT NULL,
  credits    INTEGER      NOT NULL,
  enabled    BOOLEAN      DEFAULT FALSE,
  updated_at TIMESTAMPTZ  DEFAULT NOW(),
  updated_by UUID         REFERENCES users(id)
);

-- Seed des modèles fal.ai connus
INSERT INTO studio_model_config (model_id, type, label, credits, enabled) VALUES
  ('fal-ai/flux/schnell',                             'photo', 'Flux Schnell (rapide, 4 steps)',    8,  true),
  ('fal-ai/flux/dev',                                 'photo', 'Flux Dev (HD, 28 steps)',           12, true),
  ('fal-ai/flux-pro',                                 'photo', 'Flux Pro (qualité maximale)',        15, false),
  ('fal-ai/flux-realism',                             'photo', 'Flux Realism (photoréaliste)',       10, false),
  ('fal-ai/recraft-v3',                               'photo', 'Recraft v3 (design & vectoriel)',    12, false),
  ('fal-ai/stable-diffusion-3.5-large',               'photo', 'Stable Diffusion 3.5 Large',        10, false),
  ('fal-ai/ltx-video',                                'video', 'LTX Video (~4s, open-source)',       20, true),
  ('fal-ai/kling-video/v1.6/standard/text-to-video',  'video', 'Kling Video 1.6 (HD)',              35, false),
  ('fal-ai/wan-t2v',                                  'video', 'Wan 2.1 Text-to-Video',             25, false)
ON CONFLICT (model_id) DO NOTHING;
