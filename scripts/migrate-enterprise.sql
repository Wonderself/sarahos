-- Migration: Add enterprise_quotes table
-- Run this on existing databases that already have the base schema

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
