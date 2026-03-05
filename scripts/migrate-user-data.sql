-- FREENZY.IO v0.13.0 — Migration: user_data key-value store
-- Replaces localStorage with DB-backed per-user data persistence
-- Run: psql -U freenzy -d freenzy -f scripts/migrate-user-data.sql

CREATE TABLE IF NOT EXISTS user_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    namespace VARCHAR(50) NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, namespace)
);

CREATE INDEX IF NOT EXISTS idx_user_data_user ON user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_user_ns ON user_data(user_id, namespace);
