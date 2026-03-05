-- FREENZY.IO v0.13.0 — Analytics tables for Studio, Voice, Visio
-- Run: psql -d freenzy -f scripts/migrate-v013-analytics.sql

-- Studio generations tracking
CREATE TABLE IF NOT EXISTS studio_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('video', 'photo')),
    workflow VARCHAR(50) NOT NULL,
    provider VARCHAR(30) NOT NULL DEFAULT 'unknown',
    cost_credits NUMERIC(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'completed'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_studio_gen_user ON studio_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_studio_gen_type ON studio_generations(type);
CREATE INDEX IF NOT EXISTS idx_studio_gen_created ON studio_generations(created_at DESC);

-- Voice & Visio usage tracking
CREATE TABLE IF NOT EXISTS voice_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('tts', 'stt', 'visio')),
    provider VARCHAR(30) NOT NULL DEFAULT 'deepgram',
    agent_id VARCHAR(50),
    duration_sec NUMERIC(10,2) DEFAULT 0,
    cost_credits NUMERIC(10,2) NOT NULL DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_user ON voice_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_type ON voice_usage(type);
CREATE INDEX IF NOT EXISTS idx_voice_created ON voice_usage(created_at DESC);
