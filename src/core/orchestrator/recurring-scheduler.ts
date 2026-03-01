import { logger } from '../../utils/logger';

export interface RecurringTaskConfig {
  name: string;
  intervalMs: number;
  taskFactory: () => Promise<void>;
  lastRun: string | null;
  nextRun: string | null;
}

export class RecurringScheduler {
  private tasks = new Map<string, RecurringTaskConfig>();
  private timers = new Map<string, ReturnType<typeof setInterval>>();
  private running = false;

  addRecurringTask(name: string, intervalMs: number, taskFactory: () => Promise<void>): void {
    this.tasks.set(name, {
      name,
      intervalMs,
      taskFactory,
      lastRun: null,
      nextRun: null,
    });

    logger.debug('Recurring task registered', { name, intervalMs });
  }

  start(): void {
    if (this.running) {
      logger.warn('RecurringScheduler already running');
      return;
    }

    this.running = true;

    for (const [name, config] of this.tasks) {
      config.nextRun = new Date(Date.now() + config.intervalMs).toISOString();

      const timer = setInterval(async () => {
        try {
          logger.debug(`Executing recurring task: ${name}`);
          config.lastRun = new Date().toISOString();
          await config.taskFactory();
          config.nextRun = new Date(Date.now() + config.intervalMs).toISOString();
        } catch (error) {
          logger.error(`Recurring task failed: ${name}`, {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }, config.intervalMs);

      this.timers.set(name, timer);
    }

    logger.info('RecurringScheduler started', { taskCount: this.tasks.size });
  }

  stop(): void {
    for (const [name, timer] of this.timers) {
      clearInterval(timer);
      logger.debug(`Recurring task stopped: ${name}`);
    }

    this.timers.clear();
    this.running = false;
    logger.info('RecurringScheduler stopped');
  }

  removeTask(name: string): boolean {
    const timer = this.timers.get(name);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(name);
    }
    return this.tasks.delete(name);
  }

  getScheduledTasks(): Array<{
    name: string;
    intervalMs: number;
    lastRun: string | null;
    nextRun: string | null;
  }> {
    return Array.from(this.tasks.values()).map((t) => ({
      name: t.name,
      intervalMs: t.intervalMs,
      lastRun: t.lastRun,
      nextRun: t.nextRun,
    }));
  }

  isRunning(): boolean {
    return this.running;
  }

  getTaskCount(): number {
    return this.tasks.size;
  }
}

export const recurringScheduler = new RecurringScheduler();
