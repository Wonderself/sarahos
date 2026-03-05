-- ═══════════════════════════════════════════════════════
-- FREENZY.IO v0.12.0 — User Documents (Upload context)
-- ═══════════════════════════════════════════════════════

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
