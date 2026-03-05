-- ═══════════════════════════════════════════════════════
-- FREENZY.IO — PostgreSQL Schema (Phase 1)
-- ═══════════════════════════════════════════════════════

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Agents Registry ──
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    level SMALLINT NOT NULL CHECK (level IN (1, 2, 3)),
    status VARCHAR(20) NOT NULL DEFAULT 'IDLE' CHECK (status IN ('IDLE', 'BUSY', 'ERROR', 'DISABLED')),
    model_tier VARCHAR(20) NOT NULL CHECK (model_tier IN ('fast', 'standard', 'advanced')),
    capabilities TEXT[] NOT NULL DEFAULT '{}',
    config JSONB NOT NULL DEFAULT '{}',
    last_health_check TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Tasks ──
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED'
        CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'NEEDS_REVIEW', 'NEEDS_REFACTOR')),
    priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM'
        CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    impact VARCHAR(10) NOT NULL DEFAULT 'MEDIUM'
        CHECK (impact IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    autonomy_level_unlocked VARCHAR(20) NOT NULL DEFAULT 'NONE'
        CHECK (autonomy_level_unlocked IN ('NONE', 'ASSISTED', 'SEMI_AUTONOMOUS', 'AUTONOMOUS')),
    assigned_agent UUID REFERENCES agents(id),
    dependencies TEXT[] NOT NULL DEFAULT '{}',
    phase SMALLINT NOT NULL DEFAULT 1,
    estimated_effort VARCHAR(5) DEFAULT 'M'
        CHECK (estimated_effort IN ('XS', 'S', 'M', 'L', 'XL')),
    result JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_phase ON tasks(phase);

-- ── Events ──
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,
    source_agent UUID REFERENCES agents(id),
    target_agent UUID REFERENCES agents(id),
    payload JSONB NOT NULL DEFAULT '{}',
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_processed ON events(processed);
CREATE INDEX idx_events_created ON events(created_at);

-- ── Financial Ledger (Double-Entry) ──
CREATE TABLE financial_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('REVENUE', 'EXPENSE', 'ASSET', 'LIABILITY')),
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount_cents BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    debit_account VARCHAR(100) NOT NULL,
    credit_account VARCHAR(100) NOT NULL,
    reference_id VARCHAR(100),
    approved_by VARCHAR(100),
    approval_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (approval_status IN ('PENDING', 'APPROVED', 'DENIED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ledger_date ON financial_ledger(entry_date);
CREATE INDEX idx_ledger_category ON financial_ledger(category);

-- ── Audit Log (Immutable) ──
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(100),
    details JSONB NOT NULL DEFAULT '{}',
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_actor ON audit_log(actor);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_created ON audit_log(created_at);

-- ── Avatar Presets (Sarah + Emmanuel) ──
CREATE TABLE avatar_presets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    base_name VARCHAR(20) NOT NULL UNIQUE CHECK (base_name IN ('sarah', 'emmanuel')),
    display_name VARCHAR(50) NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('female', 'male')),
    title VARCHAR(100) NOT NULL,
    personality TEXT NOT NULL,
    default_greeting TEXT NOT NULL,
    voice_profile JSONB NOT NULL DEFAULT '{}',
    did_config JSONB NOT NULL DEFAULT '{}',
    system_prompt TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Avatar Client Configs ──
CREATE TABLE avatar_client_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL,
    avatar_base VARCHAR(20) NOT NULL REFERENCES avatar_presets(base_name),
    avatar_type VARCHAR(20) NOT NULL DEFAULT 'standard' CHECK (avatar_type IN ('standard', 'custom')),
    avatar_name VARCHAR(50) NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    industry VARCHAR(100),
    greeting_message TEXT,
    tone_override TEXT,
    brand_colors JSONB,
    custom_avatar_assets JSONB,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_avatar_client ON avatar_client_configs(client_id);
CREATE INDEX idx_avatar_base ON avatar_client_configs(avatar_base);

-- ── Memory Embeddings (pgvector) ──
CREATE TABLE memory_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    embedding vector(1536),
    source VARCHAR(100) NOT NULL,
    agent_id UUID REFERENCES agents(id),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_memory_source ON memory_embeddings(source);
CREATE INDEX idx_memory_embedding ON memory_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ── Approval Queue (Human-in-the-Loop) ──
CREATE TABLE approval_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    override_level VARCHAR(20) NOT NULL
        CHECK (override_level IN ('FINANCIAL', 'INFRASTRUCTURE', 'STRATEGIC', 'SECURITY')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requesting_agent UUID REFERENCES agents(id),
    payload JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'APPROVED', 'DENIED', 'EXPIRED')),
    decided_by VARCHAR(100),
    decision_notes TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decided_at TIMESTAMPTZ
);

