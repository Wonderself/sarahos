// ═══════════════════════════════════════════════════════
// Repondeur Agent — Tools & Repository
// ═══════════════════════════════════════════════════════

import { v4 as uuidv4 } from 'uuid';
import { dbClient } from '../../../infra';
import { logger } from '../../../utils/logger';
import type {
  RepondeurConfig,
  RepondeurMessage,
  RepondeurOrder,
  RepondeurSummary,
  ScheduleConfig,
  VipContact,
  FaqEntry,
  OrderItem,
  SummaryStructured,
} from './repondeur.types';

// ── Configuration ──

export async function getRepondeurConfig(userId: string): Promise<RepondeurConfig | null> {
  if (!dbClient.isConnected()) return null;
  try {
    const result = await dbClient.query(
      'SELECT * FROM repondeur_configs WHERE user_id = $1',
      [userId],
    );
    if (result.rows.length === 0) return null;
    return rowToConfig(result.rows[0] as Record<string, unknown>);
  } catch (err) {
    logger.error('Failed to get repondeur config', { userId, error: err instanceof Error ? err.message : String(err) });
    return null;
  }
}

export async function createRepondeurConfig(userId: string, data: Partial<RepondeurConfig> = {}): Promise<RepondeurConfig | null> {
  if (!dbClient.isConnected()) return null;
  const id = uuidv4();
  const result = await dbClient.query(
    `INSERT INTO repondeur_configs
     (id, user_id, is_active, active_mode, active_style, active_skills, persona,
      custom_instructions, greeting_message, absence_message, boss_phone_number,
      boss_user_id, summary_frequency, summary_delivery_channel, blocked_contacts,
      vip_contacts, faq_entries, schedule, max_response_length, language, gdpr_retention_days)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
     RETURNING *`,
    [
      id, userId,
      data.isActive ?? false,
      data.activeMode ?? 'professional',
      data.activeStyle ?? 'friendly_professional',
      data.activeSkills ?? ['message_taking', 'vip_detection'],
      data.persona ?? 'sarah',
      data.customInstructions ?? null,
      data.greetingMessage ?? null,
      data.absenceMessage ?? null,
      data.bossPhoneNumber ?? null,
      data.bossUserId ?? null,
      data.summaryFrequency ?? 'daily',
      data.summaryDeliveryChannel ?? 'whatsapp',
      data.blockedContacts ?? [],
      JSON.stringify(data.vipContacts ?? []),
      JSON.stringify(data.faqEntries ?? []),
      JSON.stringify(data.schedule ?? { alwaysOn: true, timezone: 'Europe/Paris', rules: [] }),
      data.maxResponseLength ?? 500,
      data.language ?? 'fr',
      data.gdprRetentionDays ?? 90,
    ],
  );
  return rowToConfig(result.rows[0] as Record<string, unknown>);
}

export async function updateRepondeurConfig(userId: string, data: Partial<RepondeurConfig>): Promise<RepondeurConfig | null> {
  if (!dbClient.isConnected()) return null;

  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const mappable: Array<[string, unknown]> = [
    ['is_active', data.isActive],
    ['active_mode', data.activeMode],
    ['active_style', data.activeStyle],
    ['active_skills', data.activeSkills],
    ['persona', data.persona],
    ['custom_instructions', data.customInstructions],
    ['greeting_message', data.greetingMessage],
    ['absence_message', data.absenceMessage],
    ['boss_phone_number', data.bossPhoneNumber],
    ['boss_user_id', data.bossUserId],
    ['summary_frequency', data.summaryFrequency],
    ['summary_delivery_channel', data.summaryDeliveryChannel],
    ['blocked_contacts', data.blockedContacts],
    ['max_response_length', data.maxResponseLength],
    ['language', data.language],
    ['gdpr_retention_days', data.gdprRetentionDays],
  ];

  for (const [col, val] of mappable) {
    if (val !== undefined) {
      fields.push(`${col} = $${idx++}`);
      values.push(val);
    }
  }

  // JSONB fields need JSON.stringify
  if (data.vipContacts !== undefined) {
    fields.push(`vip_contacts = $${idx++}`);
    values.push(JSON.stringify(data.vipContacts));
  }
  if (data.faqEntries !== undefined) {
    fields.push(`faq_entries = $${idx++}`);
    values.push(JSON.stringify(data.faqEntries));
  }
  if (data.schedule !== undefined) {
    fields.push(`schedule = $${idx++}`);
    values.push(JSON.stringify(data.schedule));
  }

  if (fields.length === 0) return getRepondeurConfig(userId);

  fields.push(`updated_at = NOW()`);
  values.push(userId);

  const result = await dbClient.query(
    `UPDATE repondeur_configs SET ${fields.join(', ')} WHERE user_id = $${idx} RETURNING *`,
    values,
  );
  if (result.rows.length === 0) return null;
  return rowToConfig(result.rows[0] as Record<string, unknown>);
}

