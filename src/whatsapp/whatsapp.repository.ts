import { v4 as uuidv4 } from 'uuid';
import { dbClient } from '../infra';
import type {
  WhatsAppPhoneLink,
  WhatsAppConversation,
  WhatsAppMessage,
  CreateWhatsAppMessageInput,
  WhatsAppMessageStatus,
} from './whatsapp.types';
import { normalizePhoneNumber } from './whatsapp.types';

function rowToPhoneLink(row: Record<string, unknown>): WhatsAppPhoneLink {
  return {
    id: row['id'] as string,
    userId: row['user_id'] as string,
    phoneNumber: row['phone_number'] as string,
    phoneNumberNormalized: row['phone_number_normalized'] as string,
    isVerified: row['is_verified'] as boolean,
    verificationCode: (row['verification_code'] as string) ?? null,
    verificationExpiresAt: row['verification_expires_at'] ? new Date(row['verification_expires_at'] as string) : null,
    verificationAttempts: row['verification_attempts'] as number,
    preferredAgent: (row['preferred_agent'] as string) ?? 'sarah',
    preferredLanguage: (row['preferred_language'] as string) ?? 'fr-FR',
    enableVoiceResponses: row['enable_voice_responses'] as boolean,
    isActive: row['is_active'] as boolean,
    lastMessageAt: row['last_message_at'] ? new Date(row['last_message_at'] as string) : null,
    createdAt: new Date(row['created_at'] as string),
    updatedAt: new Date(row['updated_at'] as string),
  };
}

function rowToConversation(row: Record<string, unknown>): WhatsAppConversation {
  return {
    id: row['id'] as string,
    userId: row['user_id'] as string,
    phoneNumber: row['phone_number'] as string,
    waConversationId: (row['wa_conversation_id'] as string) ?? null,
    status: row['status'] as WhatsAppConversation['status'],
    windowStart: new Date(row['window_start'] as string),
    windowEnd: new Date(row['window_end'] as string),
    messageCount: row['message_count'] as number,
    totalTokens: row['total_tokens'] as number,
    totalBilledCredits: Number(row['total_billed_credits']),
    agentName: (row['agent_name'] as string) ?? 'sarah',
    metadata: (row['metadata'] as Record<string, unknown>) ?? {},
    createdAt: new Date(row['created_at'] as string),
    updatedAt: new Date(row['updated_at'] as string),
  };
}

function rowToMessage(row: Record<string, unknown>): WhatsAppMessage {
  return {
    id: row['id'] as string,
    conversationId: row['conversation_id'] as string,
    userId: row['user_id'] as string,
    direction: row['direction'] as WhatsAppMessage['direction'],
    messageType: row['message_type'] as WhatsAppMessage['messageType'],
    content: (row['content'] as string) ?? null,
    waMessageId: (row['wa_message_id'] as string) ?? null,
    mediaUrl: (row['media_url'] as string) ?? null,
    mediaMimeType: (row['media_mime_type'] as string) ?? null,
    audioDurationMs: (row['audio_duration_ms'] as number) ?? null,
    transcription: (row['transcription'] as string) ?? null,
    transcriptionConfidence: (row['transcription_confidence'] as number) ?? null,
    ttsAudioUrl: (row['tts_audio_url'] as string) ?? null,
    tokensUsed: (row['tokens_used'] as number) ?? 0,
    billedCredits: Number(row['billed_credits'] ?? 0),
    status: row['status'] as WhatsAppMessage['status'],
    errorMessage: (row['error_message'] as string) ?? null,
    metadata: (row['metadata'] as Record<string, unknown>) ?? {},
    createdAt: new Date(row['created_at'] as string),
  };
}

export class WhatsAppRepository {
  // ── Phone Links ──

  async linkPhone(userId: string, phoneNumber: string): Promise<WhatsAppPhoneLink> {
    const id = uuidv4();
    const normalized = normalizePhoneNumber(phoneNumber);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const result = await dbClient.query(
      `INSERT INTO whatsapp_phone_links (id, user_id, phone_number, phone_number_normalized, verification_code, verification_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO UPDATE SET
         phone_number = EXCLUDED.phone_number,
         phone_number_normalized = EXCLUDED.phone_number_normalized,
         verification_code = EXCLUDED.verification_code,
         verification_expires_at = EXCLUDED.verification_expires_at,
         verification_attempts = 0,
         is_verified = FALSE,
         updated_at = NOW()
       RETURNING *`,
      [id, userId, phoneNumber, normalized, code, expiresAt.toISOString()],
    );

    return rowToPhoneLink(result.rows[0] as Record<string, unknown>);
  }

