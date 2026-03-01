import { dbClient } from '../../infra';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

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
   * Run a job and log result to cron_history table.
   */
  private async runJob(job: CronJob): Promise<void> {
    const startTime = Date.now();
    let status = 'success';
    let errorMessage: string | null = null;
    let recordsAffected = 0;

    try {
      await job.handler();
    } catch (error) {
      status = 'error';
      errorMessage = error instanceof Error ? error.message : String(error);
    }

    const durationMs = Date.now() - startTime;

    // Log to cron_history
    if (dbClient.isConnected()) {
      try {
        await dbClient.query(
          `INSERT INTO cron_history (id, job_name, status, records_affected, duration_ms, error_message)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [uuidv4(), job.name, status, recordsAffected, durationMs, errorMessage],
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
      `SELECT started_at FROM cron_history WHERE job_name = 'reset_daily_api_calls' AND status = 'success' ORDER BY started_at DESC LIMIT 1`,
    );
    if (lastRun.rows[0]) {
      const lastRunTime = new Date((lastRun.rows[0] as Record<string, unknown>)['started_at'] as string);
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
      `DELETE FROM cron_history WHERE started_at < NOW() - INTERVAL '30 days'`,
    );

    // Remove read notifications older than 90 days
    await dbClient.query(
      `DELETE FROM notifications WHERE status = 'read' AND created_at < NOW() - INTERVAL '90 days'`,
    );

    logger.debug('Stale data cleanup completed');
  }
}

export const cronService = new CronService();