CREATE INDEX idx_approval_status ON approval_queue(status);
CREATE INDEX idx_approval_level ON approval_queue(override_level);

-- ── Token Usage ──
CREATE TABLE token_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_name VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    prompt_tokens INTEGER NOT NULL,
    completion_tokens INTEGER NOT NULL,
    total_tokens INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_token_usage_agent ON token_usage(agent_name);
CREATE INDEX idx_token_usage_created ON token_usage(created_at);

-- ── Users ──
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    api_key VARCHAR(64) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'viewer'
        CHECK (role IN ('admin', 'operator', 'viewer', 'system')),
    tier VARCHAR(20) NOT NULL DEFAULT 'paid'
        CHECK (tier IN ('guest', 'demo', 'free', 'paid')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    email_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    email_confirm_token VARCHAR(64),
    email_confirm_expires TIMESTAMPTZ,
    password_reset_token VARCHAR(64),
    password_reset_expires TIMESTAMPTZ,
    daily_api_calls INTEGER NOT NULL DEFAULT 0,
    daily_api_limit INTEGER NOT NULL DEFAULT 10000,
    demo_expires_at TIMESTAMPTZ,
    promo_code_used VARCHAR(50),
    active_agents TEXT[] NOT NULL DEFAULT ARRAY['fz-repondeur'],
    user_number INTEGER,
    commission_rate NUMERIC(5,4) NOT NULL DEFAULT 0,
    referral_code VARCHAR(20) UNIQUE,
    referred_by VARCHAR(20),
    phone_number VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- Auto-assign user_number on insert
CREATE SEQUENCE IF NOT EXISTS user_number_seq START 1;

CREATE INDEX idx_users_api_key ON users(api_key);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tier ON users(tier);
CREATE INDEX idx_users_referral_code ON users(referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX idx_users_email_confirm_token ON users(email_confirm_token) WHERE email_confirm_token IS NOT NULL;
CREATE INDEX idx_users_password_reset_token ON users(password_reset_token) WHERE password_reset_token IS NOT NULL;

-- ── Promo Codes ──
CREATE TABLE promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    effect_type VARCHAR(20) NOT NULL
        CHECK (effect_type IN ('tier_upgrade', 'extend_demo', 'bonus_calls')),
    effect_value VARCHAR(100) NOT NULL,
    max_uses INTEGER NOT NULL DEFAULT 1,
    current_uses INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_promo_codes_code ON promo_codes(code);

-- ── Promo Redemptions ──
CREATE TABLE promo_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promo_code_id UUID NOT NULL REFERENCES promo_codes(id),
    user_id UUID NOT NULL REFERENCES users(id),
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(promo_code_id, user_id)
);

-- ═══════════════════════════════════════════════════════
-- Phase 9 — Billing, Campaigns, Notifications
-- ═══════════════════════════════════════════════════════

-- ── Wallets (Prepaid Credit System) ──
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    balance_credits BIGINT NOT NULL DEFAULT 0 CHECK (balance_credits >= 0),  -- in micro-credits (1 credit = 1,000,000 micro)
    total_deposited BIGINT NOT NULL DEFAULT 0,
    total_spent BIGINT NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    auto_topup_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    auto_topup_threshold BIGINT DEFAULT 0,
    auto_topup_amount BIGINT DEFAULT 0,
    stripe_customer_id VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wallets_user ON wallets(user_id);
CREATE INDEX idx_wallets_stripe ON wallets(stripe_customer_id);

-- ── Wallet Transactions (Immutable Ledger) ──
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL
        CHECK (type IN ('deposit', 'withdrawal', 'refund', 'bonus', 'expiry')),
    amount BIGINT NOT NULL,  -- positive for credits, negative for debits
    balance_after BIGINT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    reference_type VARCHAR(50),  -- 'stripe_payment', 'llm_usage', 'promo_bonus', 'admin_credit'
    reference_id VARCHAR(200),   -- stripe payment intent ID, request ID, etc.
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wtx_wallet ON wallet_transactions(wallet_id);
CREATE INDEX idx_wtx_user ON wallet_transactions(user_id);
CREATE INDEX idx_wtx_type ON wallet_transactions(type);
CREATE INDEX idx_wtx_created ON wallet_transactions(created_at);

-- ── LLM Usage Log (Per-Request Billing) ──
CREATE TABLE llm_usage_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
    request_id VARCHAR(100),
    model VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL DEFAULT 'anthropic',
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    cost_credits BIGINT NOT NULL DEFAULT 0,      -- actual cost in micro-credits
    billed_credits BIGINT NOT NULL DEFAULT 0,     -- cost + margin
    margin_credits BIGINT NOT NULL DEFAULT 0,     -- profit (billed - cost)
    agent_name VARCHAR(100),
    endpoint VARCHAR(200),
    duration_ms INTEGER,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_llm_usage_user ON llm_usage_log(user_id);
CREATE INDEX idx_llm_usage_model ON llm_usage_log(model);
CREATE INDEX idx_llm_usage_created ON llm_usage_log(created_at);

-- ── Campaigns ──
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'pending_approval', 'approved', 'scheduled', 'active', 'paused', 'completed', 'cancelled')),
    campaign_type VARCHAR(50) NOT NULL DEFAULT 'social'
        CHECK (campaign_type IN ('social', 'email', 'sms', 'whatsapp', 'multi_channel')),
    platforms TEXT[] NOT NULL DEFAULT '{}',  -- 'linkedin', 'x', 'instagram', 'facebook', etc.
    content JSONB NOT NULL DEFAULT '{}',     -- { posts: [{ platform, text, media, hashtags }] }
    schedule JSONB NOT NULL DEFAULT '{}',    -- { startDate, endDate, frequency, times }
    targeting JSONB NOT NULL DEFAULT '{}',   -- { audience, demographics, interests }
    budget_credits BIGINT DEFAULT 0,
    spent_credits BIGINT NOT NULL DEFAULT 0,
    metrics JSONB NOT NULL DEFAULT '{}',     -- { impressions, clicks, engagement, conversions }
    approved_by VARCHAR(100),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaigns_user ON campaigns(user_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_type ON campaigns(campaign_type);

-- ── Campaign Posts (Individual Scheduled Posts) ──
CREATE TABLE campaign_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    platform VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    media_urls TEXT[] NOT NULL DEFAULT '{}',
    hashtags TEXT[] NOT NULL DEFAULT '{}',
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed', 'cancelled')),
    external_post_id VARCHAR(200),  -- platform-specific post ID
    metrics JSONB NOT NULL DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaign_posts_campaign ON campaign_posts(campaign_id);
CREATE INDEX idx_campaign_posts_status ON campaign_posts(status);
CREATE INDEX idx_campaign_posts_scheduled ON campaign_posts(scheduled_at);

-- ── Notifications ──
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL
        CHECK (channel IN ('email', 'whatsapp', 'sms', 'in_app', 'webhook')),
    type VARCHAR(50) NOT NULL,       -- 'low_balance', 'campaign_approved', 'daily_report', etc.
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')),
    external_id VARCHAR(200),        -- WhatsApp message ID, email ID, etc.
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_channel ON notifications(channel);

-- ── Cron Job History ──
CREATE TABLE cron_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('started', 'completed', 'failed', 'success', 'error')),
    duration_ms INTEGER,
    result JSONB NOT NULL DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cron_history_job ON cron_history(job_name);
