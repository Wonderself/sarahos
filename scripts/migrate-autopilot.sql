-- ═══════════════════════════════════════════════════════
-- AUTOPILOT — Agent Proposals + Audit Reports
-- Admin Autopilot governance layer
-- ═══════════════════════════════════════════════════════

-- Agent audit reports (created first because proposals reference it)
CREATE TABLE IF NOT EXISTS agent_audit_reports (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auditor_id          VARCHAR(100) NOT NULL,
    report_type         VARCHAR(50) NOT NULL
        CHECK (report_type IN ('health','security','business','performance','combined')),
    summary             TEXT NOT NULL,
    findings            JSONB NOT NULL DEFAULT '[]',
    metrics             JSONB NOT NULL DEFAULT '{}',
    proposals_generated INTEGER NOT NULL DEFAULT 0,
    wa_message_id       VARCHAR(100),
    wa_sent_at          TIMESTAMPTZ,
    duration_ms         INTEGER,
    period_start        TIMESTAMPTZ,
    period_end          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_reports_type ON agent_audit_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_audit_reports_created ON agent_audit_reports(created_at DESC);

-- Agent proposals — the core governance table
CREATE TABLE IF NOT EXISTS agent_proposals (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Identity
    agent_id            VARCHAR(100) NOT NULL,
    agent_name          VARCHAR(200) NOT NULL,

    -- Classification
    category            VARCHAR(50) NOT NULL
        CHECK (category IN ('health','performance','security','business','user_experience','cost_optimization')),
    severity            VARCHAR(20) NOT NULL
        CHECK (severity IN ('info','warning','critical','urgent')),

    -- Proposal content
    title               VARCHAR(300) NOT NULL,
    description         TEXT NOT NULL,
    rationale           TEXT NOT NULL,
    impact_estimate     TEXT,
    risk_estimate       TEXT,

    -- Execution spec
    action_type         VARCHAR(100) NOT NULL,
    action_params       JSONB NOT NULL DEFAULT '{}',
    rollback_snapshot   JSONB,

    -- Lifecycle
    status              VARCHAR(30) NOT NULL DEFAULT 'draft'
        CHECK (status IN (
            'draft','pending_review','approved','denied',
            'executing','completed','failed','rolled_back','expired'
        )),

    -- WhatsApp tracking
    wa_message_id       VARCHAR(100),
    wa_sent_at          TIMESTAMPTZ,

    -- Decision
    decided_by          VARCHAR(200),
    decided_at          TIMESTAMPTZ,
    decision_notes      TEXT,

    -- Execution tracking
    executed_by         VARCHAR(100),
    executed_at         TIMESTAMPTZ,
    execution_log       TEXT,
    execution_error     TEXT,

    -- Rate limiting
    proposal_day        DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Link to audit report
    audit_report_id     UUID REFERENCES agent_audit_reports(id) ON DELETE SET NULL,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proposals_status ON agent_proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_severity ON agent_proposals(severity);
CREATE INDEX IF NOT EXISTS idx_proposals_category ON agent_proposals(category);
CREATE INDEX IF NOT EXISTS idx_proposals_created ON agent_proposals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposals_day ON agent_proposals(proposal_day);
CREATE INDEX IF NOT EXISTS idx_proposals_wa_msg ON agent_proposals(wa_message_id) WHERE wa_message_id IS NOT NULL;
