import { BaseAgent } from '../../../base/base-agent';
import { LLMRouter } from '../../../../core/llm/llm-router';
import { eventBus } from '../../../../core/event-bus/event-bus';
import { memoryManager } from '../../../../core/memory/memory-manager';
import {
  CINEASTE_SYSTEM_PROMPT,
  SCRIPT_TEMPLATE,
  STORYBOARD_TEMPLATE,
  PRODUCTION_TEMPLATE,
  POST_PRODUCTION_TEMPLATE,
  DISTRIBUTE_TEMPLATE,
} from './cineaste.prompts';
import { getToolsForPhase, formatToolCatalogForPrompt } from './cineaste.tools';
import type { AgentTask, AgentConfig } from '../../../base/agent.types';
import type { SystemEvent } from '../../../../core/event-bus/event.types';
import type { CineasteTaskType } from './cineaste.types';

export const CINEASTE_AGENT_CONFIG: AgentConfig = {
  id: 'cineaste-agent',
  name: 'Cineaste Agent',
  level: 1,
  modelTier: 'fast',
  capabilities: ['script-writing', 'ai-storyboard', 'ai-video-production', 'post-production', 'distribution'],
  systemPrompt: CINEASTE_SYSTEM_PROMPT,
  maxRetries: 2,
  timeoutMs: 60_000,
  rateLimitPerMinute: 15,
};

export class CineasteAgent extends BaseAgent {
  constructor(config: AgentConfig = CINEASTE_AGENT_CONFIG) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    eventBus.subscribe('FilmProjectCreated', async (event) => {
      await this.handleFilmProjectCreated(event);
    }, this.id);

    eventBus.subscribe('ProductionRequested', async (event) => {
      await this.handleProductionRequest(event);
    }, this.id);