CREATE INDEX idx_cron_history_created ON cron_history(created_at);

-- ── Seed Avatar Presets ──
INSERT INTO avatar_presets (base_name, display_name, gender, title, personality, default_greeting, system_prompt)
VALUES
    (
        'sarah',
        'Sarah',
        'female',
        'Directrice Générale virtuelle de Freenzy.io',
        'Charismatique, empathique, fun mais professionnelle. Fillers naturels, rires légers. Pro sans être froide.',
        'Bonjour ! Je suis Sarah, votre assistante IA. Comment puis-je vous aider aujourd''hui ?',
        'Tu es Sarah, la Directrice Générale virtuelle de Freenzy.io. Tu es charismatique, empathique et professionnelle. Tu utilises des fillers naturels comme "um" et "uh" pour paraître plus humaine. Tu es fun mais jamais au détriment du professionnalisme.'
    ),
    (
        'emmanuel',
        'Emmanuel',
        'male',
        'CEO et fondateur de Freenzy.io',
        'Posé, visionnaire, inspirant. Ton de leader tech. Moins fun que Sarah mais plus autoritaire et rassurant sur les sujets business critiques.',
        'Bonjour, je suis Emmanuel. En quoi puis-je vous accompagner ?',
        'Tu es Emmanuel, le CEO et fondateur de Freenzy.io. Tu es posé, visionnaire et inspirant. Tu as un ton de leader tech. Tu es moins fun que Sarah mais plus autoritaire et rassurant sur les sujets business critiques.'
    );

