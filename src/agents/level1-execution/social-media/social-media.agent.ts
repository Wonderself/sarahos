import { BaseAgent } from '../../base/base-agent';
import { LLMRouter } from '../../../core/llm/llm-router';
import { eventBus } from '../../../core/event-bus/event-bus';
import { SOCIAL_MEDIA_SYSTEM_PROMPT, POST_TEMPLATE } from './social-media.prompts';
import { postLinkedIn, postX, postInstagram, trackEngagement, schedulePost, isViral } from './social-media.tools';
import type { SocialPlatform } from './social-media.tools';
import type { AgentTask, AgentConfig } from '../../base/agent.types';
import type { SystemEvent } from '../../../core/event-bus/event.types';

export const SOCIAL_MEDIA_AGENT_CONFIG: AgentConfig = {
  id: 'social-media-agent',
  name: 'Social Media Agent',
  level: 1,
  modelTier: 'fast',
  capabilities: ['post-linkedin', 'post-x', 'post-instagram', 'schedule-post', 'track-engagement'],
  systemPrompt: SOCIAL_MEDIA_SYSTEM_PROMPT,
  maxRetries: 2,
  timeoutMs: 30_000,
  rateLimitPerMinute: 15,
};

type SocialMediaTaskType = 'post' | 'schedule' | 'track' | 'generate';

export class SocialMediaAgent extends BaseAgent {
  constructor(config: AgentConfig = SOCIAL_MEDIA_AGENT_CONFIG) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    eventBus.subscribe('ContentGenerated', async (event) => {
      this.logger.debug('New content available for social posting', { eventId: event.id });
    }, this.id);

    this.logger.info('Social Media Agent initialized — monitoring content pipeline');
  }

  protected async onExecute(task: AgentTask): Promise<Record<string, unknown>> {
    const taskType = (task.payload['taskType'] as SocialMediaTaskType | undefined) ?? 'generate';

    switch (taskType) {
      case 'post':
        return this.handlePostTask(task);
      case 'schedule':
        return this.handleScheduleTask(task);
      case 'track':
        return this.handleTrackTask(task);
      case 'generate':
        return this.handleGenerateAndPost(task);
      default:
        return { error: `Unknown social media task: ${String(taskType)}` };
    }
  }

  protected async onEvent(event: SystemEvent): Promise<void> {
    if (event.type === 'ContentGenerated') {
      this.logger.debug('Content received for social distribution', { eventId: event.id });
    }
  }

  protected async onShutdown(): Promise<void> {
    eventBus.unsubscribe('ContentGenerated', this.id);
    this.logger.info('Social Media Agent shut down');
  }

  private async handlePostTask(task: AgentTask): Promise<Record<string, unknown>> {
    const platform = (task.payload['platform'] as SocialPlatform | undefined) ?? 'linkedin';
    const content = String(task.payload['content'] ?? '');
    const mediaUrl = task.payload['mediaUrl'] as string | undefined;

    let result;
    switch (platform) {
      case 'linkedin':
        result = await postLinkedIn(content, mediaUrl);
        break;
      case 'x':
        result = await postX(content, mediaUrl);
        break;
      case 'instagram':
        result = await postInstagram(mediaUrl ?? '', content, task.payload['hashtags'] as string[] | undefined);
        break;
      default:
        result = await postLinkedIn(content, mediaUrl);
    }

    await eventBus.publish('PostPublished', this.id, {
      platform,
      postId: result.postId,
      postUrl: result.postUrl,
    });

    return { ...result, platform, action: 'post' };
  }

  private async handleScheduleTask(task: AgentTask): Promise<Record<string, unknown>> {
    const platform = (task.payload['platform'] as SocialPlatform | undefined) ?? 'linkedin';
    const content = String(task.payload['content'] ?? '');
    const scheduledAt = String(task.payload['scheduledAt'] ?? '');

    const result = await schedulePost(platform, content, scheduledAt);
    return { ...result, platform, action: 'schedule' };
  }

  private async handleTrackTask(task: AgentTask): Promise<Record<string, unknown>> {
    const postId = String(task.payload['postId'] ?? '');
    const platform = (task.payload['platform'] as SocialPlatform | undefined) ?? 'linkedin';

    const metrics = await trackEngagement(postId, platform);

    if (isViral(metrics)) {
      await eventBus.publish('ViralAlert', this.id, {
        postId,
        platform,
        engagementRate: metrics.engagementRate,
        impressions: metrics.impressions,
      });
    }

    await eventBus.publish('EngagementReport', this.id, {
      postId,
      platform,
      metrics,
    });

    return { ...metrics, postId, platform, viral: isViral(metrics), action: 'track' };
  }

  private async handleGenerateAndPost(task: AgentTask): Promise<Record<string, unknown>> {
    const platform = (task.payload['platform'] as SocialPlatform | undefined) ?? 'linkedin';
    const topic = String(task.payload['topic'] ?? task.description);
    const avatar = String(task.payload['avatar'] ?? 'sarah');
    const postType = String(task.payload['postType'] ?? 'thought_leadership');

    const prompt = POST_TEMPLATE
      .replace('{platform}', platform)
      .replace('{topic}', topic)
      .replace('{avatar}', avatar)
      .replace('{postType}', postType)
      .replace('{tone}', avatar === 'sarah' ? 'casual-pro' : 'visionnaire');

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    return {
      generatedContent: response.content,
      platform,
      avatar,
      postType,
      tokensUsed: response.totalTokens,
      action: 'generate',
    };
  }
}
