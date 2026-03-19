import { dbClient } from '../../infra';
import { redisClient } from '../../infra/redis/redis-client';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { eventBus } from '../event-bus/event-bus';
import { getActiveConfigs, cleanupExpiredData } from '../../agents/level1-execution/repondeur/repondeur.tools';
import { createBatch, pollBatch } from '../llm/llm-batch';
import { REPONDEUR_SYSTEM_PROMPT, SUMMARY_GENERATION_PROMPT } from '../../agents/level1-execution/repondeur/repondeur.prompts';
import {
  getUnsummarizedMessages,
  saveSummary,
  markMessagesSummarized,
  getRepondeurConfig,
} from '../../agents/level1-execution/repondeur/repondeur.tools';

/** Redis key prefix for pending batch tracking. TTL = 26h (batch expires in 24h). */
const BATCH_KEY_PREFIX = 'llm:batch:repondeur:';
const BATCH_KEY_TTL = 26 * 60 * 60;

export interface CronJob {
  name: string;
  intervalMs: number;
  handler: () => Promise<void>;
}

/**
 * Lightweight cron service for scheduled maintenance tasks.
 * Runs periodic jobs:
 * - Daily API call counter reset
 * - Demo account expiry check
 * - Low balance alerts
 * - Stale data cleanup
 */
export class CronService {
  private timers: Map<string, ReturnType<typeof setInterval>> = new Map();
  private running = false;

  /**
   * Start all cron jobs.
   */
  start(): void {
    if (this.running) return;
    this.running = true;

    const jobs: CronJob[] = [
      {
        name: 'reset_daily_api_calls',
        intervalMs: 60 * 60 * 1000, // Check every hour, only resets once per day
        handler: () => this.resetDailyApiCalls(),
      },
      {
        name: 'expire_demo_accounts',
        intervalMs: 60 * 60 * 1000, // Check every hour
        handler: () => this.expireDemoAccounts(),
      },
      {
        name: 'low_balance_alerts',
        intervalMs: 6 * 60 * 60 * 1000, // Every 6 hours
        handler: () => this.checkLowBalances(),
      },
      {
        name: 'cleanup_stale_data',
        intervalMs: 24 * 60 * 60 * 1000, // Daily
        handler: () => this.cleanupStaleData(),
      },
      {
        name: 'check_low_balance_alert',
        intervalMs: 30 * 60 * 1000, // Every 30 minutes
        handler: () => this.checkLowBalanceAlert(),
      },
      {
        name: 'repondeur_hourly_summary',
        intervalMs: 60 * 60 * 1000, // Every hour
        handler: () => this.generateRepondeurSummaries('hourly'),
      },
      {
        name: 'repondeur_daily_summary',
        intervalMs: 60 * 60 * 1000, // Check every hour, fires at 20:00 Paris time
        handler: () => this.generateRepondeurSummaries('daily'),
      },
      {
        name: 'repondeur_gdpr_cleanup',
        intervalMs: 24 * 60 * 60 * 1000, // Daily
        handler: () => this.repondeurGdprCleanup(),
      },
      {
        name: 'check_alarms',
        intervalMs: 60 * 1000, // Every minute
        handler: () => this.checkAlarms(),
      },
      {
        name: 'check_referral_qualifications',
        intervalMs: 24 * 60 * 60 * 1000, // Daily
        handler: () => this.checkReferralQualifications(),
      },
      {
        name: 'check_batch_results',
        intervalMs: 15 * 60 * 1000, // Every 15 minutes — poll pending Anthropic batches
        handler: () => this.checkPendingBatches(),
      },
      {
        name: 'action_reminders',
        intervalMs: 15 * 60 * 1000, // Every 15 minutes — check reminder_at
        handler: () => this.checkActionReminders(),
      },
      {
        name: 'action_due_alerts',
        intervalMs: 60 * 60 * 1000, // Every hour — check overdue actions
        handler: () => this.checkOverdueActions(),
      },
      {
        name: 'autopilot_daily_audit',
        intervalMs: 60 * 60 * 1000, // Check every hour, fires at 7h and 20h Paris time
        handler: () => this.runAutopilotDailyAudit(),
      },
      {
        name: 'autopilot_proposal_reminder',
        intervalMs: 4 * 60 * 60 * 1000, // Every 4 hours — remind admin of pending proposals
        handler: () => this.remindPendingProposals(),
      },
      {
        name: 'autopilot_proposal_expire',
        intervalMs: 60 * 60 * 1000, // Every hour — expire stale proposals
        handler: () => this.expireStaleProposals(),
      },
      {
        name: 'guardrails_credit_audit',
        intervalMs: 6 * 60 * 60 * 1000, // Every 6 hours
        handler: () => this.guardrailsCreditAudit(),
      },
      {
        name: 'email_sequence',
        intervalMs: 60 * 60 * 1000, // Every hour — check for J+2/J+5 emails to send
        handler: () => this.processEmailSequence(),
      },
    ];

    for (const job of jobs) {
      const timer = setInterval(() => {
        this.runJob(job).catch((err) => {
          logger.error(`Cron job ${job.name} failed`, { error: err instanceof Error ? err.message : String(err) });
        });
      }, job.intervalMs);
      timer.unref(); // Don't prevent process exit
      this.timers.set(job.name, timer);
      logger.info(`Cron job scheduled: ${job.name}`, { intervalMs: job.intervalMs });
    }

    // Run initial checks on startup (with 30s delay)
    setTimeout(() => {
      this.runJob({ name: 'expire_demo_accounts', intervalMs: 0, handler: () => this.expireDemoAccounts() }).catch(() => {});
    }, 30_000).unref();

    logger.info('Cron service started', { jobCount: jobs.length });
  }

