import { z } from 'zod';

// ── Auth ──

export const loginSchema = z.union([
  z.object({ apiKey: z.string().min(1, 'apiKey is required') }),
  z.object({ email: z.string().email('Valid email required'), password: z.string().min(1, 'Password is required') }),
]);

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
  textInput: z.string().max(100_000).optional(),
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

const sanitizedName = z.string().min(1).max(100).transform(v => v.replace(/<[^>]*>/g, '').trim());

export const createUserSchema = z.object({
  email: z.string().email('Valid email required'),
  displayName: sanitizedName,
  role: z.enum(['admin', 'operator', 'viewer', 'system']).default('viewer'),
  tier: z.enum(['guest', 'demo', 'free', 'paid']).default('free'),
});

export const updateUserSchema = z.object({
  displayName: sanitizedName.optional(),
  role: z.enum(['admin', 'operator', 'viewer', 'system']).optional(),
  tier: z.enum(['guest', 'demo', 'free', 'paid']).optional(),
  isActive: z.boolean().optional(),
  dailyApiLimit: z.number().int().min(0).max(10_000_000).optional(),
  tokenBudgetMultiplier: z.number().min(0.1).max(10).optional(),
  demoExpiresAt: z.string().datetime().nullable().optional(),
});

export const userQuerySchema = z.object({
  role: z.enum(['admin', 'operator', 'viewer', 'system']).optional(),
  tier: z.enum(['guest', 'demo', 'free', 'paid']).optional(),
  active: z.enum(['true', 'false']).optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
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

// ── Admin Deposit / Refund ──

export const adminDepositSchema = z.object({
  amount: z.number().int().min(1, 'Amount must be positive'),
  description: z.string().max(500).optional(),
});

export const adminRefundSchema = z.object({
  amount: z.number().int().min(1, 'Amount must be positive'),
  description: z.string().max(500).optional(),
  transactionId: z.string().uuid().optional(),
});

// ── Billing ──

export const autoTopupSchema = z.object({
  autoTopupEnabled: z.boolean(),
  autoTopupThreshold: z.number().int().min(0).max(100_000_000).optional(),
  autoTopupAmount: z.number().int().min(1_000_000).max(500_000_000).optional(),
}).refine(
  (data) => {
    if (data.autoTopupEnabled) {
      return (data.autoTopupThreshold ?? 0) > 0 && (data.autoTopupAmount ?? 0) > 0;
    }
    return true;
  },
  { message: 'When auto-topup is enabled, threshold and amount must be positive' },
);

export const depositSchema = z.object({
  userId: z.string().uuid('Valid user ID required'),
  amount: z.number().int().min(1, 'Amount must be positive'),
  description: z.string().min(1).max(500),
  referenceType: z.string().min(1).max(50),
  referenceId: z.string().optional(),
  idempotencyKey: z.string().uuid().optional(),
});

export const walletTransactionsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const usageSummaryQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Supported Anthropic models — update when new models are added
const SUPPORTED_LLM_MODELS = [
  'claude-sonnet-4-6',
  'claude-sonnet-4-20250514',
  'claude-opus-4-6',
  'claude-haiku-4-5-20251001',
  // Legacy model IDs still accepted
  'claude-3-5-sonnet-20241022',
  'claude-3-5-haiku-20241022',
  'claude-3-opus-20240229',
] as const;

export const llmProxyRequestSchema = z.object({
  model: z.enum(SUPPORTED_LLM_MODELS, { errorMap: () => ({ message: `Model must be one of: ${SUPPORTED_LLM_MODELS.join(', ')}` }) }),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1).max(100_000),
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

// ── Enterprise Quotes ──

export const createEnterpriseQuoteSchema = z.object({
  companyName: z.string().min(2, 'Nom de societe requis').max(200),
  contactName: z.string().min(2, 'Nom du contact requis').max(200),
  email: z.string().email('Email valide requis'),
  phone: z.string().max(50).optional(),
  industry: z.string().max(100).optional(),
  estimatedUsers: z.number().int().min(1).optional(),
  needs: z.string().max(2000).optional(),
  budgetRange: z.enum(['< 500 EUR/mois', '500-2000 EUR/mois', '2000-5000 EUR/mois', '> 5000 EUR/mois']).optional(),
});

export const updateEnterpriseQuoteSchema = z.object({
  status: z.enum(['new', 'contacted', 'negotiation', 'accepted', 'declined']).optional(),
  adminNotes: z.string().max(5000).optional(),
});

export const quoteQuerySchema = z.object({
  status: z.enum(['new', 'contacted', 'negotiation', 'accepted', 'declined']).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

// ── Custom Creation Quotes ──

export const createCustomCreationQuoteSchema = z.object({
  contactName: z.string().min(2, 'Nom requis').max(200),
  email: z.string().email('Email valide requis'),
  phone: z.string().max(50).optional(),
  projectType: z.enum(['software', 'website', 'crm', 'api_zapier', 'mobile_app', 'automation']),
  description: z.string().min(10, 'Description trop courte').max(5000),
  budgetRange: z.enum(['< 2000 EUR', '2000-5000 EUR', '5000-15000 EUR', '15000-50000 EUR', '> 50000 EUR']).optional(),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

export const updateCustomCreationQuoteSchema = z.object({
  status: z.enum(['new', 'reviewing', 'quoted', 'accepted', 'declined', 'in_progress', 'completed']).optional(),
  adminNotes: z.string().max(5000).optional(),
  quotedPrice: z.number().min(0).optional(),
});

export const customCreationQuerySchema = z.object({
  status: z.enum(['new', 'reviewing', 'quoted', 'accepted', 'declined', 'in_progress', 'completed']).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

// ── Repondeur ──

export const repondeurConfigSchema = z.object({
  isActive: z.boolean().optional(),
  activeMode: z.enum(['professional', 'family_humor', 'order_taking', 'emergency', 'concierge', 'support_technique', 'qualification']).optional(),
  activeStyle: z.enum(['formal_corporate', 'friendly_professional', 'casual_fun', 'minimalist', 'luxe_concierge', 'tech_startup', 'medical_cabinet']).optional(),
  activeSkills: z.array(z.enum(['message_taking', 'faq_answering', 'appointment_scheduling', 'order_capture', 'complaint_handling', 'vip_detection', 'spam_filtering', 'language_detection', 'callback_scheduling', 'sentiment_analysis'])).optional(),
  persona: z.enum(['sarah', 'emmanuel']).optional(),
  customInstructions: z.string().max(5000).nullable().optional(),
  greetingMessage: z.string().max(1000).nullable().optional(),
  absenceMessage: z.string().max(1000).nullable().optional(),
  bossPhoneNumber: z.string().regex(/^\+[1-9]\d{6,14}$/).nullable().optional(),
  summaryFrequency: z.enum(['realtime', 'hourly', 'daily', 'manual']).optional(),
  summaryDeliveryChannel: z.enum(['whatsapp', 'sms', 'email', 'in_app']).optional(),
  schedule: z.object({
    alwaysOn: z.boolean(),
    timezone: z.string(),
    rules: z.array(z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string(),
      endTime: z.string(),
      isActive: z.boolean(),
    })),
  }).optional(),
  maxResponseLength: z.number().int().min(50).max(5000).optional(),
  language: z.string().max(10).optional(),
  gdprRetentionDays: z.number().int().min(1).max(365).optional(),
  projectId: z.string().uuid().nullable().optional(),
});

// ── Alarms (Reveil Intelligent) ──

const alarmModes = z.enum(['standard', 'motivant', 'doux', 'energique', 'spirituel', 'humoristique', 'informatif', 'custom', 'dur', 'sympa', 'drole', 'fou', 'zen']);
const deliveryMethods = z.enum(['phone_call', 'whatsapp', 'whatsapp_message', 'sms']);

export const createAlarmSchema = z.object({
  label: z.string().min(1).max(200).optional(),
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
  days: z.array(z.number().int().min(0).max(6)).optional(),
  isActive: z.boolean().optional(),
  mode: alarmModes.optional(),
  rubrics: z.array(z.string().max(50)).max(18).optional(),
  deliveryMethod: deliveryMethods.optional(),
  voiceId: z.string().max(100).optional(),
  phoneNumber: z.string().max(20).optional(),
  birthDate: z.string().max(20).optional(),
  customAnnouncement: z.string().max(2000).optional(),
  contentModules: z.record(z.unknown()).optional(),
  projectId: z.string().uuid().nullable().optional(),
});

export const updateAlarmSchema = z.object({
  label: z.string().min(1).max(200).optional(),
  hour: z.number().int().min(0).max(23).optional(),
  minute: z.number().int().min(0).max(59).optional(),
  days: z.array(z.number().int().min(0).max(6)).optional(),
  isActive: z.boolean().optional(),
  mode: alarmModes.optional(),
  rubrics: z.array(z.string().max(50)).max(18).optional(),
  deliveryMethod: deliveryMethods.optional(),
  voiceId: z.string().max(100).optional(),
  phoneNumber: z.string().max(20).optional(),
  birthDate: z.string().max(20).optional(),
  customAnnouncement: z.string().max(2000).optional(),
  contentModules: z.record(z.unknown()).optional(),
});

// ── Personal Agents ──

export const personalAgentConfigSchema = z.object({
  is_active: z.boolean().optional(),
  settings: z.record(z.unknown()).optional(),
  data: z.record(z.unknown()).optional(),
});

export const budgetTransactionSchema = z.object({
  amount_cents: z.number().int(),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  recurring: z.boolean().optional(),
  recurring_frequency: z.enum(['weekly', 'monthly', 'yearly']).nullable().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export const budgetGoalSchema = z.object({
  name: z.string().min(1).max(200),
  target_cents: z.number().int().min(1),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  category: z.string().max(100).nullable().optional(),
});

export const updateBudgetGoalSchema = z.object({
  current_cents: z.number().int().optional(),
  status: z.enum(['active', 'reached', 'abandoned']).optional(),
});

export const freelanceRecordSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount_cents: z.number().int(),
  tva_rate: z.number().min(0).max(100).optional(),
  tva_cents: z.number().int().optional(),
  description: z.string().min(1).max(500),
  client_name: z.string().max(200).nullable().optional(),
  invoice_number: z.string().max(100).nullable().optional(),
  invoice_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  payment_status: z.enum(['pending', 'paid', 'overdue']).optional(),
  category: z.string().min(1).max(100),
});

export const updateFreelanceRecordSchema = z.object({
  amount_cents: z.number().int().optional(),
  tva_rate: z.number().min(0).max(100).optional(),
  tva_cents: z.number().int().optional(),
  description: z.string().min(1).max(500).optional(),
  client_name: z.string().max(200).nullable().optional(),
  invoice_number: z.string().max(100).nullable().optional(),
  invoice_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  payment_status: z.enum(['pending', 'paid', 'overdue']).optional(),
  category: z.string().min(1).max(100).optional(),
});

export const freelanceReminderSchema = z.object({
  type: z.string().min(1).max(50),
  title: z.string().min(1).max(200),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(1000).nullable().optional(),
});

export const missionSchema = z.object({
  title: z.string().min(1).max(200),
  client_name: z.string().max(200).nullable().optional(),
  platform: z.string().max(100).nullable().optional(),
  url: z.string().url().nullable().optional(),
  tjm_cents: z.number().int().nullable().optional(),
  duration_days: z.number().int().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export const updateMissionSchema = z.object({
  status: z.enum(['discovered', 'applied', 'interview', 'offer', 'accepted', 'rejected']).optional(),
  next_action: z.string().max(500).nullable().optional(),
  next_action_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export const cvProfileSchema = z.object({
  full_name: z.string().min(1).max(200),
  title: z.string().max(200).nullable().optional(),
  summary: z.string().max(5000).nullable().optional(),
  contact_info: z.record(z.unknown()).optional(),
  skills: z.array(z.unknown()).optional(),
  experiences: z.array(z.unknown()).optional(),
  education: z.array(z.unknown()).optional(),
  certifications: z.array(z.unknown()).optional(),
  languages: z.array(z.unknown()).optional(),
  interests: z.array(z.string().max(100)).optional(),
  career_goals: z.string().max(2000).nullable().optional(),
  target_roles: z.array(z.string().max(100)).optional(),
  last_ai_analysis: z.record(z.unknown()).optional(),
});

export const eventPlannerSchema = z.object({
  event_type: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  event_date: z.string().nullable().optional(),
  venue: z.string().max(200).nullable().optional(),
  budget_cents: z.number().int().nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
});

export const updateEventSchema = z.object({
  status: z.enum(['planning', 'confirmed', 'completed', 'cancelled']).optional(),
  timeline: z.unknown().optional(),
  menu: z.unknown().optional(),
  spent_cents: z.number().int().optional(),
  guest_count: z.number().int().optional(),
});

export const eventGuestSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  dietary: z.string().max(200).nullable().optional(),
  plus_one: z.boolean().optional(),
});

export const updateGuestSchema = z.object({
  rsvp_status: z.enum(['pending', 'confirmed', 'declined']).optional(),
  table_number: z.number().int().nullable().optional(),
});

export const writingProjectSchema = z.object({
  title: z.string().min(1).max(200),
  genre: z.string().max(100).nullable().optional(),
  project_type: z.enum(['novel', 'short_story', 'essay', 'screenplay', 'poetry', 'other']).optional(),
  synopsis: z.string().max(5000).nullable().optional(),
  target_word_count: z.number().int().nullable().optional(),
});

export const updateWritingProjectSchema = z.object({
  status: z.enum(['draft', 'writing', 'editing', 'completed', 'published']).optional(),
  current_word_count: z.number().int().optional(),
  characters: z.unknown().optional(),
  structure: z.unknown().optional(),
  synopsis: z.string().max(5000).nullable().optional(),
});

export const writingChapterSchema = z.object({
  chapter_number: z.number().int().min(0),
  title: z.string().max(200).nullable().optional(),
  content: z.string().max(500_000).nullable().optional(),
});

export const updateChapterSchema = z.object({
  title: z.string().max(200).nullable().optional(),
  content: z.string().max(500_000).nullable().optional(),
  status: z.enum(['outline', 'draft', 'revision', 'final']).optional(),
  ai_notes: z.string().max(5000).nullable().optional(),
});