export async function deleteRepondeurConfig(userId: string): Promise<boolean> {
  if (!dbClient.isConnected()) return false;
  const result = await dbClient.query(
    'DELETE FROM repondeur_configs WHERE user_id = $1',
    [userId],
  );
  return (result.rowCount ?? 0) > 0;
}

// ── Messages ──

export async function saveRepondeurMessage(input: {
  configId: string; userId: string; senderPhone: string; senderName?: string | null;
  direction: string; content: string; modeUsed: string; styleUsed: string;
  classification?: string; priority?: string; sentiment?: string;
  entitiesExtracted?: Record<string, unknown>; skillsTriggered?: string[];
  tokensUsed?: number; billedCredits?: number; waMessageId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<RepondeurMessage> {
  const id = uuidv4();
  const result = await dbClient.query(
    `INSERT INTO repondeur_messages
     (id, config_id, user_id, sender_phone, sender_name, direction, content,
      mode_used, style_used, classification, priority, sentiment,
      entities_extracted, skills_triggered, tokens_used, billed_credits,
      wa_message_id, metadata)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
     RETURNING *`,
    [
      id, input.configId, input.userId, input.senderPhone,
      input.senderName ?? null, input.direction, input.content,
      input.modeUsed, input.styleUsed,
      input.classification ?? 'general', input.priority ?? 'normal',
      input.sentiment ?? 'neutral',
      JSON.stringify(input.entitiesExtracted ?? {}),
      input.skillsTriggered ?? [],
      input.tokensUsed ?? 0, input.billedCredits ?? 0,
      input.waMessageId ?? null, JSON.stringify(input.metadata ?? {}),
    ],
  );
  return rowToMessage(result.rows[0] as Record<string, unknown>);
}

export async function getRepondeurMessages(
  configId: string,
  options: { limit?: number; offset?: number; classification?: string; priority?: string } = {},
): Promise<{ messages: RepondeurMessage[]; total: number }> {
  if (!dbClient.isConnected()) return { messages: [], total: 0 };

  const conditions = ['config_id = $1'];
  const values: unknown[] = [configId];
  let idx = 2;

  if (options.classification) {
    conditions.push(`classification = $${idx++}`);
    values.push(options.classification);
  }
  if (options.priority) {
    conditions.push(`priority = $${idx++}`);
    values.push(options.priority);
  }

  const where = conditions.join(' AND ');
  const limit = options.limit ?? 50;
  const offset = options.offset ?? 0;

  const [dataResult, countResult] = await Promise.all([
    dbClient.query(
      `SELECT * FROM repondeur_messages WHERE ${where} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx}`,
      [...values, limit, offset],
    ),
    dbClient.query(
      `SELECT COUNT(*) as total FROM repondeur_messages WHERE ${where}`,
      values,
    ),
  ]);

  return {
    messages: dataResult.rows.map((r) => rowToMessage(r as Record<string, unknown>)),
    total: Number((countResult.rows[0] as Record<string, unknown>)['total'] ?? 0),
  };
}

export async function getUnsummarizedMessages(
  configId: string, periodStart: string, periodEnd: string,
): Promise<RepondeurMessage[]> {
  if (!dbClient.isConnected()) return [];
  const result = await dbClient.query(
    `SELECT * FROM repondeur_messages
     WHERE config_id = $1 AND direction = 'inbound'
       AND included_in_summary_id IS NULL
       AND created_at BETWEEN $2 AND $3
     ORDER BY created_at ASC`,
    [configId, periodStart, periodEnd],
  );
  return result.rows.map((r) => rowToMessage(r as Record<string, unknown>));
}

export async function markMessagesSummarized(messageIds: string[], summaryId: string): Promise<void> {
  if (!dbClient.isConnected() || messageIds.length === 0) return;
  const placeholders = messageIds.map((_, i) => `$${i + 2}`).join(',');
  await dbClient.query(
    `UPDATE repondeur_messages SET included_in_summary_id = $1 WHERE id IN (${placeholders})`,
    [summaryId, ...messageIds],
  );
}

// ── Orders ──

export async function saveRepondeurOrder(input: {
  configId: string; messageId: string; customerPhone: string;
  customerName?: string | null; orderItems: OrderItem[];
  deliveryAddress?: string | null; deliveryNotes?: string | null;
}): Promise<RepondeurOrder> {
  const id = uuidv4();
  const result = await dbClient.query(
    `INSERT INTO repondeur_orders
     (id, config_id, message_id, customer_phone, customer_name,
      order_items, delivery_address, delivery_notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [
      id, input.configId, input.messageId, input.customerPhone,
      input.customerName ?? null, JSON.stringify(input.orderItems),
      input.deliveryAddress ?? null, input.deliveryNotes ?? null,
    ],
  );
  return rowToOrder(result.rows[0] as Record<string, unknown>);
}

export async function getRepondeurOrders(
  configId: string,
  options: { limit?: number; offset?: number; status?: string } = {},
): Promise<{ orders: RepondeurOrder[]; total: number }> {
  if (!dbClient.isConnected()) return { orders: [], total: 0 };

  const conditions = ['config_id = $1'];
  const values: unknown[] = [configId];
  let idx = 2;

  if (options.status) {
    conditions.push(`status = $${idx++}`);
    values.push(options.status);
  }

  const where = conditions.join(' AND ');
  const limit = options.limit ?? 50;
  const offset = options.offset ?? 0;

  const [dataResult, countResult] = await Promise.all([
    dbClient.query(
      `SELECT * FROM repondeur_orders WHERE ${where} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx}`,
      [...values, limit, offset],
    ),
    dbClient.query(
      `SELECT COUNT(*) as total FROM repondeur_orders WHERE ${where}`,
      values,
    ),
  ]);

  return {
    orders: dataResult.rows.map((r) => rowToOrder(r as Record<string, unknown>)),
    total: Number((countResult.rows[0] as Record<string, unknown>)['total'] ?? 0),
  };
}

export async function updateOrderStatus(orderId: string, status: string): Promise<RepondeurOrder | null> {
  if (!dbClient.isConnected()) return null;
  const result = await dbClient.query(
    `UPDATE repondeur_orders SET status = $1, updated_at = NOW(),
     confirmed_at = CASE WHEN $1 = 'confirmed' THEN NOW() ELSE confirmed_at END
     WHERE id = $2 RETURNING *`,
    [status, orderId],
  );
  if (result.rows.length === 0) return null;
  return rowToOrder(result.rows[0] as Record<string, unknown>);
}

// ── Summaries ──

export async function saveSummary(input: {
  configId: string; userId: string; summaryType: string;
  periodStart: string; periodEnd: string;
  totalMessages: number; urgentCount: number;
  vipCount: number; orderCount: number; complaintCount: number;
  summaryText: string; deliveryChannel: string; tokensUsed: number;
}): Promise<RepondeurSummary> {
  const id = uuidv4();
  let summaryText = input.summaryText;
  let summaryStructured = '{}';
  try {
    const parsed = JSON.parse(input.summaryText) as Record<string, unknown>;
    summaryText = (parsed['summaryText'] as string) ?? input.summaryText;
    summaryStructured = JSON.stringify(parsed['summaryStructured'] ?? {});
  } catch { /* LLM returned plain text */ }

  const result = await dbClient.query(
    `INSERT INTO repondeur_summaries
     (id, config_id, user_id, summary_type, period_start, period_end,
      total_messages, urgent_count, vip_count, order_count, complaint_count,
      summary_text, summary_structured, delivery_channel, tokens_used)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     RETURNING *`,
    [
      id, input.configId, input.userId, input.summaryType,
      input.periodStart, input.periodEnd,
      input.totalMessages, input.urgentCount,
      input.vipCount, input.orderCount, input.complaintCount,
      summaryText, summaryStructured, input.deliveryChannel, input.tokensUsed,
    ],
  );
  return rowToSummary(result.rows[0] as Record<string, unknown>);
}

export async function getRepondeurSummaries(
  configId: string,
  options: { limit?: number; offset?: number } = {},
): Promise<{ summaries: RepondeurSummary[]; total: number }> {
  if (!dbClient.isConnected()) return { summaries: [], total: 0 };
  const limit = options.limit ?? 20;
  const offset = options.offset ?? 0;

  const [dataResult, countResult] = await Promise.all([
    dbClient.query(
      'SELECT * FROM repondeur_summaries WHERE config_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [configId, limit, offset],
    ),
    dbClient.query(
      'SELECT COUNT(*) as total FROM repondeur_summaries WHERE config_id = $1',
      [configId],
    ),
  ]);

  return {
    summaries: dataResult.rows.map((r) => rowToSummary(r as Record<string, unknown>)),
    total: Number((countResult.rows[0] as Record<string, unknown>)['total'] ?? 0),
  };
}

// ── Schedule Checking ──

export function isScheduleActive(schedule: ScheduleConfig): boolean {
  if (schedule.alwaysOn) return true;
  if (!schedule.rules || schedule.rules.length === 0) return true;

  const now = new Date();
  const tz = schedule.timezone ?? 'Europe/Paris';

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: '2-digit', minute: '2-digit', hour12: false,
      weekday: 'short',
    });
    const parts = formatter.formatToParts(now);
    const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const weekday = parts.find(p => p.type === 'weekday')?.value ?? '';
    const hour = parts.find(p => p.type === 'hour')?.value ?? '00';
    const minute = parts.find(p => p.type === 'minute')?.value ?? '00';
    const currentDay = dayMap[weekday] ?? 0;
    const currentTime = `${hour}:${minute}`;

    return schedule.rules.some(rule =>
      rule.isActive &&
      rule.dayOfWeek === currentDay &&
      currentTime >= rule.startTime &&
      currentTime <= rule.endTime,
    );
  } catch {
    return true; // Fallback: allow if timezone parsing fails
  }
}

// ── Contact Checks ──

export function isContactBlocked(phone: string, blockedContacts: string[]): boolean {
  const normalized = phone.replace(/[^0-9+]/g, '');
  return blockedContacts.some(b => b.replace(/[^0-9+]/g, '') === normalized);
}

export function isContactVip(phone: string, vipContacts: VipContact[]): boolean {
  const normalized = phone.replace(/[^0-9+]/g, '');
  return vipContacts.some(v => v.phone.replace(/[^0-9+]/g, '') === normalized);
}

// ── GDPR Cleanup ──

export async function cleanupExpiredData(): Promise<{ messagesDeleted: number; ordersDeleted: number; summariesDeleted: number }> {
  if (!dbClient.isConnected()) return { messagesDeleted: 0, ordersDeleted: 0, summariesDeleted: 0 };

  try {
    // Delete orders linked to messages that will be deleted
    const orderResult = await dbClient.query(
      `DELETE FROM repondeur_orders WHERE message_id IN (
        SELECT m.id FROM repondeur_messages m
        JOIN repondeur_configs c ON c.id = m.config_id
        WHERE m.created_at < NOW() - (c.gdpr_retention_days || ' days')::interval
      )`,
    );

    // Delete expired messages
    const msgResult = await dbClient.query(
      `DELETE FROM repondeur_messages WHERE id IN (
        SELECT m.id FROM repondeur_messages m
        JOIN repondeur_configs c ON c.id = m.config_id
        WHERE m.created_at < NOW() - (c.gdpr_retention_days || ' days')::interval
      )`,
    );

    // Delete old summaries (keep 1 year)
    const summaryResult = await dbClient.query(
      `DELETE FROM repondeur_summaries WHERE created_at < NOW() - INTERVAL '365 days'`,
    );

    const result = {
      messagesDeleted: msgResult.rowCount ?? 0,
      ordersDeleted: orderResult.rowCount ?? 0,
      summariesDeleted: summaryResult.rowCount ?? 0,
    };

    if (result.messagesDeleted > 0 || result.ordersDeleted > 0) {
      logger.info('Repondeur GDPR cleanup completed', result);
    }

    return result;
  } catch (err) {
    logger.error('Repondeur GDPR cleanup failed', { error: err instanceof Error ? err.message : String(err) });
    return { messagesDeleted: 0, ordersDeleted: 0, summariesDeleted: 0 };
  }
}

// ── GDPR Export ──

export async function exportContactData(configId: string, phone: string): Promise<Record<string, unknown>> {
  if (!dbClient.isConnected()) return { error: 'Database not connected' };
  const normalized = phone.replace(/[^0-9+]/g, '');

  const [messages, orders] = await Promise.all([
    dbClient.query(
      'SELECT * FROM repondeur_messages WHERE config_id = $1 AND sender_phone = $2 ORDER BY created_at',
      [configId, normalized],
    ),
    dbClient.query(
      'SELECT * FROM repondeur_orders WHERE config_id = $1 AND customer_phone = $2 ORDER BY created_at',
      [configId, normalized],
    ),
  ]);

  return {
    phone: normalized,
    exportDate: new Date().toISOString(),
    messages: messages.rows,
    orders: orders.rows,
    totalMessages: messages.rows.length,
    totalOrders: orders.rows.length,
  };
}

export async function deleteContactData(configId: string, phone: string): Promise<{ deleted: number }> {
  if (!dbClient.isConnected()) return { deleted: 0 };
  const normalized = phone.replace(/[^0-9+]/g, '');

  // Delete orders first (FK constraint)
  await dbClient.query(
    `DELETE FROM repondeur_orders WHERE config_id = $1 AND customer_phone = $2`,
    [configId, normalized],
  );

  const result = await dbClient.query(
    'DELETE FROM repondeur_messages WHERE config_id = $1 AND sender_phone = $2',
    [configId, normalized],
  );

  return { deleted: result.rowCount ?? 0 };
}

// ── Stats ──

export async function getRepondeurStats(configId: string): Promise<Record<string, unknown>> {
  if (!dbClient.isConnected()) return {};

  const [msgStats, orderStats, summaryStats] = await Promise.all([
    dbClient.query(
      `SELECT
         COUNT(*) as total_messages,
         COUNT(*) FILTER (WHERE direction = 'inbound') as inbound,
         COUNT(*) FILTER (WHERE direction = 'outbound') as outbound,
         COUNT(*) FILTER (WHERE classification = 'urgent') as urgent,
         COUNT(*) FILTER (WHERE classification = 'vip') as vip,
         COUNT(*) FILTER (WHERE classification = 'order') as orders,
         COUNT(*) FILTER (WHERE classification = 'complaint') as complaints,
         COUNT(*) FILTER (WHERE classification = 'spam') as spam,
         SUM(tokens_used) as total_tokens,
         SUM(billed_credits) as total_credits
       FROM repondeur_messages WHERE config_id = $1`,
      [configId],
    ),
    dbClient.query(
      `SELECT
         COUNT(*) as total_orders,
         COUNT(*) FILTER (WHERE status = 'pending') as pending,
         COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed
       FROM repondeur_orders WHERE config_id = $1`,
      [configId],
    ),
    dbClient.query(
      `SELECT COUNT(*) as total_summaries
       FROM repondeur_summaries WHERE config_id = $1`,
      [configId],
    ),
  ]);

  const msg = msgStats.rows[0] as Record<string, unknown>;
  const ord = orderStats.rows[0] as Record<string, unknown>;
  const sum = summaryStats.rows[0] as Record<string, unknown>;

  return {
    messages: {
      total: Number(msg['total_messages'] ?? 0),
      inbound: Number(msg['inbound'] ?? 0),
      outbound: Number(msg['outbound'] ?? 0),
      urgent: Number(msg['urgent'] ?? 0),
      vip: Number(msg['vip'] ?? 0),
      orders: Number(msg['orders'] ?? 0),
      complaints: Number(msg['complaints'] ?? 0),
      spam: Number(msg['spam'] ?? 0),
      totalTokens: Number(msg['total_tokens'] ?? 0),
      totalCredits: Number(msg['total_credits'] ?? 0),
    },
    orders: {
      total: Number(ord['total_orders'] ?? 0),
      pending: Number(ord['pending'] ?? 0),
      confirmed: Number(ord['confirmed'] ?? 0),
    },
    summaries: {
      total: Number(sum['total_summaries'] ?? 0),
    },
  };
}

// ── Active Configs (for cron) ──

export async function getActiveConfigs(summaryFrequency?: string): Promise<RepondeurConfig[]> {
  if (!dbClient.isConnected()) return [];
  const conditions = ['is_active = TRUE'];
  const values: unknown[] = [];
  if (summaryFrequency) {
    conditions.push('summary_frequency = $1');
    values.push(summaryFrequency);
  }
  const result = await dbClient.query(
    `SELECT * FROM repondeur_configs WHERE ${conditions.join(' AND ')}`,
    values,
  );
  return result.rows.map((r) => rowToConfig(r as Record<string, unknown>));
}

// ── Row Mappers ──

function rowToConfig(row: Record<string, unknown>): RepondeurConfig {
  return {
    id: row['id'] as string,
    userId: row['user_id'] as string,
    isActive: row['is_active'] as boolean,
    activeMode: row['active_mode'] as RepondeurConfig['activeMode'],
    activeStyle: row['active_style'] as RepondeurConfig['activeStyle'],
    activeSkills: (row['active_skills'] as RepondeurConfig['activeSkills']) ?? ['message_taking'],
    persona: (row['persona'] as 'sarah' | 'emmanuel') ?? 'sarah',
    customInstructions: (row['custom_instructions'] as string) ?? null,
    greetingMessage: (row['greeting_message'] as string) ?? null,
    absenceMessage: (row['absence_message'] as string) ?? null,
    bossPhoneNumber: (row['boss_phone_number'] as string) ?? null,
    bossUserId: (row['boss_user_id'] as string) ?? null,
    summaryFrequency: (row['summary_frequency'] as RepondeurConfig['summaryFrequency']) ?? 'daily',
    summaryDeliveryChannel: (row['summary_delivery_channel'] as RepondeurConfig['summaryDeliveryChannel']) ?? 'whatsapp',
    blockedContacts: (row['blocked_contacts'] as string[]) ?? [],
    vipContacts: (row['vip_contacts'] as VipContact[]) ?? [],
    faqEntries: (row['faq_entries'] as FaqEntry[]) ?? [],
    schedule: (row['schedule'] as ScheduleConfig) ?? { alwaysOn: true, timezone: 'Europe/Paris', rules: [] },
    maxResponseLength: (row['max_response_length'] as number) ?? 500,
    language: (row['language'] as string) ?? 'fr',
    gdprRetentionDays: (row['gdpr_retention_days'] as number) ?? 90,
    createdAt: new Date(row['created_at'] as string),
    updatedAt: new Date(row['updated_at'] as string),
  };
}

function rowToMessage(row: Record<string, unknown>): RepondeurMessage {
  return {
    id: row['id'] as string,
    configId: row['config_id'] as string,
    userId: row['user_id'] as string,
    senderPhone: row['sender_phone'] as string,
    senderName: (row['sender_name'] as string) ?? null,
    direction: row['direction'] as 'inbound' | 'outbound',
    content: row['content'] as string,
    modeUsed: row['mode_used'] as RepondeurMessage['modeUsed'],
    styleUsed: row['style_used'] as RepondeurMessage['styleUsed'],
    classification: row['classification'] as RepondeurMessage['classification'],
    priority: row['priority'] as RepondeurMessage['priority'],
    sentiment: (row['sentiment'] as RepondeurMessage['sentiment']) ?? 'neutral',
    entitiesExtracted: (row['entities_extracted'] as Record<string, unknown>) ?? {},
    skillsTriggered: (row['skills_triggered'] as RepondeurMessage['skillsTriggered']) ?? [],
    tokensUsed: (row['tokens_used'] as number) ?? 0,
    billedCredits: Number(row['billed_credits'] ?? 0),
    includedInSummaryId: (row['included_in_summary_id'] as string) ?? null,
    waMessageId: (row['wa_message_id'] as string) ?? null,
    metadata: (row['metadata'] as Record<string, unknown>) ?? {},
    createdAt: new Date(row['created_at'] as string),
  };
}

function rowToOrder(row: Record<string, unknown>): RepondeurOrder {
  return {
    id: row['id'] as string,
    configId: row['config_id'] as string,
    messageId: row['message_id'] as string,
    customerPhone: row['customer_phone'] as string,
    customerName: (row['customer_name'] as string) ?? null,
    orderItems: (row['order_items'] as OrderItem[]) ?? [],
    orderTotalCents: (row['order_total_cents'] as number) ?? null,
    currency: (row['currency'] as string) ?? 'EUR',
    deliveryAddress: (row['delivery_address'] as string) ?? null,
    deliveryNotes: (row['delivery_notes'] as string) ?? null,
    status: (row['status'] as RepondeurOrder['status']) ?? 'pending',
    confirmedAt: row['confirmed_at'] ? new Date(row['confirmed_at'] as string) : null,
    metadata: (row['metadata'] as Record<string, unknown>) ?? {},
    createdAt: new Date(row['created_at'] as string),
    updatedAt: new Date(row['updated_at'] as string),
  };
}

function rowToSummary(row: Record<string, unknown>): RepondeurSummary {
  return {
    id: row['id'] as string,
    configId: row['config_id'] as string,
    userId: row['user_id'] as string,
    summaryType: row['summary_type'] as RepondeurSummary['summaryType'],
    periodStart: new Date(row['period_start'] as string),
    periodEnd: new Date(row['period_end'] as string),
    totalMessages: (row['total_messages'] as number) ?? 0,
    urgentCount: (row['urgent_count'] as number) ?? 0,
    vipCount: (row['vip_count'] as number) ?? 0,
    orderCount: (row['order_count'] as number) ?? 0,
    complaintCount: (row['complaint_count'] as number) ?? 0,
    summaryText: (row['summary_text'] as string) ?? '',
    summaryStructured: (row['summary_structured'] as SummaryStructured) ?? {
      highlights: [], urgentMessages: [], vipMessages: [], orders: [], complaints: [],
      stats: { totalInbound: 0, totalOutbound: 0, avgResponseTimeMs: 0, topSenders: [] },
    },
    deliveryChannel: (row['delivery_channel'] as RepondeurSummary['deliveryChannel']) ?? 'whatsapp',
    deliveryStatus: (row['delivery_status'] as RepondeurSummary['deliveryStatus']) ?? 'pending',
    externalMessageId: (row['external_message_id'] as string) ?? null,
    tokensUsed: (row['tokens_used'] as number) ?? 0,
    createdAt: new Date(row['created_at'] as string),
  };
}