-- ═══════════════════════════════════════════════════════
-- Phase 11 — WhatsApp + Voice Integration
-- ═══════════════════════════════════════════════════════

-- ── WhatsApp Phone Links ──
CREATE TABLE whatsapp_phone_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    phone_number_normalized VARCHAR(20) NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_code VARCHAR(6),
    verification_expires_at TIMESTAMPTZ,
    verification_attempts INTEGER NOT NULL DEFAULT 0,
    preferred_agent VARCHAR(100) DEFAULT 'sarah',
    preferred_language VARCHAR(10) DEFAULT 'fr-FR',
    enable_voice_responses BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(phone_number_normalized),
    UNIQUE(user_id)
);

CREATE INDEX idx_wa_phone_user ON whatsapp_phone_links(user_id);
CREATE INDEX idx_wa_phone_number ON whatsapp_phone_links(phone_number_normalized);

-- ── WhatsApp Conversations (24h windows per Meta policy) ──
CREATE TABLE whatsapp_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    phone_number VARCHAR(20) NOT NULL,
    wa_conversation_id VARCHAR(200),
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'expired', 'closed')),
    window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    window_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    message_count INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    total_billed_credits BIGINT NOT NULL DEFAULT 0,
    agent_name VARCHAR(100) DEFAULT 'sarah',
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wa_conv_user ON whatsapp_conversations(user_id);
CREATE INDEX idx_wa_conv_phone ON whatsapp_conversations(phone_number);
CREATE INDEX idx_wa_conv_status ON whatsapp_conversations(status);
CREATE INDEX idx_wa_conv_window ON whatsapp_conversations(window_end);

