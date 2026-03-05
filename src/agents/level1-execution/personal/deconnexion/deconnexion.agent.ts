import { BaseAgent } from '../../../base/base-agent';
import { LLMRouter } from '../../../../core/llm/llm-router';
import { eventBus } from '../../../../core/event-bus/event-bus';
import { memoryManager } from '../../../../core/memory/memory-manager';
import {
  DECONNEXION_SYSTEM_PROMPT,
  CHALLENGE_TEMPLATE,
  ACTIVITIES_TEMPLATE,
  MOOD_TEMPLATE,
  PROGRESS_TEMPLATE,
} from './deconnexion.prompts';
import { CHALLENGES, OFFLINE_ACTIVITIES, formatMoodTrend } from './deconnexion.tools';
import type { AgentTask, AgentConfig } from '../../../base/agent.types';
import type { SystemEvent } from '../../../../core/event-bus/event.types';
import type { DeconnexionTaskType, MoodEntry, ChallengeLevel } from './deconnexion.types';

export const DECONNEXION_AGENT_CONFIG: AgentConfig = {
  id: 'deconnexion-agent',
  name: 'Deconnexion Agent',
  level: 1,
  modelTier: 'fast',
  capabilities: ['disconnection-challenges', 'offline-activities', 'mood-tracking', 'progress-tracking'],
  systemPrompt: DECONNEXION_SYSTEM_PROMPT,
  maxRetries: 2,
  timeoutMs: 30_000,
  rateLimitPerMinute: 20,
};

export class DeconnexionAgent extends BaseAgent {
  constructor(config: AgentConfig = DECONNEXION_AGENT_CONFIG) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    eventBus.subscribe('CoachStreakUpdated', async (event) => {
      await this.handleStreakUpdate(event);
    }, this.id);

