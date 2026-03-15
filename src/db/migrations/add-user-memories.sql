-- Migration: add-user-memories.sql
-- User memories with pgvector for semantic search
-- Run after: users table, organizations table exist

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE user_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('client', 'project', 'preference', 'fact', 'instruction', 'other')),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  shared BOOLEAN DEFAULT false,  -- if true, visible to team members
  active BOOLEAN DEFAULT true,
  source VARCHAR(50) DEFAULT 'manual', -- 'manual' | 'auto' | 'conversation'
  assistant_ids TEXT[] DEFAULT '{}',  -- which assistants can use this memory (empty = all)
  embedding vector(1536),  -- for semantic search later
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_memories_user ON user_memories(user_id);
CREATE INDEX idx_memories_org ON user_memories(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_memories_category ON user_memories(user_id, category);
CREATE INDEX idx_memories_active ON user_memories(user_id, active);
CREATE INDEX idx_memories_shared ON user_memories(organization_id, shared) WHERE shared = true;

-- RLS
ALTER TABLE user_memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY memory_owner ON user_memories FOR ALL
  USING (user_id = current_setting('app.current_user_id', true)::uuid);
CREATE POLICY memory_team_read ON user_memories FOR SELECT
  USING (shared = true AND organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = current_setting('app.current_user_id', true)::uuid
  ));