  async verifyPhone(userId: string, code: string): Promise<boolean> {
    const result = await dbClient.query(
      `UPDATE whatsapp_phone_links
       SET verification_attempts = verification_attempts + 1,
           is_verified = CASE
             WHEN verification_code = $2 AND verification_expires_at > NOW() AND verification_attempts < 5
             THEN TRUE ELSE is_verified END,
           verification_code = CASE
             WHEN verification_code = $2 AND verification_expires_at > NOW()
             THEN NULL ELSE verification_code END,
           updated_at = NOW()
       WHERE user_id = $1
       RETURNING is_verified`,
      [userId, code],
    );

    return result.rows.length > 0 && (result.rows[0] as Record<string, unknown>)['is_verified'] === true;
  }

  async getPhoneLink(userId: string): Promise<WhatsAppPhoneLink | null> {
    const result = await dbClient.query(
      'SELECT * FROM whatsapp_phone_links WHERE user_id = $1',
      [userId],
    );
    return result.rows.length > 0 ? rowToPhoneLink(result.rows[0] as Record<string, unknown>) : null;
  }

  async findUserByPhone(phoneNormalized: string): Promise<WhatsAppPhoneLink | null> {
    const result = await dbClient.query(
      'SELECT * FROM whatsapp_phone_links WHERE phone_number_normalized = $1 AND is_verified = TRUE AND is_active = TRUE',
      [phoneNormalized],
    );
    return result.rows.length > 0 ? rowToPhoneLink(result.rows[0] as Record<string, unknown>) : null;
  }

  async unlinkPhone(userId: string): Promise<void> {
    await dbClient.query(
      'DELETE FROM whatsapp_phone_links WHERE user_id = $1',
      [userId],
    );
  }

  async updatePhoneSettings(userId: string, settings: {
    preferredAgent?: string;
    preferredLanguage?: string;
    enableVoiceResponses?: boolean;
  }): Promise<WhatsAppPhoneLink | null> {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (settings.preferredAgent !== undefined) {
      updates.push(`preferred_agent = $${paramIndex++}`);
      values.push(settings.preferredAgent);
    }
    if (settings.preferredLanguage !== undefined) {
      updates.push(`preferred_language = $${paramIndex++}`);
      values.push(settings.preferredLanguage);
    }
    if (settings.enableVoiceResponses !== undefined) {
      updates.push(`enable_voice_responses = $${paramIndex++}`);
      values.push(settings.enableVoiceResponses);
    }

    if (updates.length === 0) return this.getPhoneLink(userId);

    updates.push('updated_at = NOW()');
    values.push(userId);

    const result = await dbClient.query(
      `UPDATE whatsapp_phone_links SET ${updates.join(', ')} WHERE user_id = $${paramIndex} RETURNING *`,
      values,
    );

    return result.rows.length > 0 ? rowToPhoneLink(result.rows[0] as Record<string, unknown>) : null;
  }

  async updateLastMessage(userId: string): Promise<void> {
    await dbClient.query(
      'UPDATE whatsapp_phone_links SET last_message_at = NOW(), updated_at = NOW() WHERE user_id = $1',
      [userId],
    );
  }

  // ── Conversations ──

