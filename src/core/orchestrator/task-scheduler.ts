import { logger } from '../../utils/logger';
import type { AgentTask } from '../../agents/base/agent.types';

type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  CRITICAL: 100,
  HIGH: 75,
  MEDIUM: 50,
  LOW: 25,
};

interface ScheduledTask extends AgentTask {
  scheduledFor?: string;
  autonomyBoost: boolean;
}

export class TaskScheduler {
  private taskQueue: ScheduledTask[] = [];

  enqueue(task: AgentTask, autonomyBoost = false): void {
    const scheduled: ScheduledTask = { ...task, autonomyBoost };
    this.taskQueue.push(scheduled);
    this.sortQueue();

    logger.debug('Task enqueued', {
      taskId: task.id,
      priority: task.priority,
      autonomyBoost,
      queueSize: this.taskQueue.length,
    });
  }

  dequeue(): ScheduledTask | undefined {
    return this.taskQueue.shift();
  }

  peek(): ScheduledTask | undefined {
    return this.taskQueue[0];
  }

  getQueueSize(): number {
    return this.taskQueue.length;
  }

  getQueue(): ScheduledTask[] {
    return [...this.taskQueue];
  }

  getById(taskId: string): ScheduledTask | undefined {
    return this.taskQueue.find((t) => t.id === taskId);
  }

  remove(taskId: string): boolean {
    const index = this.taskQueue.findIndex((t) => t.id === taskId);
    if (index === -1) return false;
    this.taskQueue.splice(index, 1);
    return true;
  }

  private sortQueue(): void {
    this.taskQueue.sort((a, b) => {
      const scoreA = this.calculateScore(a);
      const scoreB = this.calculateScore(b);
      return scoreB - scoreA; // Higher score = higher priority
    });
  }

  private calculateScore(task: ScheduledTask): number {
    let score = PRIORITY_WEIGHTS[task.priority] ?? 50;

    // Autonomy-boosting tasks get +30 bonus (per spec: "ALWAYS prioritize tasks that increase autonomy_level_unlocked")
    if (task.autonomyBoost) {
      score += 30;
    }

    return score;
  }
}

export const taskScheduler = new TaskScheduler();