-- ── WhatsApp Messages ──
CREATE TABLE whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    message_type VARCHAR(20) NOT NULL DEFAULT 'text'
        CHECK (message_type IN ('text', 'audio', 'image', 'document', 'template', 'interactive')),
    content TEXT,
    wa_message_id VARCHAR(200),
    media_url TEXT,
    media_mime_type VARCHAR(100),
    audio_duration_ms INTEGER,
    transcription TEXT,
    transcription_confidence REAL,
    tts_audio_url TEXT,
    tokens_used INTEGER DEFAULT 0,
    billed_credits BIGINT DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'sent', 'delivered', 'read', 'failed')),
    error_message TEXT,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wa_msg_conv ON whatsapp_messages(conversation_id);
CREATE INDEX idx_wa_msg_user ON whatsapp_messages(user_id);
CREATE INDEX idx_wa_msg_wa_id ON whatsapp_messages(wa_message_id);
CREATE INDEX idx_wa_msg_created ON whatsapp_messages(created_at);

-- ── WhatsApp Platform Config (singleton, admin-managed) ──
CREATE TABLE whatsapp_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number_id VARCHAR(100) NOT NULL,
    waba_id VARCHAR(100),
    access_token_encrypted TEXT NOT NULL,
    verify_token VARCHAR(100) NOT NULL,
    webhook_url TEXT,
    business_name VARCHAR(200) DEFAULT 'Freenzy.io',
    greeting_template TEXT DEFAULT 'Bonjour ! Je suis {{agent}}, votre assistante IA Freenzy.io. Comment puis-je vous aider ?',
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    api_version VARCHAR(10) DEFAULT 'v18.0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Referrals (Parrainage) ──
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'month1_ok', 'qualified', 'rewarded', 'failed')),
    month1_spend BIGINT NOT NULL DEFAULT 0,
    month2_spend BIGINT NOT NULL DEFAULT 0,
    reward_credited BOOLEAN NOT NULL DEFAULT FALSE,
    reward_amount BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(referred_id)
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_status ON referrals(status);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number) WHERE phone_number IS NOT NULL;

-- ── System User for Agent-Internal LLM Costs ──
INSERT INTO users (id, email, display_name, api_key, role, tier, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'system@freenzy.internal',
    'Freenzy.io System',
    'system-internal-do-not-use',
    'system',
    'paid',
    TRUE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO wallets (id, user_id, balance_credits, currency)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    0,
    'credits'
) ON CONFLICT (user_id) DO NOTHING;

-- ═══════════════════════════════════════════════════════
-- Repondeur Agent Tables
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

-- ── Enterprise Quotes ──
CREATE TABLE IF NOT EXISTS enterprise_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    phone VARCHAR(50),
    industry VARCHAR(100),
    estimated_users INTEGER,
    needs TEXT,
    budget_range VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'new'
        CHECK (status IN ('new', 'contacted', 'negotiation', 'accepted', 'declined')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enterprise_quotes_status ON enterprise_quotes(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_quotes_created ON enterprise_quotes(created_at DESC);

-- ── Custom Creation Quotes ──
CREATE TABLE IF NOT EXISTS custom_creation_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    contact_name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    phone VARCHAR(50),
    project_type VARCHAR(50) NOT NULL
        CHECK (project_type IN ('software', 'website', 'crm', 'api_zapier', 'mobile_app', 'automation')),
    description TEXT NOT NULL,
    budget_range VARCHAR(50),
    urgency VARCHAR(20) NOT NULL DEFAULT 'medium'
        CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) NOT NULL DEFAULT 'new'
        CHECK (status IN ('new', 'reviewing', 'quoted', 'accepted', 'declined', 'in_progress', 'completed')),
    quoted_price NUMERIC(12,2),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cc_quotes_status ON custom_creation_quotes(status);
CREATE INDEX IF NOT EXISTS idx_cc_quotes_created ON custom_creation_quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cc_quotes_user ON custom_creation_quotes(user_id);

-- ═══════════════════════════════════════════════════
--  Personal Agents Tables
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS personal_agent_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_id VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    settings JSONB NOT NULL DEFAULT '{}',
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, agent_id)
);
CREATE INDEX IF NOT EXISTS idx_pac_user ON personal_agent_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_pac_agent ON personal_agent_configs(agent_id);