  /**
   * Stop all cron jobs.
   */
  stop(): void {
    for (const [name, timer] of this.timers) {
      clearInterval(timer);
      logger.info(`Cron job stopped: ${name}`);
    }
    this.timers.clear();
    this.running = false;
    logger.info('Cron service stopped');
  }

  /**
   * Manually trigger a job by name (used by admin "Run now" button).
   * Bypasses the scheduler and runs the handler directly via runJob.
   */
  public async triggerJob(name: string): Promise<void> {
    const handlers: Record<string, () => Promise<void>> = {
      reset_daily_api_calls:         () => this.resetDailyApiCalls(),
      expire_demo_accounts:          () => this.expireDemoAccounts(),
      low_balance_alerts:            () => this.checkLowBalances(),
      cleanup_stale_data:            () => this.cleanupStaleData(),
      check_low_balance_alert:       () => this.checkLowBalanceAlert(),
      repondeur_hourly_summary:      () => this.generateRepondeurSummaries('hourly'),
      repondeur_daily_summary:       () => this.generateRepondeurSummaries('daily'),
      repondeur_gdpr_cleanup:        () => this.repondeurGdprCleanup(),
      check_alarms:                  () => this.checkAlarms(),
      check_referral_qualifications: () => this.checkReferralQualifications(),
      check_batch_results:           () => this.checkPendingBatches(),
      action_reminders:              () => this.checkActionReminders(),
      action_due_alerts:             () => this.checkOverdueActions(),
      autopilot_daily_audit:         () => this.runAutopilotDailyAudit(),
      autopilot_proposal_reminder:   () => this.remindPendingProposals(),
      autopilot_proposal_expire:     () => this.expireStaleProposals(),
      guardrails_credit_audit:       () => this.guardrailsCreditAudit(),
      email_sequence:                () => this.processEmailSequence(),
    };
    const handler = handlers[name];
    if (!handler) throw new Error(`Unknown cron job: ${name}`);
    await this.runJob({ name, intervalMs: 0, handler });
  }

  /**
   * Acquire a distributed lock via Redis SET NX EX.
   * Returns true if lock acquired (or Redis unavailable = single process mode).
   */
  private async acquireLock(jobName: string, ttlSeconds: number): Promise<boolean> {
    try {
      return await redisClient.setNx(`cron:lock:${jobName}`, process.pid?.toString() ?? '1', ttlSeconds);
    } catch {
      return true; // No Redis = single process, proceed without lock
    }
  }

  /**
   * Release a distributed lock.
   */
  private async releaseLock(jobName: string): Promise<void> {
    try {
      if (redisClient.isConnected()) {
        await redisClient.del(`cron:lock:${jobName}`);
      }
    } catch {
      // Best effort
    }
  }

