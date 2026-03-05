import { BaseAgent } from '../../../base/base-agent';
import { LLMRouter } from '../../../../core/llm/llm-router';
import { eventBus } from '../../../../core/event-bus/event-bus';
import { memoryManager } from '../../../../core/memory/memory-manager';
import {
  COACH_SYSTEM_PROMPT,
  GOALS_TEMPLATE,
  CHECKIN_TEMPLATE,
  REVIEW_TEMPLATE,
  CELEBRATE_TEMPLATE,
} from './coach.prompts';
import { calculateStreak, formatGoalProgress, generateCelebration } from './coach.tools';
import type { AgentTask, AgentConfig } from '../../../base/agent.types';
import type { SystemEvent } from '../../../../core/event-bus/event.types';
import type { CoachTaskType, CoachStreak, CoachGoal } from './coach.types';

export const COACH_AGENT_CONFIG: AgentConfig = {
  id: 'coach-agent',
  name: 'Coach Agent',
  level: 1,
  modelTier: 'fast',
  capabilities: ['goal-setting', 'daily-checkin', 'weekly-review', 'celebration'],
  systemPrompt: COACH_SYSTEM_PROMPT,
  maxRetries: 2,
  timeoutMs: 30_000,
  rateLimitPerMinute: 20,
};

export class CoachAgent extends BaseAgent {
  constructor(config: AgentConfig = COACH_AGENT_CONFIG) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    eventBus.subscribe('TaskCompleted', async (event) => {
      await this.handleTaskCompletion(event);
    }, this.id);