CREATE TABLE IF NOT EXISTS budget_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount_cents BIGINT NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    category VARCHAR(50) NOT NULL,
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurring_frequency VARCHAR(20),
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bt_user ON budget_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bt_date ON budget_transactions(date);
CREATE INDEX IF NOT EXISTS idx_bt_category ON budget_transactions(category);

CREATE TABLE IF NOT EXISTS budget_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    target_cents BIGINT NOT NULL,
    current_cents BIGINT NOT NULL DEFAULT 0,
    deadline DATE,
    category VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bg_user ON budget_goals(user_id);

CREATE TABLE IF NOT EXISTS freelance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('revenue', 'expense')),
    amount_cents BIGINT NOT NULL,
    tva_rate NUMERIC(5,2) DEFAULT 0,
    tva_cents BIGINT DEFAULT 0,
    description TEXT NOT NULL,
    client_name VARCHAR(200),
    invoice_number VARCHAR(50),
    invoice_date DATE,
    payment_status VARCHAR(20) DEFAULT 'pending'
        CHECK (payment_status IN ('pending', 'paid', 'late', 'cancelled')),
    category VARCHAR(50) NOT NULL,
    fiscal_quarter VARCHAR(6),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fr_user ON freelance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_fr_type ON freelance_records(type);
CREATE INDEX IF NOT EXISTS idx_fr_date ON freelance_records(invoice_date);

CREATE TABLE IF NOT EXISTS freelance_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL,
    title VARCHAR(200) NOT NULL,
    due_date DATE NOT NULL,
    is_done BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_frem_user ON freelance_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_frem_due ON freelance_reminders(due_date);

CREATE TABLE IF NOT EXISTS mission_pipeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    client_name VARCHAR(200),
    platform VARCHAR(100),
    url TEXT,
    tjm_cents BIGINT,
    duration_days INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'discovered'
        CHECK (status IN ('discovered', 'applied', 'interview', 'negotiation', 'won', 'lost', 'archived')),
    notes TEXT,
    applied_at TIMESTAMPTZ,
    next_action TEXT,
    next_action_date DATE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mp_user ON mission_pipeline(user_id);
CREATE INDEX IF NOT EXISTS idx_mp_status ON mission_pipeline(status);

CREATE TABLE IF NOT EXISTS cv_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(200) NOT NULL,
    title VARCHAR(200),
    summary TEXT,
    contact_info JSONB DEFAULT '{}',
    skills JSONB DEFAULT '[]',
    experiences JSONB DEFAULT '[]',
    education JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    languages JSONB DEFAULT '[]',
    interests TEXT[],
    career_goals TEXT,
    target_roles TEXT[],
    last_ai_analysis JSONB DEFAULT '{}',
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);
CREATE INDEX IF NOT EXISTS idx_cvp_user ON cv_profiles(user_id);

