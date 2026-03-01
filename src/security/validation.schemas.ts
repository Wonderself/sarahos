import { z } from 'zod';

// ── Auth ──

export const loginSchema = z.object({
  apiKey: z.string().min(1, 'apiKey is required'),
});

// ── Approvals ──

export const approvalDecisionSchema = z.object({
  status: z.enum(['APPROVED', 'DENIED']),
  decidedBy: z.string().min(1),
  notes: z.string().optional(),
});

// ── Avatar Conversation ──

export const conversationStartSchema = z.object({
  sessionId: z.string().min(1),
  avatarBase: z.enum(['sarah', 'emmanuel']),
  personaId: z.string().min(1),
  config: z.record(z.unknown()).optional(),
});

export const conversationTurnSchema = z.object({
  sessionId: z.string().min(1),
  textInput: z.string().optional(),
});

export const conversationEndSchema = z.object({
  sessionId: z.string().min(1),
});

// ── Avatar Services ──

export const asrTranscribeSchema = z.object({
  sessionId: z.string().min(1),
  text: z.string().min(1),
});

export const ttsSynthesizeSchema = z.object({
  sessionId: z.string().min(1),
  text: z.string().min(1).max(5000),
});

export const telephonyCallSchema = z.object({
  to: z.string().min(1),
  avatarBase: z.enum(['sarah', 'emmanuel']),
  sessionId: z.string().min(1),
});

export const personaSwitchSchema = z.object({
  personaId: z.string().min(1),
  sessionId: z.string().optional(),
});

// ── Tasks ──

export const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  payload: z.record(z.unknown()).default({}),
  assignedBy: z.string().min(1),
  deadline: z.string().datetime().optional(),
  autonomyBoost: z.boolean().default(false),
});

export const taskQuerySchema = z.object({
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  assignedBy: z.string().optional(),
});

// ── Agent Control ──

export const agentExecuteSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  payload: z.record(z.unknown()).default({}),
});

// ── Memory ──

export const memoryStoreSchema = z.object({
  content: z.string().min(1).max(10000),
  metadata: z.record(z.unknown()).default({}),
  source: z.string().min(1),
  agentId: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
});

export const memorySearchSchema = z.object({
  query: z.string().min(1),
  topK: z.number().int().min(1).max(100).default(5),
  source: z.string().optional(),
  agentId: z.string().optional(),
  minScore: z.number().min(0).max(1).default(0.7),
});

// ── Events ──

export const eventsQuerySchema = z.object({
  type: z.string().optional(),
  source: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(500).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

// ── Admin: Users ──

export const createUserSchema = z.object({
  email: z.string().email('Valid email required'),
  displayName: z.string().min(1).max(100),
  role: z.enum(['admin', 'operator', 'viewer', 'system']).default('viewer'),
  tier: z.enum(['guest', 'demo', 'free', 'paid']).default('free'),
});

export const updateUserSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  role: z.enum(['admin', 'operator', 'viewer', 'system']).optional(),
  tier: z.enum(['guest', 'demo', 'free', 'paid']).optional(),
  isActive: z.boolean().optional(),
  dailyApiLimit: z.number().int().min(0).max(1000000).optional(),
  demoExpiresAt: z.string().datetime().nullable().optional(),
});

export const userQuerySchema = z.object({
  role: z.enum(['admin', 'operator', 'viewer', 'system']).optional(),
  tier: z.enum(['guest', 'demo', 'free', 'paid']).optional(),
  active: z.enum(['true', 'false']).optional(),
  search: z.string().optional(),
});

// ── Promo Codes ──

export const createPromoSchema = z.object({
  code: z.string().min(3).max(50).regex(/^[A-Z0-9_-]+$/i, 'Code must be alphanumeric with hyphens/underscores'),
  description: z.string().max(500).default(''),
  effectType: z.enum(['tier_upgrade', 'extend_demo', 'bonus_calls']),
  effectValue: z.string().min(1),
  maxUses: z.number().int().min(1).max(100000).default(1),
  expiresAt: z.string().datetime().optional(),
});

export const redeemPromoSchema = z.object({
  code: z.string().min(1),
});

// ── Billing ──

export const depositSchema = z.object({
  userId: z.string().uuid('Valid user ID required'),
  amount: z.number().int().min(1, 'Amount must be positive'),
  description: z.string().min(1).max(500),
  referenceType: z.string().min(1).max(50),
  referenceId: z.string().optional(),
});

export const walletTransactionsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const usageSummaryQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const llmProxyRequestSchema = z.object({
  model: z.string().min(1),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1),
  })).min(1),
  maxTokens: z.number().int().min(1).max(200000).optional(),
  temperature: z.number().min(0).max(2).optional(),
  agentName: z.string().optional(),
});

// ── Campaigns ──

export const createCampaignSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).default(''),
  campaignType: z.enum(['social', 'email', 'sms', 'whatsapp', 'multi_channel']).default('social'),
  platforms: z.array(z.string()).default([]),
  content: z.record(z.unknown()).default({}),
  schedule: z.record(z.unknown()).default({}),
  targeting: z.record(z.unknown()).default({}),
  budgetCredits: z.number().int().min(0).default(0),
});

export const updateCampaignSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(['draft', 'pending_approval', 'approved', 'scheduled', 'active', 'paused', 'completed', 'cancelled']).optional(),
  platforms: z.array(z.string()).optional(),
  content: z.record(z.unknown()).optional(),
  schedule: z.record(z.unknown()).optional(),
  targeting: z.record(z.unknown()).optional(),
  budgetCredits: z.number().int().min(0).optional(),
});

export const campaignQuerySchema = z.object({
  status: z.enum(['draft', 'pending_approval', 'approved', 'scheduled', 'active', 'paused', 'completed', 'cancelled']).optional(),
});

export const createPostSchema = z.object({
  platform: z.string().min(1).max(50),
  content: z.string().min(1).max(10000),
  mediaUrls: z.array(z.string().url()).max(10).default([]),
  hashtags: z.array(z.string().max(100)).max(30).default([]),
  scheduledAt: z.string().datetime().optional(),
});

// ── Notifications ──

export const sendNotificationSchema = z.object({
  userId: z.string().uuid('Valid user ID required'),
  channel: z.enum(['email', 'whatsapp', 'sms', 'in_app', 'webhook']),
  type: z.string().min(1).max(50),
  subject: z.string().min(1).max(500),
  body: z.string().min(1).max(10000),
  metadata: z.record(z.unknown()).default({}),
});

// ── WhatsApp ──

export const linkPhoneSchema = z.object({
  phoneNumber: z.string().regex(/^\+[1-9]\d{6,14}$/, 'Phone must be E.164 format (+33612345678)'),
});

export const verifyPhoneSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d{6}$/),
});

export const whatsAppSettingsSchema = z.object({
  preferredAgent: z.enum(['sarah', 'emmanuel']).optional(),
  preferredLanguage: z.string().optional(),
  enableVoiceResponses: z.boolean().optional(),
});
