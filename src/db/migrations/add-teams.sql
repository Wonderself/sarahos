-- ============================================================
-- Teams System Migration — Freenzy.io
-- Organizations, members, credit pools, agent config, workflows
-- ============================================================

BEGIN;

-- ─── 1. Organizations ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(120) NOT NULL,
  slug          VARCHAR(80) NOT NULL UNIQUE,
  owner_id      UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  plan          VARCHAR(30) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'business', 'enterprise')),
  max_members   INT NOT NULL DEFAULT 5,
  shared_credits BIGINT NOT NULL DEFAULT 0,
  settings      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- ─── 2. Organization Members ─────────────────────────────────

CREATE TABLE IF NOT EXISTS organization_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  permissions     JSONB NOT NULL DEFAULT '{}'::jsonb,
  invited_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_invited_by ON organization_members(invited_by);

-- ─── 3. Credit Pools ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS credit_pools (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  total_credits   BIGINT NOT NULL DEFAULT 0,
  used_credits    BIGINT NOT NULL DEFAULT 0,
  monthly_limit   BIGINT NOT NULL DEFAULT 0,
  reset_day       INT NOT NULL DEFAULT 1 CHECK (reset_day >= 1 AND reset_day <= 28),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_pools_org ON credit_pools(organization_id);

-- ─── 4. Credit Usage Log ────────────────────────────────────

CREATE TABLE IF NOT EXISTS credit_usage_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id        VARCHAR(80) NOT NULL,
  credits_used    BIGINT NOT NULL,
  source          VARCHAR(20) NOT NULL DEFAULT 'shared' CHECK (source IN ('personal', 'shared')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_usage_org ON credit_usage_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_user ON credit_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_agent ON credit_usage_log(agent_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_created ON credit_usage_log(created_at);

-- ─── 5. Organization Agents ─────────────────────────────────

CREATE TABLE IF NOT EXISTS organization_agents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_id            VARCHAR(80) NOT NULL,
  enabled             BOOLEAN NOT NULL DEFAULT true,
  custom_instructions TEXT DEFAULT '',
  allowed_roles       TEXT[] NOT NULL DEFAULT ARRAY['owner', 'admin', 'member'],
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, agent_id)
);

CREATE INDEX IF NOT EXISTS idx_org_agents_org ON organization_agents(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_agents_agent ON organization_agents(agent_id);

-- ─── 6. Approval Workflows ─────────────────────────────────

CREATE TABLE IF NOT EXISTS approval_workflows (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  action_type       VARCHAR(60) NOT NULL,
  required_role     VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (required_role IN ('owner', 'admin', 'member', 'viewer')),
  auto_approve_for  TEXT[] NOT NULL DEFAULT ARRAY['owner'],
  notify_roles      TEXT[] NOT NULL DEFAULT ARRAY['owner', 'admin'],
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approval_workflows_org ON approval_workflows(organization_id);

-- ─── 7. Row-Level Security ──────────────────────────────────

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;

-- Organizations: members can read, owner can modify
CREATE POLICY org_member_select ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM organization_members WHERE user_id = current_setting('app.current_user_id', true)::uuid)
  );

CREATE POLICY org_owner_modify ON organizations
  FOR ALL USING (
    owner_id = current_setting('app.current_user_id', true)::uuid
  );

-- Organization Members: members can read their org, admin+ can modify
CREATE POLICY org_members_select ON organization_members
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = current_setting('app.current_user_id', true)::uuid)
  );

CREATE POLICY org_members_admin_modify ON organization_members
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = current_setting('app.current_user_id', true)::uuid
        AND role IN ('owner', 'admin')
    )
  );

-- Credit Pools: members can read, admin+ can modify
CREATE POLICY credit_pools_member_select ON credit_pools
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = current_setting('app.current_user_id', true)::uuid)
  );

CREATE POLICY credit_pools_admin_modify ON credit_pools
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = current_setting('app.current_user_id', true)::uuid
        AND role IN ('owner', 'admin')
    )
  );

-- Credit Usage Log: members can read their org's log
CREATE POLICY credit_usage_member_select ON credit_usage_log
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = current_setting('app.current_user_id', true)::uuid)
  );

CREATE POLICY credit_usage_insert ON credit_usage_log
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = current_setting('app.current_user_id', true)::uuid)
  );

-- Organization Agents: members can read, admin+ can modify
CREATE POLICY org_agents_member_select ON organization_agents
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = current_setting('app.current_user_id', true)::uuid)
  );

CREATE POLICY org_agents_admin_modify ON organization_agents
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = current_setting('app.current_user_id', true)::uuid
        AND role IN ('owner', 'admin')
    )
  );

-- Approval Workflows: members can read, admin+ can modify
CREATE POLICY workflows_member_select ON approval_workflows
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = current_setting('app.current_user_id', true)::uuid)
  );

CREATE POLICY workflows_admin_modify ON approval_workflows
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = current_setting('app.current_user_id', true)::uuid
        AND role IN ('owner', 'admin')
    )
  );

-- ─── 8. Updated-at triggers ─────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_credit_pools_updated_at
  BEFORE UPDATE ON credit_pools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_org_agents_updated_at
  BEFORE UPDATE ON organization_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_approval_workflows_updated_at
  BEFORE UPDATE ON approval_workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMIT;