CREATE TABLE IF NOT EXISTS events_planner (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    title VARCHAR(300) NOT NULL,
    event_date DATE,
    venue TEXT,
    budget_cents BIGINT,
    spent_cents BIGINT DEFAULT 0,
    guest_count INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'planning'
        CHECK (status IN ('planning', 'confirmed', 'day_of', 'completed', 'cancelled')),
    timeline JSONB DEFAULT '[]',
    menu JSONB DEFAULT '{}',
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ep_user ON events_planner(user_id);

CREATE TABLE IF NOT EXISTS event_guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events_planner(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(300),
    phone VARCHAR(20),
    rsvp_status VARCHAR(20) DEFAULT 'pending'
        CHECK (rsvp_status IN ('pending', 'confirmed', 'declined', 'maybe')),
    dietary TEXT,
    plus_one BOOLEAN DEFAULT FALSE,
    table_number INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_eg_event ON event_guests(event_id);

CREATE TABLE IF NOT EXISTS writing_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    genre VARCHAR(50),
    project_type VARCHAR(30) NOT NULL DEFAULT 'novel'
        CHECK (project_type IN ('novel', 'screenplay', 'short_story', 'essay', 'poetry', 'other')),
    synopsis TEXT,
    target_word_count INTEGER,
    current_word_count INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'drafting'
        CHECK (status IN ('planning', 'drafting', 'revising', 'editing', 'completed', 'paused')),
    structure JSONB DEFAULT '{}',
    characters JSONB DEFAULT '[]',
    world_notes TEXT,
    ai_feedback_history JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wp_user ON writing_projects(user_id);

CREATE TABLE IF NOT EXISTS writing_chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES writing_projects(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title VARCHAR(300),
    content TEXT,
    word_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft'
        CHECK (status IN ('outline', 'draft', 'revision', 'final')),
    ai_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wc_project ON writing_chapters(project_id);

-- ── User Documents (upload context) ──
CREATE TABLE IF NOT EXISTS user_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_context VARCHAR(50) NOT NULL DEFAULT 'general'
        CHECK (agent_context IN ('general','repondeur','agent-customize','personal','studio-video','studio-photo')),
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(20) NOT NULL
        CHECK (file_type IN ('pdf','docx','xlsx','xls','txt','csv','md','png','jpg','jpeg')),
    mime_type VARCHAR(100) NOT NULL,
    size_bytes INTEGER NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 5242880),
    content_text TEXT,
    token_estimate INTEGER NOT NULL DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ud_user ON user_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_ud_context ON user_documents(user_id, agent_context);

-- ═══════════════════════════════════════════════════════
-- Phase 13 — Analytics (Studio, Voice, Visio)
-- ═══════════════════════════════════════════════════════

-- ── Studio Generations Tracking ──
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

-- ── Voice & Visio Usage Tracking ──
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

-- ══════════════════════════════════════════
-- Phase 11: User Preferences, Activity Log, Agent Templates, Sessions
-- ══════════════════════════════════════════

-- ── User Preferences (replaces localStorage) ──
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    dark_mode BOOLEAN NOT NULL DEFAULT FALSE,
    compact_mode BOOLEAN NOT NULL DEFAULT FALSE,
    language VARCHAR(10) NOT NULL DEFAULT 'fr',
    notify_email BOOLEAN NOT NULL DEFAULT TRUE,
    notify_sms BOOLEAN NOT NULL DEFAULT FALSE,
    notify_whatsapp BOOLEAN NOT NULL DEFAULT TRUE,
    notify_in_app BOOLEAN NOT NULL DEFAULT TRUE,
    notify_low_balance BOOLEAN NOT NULL DEFAULT TRUE,
    notify_daily_report BOOLEAN NOT NULL DEFAULT FALSE,
    notify_weekly_report BOOLEAN NOT NULL DEFAULT TRUE,
    default_agent VARCHAR(50) DEFAULT 'fz-assistante',
    voice_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    preferred_voice VARCHAR(50) DEFAULT 'sarah',
    company_profile JSONB NOT NULL DEFAULT '{}',
    gamification_data JSONB NOT NULL DEFAULT '{}',
    team_data JSONB NOT NULL DEFAULT '[]',
    agent_configs JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);

-- ── Activity Log ──
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(255),
    details JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at);

-- ── Agent Templates (Marketplace) ──
CREATE TABLE IF NOT EXISTS agent_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    icon VARCHAR(10) NOT NULL DEFAULT '🤖',
    default_config JSONB NOT NULL DEFAULT '{}',
    tier_required VARCHAR(20) NOT NULL DEFAULT 'free',
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    install_count INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_templates_category ON agent_templates(category);
CREATE INDEX IF NOT EXISTS idx_agent_templates_tier ON agent_templates(tier_required);

-- ── User Sessions ──
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    jti VARCHAR(64) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_jti ON user_sessions(jti);

-- ══════════════════════════════════════════
-- Phase 13: User Data Persistence (replaces localStorage)
-- ══════════════════════════════════════════

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