  async getActiveConversation(userId: string): Promise<WhatsAppConversation | null> {
    const result = await dbClient.query(
      `SELECT * FROM whatsapp_conversations
       WHERE user_id = $1 AND status = 'active' AND window_end > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [userId],
    );
    return result.rows.length > 0 ? rowToConversation(result.rows[0] as Record<string, unknown>) : null;
  }

  async createConversation(userId: string, phone: string, agentName: string): Promise<WhatsAppConversation> {
    const id = uuidv4();
    const result = await dbClient.query(
      `INSERT INTO whatsapp_conversations (id, user_id, phone_number, agent_name)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, userId, phone, agentName],
    );
    return rowToConversation(result.rows[0] as Record<string, unknown>);
  }

  async updateConversationStats(convId: string, tokens: number, credits: number): Promise<void> {
    await dbClient.query(
      `UPDATE whatsapp_conversations
       SET message_count = message_count + 1,
           total_tokens = total_tokens + $2,
           total_billed_credits = total_billed_credits + $3,
           updated_at = NOW()
       WHERE id = $1`,
      [convId, tokens, credits],
    );
  }

  async updateConversationMetadata(convId: string, metadata: Record<string, unknown>): Promise<void> {
    await dbClient.query(
      `UPDATE whatsapp_conversations
       SET metadata = COALESCE(metadata, '{}'::jsonb) || $2::jsonb,
           updated_at = NOW()
       WHERE id = $1`,
      [convId, JSON.stringify(metadata)],
    );
  }

  async expireOldConversations(): Promise<number> {
    const result = await dbClient.query(
      `UPDATE whatsapp_conversations
       SET status = 'expired', updated_at = NOW()
       WHERE status = 'active' AND window_end < NOW()`,
    );
    return result.rowCount ?? 0;
  }

  async listConversations(userId: string, limit = 20, offset = 0): Promise<WhatsAppConversation[]> {
    const result = await dbClient.query(
      'SELECT * FROM whatsapp_conversations WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset],
    );
    return result.rows.map((r) => rowToConversation(r as Record<string, unknown>));
  }

  // ── Messages ──

  async createMessage(input: CreateWhatsAppMessageInput): Promise<WhatsAppMessage> {
    const id = uuidv4();
    const result = await dbClient.query(
      `INSERT INTO whatsapp_messages
       (id, conversation_id, user_id, direction, message_type, content, wa_message_id,
        media_url, media_mime_type, audio_duration_ms, transcription, transcription_confidence,
        tts_audio_url, tokens_used, billed_credits, status, error_message, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING *`,
      [
        id, input.conversationId, input.userId, input.direction, input.messageType,
        input.content ?? null, input.waMessageId ?? null,
        input.mediaUrl ?? null, input.mediaMimeType ?? null, input.audioDurationMs ?? null,
        input.transcription ?? null, input.transcriptionConfidence ?? null,
        input.ttsAudioUrl ?? null, input.tokensUsed ?? 0, input.billedCredits ?? 0,
        input.status ?? 'pending', input.errorMessage ?? null,
        JSON.stringify(input.metadata ?? {}),
      ],
    );
    return rowToMessage(result.rows[0] as Record<string, unknown>);
  }

  async updateMessageStatus(waMessageId: string, status: WhatsAppMessageStatus): Promise<void> {
    const deliveredAt = status === 'delivered' ? ', delivered_at = NOW()' : '';
    const readAt = status === 'read' ? ', read_at = NOW()' : '';
    await dbClient.query(
      `UPDATE whatsapp_messages SET status = $1${deliveredAt}${readAt} WHERE wa_message_id = $2`,
      [status, waMessageId],
    );
  }

  async getConversationMessages(convId: string, limit = 50): Promise<WhatsAppMessage[]> {
    const result = await dbClient.query(
      'SELECT * FROM whatsapp_messages WHERE conversation_id = $1 ORDER BY created_at ASC LIMIT $2',
      [convId, limit],
    );
    return result.rows.map((r) => rowToMessage(r as Record<string, unknown>));
  }

  async getRecentMessagesForContext(userId: string, limit = 8): Promise<Array<{ role: string; content: string }>> {
    const result = await dbClient.query(
      `SELECT direction, content, transcription FROM whatsapp_messages
       WHERE user_id = $1 AND (content IS NOT NULL OR transcription IS NOT NULL)
       ORDER BY created_at DESC LIMIT $2`,
      [userId, limit],
    );

    return result.rows.reverse().map((r) => {
      const row = r as Record<string, unknown>;
      const text = (row['content'] as string) || (row['transcription'] as string) || '';
      return {
        role: row['direction'] === 'inbound' ? 'user' : 'assistant',
        content: text,
      };
    });
  }

  // ── Admin Stats ──

  async getStats(): Promise<{
    totalPhoneLinks: number;
    verifiedLinks: number;
    activeConversations: number;
    totalMessages: number;
    messagesToday: number;
  }> {
    const [links, verified, activeConvs, totalMsgs, msgsToday] = await Promise.all([
      dbClient.query('SELECT COUNT(*)::int as c FROM whatsapp_phone_links'),
      dbClient.query('SELECT COUNT(*)::int as c FROM whatsapp_phone_links WHERE is_verified = TRUE'),
      dbClient.query("SELECT COUNT(*)::int as c FROM whatsapp_conversations WHERE status = 'active'"),
      dbClient.query('SELECT COUNT(*)::int as c FROM whatsapp_messages'),
      dbClient.query("SELECT COUNT(*)::int as c FROM whatsapp_messages WHERE created_at > CURRENT_DATE"),
    ]);

    return {
      totalPhoneLinks: Number((links.rows[0] as Record<string, unknown>)['c']),
      verifiedLinks: Number((verified.rows[0] as Record<string, unknown>)['c']),
      activeConversations: Number((activeConvs.rows[0] as Record<string, unknown>)['c']),
      totalMessages: Number((totalMsgs.rows[0] as Record<string, unknown>)['c']),
      messagesToday: Number((msgsToday.rows[0] as Record<string, unknown>)['c']),
    };
  }
}

export const whatsAppRepository = new WhatsAppRepository();
