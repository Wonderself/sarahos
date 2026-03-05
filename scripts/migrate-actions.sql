-- FREENZY.IO — Migration: Actions system (conversation → action pipeline)
-- Run after migrate-projects.sql

CREATE TABLE IF NOT EXISTS actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    workspace_id UUID,

    -- Type & classification
    type VARCHAR(30) NOT NULL DEFAULT 'task',
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'proposed',
    priority VARCHAR(10) NOT NULL DEFAULT 'medium',

    -- Source traceability
    source_agent VARCHAR(50),
    source_conversation_id VARCHAR(100),
    source_message_index INTEGER,

    -- Assignment (for workspace/team)
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Scheduling
    due_date TIMESTAMPTZ,
    reminder_at TIMESTAMPTZ,
    scheduled_at TIMESTAMPTZ,

    -- Type-specific data
    payload JSONB NOT NULL DEFAULT '{}',

    -- Completion
    completed_at TIMESTAMPTZ,
    result JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_actions_user ON actions(user_id);
CREATE INDEX IF NOT EXISTS idx_actions_status ON actions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_actions_type ON actions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_actions_workspace ON actions(workspace_id) WHERE workspace_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_actions_due ON actions(due_date) WHERE due_date IS NOT NULL AND status NOT IN ('completed', 'cancelled');
CREATE INDEX IF NOT EXISTS idx_actions_assigned ON actions(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_actions_reminder ON actions(reminder_at) WHERE reminder_at IS NOT NULL AND status NOT IN ('completed', 'cancelled');

-- Check constraints
ALTER TABLE actions ADD CONSTRAINT chk_action_type CHECK (
    type IN ('task', 'social_post', 'calendar_event', 'phone_call', 'email',
             'document', 'meeting', 'campaign', 'crm_entry', 'strategy_update',
             'budget_action', 'notification_setup', 'follow_up', 'custom')
);

ALTER TABLE actions ADD CONSTRAINT chk_action_status CHECK (
    status IN ('proposed', 'accepted', 'in_progress', 'completed', 'cancelled', 'deferred')
);

ALTER TABLE actions ADD CONSTRAINT chk_action_priority CHECK (
    priority IN ('low', 'medium', 'high', 'urgent')
);
