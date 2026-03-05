-- FREENZY.IO — Migration: Workspaces & Team Collaboration
-- Run after migrate-actions.sql

-- Workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    settings JSONB NOT NULL DEFAULT '{}',
    plan VARCHAR(20) NOT NULL DEFAULT 'team',
    max_members INTEGER NOT NULL DEFAULT 5,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON workspaces(slug);

ALTER TABLE workspaces ADD CONSTRAINT chk_workspace_plan CHECK (
    plan IN ('team', 'business', 'enterprise')
);

-- Workspace members
CREATE TABLE IF NOT EXISTS workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'viewer',
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    accepted_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_ws_members_workspace ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ws_members_user ON workspace_members(user_id);

ALTER TABLE workspace_members ADD CONSTRAINT chk_member_role CHECK (
    role IN ('owner', 'editor', 'viewer')
);

-- Workspace invitations
CREATE TABLE IF NOT EXISTS workspace_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'viewer',
    invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(64) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ws_invite_token ON workspace_invitations(token);
CREATE INDEX IF NOT EXISTS idx_ws_invite_email ON workspace_invitations(email);

ALTER TABLE workspace_invitations ADD CONSTRAINT chk_invite_status CHECK (
    status IN ('pending', 'accepted', 'declined', 'expired')
);

ALTER TABLE workspace_invitations ADD CONSTRAINT chk_invite_role CHECK (
    role IN ('owner', 'editor', 'viewer')
);

-- Workspace activity log
CREATE TABLE IF NOT EXISTS workspace_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    details JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ws_activity_workspace ON workspace_activity(workspace_id, created_at DESC);
