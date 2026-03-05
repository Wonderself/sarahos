// ═══════════════════════════════════════════════════════
// Repondeur Agent — Type Definitions
// ═══════════════════════════════════════════════════════

// ── Operating Modes ──

export type RepondeurMode =
  | 'professional'
  | 'family_humor'
  | 'order_taking'
  | 'emergency'
  | 'concierge'
  | 'support_technique'
  | 'qualification';

// ── Style Templates ──

export type RepondeurStyle =
  | 'formal_corporate'
  | 'friendly_professional'
  | 'casual_fun'
  | 'minimalist'
  | 'luxe_concierge'
  | 'tech_startup'
  | 'medical_cabinet';

// ── Skills ──

export type RepondeurSkill =
  | 'message_taking'
  | 'faq_answering'
  | 'appointment_scheduling'
  | 'order_capture'
  | 'complaint_handling'
  | 'vip_detection'
  | 'spam_filtering'
  | 'language_detection'
  | 'callback_scheduling'
  | 'sentiment_analysis';

// ── Message Classification ──

export type MessageClassification =
  | 'general'
  | 'urgent'
  | 'vip'
  | 'order'
  | 'complaint'
  | 'appointment'
  | 'faq'
  | 'family'
  | 'spam'
  | 'blocked';

export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent' | 'critical';

export type MessageSentiment = 'positive' | 'neutral' | 'negative' | 'angry' | 'confused';

export type SummaryFrequency = 'realtime' | 'hourly' | 'daily' | 'manual';

export type SummaryDeliveryChannel = 'whatsapp' | 'sms' | 'email' | 'in_app';

// ── Configuration ──

export interface VipContact {
  phone: string;
  name: string;
  relationship: string;
  notes: string;
}

export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
}

export interface ScheduleRule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface ScheduleConfig {
  alwaysOn: boolean;
  timezone: string;
  rules: ScheduleRule[];
}

export interface RepondeurConfig {
  id: string;
  userId: string;
  isActive: boolean;
  activeMode: RepondeurMode;
  activeStyle: RepondeurStyle;
  activeSkills: RepondeurSkill[];
  persona: 'sarah' | 'emmanuel';
  customInstructions: string | null;
  greetingMessage: string | null;
  absenceMessage: string | null;
  bossPhoneNumber: string | null;
  bossUserId: string | null;
  summaryFrequency: SummaryFrequency;
  summaryDeliveryChannel: SummaryDeliveryChannel;
  blockedContacts: string[];
  vipContacts: VipContact[];
  faqEntries: FaqEntry[];
  schedule: ScheduleConfig;
  maxResponseLength: number;
  language: string;
  gdprRetentionDays: number;
  createdAt: Date;
  updatedAt: Date;
}

// ── Messages ──

export interface RepondeurMessage {
  id: string;
  configId: string;
  userId: string;
  senderPhone: string;
  senderName: string | null;
  direction: 'inbound' | 'outbound';
  content: string;
  modeUsed: RepondeurMode;
  styleUsed: RepondeurStyle;
  classification: MessageClassification;
  priority: MessagePriority;
  sentiment: MessageSentiment;
  entitiesExtracted: Record<string, unknown>;
  skillsTriggered: RepondeurSkill[];
  tokensUsed: number;
  billedCredits: number;
  includedInSummaryId: string | null;
  waMessageId: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

// ── Orders ──

export interface OrderItem {
  name: string;
  quantity: number;
  unitPriceCents: number | null;
  notes: string | null;
}

export interface RepondeurOrder {
  id: string;
  configId: string;
  messageId: string;
  customerPhone: string;
  customerName: string | null;
  orderItems: OrderItem[];
  orderTotalCents: number | null;
  currency: string;
  deliveryAddress: string | null;
  deliveryNotes: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  confirmedAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ── Summaries ──

export interface SummaryStructured {
  highlights: string[];
  urgentMessages: Array<{ from: string; preview: string; time: string }>;
  vipMessages: Array<{ from: string; preview: string; time: string }>;
  orders: Array<{ from: string; items: string; total: string }>;
  complaints: Array<{ from: string; issue: string }>;
  stats: {
    totalInbound: number;
    totalOutbound: number;
    avgResponseTimeMs: number;
    topSenders: Array<{ name: string; count: number }>;
  };
}

export interface RepondeurSummary {
  id: string;
  configId: string;
  userId: string;
  summaryType: SummaryFrequency;
  periodStart: Date;
  periodEnd: Date;
  totalMessages: number;
  urgentCount: number;
  vipCount: number;
  orderCount: number;
  complaintCount: number;
  summaryText: string;
  summaryStructured: SummaryStructured;
  deliveryChannel: SummaryDeliveryChannel;
  deliveryStatus: 'pending' | 'sent' | 'delivered' | 'failed';
  externalMessageId: string | null;
  tokensUsed: number;
  createdAt: Date;
}

// ── Task Payloads ──

export type RepondeurTaskType =
  | 'process_message'
  | 'generate_summary'
  | 'send_summary'
  | 'cleanup_old_data';

export interface ProcessMessagePayload {
  type: 'process_message';
  senderPhone: string;
  senderName: string;
  messageContent: string;
  messageType: 'text' | 'audio';
  transcription?: string;
  waMessageId?: string;
  userId: string;
}

export interface GenerateSummaryPayload {
  type: 'generate_summary';
  configId: string;
  userId: string;
  periodStart: string;
  periodEnd: string;
  summaryType: SummaryFrequency;
}

// ── LLM Response Shapes ──

export interface ClassificationResult {
  classification: MessageClassification;
  priority: MessagePriority;
  sentiment: MessageSentiment;
  entities: Record<string, unknown>;
  skillsToTrigger: RepondeurSkill[];
  isUrgent: boolean;
  isBossMessage: boolean;
}

export interface GeneratedResponse {
  response: string;
  classification: ClassificationResult;
  order?: Partial<RepondeurOrder>;
  appointmentRequest?: {
    preferredDate: string;
    preferredTime: string;
    reason: string;
  };
  faqMatched?: {
    questionId: string;
    confidence: number;
  };
}