    this.logger.info('Deconnexion Agent initialized — ready for digital detox coaching');
  }

  protected async onExecute(task: AgentTask): Promise<Record<string, unknown>> {
    const taskType = (task.payload['type'] as DeconnexionTaskType | undefined) ?? 'challenge';

    switch (taskType) {
      case 'challenge':
        return this.handleChallengeTask(task);
      case 'activities':
        return this.handleActivitiesTask(task);
      case 'mood':
        return this.handleMoodTask(task);
      case 'progress':
        return this.handleProgressTask(task);
      default:
        return { error: `Unknown deconnexion task type: ${String(taskType)}` };
    }
  }

  protected async onEvent(event: SystemEvent): Promise<void> {
    switch (event.type) {
      case 'CoachStreakUpdated':
        await this.handleStreakUpdate(event);
        break;
    }
  }

  protected async onShutdown(): Promise<void> {
    eventBus.unsubscribe('CoachStreakUpdated', this.id);
    this.logger.info('Deconnexion Agent shut down');
  }

  private async handleChallengeTask(task: AgentTask): Promise<Record<string, unknown>> {
    const level = (task.payload['level'] as ChallengeLevel) ?? 'beginner';
    const lastChallenge = String(task.payload['lastChallenge'] ?? 'Aucun');
    const preferences = String(task.payload['preferences'] ?? '');

    // Provide available challenges as context
    const availableChallenges = CHALLENGES[level]
      .map((c) => `- ${c.nom} (${c.duree})`)
      .join('\n');

    const prompt = CHALLENGE_TEMPLATE
      .replace('{level}', level)
      .replace('{lastChallenge}', lastChallenge)
      .replace('{preferences}', preferences)
      + `\n\nDefis disponibles pour le niveau ${level} :\n${availableChallenges}`;

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    await memoryManager.store({
      content: `Challenge proposed: level=${level} — ${response.content.substring(0, 200)}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'challenge_proposed', level },
    });

    try {
      const parsed = JSON.parse(response.content) as Record<string, unknown>;
      return { ...parsed, availableCount: CHALLENGES[level].length, tokensUsed: response.totalTokens };
    } catch {
      return { rawAnalysis: response.content, tokensUsed: response.totalTokens };
    }
  }

  private async handleActivitiesTask(task: AgentTask): Promise<Record<string, unknown>> {
    const duration = String(task.payload['duration'] ?? '1-2h');
    const category = String(task.payload['category'] ?? 'nature');
    const energy = String(task.payload['energy'] ?? 'medium');
    const season = String(task.payload['season'] ?? 'printemps');

    // Provide activity catalog as context
    const categoryActivities = OFFLINE_ACTIVITIES[category] ?? [];
    const activityList = categoryActivities
      .map((a) => `- ${a.nom}: ${a.description} (${a.duree_estimee}, energie: ${a.niveau_energie_requis})`)
      .join('\n');

    const prompt = ACTIVITIES_TEMPLATE
      .replace('{duration}', duration)
      .replace('{category}', category)
      .replace('{energy}', energy)
      .replace('{season}', season)
      + `\n\nActivites disponibles en "${category}" :\n${activityList || 'Aucune activite pre-cataloguee dans cette categorie.'}`;

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    try {
      const parsed = JSON.parse(response.content) as Record<string, unknown>;
      return { ...parsed, catalogCategories: Object.keys(OFFLINE_ACTIVITIES), tokensUsed: response.totalTokens };
    } catch {
      return { rawAnalysis: response.content, tokensUsed: response.totalTokens };
    }
  }

  private async handleMoodTask(task: AgentTask): Promise<Record<string, unknown>> {
    const entryType = String(task.payload['entryType'] ?? 'general');
    const mood = (task.payload['mood'] as number) ?? 5;
    const stress = (task.payload['stress'] as number) ?? 5;
    const sleep = (task.payload['sleep'] as number) ?? 5;
    const notes = String(task.payload['notes'] ?? '');
    const moodHistory = (task.payload['moodHistory'] as MoodEntry[]) ?? [];

    const historyFormatted = formatMoodTrend(moodHistory);

    const prompt = MOOD_TEMPLATE
      .replace('{entryType}', entryType)
      .replace('{mood}', String(mood))
      .replace('{stress}', String(stress))
      .replace('{sleep}', String(sleep))
      .replace('{notes}', notes)
      .replace('{moodHistory}', historyFormatted);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    // Store mood entry in memory
    await memoryManager.store({
      content: `Mood entry: ${entryType} — mood=${mood}, stress=${stress}, sleep=${sleep}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'mood_entry', entryType, mood, stress, sleep },
    });

    try {
      const parsed = JSON.parse(response.content) as Record<string, unknown>;
      return { ...parsed, tokensUsed: response.totalTokens };
    } catch {
      return { rawAnalysis: response.content, tokensUsed: response.totalTokens };
    }
  }

  private async handleProgressTask(task: AgentTask): Promise<Record<string, unknown>> {
    const challengesCompleted = (task.payload['challengesCompleted'] as number) ?? 0;
    const totalTimeOffline = String(task.payload['totalTimeOffline'] ?? '0 heures');
    const averageMood = (task.payload['averageMood'] as number) ?? 0;
    const history = String(task.payload['history'] ?? '');

    const prompt = PROGRESS_TEMPLATE
      .replace('{challengesCompleted}', String(challengesCompleted))
      .replace('{totalTimeOffline}', totalTimeOffline)
      .replace('{averageMood}', String(averageMood))
      .replace('{history}', history);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    // Publish event if challenge was completed
    if (challengesCompleted > 0) {
      await eventBus.publish('DeconnexionChallengeCompleted', this.id, {
        challengesCompleted,
        totalTimeOffline,
        averageMood,
      });
    }

    try {
      const parsed = JSON.parse(response.content) as Record<string, unknown>;
      return { ...parsed, tokensUsed: response.totalTokens };
    } catch {
      return { rawAnalysis: response.content, tokensUsed: response.totalTokens };
    }
  }

  private async handleStreakUpdate(event: SystemEvent): Promise<void> {
    const streak = event.payload['streak'] as number | undefined;
    if (!streak || streak <= 0) return;

    // When the Coach agent reports a long streak, suggest a deconnexion challenge
    if (streak % 7 === 0) {
      this.logger.info('Streak milestone — considering disconnection challenge suggestion', { streak });

      await memoryManager.store({
        content: `Streak milestone ${streak} days — good time to suggest a disconnection challenge`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'streak_milestone_noted', streak, sourceEvent: event.id },
      });
    }
  }
}
