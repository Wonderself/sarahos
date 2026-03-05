-- ═══════════════════════════════════════════════════
--  FREENZY.IO — Personal Agents Migration
--  13 personal agents: budget, comptable, chasseur, cv, ceremonie, ecrivain + shared config
-- ═══════════════════════════════════════════════════

-- Shared config for all personal agents (activation, JSONB settings/data)
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

-- ─── Mon Budget ───

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

-- ─── Mon Comptable ───

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

-- ─── Chasseur de Missions ───

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

-- ─── CV 2026 ───

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

-- ─── Maître de Cérémonie ───

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

-- ─── Mon Écrivain ───

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
