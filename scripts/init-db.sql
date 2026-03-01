-- ═══════════════════════════════════════════════════════
-- SARAH OS — PostgreSQL Schema (Phase 1)
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
    active_agents TEXT[] NOT NULL DEFAULT ARRAY['sarah-repondeur'],
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
    user_id UUID NOT NULL UNIQUE REFERENCES users(id),
    balance_credits BIGINT NOT NULL DEFAULT 0,  -- in micro-credits (1 credit = 1,000,000 micro)
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
    wallet_id UUID NOT NULL REFERENCES wallets(id),
    user_id UUID NOT NULL REFERENCES users(id),
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
    user_id UUID NOT NULL REFERENCES users(id),
    wallet_id UUID REFERENCES wallets(id),
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
    user_id UUID NOT NULL REFERENCES users(id),
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
    user_id UUID NOT NULL REFERENCES users(id),
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
    status VARCHAR(20) NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
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
        'Directrice Générale virtuelle de SARAH OS',
        'Charismatique, empathique, fun mais professionnelle. Fillers naturels, rires légers. Pro sans être froide.',
        'Bonjour ! Je suis Sarah, votre assistante IA. Comment puis-je vous aider aujourd''hui ?',
        'Tu es Sarah, la Directrice Générale virtuelle de SARAH OS. Tu es charismatique, empathique et professionnelle. Tu utilises des fillers naturels comme "um" et "uh" pour paraître plus humaine. Tu es fun mais jamais au détriment du professionnalisme.'
    ),
    (
        'emmanuel',
        'Emmanuel',
        'male',
        'CEO et fondateur de SARAH OS',
        'Posé, visionnaire, inspirant. Ton de leader tech. Moins fun que Sarah mais plus autoritaire et rassurant sur les sujets business critiques.',
        'Bonjour, je suis Emmanuel. En quoi puis-je vous accompagner ?',
        'Tu es Emmanuel, le CEO et fondateur de SARAH OS. Tu es posé, visionnaire et inspirant. Tu as un ton de leader tech. Tu es moins fun que Sarah mais plus autoritaire et rassurant sur les sujets business critiques.'
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
    business_name VARCHAR(200) DEFAULT 'SARAH OS',
    greeting_template TEXT DEFAULT 'Bonjour ! Je suis {{agent}}, votre assistante IA SARAH OS. Comment puis-je vous aider ?',
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    api_version VARCHAR(10) DEFAULT 'v18.0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Referrals (Parrainage) ──
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES users(id),
    referred_id UUID NOT NULL REFERENCES users(id),
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
    'system@sarah-os.internal',
    'SARAH OS System',
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
