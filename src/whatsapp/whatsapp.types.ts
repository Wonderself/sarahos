// ═══════════════════════════════════════════════════════
// WhatsApp Integration Types — Phase 11
// ═══════════════════════════════════════════════════════

// ── Meta Cloud API Types ──

export interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  verifyToken: string;
  apiVersion: string;
  webhookBaseUrl: string;
}

export interface IncomingWhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: 'text' | 'audio' | 'image' | 'document' | 'interactive' | 'reaction' | 'sticker' | 'location';
  text?: { body: string };
  audio?: { id: string; mime_type: string };
  image?: { id: string; mime_type: string; caption?: string };
  document?: { id: string; mime_type: string; filename?: string; caption?: string };
  interactive?: { type: string; [key: string]: unknown };
  reaction?: { message_id: string; emoji: string };
}

export interface WhatsAppContact {
  profile: { name: string };
  wa_id: string;
}

export interface WhatsAppStatusUpdate {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  errors?: Array<{ code: number; title: string; message?: string }>;
}

export interface WhatsAppWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: WhatsAppContact[];
        messages?: IncomingWhatsAppMessage[];
        statuses?: WhatsAppStatusUpdate[];
      };
      field: string;
    }>;
  }>;
}

// ── Send Message Types ──

export interface SendTextMessageParams {
  to: string;
  text: string;
  previewUrl?: boolean;
}

export interface SendAudioMessageParams {
  to: string;
  audioBuffer: Buffer;
  mimeType?: string;
}

export interface SendTemplateMessageParams {
  to: string;
  templateName: string;
  languageCode: string;
  parameters?: Array<{ type: string; text: string }>;
}

// ── Database Model Types ──

export interface WhatsAppPhoneLink {
  id: string;
  userId: string;
  phoneNumber: string;
  phoneNumberNormalized: string;
  isVerified: boolean;
  verificationCode: string | null;
  verificationExpiresAt: Date | null;
  verificationAttempts: number;
  preferredAgent: string;
  preferredLanguage: string;
  enableVoiceResponses: boolean;
  isActive: boolean;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppConversation {
  id: string;
  userId: string;
  phoneNumber: string;
  waConversationId: string | null;
  status: 'active' | 'expired' | 'closed';
  windowStart: Date;
  windowEnd: Date;
  messageCount: number;
  totalTokens: number;
  totalBilledCredits: number;
  agentName: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppMessage {
  id: string;
  conversationId: string;
  userId: string;
  direction: 'inbound' | 'outbound';
  messageType: 'text' | 'audio' | 'image' | 'document' | 'template' | 'interactive';
  content: string | null;
  waMessageId: string | null;
  mediaUrl: string | null;
  mediaMimeType: string | null;
  audioDurationMs: number | null;
  transcription: string | null;
  transcriptionConfidence: number | null;
  ttsAudioUrl: string | null;
  tokensUsed: number;
  billedCredits: number;
  status: 'pending' | 'processing' | 'sent' | 'delivered' | 'read' | 'failed';
  errorMessage: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface WhatsAppPlatformConfig {
  id: string;
  phoneNumberId: string;
  wabaId: string | null;
  accessTokenEncrypted: string;
  verifyToken: string;
  webhookUrl: string | null;
  businessName: string;
  greetingTemplate: string;
  isActive: boolean;
  apiVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

// ── Input Types ──

export interface CreateWhatsAppMessageInput {
  conversationId: string;
  userId: string;
  direction: 'inbound' | 'outbound';
  messageType: 'text' | 'audio' | 'image' | 'document' | 'template' | 'interactive';
  content?: string;
  waMessageId?: string;
  mediaUrl?: string;
  mediaMimeType?: string;
  audioDurationMs?: number;
  transcription?: string;
  transcriptionConfidence?: number;
  ttsAudioUrl?: string;
  tokensUsed?: number;
  billedCredits?: number;
  status?: 'pending' | 'processing' | 'sent' | 'delivered' | 'read' | 'failed';
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

export type WhatsAppMessageStatus = 'pending' | 'processing' | 'sent' | 'delivered' | 'read' | 'failed';

export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}
