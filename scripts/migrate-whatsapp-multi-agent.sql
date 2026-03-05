-- Migration: WhatsApp Multi-Agent Support
-- Uses existing metadata JSONB column — no new columns needed
-- Adds index for agent_id lookups in metadata

-- Index for fast agent_id lookups in WhatsApp messages metadata
CREATE INDEX IF NOT EXISTS idx_wa_msg_agent
  ON whatsapp_messages ((metadata->>'agent_id'));

-- Index for onboarding phase lookups
CREATE INDEX IF NOT EXISTS idx_wa_conv_agent_context
  ON whatsapp_conversations ((metadata->>'agent_context'));