  /**
   * Run a job with distributed locking and log result to cron_history table.
   */
  private async runJob(job: CronJob): Promise<void> {
    // Acquire distributed lock to prevent duplicate runs across processes
    // TTL = interval + 30s safety margin (ensures lock outlasts the interval to prevent overlap)
    const lockTtl = Math.ceil(job.intervalMs / 1000) + 30;
    const acquired = await this.acquireLock(job.name, lockTtl);
    if (!acquired) {
      logger.debug(`Cron job skipped (lock held by another process): ${job.name}`);
      return;
    }

    const startTime = Date.now();
    let status = 'success';
    let errorMessage: string | null = null;
    let recordsAffected = 0;

    try {
      await job.handler();
    } catch (error) {
      status = 'error';
      errorMessage = error instanceof Error ? error.message : String(error);
    } finally {
      await this.releaseLock(job.name);
    }

    const durationMs = Date.now() - startTime;

    // Log to cron_history
    if (dbClient.isConnected()) {
      try {
        await dbClient.query(
          `INSERT INTO cron_history (id, job_name, status, duration_ms, result, error_message)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [uuidv4(), job.name, status, durationMs, JSON.stringify({ records_affected: recordsAffected }), errorMessage],
        );
      } catch {
        // Don't fail the job if logging fails
      }
    }

    if (status === 'error') {
      logger.error(`Cron job failed: ${job.name}`, { durationMs, error: errorMessage });
    } else {
      logger.debug(`Cron job completed: ${job.name}`, { durationMs, recordsAffected });
    }
  }

  /**
   * Reset daily API call counters for all users.
   * Only runs if last reset was >23 hours ago (prevents double-runs).
   */
  private async resetDailyApiCalls(): Promise<void> {
    if (!dbClient.isConnected()) return;

    // Check last run
    const lastRun = await dbClient.query(
      `SELECT created_at FROM cron_history WHERE job_name = 'reset_daily_api_calls' AND status = 'success' ORDER BY created_at DESC LIMIT 1`,
    );
    if (lastRun.rows[0]) {
      const lastRunTime = new Date((lastRun.rows[0] as Record<string, unknown>)['created_at'] as string);
      const hoursSince = (Date.now() - lastRunTime.getTime()) / (1000 * 60 * 60);
      if (hoursSince < 23) return; // Already ran recently
    }

    const result = await dbClient.query(
      `UPDATE users SET daily_api_calls = 0 WHERE daily_api_calls > 0`,
    );
    logger.info('Daily API calls reset', { affected: result.rowCount ?? 0 });
  }

  /**
   * Deactivate expired demo accounts.
   */
  private async expireDemoAccounts(): Promise<void> {
    if (!dbClient.isConnected()) return;

    const result = await dbClient.query(
      `UPDATE users SET is_active = FALSE, tier = 'guest'
       WHERE tier = 'demo' AND demo_expires_at IS NOT NULL AND demo_expires_at < NOW() AND is_active = TRUE`,
    );

    const affected = result.rowCount ?? 0;
    if (affected > 0) {
      logger.info('Demo accounts expired', { count: affected });
    }
  }

  /**
   * Check for wallets with low balance and queue notifications.
   */
  private async checkLowBalances(): Promise<void> {
    if (!dbClient.isConnected()) return;

    // Find wallets with balance < 10% of their total deposited (min threshold: 1 credit worth)
    const result = await dbClient.query(
      `SELECT w.user_id, w.balance_credits, w.total_deposited
       FROM wallets w
       WHERE w.balance_credits > 0
         AND w.balance_credits < GREATEST(w.total_deposited * 0.1, 1000000)
         AND NOT EXISTS (
           SELECT 1 FROM notifications n
           WHERE n.user_id = w.user_id
             AND n.type = 'low_balance'
             AND n.created_at > NOW() - INTERVAL '24 hours'
         )`,
    );

    for (const row of result.rows) {
      const r = row as Record<string, unknown>;
      try {
        await dbClient.query(
          `INSERT INTO notifications (id, user_id, channel, type, subject, body, metadata)
           VALUES ($1, $2, 'in_app', 'low_balance', 'Low balance alert', $3, $4)`,
          [
            uuidv4(),
            r['user_id'],
            `Your wallet balance is running low. Please top up to continue using services.`,
            JSON.stringify({ balance: Number(r['balance_credits']) }),
          ],
        );
      } catch {
        // Continue with other users if one fails
      }
    }

    if (result.rows.length > 0) {
      logger.info('Low balance alerts sent', { count: result.rows.length });
    }
  }

  /**
   * Clean up old data: stale sessions, old cron logs, etc.
   */
  private async cleanupStaleData(): Promise<void> {
    if (!dbClient.isConnected()) return;

    // Remove cron history older than 30 days
    await dbClient.query(
      `DELETE FROM cron_history WHERE created_at < NOW() - INTERVAL '30 days'`,
    );

    // Remove read notifications older than 90 days
    await dbClient.query(
      `DELETE FROM notifications WHERE status = 'read' AND created_at < NOW() - INTERVAL '90 days'`,
    );

    logger.debug('Stale data cleanup completed');
  }

  /**
   * Generate repondeur summaries for active configs with matching frequency.
   * Uses Batch API (−50% cost) when 3+ configs; falls back to event bus for fewer.
   */
  private async generateRepondeurSummaries(frequency: 'hourly' | 'daily'): Promise<void> {
    if (!dbClient.isConnected()) return;

    // For daily summaries, only fire at 20:00 Paris time
    if (frequency === 'daily') {
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Europe/Paris',
          hour: '2-digit',
          hour12: false,
        });
        const hour = formatter.formatToParts(new Date()).find(p => p.type === 'hour')?.value;
        if (hour !== '20') return;
      } catch {
        return;
      }
    }

    try {
      const configs = await getActiveConfigs(frequency);
      if (configs.length === 0) return;

      const now = new Date();
      const periodEnd = now.toISOString();
      const periodStart = frequency === 'hourly'
        ? new Date(now.getTime() - 60 * 60 * 1000).toISOString()
        : new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

      // ── Batch API path (3+ users, −50% cost) ──
      if (configs.length >= 3 && redisClient.isConnected()) {
        await this.generateRepondeurSummariesBatch(configs, frequency, periodStart, periodEnd);
        return;
      }

      // ── Event bus path (1-2 users, immediate delivery) ──
      for (const config of configs) {
        await eventBus.publish('RepondeurSummaryRequested', 'cron-service', {
          configId: config.id,
          userId: config.userId,
          periodStart,
          periodEnd,
          summaryType: frequency,
        });
      }

      logger.info(`Repondeur ${frequency} summaries triggered (event bus)`, { count: configs.length });
    } catch (error) {
      logger.error(`Repondeur ${frequency} summary generation failed`, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Submit repondeur summaries as a single Anthropic batch request (−50% cost).
   * Results processed asynchronously by check_batch_results cron job.
   */
  private async generateRepondeurSummariesBatch(
    configs: Array<{ id: string; userId: string; summaryDeliveryChannel: string }>,
    frequency: 'hourly' | 'daily',
    periodStart: string,
    periodEnd: string,
  ): Promise<void> {
    const batchRequests: Array<{
      customId: string;
      configId: string;
      userId: string;
      summaryDeliveryChannel: string;
      messageCount: number;
      request: import('../llm/llm-batch').LLMBatchRequest;
    }> = [];

    for (const config of configs) {
      try {
        const messages = await getUnsummarizedMessages(config.id, periodStart, periodEnd);
        if (messages.length === 0) continue;

        const messagesText = messages.map((m) =>
          `[${m.createdAt.toISOString()}] [${m.classification}/${m.priority}] ${m.senderName ?? m.senderPhone}: ${m.content}`,
        ).join('\n');

        const userMessage = SUMMARY_GENERATION_PROMPT
          .replace('{periodStart}', periodStart)
          .replace('{periodEnd}', periodEnd)
          .replace('{messageCount}', String(messages.length))
          .replace('{messages}', messagesText);

        const customId = `repondeur-${frequency}-${config.id}-${config.userId}-${Date.now()}`;

        batchRequests.push({
          customId,
          configId: config.id,
          userId: config.userId,
          summaryDeliveryChannel: config.summaryDeliveryChannel,
          messageCount: messages.length,
          request: {
            customId,
            request: {
              agentId: 'repondeur-agent',
              agentName: 'Repondeur Agent',
              modelTier: 'fast',
              systemPrompt: REPONDEUR_SYSTEM_PROMPT,
              userMessage,
              maxTokens: 1024,
            },
          },
        });
      } catch {
        // Skip this config on error, continue with others
      }
    }

    if (batchRequests.length === 0) return;

    const batchId = await createBatch(batchRequests.map(r => r.request));

    // Store batch metadata in Redis so check_batch_results knows what to do with results
    const batchMeta = {
      batchId,
      frequency,
      periodStart,
      periodEnd,
      summaryType: frequency,
      requests: batchRequests.map(r => ({
        customId: r.customId,
        configId: r.configId,
        userId: r.userId,
        summaryDeliveryChannel: r.summaryDeliveryChannel,
        messageCount: r.messageCount,
      })),
    };

    await redisClient.set(
      `${BATCH_KEY_PREFIX}${batchId}`,
      JSON.stringify(batchMeta),
      BATCH_KEY_TTL,
    );

    // Register batchId in the active batches tracking list
    const activeBatchesKey = 'llm:active_batches';
    try {
      const raw = await redisClient.get(activeBatchesKey);
      const active: string[] = raw ? (JSON.parse(raw) as string[]) : [];
      active.push(batchId);
      await redisClient.set(activeBatchesKey, JSON.stringify(active), BATCH_KEY_TTL);
    } catch {
      // Best effort — check_batch_results will not find this batch, fallback to event bus
    }

    logger.info(`Repondeur ${frequency} summaries submitted as batch (−50% cost)`, {
      batchId,
      count: batchRequests.length,
    });
  }

  /**
   * Poll all pending Anthropic batches and process completed results.
   * Runs every 15 minutes. Handles repondeur summary batch results.
   */
  private async checkPendingBatches(): Promise<void> {
    if (!redisClient.isConnected() || !dbClient.isConnected()) return;

    // Find all pending batch keys in Redis
    // Note: Redis scan is not in our client; we track active batches via a set key
    const activeBatchesKey = 'llm:active_batches';
    let batchIds: string[] = [];
    try {
      const raw = await redisClient.get(activeBatchesKey);
      batchIds = raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return;
    }

    if (batchIds.length === 0) return;

    const stillActive: string[] = [];

    for (const batchId of batchIds) {
      try {
        const metaRaw = await redisClient.get(`${BATCH_KEY_PREFIX}${batchId}`);
        if (!metaRaw) continue; // TTL expired or already processed

        const { status, results } = await pollBatch(batchId);

        if (status.status !== 'ended') {
          stillActive.push(batchId);
          continue;
        }

        if (!results || results.length === 0) continue;

        const meta = JSON.parse(metaRaw) as {
          frequency: 'hourly' | 'daily';
          periodStart: string;
          periodEnd: string;
          summaryType: 'hourly' | 'daily';
          requests: Array<{
            customId: string;
            configId: string;
            userId: string;
            summaryDeliveryChannel: string;
            messageCount: number;
          }>;
        };

        // Process each result
        for (const result of results) {
          if (!result.response) {
            logger.warn('Batch result errored', { customId: result.customId, error: result.error });
            continue;
          }

          const reqMeta = meta.requests.find(r => r.customId === result.customId);
          if (!reqMeta) continue;

          // Get config to know urgent/vip/order counts
          const config = await getRepondeurConfig(reqMeta.userId);
          if (!config) continue;

          const messages = await getUnsummarizedMessages(
            reqMeta.configId,
            meta.periodStart,
            meta.periodEnd,
          );

          const summary = await saveSummary({
            configId: reqMeta.configId,
            userId: reqMeta.userId,
            summaryType: meta.summaryType,
            periodStart: meta.periodStart,
            periodEnd: meta.periodEnd,
            totalMessages: reqMeta.messageCount,
            urgentCount: messages.filter(m => m.priority === 'urgent' || m.priority === 'critical').length,
            vipCount: messages.filter(m => m.classification === 'vip').length,
            orderCount: messages.filter(m => m.classification === 'order').length,
            complaintCount: messages.filter(m => m.classification === 'complaint').length,
            summaryText: result.response.content,
            deliveryChannel: config.summaryDeliveryChannel,
            tokensUsed: result.response.totalTokens,
          });

          await markMessagesSummarized(messages.map(m => m.id), summary.id);

          // Trigger delivery
          await eventBus.publish('RepondeurSummaryDelivered', 'cron-service', {
            summaryId: summary.id,
            userId: reqMeta.userId,
          });
        }

        // Clean up processed batch from Redis
        await redisClient.del(`${BATCH_KEY_PREFIX}${batchId}`);
        logger.info('Batch processed and cleaned up', { batchId, results: results.length });
      } catch (error) {
        logger.error('Error processing batch', {
          batchId,
          error: error instanceof Error ? error.message : String(error),
        });
        stillActive.push(batchId); // Keep for retry
      }
    }

    // Update active batches list
    try {
      if (stillActive.length > 0) {
        await redisClient.set(activeBatchesKey, JSON.stringify(stillActive), BATCH_KEY_TTL);
      } else {
        await redisClient.del(activeBatchesKey);
      }
    } catch {
      // Best effort
    }
  }

  /**
   * Check wallets with low balance and notify admin + user.
   * Note: This does NOT auto-deposit. It sends notifications so admin can manually process.
   */
  private async checkLowBalanceAlert(): Promise<void> {
    if (!dbClient.isConnected()) return;

    try {
      const { walletService } = await import('../../billing/wallet.service');
      const walletsNeedingTopup = await walletService.getWalletsNeedingTopup();

      for (const wallet of walletsNeedingTopup) {
        // Check if we already sent a topup request notification in the last 6 hours
        const existing = await dbClient.query(
          `SELECT 1 FROM notifications
           WHERE user_id = $1 AND type = 'low_balance_alert' AND created_at > NOW() - INTERVAL '6 hours'`,
          [wallet.userId],
        );
        if (existing.rows.length > 0) continue;

        const creditsBalance = (wallet.balance / 1_000_000).toFixed(2);

        // Notify user
        await dbClient.query(
          `INSERT INTO notifications (id, user_id, channel, type, subject, body, metadata)
           VALUES ($1, $2, 'in_app', 'low_balance_alert', 'Alerte solde bas', $3, $4)`,
          [
            uuidv4(),
            wallet.userId,
            `Votre solde est de ${creditsBalance} credits (sous le seuil de ${(wallet.threshold / 1_000_000).toFixed(2)} credits). Contactez un administrateur pour recharger.`,
            JSON.stringify({ balance: wallet.balance, requestedAmount: wallet.amount }),
          ],
        );

        // Notify all admins
        const admins = await dbClient.query(
          `SELECT id FROM users WHERE role = 'admin' AND is_active = TRUE`,
        );
        for (const admin of admins.rows) {
          const adminRow = admin as Record<string, unknown>;
          await dbClient.query(
            `INSERT INTO notifications (id, user_id, channel, type, subject, body, metadata)
             VALUES ($1, $2, 'in_app', 'admin_low_balance_alert', 'Alerte solde bas client', $3, $4)`,
            [
              uuidv4(),
              adminRow['id'],
              `L'utilisateur (${wallet.userId}) a un solde bas: ${creditsBalance} credits (seuil: ${(wallet.threshold / 1_000_000).toFixed(2)} credits). Action manuelle requise.`,
              JSON.stringify({ targetUserId: wallet.userId, balance: wallet.balance, requestedAmount: wallet.amount }),
            ],
          );
        }

        logger.info('Low balance alert sent', { userId: wallet.userId, balance: wallet.balance });
      }