    this.logger.info('Cineaste Agent initialized — listening for film project and production requests');
  }

  protected async onExecute(task: AgentTask): Promise<Record<string, unknown>> {
    const taskType = (task.payload['type'] as CineasteTaskType | undefined) ?? 'script';

    switch (taskType) {
      case 'script':
        return this.handleScriptTask(task);
      case 'storyboard':
        return this.handleStoryboardTask(task);
      case 'production':
        return this.handleProductionTask(task);
      case 'post':
        return this.handlePostProductionTask(task);
      case 'distribute':
        return this.handleDistributeTask(task);
      default:
        return { error: `Unknown cineaste task type: ${String(taskType)}` };
    }
  }

  protected async onEvent(event: SystemEvent): Promise<void> {
    switch (event.type) {
      case 'FilmProjectCreated':
        await this.handleFilmProjectCreated(event);
        break;
      case 'ProductionRequested':
        await this.handleProductionRequest(event);
        break;
    }
  }

  protected async onShutdown(): Promise<void> {
    eventBus.unsubscribe('FilmProjectCreated', this.id);
    eventBus.unsubscribe('ProductionRequested', this.id);
    this.logger.info('Cineaste Agent shut down');
  }

  private async handleScriptTask(task: AgentTask): Promise<Record<string, unknown>> {
    const projectType = String(task.payload['projectType'] ?? 'court-metrage');
    const genre = String(task.payload['genre'] ?? 'drame');
    const duration = String(task.payload['duration'] ?? '5 minutes');
    const theme = String(task.payload['theme'] ?? task.description);
    const audience = String(task.payload['audience'] ?? 'grand public');
    const tone = String(task.payload['tone'] ?? 'cinematographique');
    const context = String(task.payload['context'] ?? '');

    const prompt = SCRIPT_TEMPLATE
      .replace('{projectType}', projectType)
      .replace('{genre}', genre)
      .replace('{duration}', duration)
      .replace('{theme}', theme)
      .replace('{audience}', audience)
      .replace('{tone}', tone)
      .replace('{context}', context);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    await memoryManager.store({
      content: `Script for "${theme}": ${response.content}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'script', projectType, genre, theme },
    });

    await eventBus.publish('ScriptCreated', this.id, {
      projectType,
      genre,
      theme,
      taskId: task.id,
    });

    try {
      const parsed = JSON.parse(response.content) as Record<string, unknown>;
      return { ...parsed, tokensUsed: response.totalTokens };
    } catch {
      return { rawScript: response.content, tokensUsed: response.totalTokens };
    }
  }

  private async handleStoryboardTask(task: AgentTask): Promise<Record<string, unknown>> {
    const synopsis = String(task.payload['synopsis'] ?? task.description);
    const visualStyle = String(task.payload['visualStyle'] ?? 'cinematique realiste');
    const primaryTool = String(task.payload['primaryTool'] ?? 'Midjourney');
    const panelCount = String(task.payload['panelCount'] ?? '8');
    const format = String(task.payload['format'] ?? '16:9');
    const context = String(task.payload['context'] ?? '');

    // Inject relevant tools catalog into context
    const storyboardTools = getToolsForPhase('storyboard');
    const toolsContext = formatToolCatalogForPrompt(storyboardTools);

    const prompt = STORYBOARD_TEMPLATE
      .replace('{synopsis}', synopsis)
      .replace('{visualStyle}', visualStyle)
      .replace('{primaryTool}', primaryTool)
      .replace('{panelCount}', panelCount)
      .replace('{format}', format)
      .replace('{context}', `${context}\n\n${toolsContext}`);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    await eventBus.publish('StoryboardCreated', this.id, {
      visualStyle,
      primaryTool,
      panelCount,
      taskId: task.id,
    });

    try {
      const parsed = JSON.parse(response.content) as Record<string, unknown>;
      return {
        ...parsed,
        recommendedTools: storyboardTools.map((t) => t.name),
        tokensUsed: response.totalTokens,
      };
    } catch {
      return {
        rawStoryboard: response.content,
        recommendedTools: storyboardTools.map((t) => t.name),
        tokensUsed: response.totalTokens,
      };
    }
  }

  private async handleProductionTask(task: AgentTask): Promise<Record<string, unknown>> {
    const sceneDescription = String(task.payload['sceneDescription'] ?? task.description);
    const visualStyle = String(task.payload['visualStyle'] ?? 'cinematique');
    const tool = String(task.payload['tool'] ?? 'Runway ML');
    const duration = String(task.payload['duration'] ?? '4 secondes');
    const resolution = String(task.payload['resolution'] ?? '1920x1080');
    const context = String(task.payload['context'] ?? '');

    // Inject production tools catalog
    const productionTools = getToolsForPhase('production');
    const toolsContext = formatToolCatalogForPrompt(productionTools);

    const prompt = PRODUCTION_TEMPLATE
      .replace('{sceneDescription}', sceneDescription)
      .replace('{visualStyle}', visualStyle)
      .replace('{tool}', tool)
      .replace('{duration}', duration)
      .replace('{resolution}', resolution)
      .replace('{context}', `${context}\n\n${toolsContext}`);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    await memoryManager.store({
      content: `Production guide for "${sceneDescription}": ${response.content}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'production', tool, visualStyle },
    });

    await eventBus.publish('ProductionGuideCreated', this.id, {
      tool,
      sceneDescription: sceneDescription.substring(0, 100),
      taskId: task.id,
    });

    try {
      const parsed = JSON.parse(response.content) as Record<string, unknown>;
      return {
        ...parsed,
        availableTools: productionTools.map((t) => t.name),
        tokensUsed: response.totalTokens,
      };
    } catch {
      return {
        rawGuide: response.content,
        availableTools: productionTools.map((t) => t.name),
        tokensUsed: response.totalTokens,
      };
    }
  }

  private async handlePostProductionTask(task: AgentTask): Promise<Record<string, unknown>> {
    const projectType = String(task.payload['projectType'] ?? 'court-metrage');
    const duration = String(task.payload['duration'] ?? '5 minutes');
    const editStyle = String(task.payload['editStyle'] ?? 'cinematographique');
    const audioNeeds = String(task.payload['audioNeeds'] ?? 'voix off + musique originale');
    const vfxNeeds = String(task.payload['vfxNeeds'] ?? 'color grading + transitions');
    const targetPlatform = String(task.payload['targetPlatform'] ?? 'YouTube');
    const context = String(task.payload['context'] ?? '');

    // Inject post-production tools catalog
    const postTools = getToolsForPhase('post');
    const toolsContext = formatToolCatalogForPrompt(postTools);

    const prompt = POST_PRODUCTION_TEMPLATE
      .replace('{projectType}', projectType)
      .replace('{duration}', duration)
      .replace('{editStyle}', editStyle)
      .replace('{audioNeeds}', audioNeeds)
      .replace('{vfxNeeds}', vfxNeeds)
      .replace('{targetPlatform}', targetPlatform)
      .replace('{context}', `${context}\n\n${toolsContext}`);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    await memoryManager.store({
      content: `Post-production pipeline for ${projectType}: ${response.content}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'post_production', projectType, targetPlatform },
    });

    await eventBus.publish('PostProductionGuideCreated', this.id, {
      projectType,
      targetPlatform,
      taskId: task.id,
    });

    try {
      const parsed = JSON.parse(response.content) as Record<string, unknown>;
      return {
        ...parsed,
        availableTools: postTools.map((t) => t.name),
        tokensUsed: response.totalTokens,
      };
    } catch {
      return {
        rawPipeline: response.content,
        availableTools: postTools.map((t) => t.name),
        tokensUsed: response.totalTokens,
      };
    }
  }

  private async handleDistributeTask(task: AgentTask): Promise<Record<string, unknown>> {
    const title = String(task.payload['title'] ?? 'Mon Projet');
    const contentType = String(task.payload['contentType'] ?? 'court-metrage');
    const duration = String(task.payload['duration'] ?? '5 minutes');
    const audience = String(task.payload['audience'] ?? 'grand public');
    const budget = String(task.payload['budget'] ?? '0 (organique)');
    const platforms = String(task.payload['platforms'] ?? 'YouTube, Instagram, TikTok');
    const context = String(task.payload['context'] ?? '');

    // Inject distribution tools
    const distroTools = getToolsForPhase('distribute');
    const toolsContext = formatToolCatalogForPrompt(distroTools);

    const prompt = DISTRIBUTE_TEMPLATE
      .replace('{title}', title)
      .replace('{contentType}', contentType)
      .replace('{duration}', duration)
      .replace('{audience}', audience)
      .replace('{budget}', budget)
      .replace('{platforms}', platforms)
      .replace('{context}', `${context}\n\n${toolsContext}`);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    await eventBus.publish('DistributionPlanCreated', this.id, {
      title,
      contentType,
      platforms,
      taskId: task.id,
    });

    try {
      const parsed = JSON.parse(response.content) as Record<string, unknown>;
      return {
        ...parsed,
        distributionTools: distroTools.map((t) => t.name),
        tokensUsed: response.totalTokens,
      };
    } catch {
      return {
        rawPlan: response.content,
        distributionTools: distroTools.map((t) => t.name),
        tokensUsed: response.totalTokens,
      };
    }
  }

  private async handleFilmProjectCreated(event: SystemEvent): Promise<void> {
    const theme = String(event.payload['theme'] ?? '');
    if (!theme) return;

    this.logger.info('Handling film project creation event', { theme });

    const prompt = SCRIPT_TEMPLATE
      .replace('{projectType}', String(event.payload['projectType'] ?? 'court-metrage'))
      .replace('{genre}', String(event.payload['genre'] ?? 'drame'))
      .replace('{duration}', String(event.payload['duration'] ?? '5 minutes'))
      .replace('{theme}', theme)
      .replace('{audience}', String(event.payload['audience'] ?? 'grand public'))
      .replace('{tone}', String(event.payload['tone'] ?? 'cinematographique'))
      .replace('{context}', 'Event-triggered script creation');

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    await memoryManager.store({
      content: `Event-triggered script for "${theme}": ${response.content}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'script', sourceEvent: event.id, theme },
    });
  }

  private async handleProductionRequest(event: SystemEvent): Promise<void> {
    const sceneDescription = String(event.payload['sceneDescription'] ?? '');
    if (!sceneDescription) return;

    this.logger.info('Handling production request event', { sceneDescription: sceneDescription.substring(0, 80) });

    const productionTools = getToolsForPhase('production');
    const toolsContext = formatToolCatalogForPrompt(productionTools);

    const prompt = PRODUCTION_TEMPLATE
      .replace('{sceneDescription}', sceneDescription)
      .replace('{visualStyle}', String(event.payload['visualStyle'] ?? 'cinematique'))
      .replace('{tool}', String(event.payload['tool'] ?? 'Runway ML'))
      .replace('{duration}', String(event.payload['duration'] ?? '4 secondes'))
      .replace('{resolution}', String(event.payload['resolution'] ?? '1920x1080'))
      .replace('{context}', `Event-triggered production\n\n${toolsContext}`);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    await memoryManager.store({
      content: `Event-triggered production guide: ${response.content}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'production', sourceEvent: event.id },
    });
  }
}
