-- Migration: Add custom_creation_quotes table
-- Run: docker exec -i freenzy-postgres psql -U postgres -d freenzy < scripts/migrate-custom-creation.sql

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