      if (walletsNeedingTopup.length > 0) {
        logger.info('Low balance alert check completed', { walletsAlerted: walletsNeedingTopup.length });
      }
    } catch (error) {
      logger.error('Low balance alert check failed', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * GDPR cleanup for repondeur expired data.
   */
  private async repondeurGdprCleanup(): Promise<void> {
    try {
      const result = await cleanupExpiredData();
      if (result.messagesDeleted > 0 || result.ordersDeleted > 0) {
        logger.info('Repondeur GDPR cleanup completed', result);
      }
    } catch (error) {
      logger.error('Repondeur GDPR cleanup failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  /**
   * Check and trigger due alarms (réveil intelligent).
   */
  private async checkAlarms(): Promise<void> {
    if (!dbClient.isConnected()) return;

    try {
      const { alarmService } = await import('../../reveil/alarm.service');
      await alarmService.checkAndTriggerAlarms();
    } catch (error) {
      logger.error('Alarm check failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  /**
   * Daily check: track referral spending thresholds and credit rewards.
   * Statuses: pending → month1_ok → qualified → rewarded (or failed).
   */
  private async checkReferralQualifications(): Promise<void> {
    if (!dbClient.isConnected()) return;

    try {
      const referrals = await dbClient.query(
        `SELECT r.*, u.created_at as referred_created_at
         FROM referrals r JOIN users u ON r.referred_id = u.id
         WHERE r.status IN ('pending', 'month1_ok')`,
      );

      if (referrals.rows.length === 0) return;

      const MONTHLY_THRESHOLD = 9_000_000; // 9 credits in micro-credits
      const REWARD_AMOUNT = 20_000_000;    // 20 credits reward
      let processed = 0;

      for (const row of referrals.rows) {
        const ref = row as Record<string, unknown>;
        const referredId = ref['referred_id'] as string;
        const referrerId = ref['referrer_id'] as string;
        const referralId = ref['id'] as string;
        const referredCreatedAt = new Date(ref['referred_created_at'] as string);
        const status = ref['status'] as string;
        const now = new Date();

        // Calculate month boundaries from referral creation
        const month1End = new Date(referredCreatedAt);
        month1End.setMonth(month1End.getMonth() + 1);
        const month2End = new Date(month1End);
        month2End.setMonth(month2End.getMonth() + 1);

        // Get month 1 spend
        const m1Result = await dbClient.query(
          `SELECT COALESCE(SUM(billed_credits), 0)::bigint as spend
           FROM llm_usage_log WHERE user_id = $1 AND created_at >= $2 AND created_at < $3`,
          [referredId, referredCreatedAt, month1End],
        );
        const month1Spend = Number((m1Result.rows[0] as Record<string, unknown>)['spend']);
        await dbClient.query('UPDATE referrals SET month1_spend = $1, updated_at = NOW() WHERE id = $2', [month1Spend, referralId]);

        if (status === 'pending' && now >= month1End) {
          if (month1Spend >= MONTHLY_THRESHOLD) {
            await dbClient.query("UPDATE referrals SET status = 'month1_ok', updated_at = NOW() WHERE id = $1", [referralId]);
          } else {
            await dbClient.query("UPDATE referrals SET status = 'failed', updated_at = NOW() WHERE id = $1", [referralId]);
          }
          processed++;
          continue;
        }

        if (status === 'month1_ok' && now >= month2End) {
          const m2Result = await dbClient.query(
            `SELECT COALESCE(SUM(billed_credits), 0)::bigint as spend
             FROM llm_usage_log WHERE user_id = $1 AND created_at >= $2 AND created_at < $3`,
            [referredId, month1End, month2End],
          );
          const month2Spend = Number((m2Result.rows[0] as Record<string, unknown>)['spend']);
          await dbClient.query('UPDATE referrals SET month2_spend = $1, updated_at = NOW() WHERE id = $2', [month2Spend, referralId]);

          if (month2Spend >= MONTHLY_THRESHOLD) {
            // Qualified! Credit reward to referrer
            await dbClient.query(
              "UPDATE referrals SET status = 'qualified', updated_at = NOW() WHERE id = $1",
              [referralId],
            );

            const { walletService } = await import('../../billing/wallet.service');
            const reward = await walletService.deposit({
              userId: referrerId,
              amount: REWARD_AMOUNT,
              description: 'Recompense parrainage (filleul qualifie)',
              referenceType: 'referral_reward',
              referenceId: referralId,
            });

            if (reward) {
              await dbClient.query(
                "UPDATE referrals SET status = 'rewarded', reward_credited = TRUE, reward_amount = $1, updated_at = NOW() WHERE id = $2",
                [REWARD_AMOUNT, referralId],
              );

              // Notify referrer
              await dbClient.query(
                `INSERT INTO notifications (id, user_id, channel, type, subject, body, status)
                 VALUES ($1, $2, 'in_app', 'referral_reward', 'Recompense parrainage !',
                 'Felicitations ! Votre filleul est qualifie. 20 credits ont ete credites sur votre compte.', 'pending')`,
                [uuidv4(), referrerId],
              );

              logger.info('Referral reward credited', { referralId, referrerId, referredId, reward: REWARD_AMOUNT });
            }
          } else {
            await dbClient.query("UPDATE referrals SET status = 'failed', updated_at = NOW() WHERE id = $1", [referralId]);
          }
          processed++;
        }
      }

      if (processed > 0) {
        logger.info('Referral qualifications checked', { processed, total: referrals.rows.length });
      }
    } catch (error) {
      logger.error('Referral qualification check failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  // ─── Action Reminders ───

  private async checkActionReminders(): Promise<void> {
    if (!dbClient.isConnected()) return;
    try {
      const { actionRepository } = await import('../../actions/action.repository');
      const dueActions = await actionRepository.getDueActions(new Date());
      if (dueActions.length === 0) return;

      logger.info(`Found ${dueActions.length} actions with due reminders`);
      for (const action of dueActions) {
        try {
          const { notificationService } = await import('../../notifications/notification.service');
          await notificationService.send({
            userId: action.userId,
            channel: 'in_app',
            type: 'action_reminder',
            subject: `Rappel: ${action.title}`,
            body: action.description || `Action "${action.title}" nécessite votre attention.`,
          });
          // Clear reminder so it doesn't fire again
          await actionRepository.update(action.id, action.userId, { reminderAt: null });
        } catch (error) {
          logger.error('Failed to send action reminder', { actionId: action.id, error });
        }
      }
    } catch (error) {
      logger.error('Action reminders check failed', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  // ─── Overdue Actions ───

  private async checkOverdueActions(): Promise<void> {
    if (!dbClient.isConnected()) return;
    try {
      const { actionRepository } = await import('../../actions/action.repository');
      const overdue = await actionRepository.getOverdueActions();
      if (overdue.length === 0) return;

      logger.info(`Found ${overdue.length} overdue actions`);
      // Group by user
      const byUser = new Map<string, typeof overdue>();
      for (const action of overdue) {
        const list = byUser.get(action.userId) ?? [];
        list.push(action);
        byUser.set(action.userId, list);
      }

      for (const [userId, userActions] of byUser) {
        try {
          const { notificationService } = await import('../../notifications/notification.service');
          await notificationService.send({
            userId,
            channel: 'in_app',
            type: 'action_overdue',
            subject: `${userActions.length} action${userActions.length > 1 ? 's' : ''} en retard`,
            body: userActions.map(a => `- ${a.title}`).join('\n').slice(0, 500),
          });
        } catch (error) {
          logger.error('Failed to send overdue alert', { userId, error });
        }
      }
    } catch (error) {
      logger.error('Overdue actions check failed', { error: error instanceof Error ? error.message : String(error) });
    }
  }
  // ─── Autopilot: Daily Audit ───

  private async runAutopilotDailyAudit(): Promise<void> {
    const { config } = await import('../../utils/config');
    if (config.AUTOPILOT_ENABLED !== 'true') return;

    // Check if autopilot cron is disabled via Redis
    try {
      const disabled = await redisClient.get('autopilot:cron_disabled:autopilot_daily_audit');
      if (disabled) return;
    } catch { /* no Redis = proceed */ }

    // Only fire at 7h or 20h Paris time
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Paris',
        hour: '2-digit',
        hour12: false,
      });
      const hour = formatter.formatToParts(new Date()).find(p => p.type === 'hour')?.value;
      if (hour !== '07' && hour !== '20') return;
    } catch { return; }

    try {
      const { runHealthAudit } = await import('../../autopilot/auditors/health.auditor');
      const { runBusinessAudit } = await import('../../autopilot/auditors/business.auditor');
      const { runSecurityAudit } = await import('../../autopilot/auditors/security.auditor');
      const { sendAuditReportToAdmin } = await import('../../autopilot/autopilot.service');

      const [healthReport, businessReport, securityReport] = await Promise.allSettled([
        runHealthAudit(),
        runBusinessAudit(),
        runSecurityAudit(),
      ]);

      const reports = [healthReport, businessReport, securityReport]
        .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof runHealthAudit>>> => r.status === 'fulfilled')
        .map(r => r.value);

      for (const report of reports) {
        await sendAuditReportToAdmin(report).catch(err =>
          logger.error('Failed to send audit report to admin', { error: String(err) }),
        );
      }

      logger.info('Autopilot daily audit completed', { reportsGenerated: reports.length });
    } catch (error) {
      logger.error('Autopilot daily audit failed', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  // ─── Autopilot: Proposal Reminder ───

  private async remindPendingProposals(): Promise<void> {
    const { config } = await import('../../utils/config');
    if (config.AUTOPILOT_ENABLED !== 'true') return;

    try {
      const disabled = await redisClient.get('autopilot:cron_disabled:autopilot_proposal_reminder');
      if (disabled) return;
    } catch { /* proceed */ }

    try {
      const { getPendingProposals } = await import('../../autopilot/autopilot.repository');
      const pending = await getPendingProposals();
      if (pending.length === 0) return;

      // Only remind if oldest pending is >4h old
      const oldest = pending[0];
      if (!oldest) return;
      const oldestAge = Date.now() - oldest.createdAt.getTime();
      if (oldestAge < 4 * 60 * 60 * 1000) return;

      const { sendPendingList } = await import('../../autopilot/autopilot.service');
      await sendPendingList();
      logger.info('Autopilot proposal reminder sent', { pending: pending.length });
    } catch (error) {
      logger.error('Autopilot proposal reminder failed', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  // ─── Autopilot: Expire Stale Proposals ───

  private async expireStaleProposals(): Promise<void> {
    const { config } = await import('../../utils/config');
    if (config.AUTOPILOT_ENABLED !== 'true') return;

    try {
      const disabled = await redisClient.get('autopilot:cron_disabled:autopilot_proposal_expire');
      if (disabled) return;
    } catch { /* proceed */ }

    try {
      const { expireStaleProposals: expireInDb } = await import('../../autopilot/autopilot.repository');
      const expired = await expireInDb(config.AUTOPILOT_PROPOSAL_EXPIRY_HOURS);
      if (expired > 0) {
        logger.info('Autopilot proposals expired', { count: expired });
      }
    } catch (error) {
      logger.error('Autopilot proposal expiry failed', { error: error instanceof Error ? error.message : String(error) });
    }
  }
  // ─── Guardrails: Credit Coherence Audit ───

  private async guardrailsCreditAudit(): Promise<void> {
    if (!dbClient.isConnected()) return;
    try {
      const { checkCreditCoherence, detectAnomalies } = await import('../guardrails/credit-guard');
      const { createAlert } = await import('../guardrails/alert-system');

      const drifts = await checkCreditCoherence();
      if (drifts.length > 0) {
        await createAlert('high', 'credit_drift', `Credit coherence drift detected for ${drifts.length} wallets`, { drifts }).catch(() => {});
        logger.warn('Credit coherence drifts detected', { count: drifts.length });
      }

      const anomalies = await detectAnomalies();
      if (anomalies.length > 0) {
        await createAlert('high', 'credit_anomaly', `${anomalies.length} credit anomalies detected`, { anomalies }).catch(() => {});
        logger.warn('Credit anomalies detected', { count: anomalies.length });
      }
    } catch (error) {
      logger.error('Guardrails credit audit failed', { error: error instanceof Error ? error.message : String(error) });
    }
  }
  // ─── Email Sequence: J+0 / J+2 / J+5 ───

  private async processEmailSequence(): Promise<void> {
    if (!dbClient.isConnected()) return;

    try {
      // Find users who need J+2 email (created 2 days ago, not yet sent)
      const j2Users = await dbClient.query(
        `SELECT id, email, display_name as name FROM users
         WHERE is_active = TRUE
           AND created_at >= NOW() - INTERVAL '3 days'
           AND created_at < NOW() - INTERVAL '2 days'
           AND id NOT IN (
             SELECT user_id FROM email_sequence_log WHERE step = 'j2'
           )`,
      );

      // Find users who need J+5 email (created 5 days ago, not yet sent)
      const j5Users = await dbClient.query(
        `SELECT id, email, display_name as name FROM users
         WHERE is_active = TRUE
           AND created_at >= NOW() - INTERVAL '6 days'
           AND created_at < NOW() - INTERVAL '5 days'
           AND id NOT IN (
             SELECT user_id FROM email_sequence_log WHERE step = 'j5'
           )`,
      );

      const { sendGettingStartedEmail, sendSuccessStoryEmail } = await import('../../notifications/email.service');

      let sent = 0;

      for (const row of j2Users.rows) {
        const user = row as Record<string, unknown>;
        const email = user['email'] as string;
        const name = user['name'] as string || 'Utilisateur';
        const userId = user['id'] as string;

        const success = await sendGettingStartedEmail(email, name);
        if (success) {
          await dbClient.query(
            `INSERT INTO email_sequence_log (id, user_id, step, sent_at)
             VALUES ($1, $2, 'j2', NOW())`,
            [uuidv4(), userId],
          );
          sent++;
        }
      }

      for (const row of j5Users.rows) {
        const user = row as Record<string, unknown>;
        const email = user['email'] as string;
        const name = user['name'] as string || 'Utilisateur';
        const userId = user['id'] as string;

        const success = await sendSuccessStoryEmail(email, name);
        if (success) {
          await dbClient.query(
            `INSERT INTO email_sequence_log (id, user_id, step, sent_at)
             VALUES ($1, $2, 'j5', NOW())`,
            [uuidv4(), userId],
          );
          sent++;
        }
      }

      if (sent > 0) {
        logger.info('Email sequence processed', { j2: j2Users.rows.length, j5: j5Users.rows.length, sent });
      }
    } catch (error) {
      logger.error('Email sequence processing failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export const cronService = new CronService();
