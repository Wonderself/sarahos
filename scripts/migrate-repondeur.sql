-- ═══════════════════════════════════════════════════════
-- Repondeur Agent — Database Schema
-- Run after init-db.sql
-- ═══════════════════════════════════════════════════════

-- ── Repondeur Configuration (per-user singleton) ──
CREATE TABLE IF NOT EXISTS repondeur_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    active_mode VARCHAR(30) NOT NULL DEFAULT 'professional'
        CHECK (active_mode IN (
            'professional', 'family_humor', 'order_taking',
            'emergency', 'concierge', 'support_technique', 'qualification'
        )),
    active_style VARCHAR(30) NOT NULL DEFAULT 'friendly_professional'
        CHECK (active_style IN (
            'formal_corporate', 'friendly_professional', 'casual_fun',
            'minimalist', 'luxe_concierge', 'tech_startup', 'medical_cabinet'
        )),
    active_skills TEXT[] NOT NULL DEFAULT ARRAY['message_taking', 'vip_detection'],
    persona VARCHAR(20) NOT NULL DEFAULT 'sarah'
        CHECK (persona IN ('sarah', 'emmanuel')),
    custom_instructions TEXT,
    greeting_message TEXT,
    absence_message TEXT,
    boss_phone_number VARCHAR(20),
    boss_user_id UUID REFERENCES users(id),
    summary_frequency VARCHAR(20) NOT NULL DEFAULT 'daily'
        CHECK (summary_frequency IN ('realtime', 'hourly', 'daily', 'manual')),
    summary_delivery_channel VARCHAR(20) NOT NULL DEFAULT 'whatsapp'
        CHECK (summary_delivery_channel IN ('whatsapp', 'sms', 'email', 'in_app')),
    blocked_contacts TEXT[] NOT NULL DEFAULT '{}',
    vip_contacts JSONB NOT NULL DEFAULT '[]',
    faq_entries JSONB NOT NULL DEFAULT '[]',
    schedule JSONB NOT NULL DEFAULT '{"alwaysOn": true, "timezone": "Europe/Paris", "rules": []}',
    max_response_length INTEGER NOT NULL DEFAULT 500,
    language VARCHAR(10) NOT NULL DEFAULT 'fr',
    gdpr_retention_days INTEGER NOT NULL DEFAULT 90,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_repondeur_config_user ON repondeur_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_repondeur_config_active ON repondeur_configs(is_active);

-- ── Repondeur Message Log ──
CREATE TABLE IF NOT EXISTS repondeur_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_id UUID NOT NULL REFERENCES repondeur_configs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    sender_phone VARCHAR(20) NOT NULL,
    sender_name VARCHAR(200),
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    content TEXT NOT NULL,
    mode_used VARCHAR(30) NOT NULL,
    style_used VARCHAR(30) NOT NULL,
    classification VARCHAR(30) NOT NULL DEFAULT 'general'
        CHECK (classification IN (
            'general', 'urgent', 'vip', 'order', 'complaint',
            'appointment', 'faq', 'family', 'spam', 'blocked'
        )),
    priority VARCHAR(10) NOT NULL DEFAULT 'normal'
        CHECK (priority IN ('low', 'normal', 'high', 'urgent', 'critical')),
    sentiment VARCHAR(20) DEFAULT 'neutral'
        CHECK (sentiment IN ('positive', 'neutral', 'negative', 'angry', 'confused')),
    entities_extracted JSONB NOT NULL DEFAULT '{}',
    skills_triggered TEXT[] NOT NULL DEFAULT '{}',
    tokens_used INTEGER DEFAULT 0,
    billed_credits BIGINT DEFAULT 0,
    included_in_summary_id UUID,
    wa_message_id VARCHAR(200),
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_repondeur_msg_config ON repondeur_messages(config_id);
CREATE INDEX IF NOT EXISTS idx_repondeur_msg_user ON repondeur_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_repondeur_msg_sender ON repondeur_messages(sender_phone);
CREATE INDEX IF NOT EXISTS idx_repondeur_msg_classification ON repondeur_messages(classification);
CREATE INDEX IF NOT EXISTS idx_repondeur_msg_priority ON repondeur_messages(priority);
CREATE INDEX IF NOT EXISTS idx_repondeur_msg_created ON repondeur_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_repondeur_msg_unsummarized ON repondeur_messages(included_in_summary_id)
    WHERE included_in_summary_id IS NULL;

-- ── Repondeur Order Captures ──
CREATE TABLE IF NOT EXISTS repondeur_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_id UUID NOT NULL REFERENCES repondeur_configs(id) ON DELETE CASCADE,
    message_id UUID NOT NULL REFERENCES repondeur_messages(id),
    customer_phone VARCHAR(20) NOT NULL,
    customer_name VARCHAR(200),
    order_items JSONB NOT NULL DEFAULT '[]',
    order_total_cents BIGINT,
    currency VARCHAR(3) DEFAULT 'EUR',
    delivery_address TEXT,
    delivery_notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    confirmed_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_repondeur_orders_config ON repondeur_orders(config_id);
CREATE INDEX IF NOT EXISTS idx_repondeur_orders_status ON repondeur_orders(status);

-- ── Repondeur Summaries ──
CREATE TABLE IF NOT EXISTS repondeur_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_id UUID NOT NULL REFERENCES repondeur_configs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    summary_type VARCHAR(20) NOT NULL DEFAULT 'daily'
        CHECK (summary_type IN ('realtime', 'hourly', 'daily', 'manual')),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    total_messages INTEGER NOT NULL DEFAULT 0,
    urgent_count INTEGER NOT NULL DEFAULT 0,
    vip_count INTEGER NOT NULL DEFAULT 0,
    order_count INTEGER NOT NULL DEFAULT 0,
    complaint_count INTEGER NOT NULL DEFAULT 0,
    summary_text TEXT NOT NULL,
    summary_structured JSONB NOT NULL DEFAULT '{}',
    delivery_channel VARCHAR(20) NOT NULL,
    delivery_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed')),
    external_message_id VARCHAR(200),
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_repondeur_summary_config ON repondeur_summaries(config_id);
CREATE INDEX IF NOT EXISTS idx_repondeur_summary_period ON repondeur_summaries(period_start, period_end);

-- ── Repondeur Schedule Rules ──
CREATE TABLE IF NOT EXISTS repondeur_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_id UUID NOT NULL REFERENCES repondeur_configs(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_repondeur_schedule_config ON repondeur_schedules(config_id);