    this.logger.info('Coach Agent initialized — ready to motivate and track goals');
  }

  protected async onExecute(task: AgentTask): Promise<Record<string, unknown>> {
    const taskType = (task.payload['type'] as CoachTaskType | undefined) ?? 'checkin';

    switch (taskType) {
      case 'goals':
        return this.handleGoalsTask(task);
      case 'checkin':
        return this.handleCheckinTask(task);
      case 'review':
        return this.handleReviewTask(task);
      case 'celebrate':
        return this.handleCelebrateTask(task);
      default:
        return { error: `Unknown coach task type: ${String(taskType)}` };
    }
  }

  protected async onEvent(event: SystemEvent): Promise<void> {
    switch (event.type) {
      case 'TaskCompleted':
        await this.handleTaskCompletion(event);
        break;
    }
  }

  protected async onShutdown(): Promise<void> {
    eventBus.unsubscribe('TaskCompleted', this.id);
    this.logger.info('Coach Agent shut down');
  }

  private async handleGoalsTask(task: AgentTask): Promise<Record<string, unknown>> {
    const goals = String(task.payload['goals'] ?? task.description);
    const context = String(task.payload['context'] ?? '');

    const prompt = GOALS_TEMPLATE
      .replace('{goals}', goals)
      .replace('{context}', context);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    await memoryManager.store({
      content: `Goals defined: ${goals} — ${response.content.substring(0, 200)}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'goals_defined' },
    });

    try {
      const parsed = JSON.parse(response.content) as Record<string, unknown>;
      return { ...parsed, tokensUsed: response.totalTokens };
    } catch {
      return { rawAnalysis: response.content, tokensUsed: response.totalTokens };
    }
  }

  private async handleCheckinTask(task: AgentTask): Promise<Record<string, unknown>> {
    const accomplishments = String(task.payload['accomplishments'] ?? task.description);
    const currentStreak = (task.payload['currentStreak'] as number) ?? 0;
    const bestStreak = (task.payload['bestStreak'] as number) ?? 0;
    const activeGoals = (task.payload['activeGoals'] as CoachGoal[]) ?? [];

    // Calculate updated streak
    const streakData: CoachStreak = {
      current: currentStreak,
      best: bestStreak,
      lastCheckinDate: (task.payload['lastCheckinDate'] as string) ?? null,
      totalCheckins: (task.payload['totalCheckins'] as number) ?? 0,
      badge: 'none',
    };
    const updatedStreak = calculateStreak(streakData, new Date().toISOString());

    const goalsFormatted = formatGoalProgress(activeGoals);

    const prompt = CHECKIN_TEMPLATE
      .replace('{accomplishments}', accomplishments)
      .replace('{currentStreak}', String(updatedStreak.current))
      .replace('{bestStreak}', String(updatedStreak.best))
      .replace('{activeGoals}', goalsFormatted);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    // Publish streak update event
    await eventBus.publish('CoachStreakUpdated', this.id, {
      streak: updatedStreak.current,
      best: updatedStreak.best,
      badge: updatedStreak.badge,
      totalCheckins: updatedStreak.totalCheckins,
    });

    // Store check-in in memory
    await memoryManager.store({
      content: `Daily checkin — streak: ${updatedStreak.current}, accomplishments: ${accomplishments}`,
      source: this.name,
      agentId: this.id,
      metadata: {
        type: 'daily_checkin',
        streak: updatedStreak.current,
        badge: updatedStreak.badge,
      },
    });

    try {
      const parsed = JSON.parse(response.content) as Record<string, unknown>;
      return {
        ...parsed,
        streak: updatedStreak.current,
        bestStreak: updatedStreak.best,
        badge: updatedStreak.badge,
        totalCheckins: updatedStreak.totalCheckins,
        tokensUsed: response.totalTokens,
      };
    } catch {
      return {
        rawAnalysis: response.content,
        streak: updatedStreak.current,
        bestStreak: updatedStreak.best,
        badge: updatedStreak.badge,
        tokensUsed: response.totalTokens,
      };
    }
  }

  private async handleReviewTask(task: AgentTask): Promise<Record<string, unknown>> {
    const weekCheckins = String(task.payload['weekCheckins'] ?? 'Aucun check-in cette semaine');
    const activeGoals = (task.payload['activeGoals'] as CoachGoal[]) ?? [];
    const currentStreak = (task.payload['currentStreak'] as number) ?? 0;

    const goalsFormatted = formatGoalProgress(activeGoals);

    const prompt = REVIEW_TEMPLATE
      .replace('{weekCheckins}', weekCheckins)
      .replace('{activeGoals}', goalsFormatted)
      .replace('{currentStreak}', String(currentStreak));

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    await memoryManager.store({
      content: `Weekly review — ${response.content.substring(0, 200)}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'weekly_review', streak: currentStreak },
    });

    try {
      const parsed = JSON.parse(response.content) as Record<string, unknown>;
      return { ...parsed, tokensUsed: response.totalTokens };
    } catch {
      return { rawAnalysis: response.content, tokensUsed: response.totalTokens };
    }
  }

  private async handleCelebrateTask(task: AgentTask): Promise<Record<string, unknown>> {
    const achievement = String(task.payload['achievement'] ?? task.description);
    const history = String(task.payload['history'] ?? '');
    const currentStreak = (task.payload['currentStreak'] as number) ?? 0;

    const celebration = generateCelebration(currentStreak, achievement);

    const prompt = CELEBRATE_TEMPLATE
      .replace('{achievement}', achievement)
      .replace('{history}', history)
      .replace('{currentStreak}', String(currentStreak));

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    await memoryManager.store({
      content: `Celebration: ${achievement} — streak: ${currentStreak}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'celebration', achievement },
    });

    try {
      const parsed = JSON.parse(response.content) as Record<string, unknown>;
      return { ...parsed, localCelebration: celebration, tokensUsed: response.totalTokens };
    } catch {
      return { rawAnalysis: response.content, localCelebration: celebration, tokensUsed: response.totalTokens };
    }
  }

  private async handleTaskCompletion(event: SystemEvent): Promise<void> {
    // Auto-celebrate when a task is completed by the user's agents
    const taskId = String(event.payload['taskId'] ?? '');
    if (!taskId) return;

    this.logger.info('Noting task completion for potential celebration', { taskId });

    await memoryManager.store({
      content: `Task completed: ${taskId}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'task_completion_noted', taskId, sourceEvent: event.id },
    });
  }
}
