-- FREENZY.IO v0.12.0 — Migration: user_alarms table for Réveil Intelligent
-- Run after init-db.sql

CREATE TABLE IF NOT EXISTS user_alarms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL DEFAULT 'Mon réveil',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    alarm_time TIME NOT NULL DEFAULT '07:00',
    timezone VARCHAR(50) NOT NULL DEFAULT 'Europe/Paris',
    days_of_week INTEGER[] NOT NULL DEFAULT ARRAY[1,2,3,4,5],
    mode VARCHAR(30) NOT NULL DEFAULT 'doux'
        CHECK (mode IN ('doux', 'dur', 'sympa', 'drole', 'fou', 'motivant', 'zen', 'energique')),
    rubrics JSONB NOT NULL DEFAULT '["bonne_humeur", "meteo", "citation"]',
    voice VARCHAR(50) NOT NULL DEFAULT 'sarah',
    delivery_method VARCHAR(20) NOT NULL DEFAULT 'phone_call'
        CHECK (delivery_method IN ('phone_call', 'whatsapp_message')),
    phone_number VARCHAR(20),
    custom_announcement TEXT,
    birth_date DATE,
    last_triggered_at TIMESTAMPTZ,
    last_trigger_status VARCHAR(20) DEFAULT 'pending'
        CHECK (last_trigger_status IN ('pending', 'triggered', 'delivered', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_alarms_user ON user_alarms(user_id);
CREATE INDEX IF NOT EXISTS idx_user_alarms_active ON user_alarms(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_alarms_time ON user_alarms(alarm_time);
