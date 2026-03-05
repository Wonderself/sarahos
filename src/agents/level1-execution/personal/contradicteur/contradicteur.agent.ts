import { BaseAgent } from '../../../base/base-agent';
import { LLMRouter } from '../../../../core/llm/llm-router';
import { eventBus } from '../../../../core/event-bus/event-bus';
import { memoryManager } from '../../../../core/memory/memory-manager';
import {
  CONTRADICTEUR_SYSTEM_PROMPT,
  DEBATE_TEMPLATE,
  MATRIX_TEMPLATE,
  BIAS_TEMPLATE,
  REVIEW_TEMPLATE,
} from './contradicteur.prompts';
import { COGNITIVE_BIASES, formatDecisionMatrix, formatProsCons } from './contradicteur.tools';
import type { AgentTask, AgentConfig } from '../../../base/agent.types';
import type { SystemEvent } from '../../../../core/event-bus/event.types';
import type { ContradicteurTaskType } from './contradicteur.types';

export const CONTRADICTEUR_AGENT_CONFIG: AgentConfig = {
  id: 'contradicteur-agent',
  name: 'Contradicteur Agent',
  level: 1,
  modelTier: 'standard',
  capabilities: ['debate', 'decision-matrix', 'bias-detection', 'decision-review'],
  systemPrompt: CONTRADICTEUR_SYSTEM_PROMPT,
  maxRetries: 2,
  timeoutMs: 60_000,
  rateLimitPerMinute: 20,
};

export class ContradicteurAgent extends BaseAgent {
  constructor(config: AgentConfig = CONTRADICTEUR_AGENT_CONFIG) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    eventBus.subscribe('ApprovalRequested', async (event) => {
      await this.handleApprovalRequest(event);
    }, this.id);

    this.logger.info('Contradicteur Agent initialized — ready for decision analysis');
  }

  protected async onExecute(task: AgentTask): Promise<Record<string, unknown>> {
    const taskType = (task.payload['type'] as ContradicteurTaskType | undefined) ?? 'debate';

    switch (taskType) {
      case 'debate':
        return this.handleDebateTask(task);
      case 'matrix':
        return this.handleMatrixTask(task);
      case 'bias':
        return this.handleBiasTask(task);
      case 'review':
        return this.handleReviewTask(task);
      default:
        return { error: `Unknown contradicteur task type: ${String(taskType)}` };
    }
  }

  protected async onEvent(event: SystemEvent): Promise<void> {
    switch (event.type) {
      case 'ApprovalRequested':
        await this.handleApprovalRequest(event);
        break;
    }
  }

  protected async onShutdown(): Promise<void> {
    eventBus.unsubscribe('ApprovalRequested', this.id);
    this.logger.info('Contradicteur Agent shut down');
  }

  private async handleDebateTask(task: AgentTask): Promise<Record<string, unknown>> {
    const decision = String(task.payload['decision'] ?? task.description);
    const context = String(task.payload['context'] ?? '');

    const prompt = DEBATE_TEMPLATE
      .replace('{decision}', decision)
      .replace('{context}', context);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    await memoryManager.store({
      content: `Debate analysis: ${decision} — ${response.content.substring(0, 200)}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'debate', decision },
    });

    try {
      const parsed = JSON.parse(response.content) as Record<string, unknown>;
      const pour = (parsed['pour'] ?? []) as Array<{ title: string; explanation: string; strength: string }>;
      const contre = (parsed['contre'] ?? []) as Array<{ title: string; explanation: string; strength: string }>;
      const formatted = formatProsCons(
        pour.map((a) => ({ ...a, strength: (a.strength ?? 'moderate') as 'strong' | 'moderate' | 'weak' })),
        contre.map((a) => ({ ...a, strength: (a.strength ?? 'moderate') as 'strong' | 'moderate' | 'weak' })),
      );
      return { ...parsed, formatted, tokensUsed: response.totalTokens };
    } catch {
      return { rawAnalysis: response.content, tokensUsed: response.totalTokens };
    }
  }

  private async handleMatrixTask(task: AgentTask): Promise<Record<string, unknown>> {
    const decision = String(task.payload['decision'] ?? task.description);
    const options = task.payload['options'] as string[] | undefined;
    const optionsStr = options ? options.join(', ') : 'a determiner par l\'analyse';
    const context = String(task.payload['context'] ?? '');

    const prompt = MATRIX_TEMPLATE
      .replace('{decision}', decision)
      .replace('{options}', optionsStr)
      .replace('{context}', context);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    try {
      const parsed = JSON.parse(response.content) as Record<string, unknown>;
      const formatted = formatDecisionMatrix(parsed as unknown as import('./contradicteur.types').DecisionMatrix);
      return { ...parsed, formatted, tokensUsed: response.totalTokens };
    } catch {
      return { rawAnalysis: response.content, tokensUsed: response.totalTokens };
    }
  }

  private async handleBiasTask(task: AgentTask): Promise<Record<string, unknown>> {
    const reasoning = String(task.payload['reasoning'] ?? task.description);
    const context = String(task.payload['context'] ?? '');

    // Provide the bias catalog to the LLM as context
    const biasCatalog = COGNITIVE_BIASES
      .map((b) => `- ${b.name}: ${b.description}`)
      .join('\n');

    const prompt = BIAS_TEMPLATE
      .replace('{reasoning}', reasoning)
      .replace('{context}', context)
      + `\n\nCatalogue de biais connus :\n${biasCatalog}`;

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    await memoryManager.store({
      content: `Bias analysis: ${reasoning.substring(0, 100)} — ${response.content.substring(0, 200)}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'bias_analysis' },
    });

    try {
      const parsed = JSON.parse(response.content) as Record<string, unknown>;
      return { ...parsed, biasesCatalogSize: COGNITIVE_BIASES.length, tokensUsed: response.totalTokens };
    } catch {
      return { rawAnalysis: response.content, tokensUsed: response.totalTokens };
    }
  }

  private async handleReviewTask(task: AgentTask): Promise<Record<string, unknown>> {
    const decision = String(task.payload['decision'] ?? task.description);
    const reasons = String(task.payload['reasons'] ?? '');
    const context = String(task.payload['context'] ?? '');

    const prompt = REVIEW_TEMPLATE
      .replace('{decision}', decision)
      .replace('{reasons}', reasons)
      .replace('{context}', context);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    await memoryManager.store({
      content: `Decision review: ${decision} — ${response.content.substring(0, 200)}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'decision_review', decision },
    });

    try {
      const parsed = JSON.parse(response.content) as Record<string, unknown>;
      return { ...parsed, tokensUsed: response.totalTokens };
    } catch {
      return { rawAnalysis: response.content, tokensUsed: response.totalTokens };
    }
  }

  private async handleApprovalRequest(event: SystemEvent): Promise<void> {
    const description = String(event.payload['description'] ?? '');
    if (!description) return;

    this.logger.info('Auto-analyzing approval request for biases');

    const prompt = BIAS_TEMPLATE
      .replace('{reasoning}', description)
      .replace('{context}', 'Demande d\'approbation interne');

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    await memoryManager.store({
      content: `Auto bias check on approval: ${response.content.substring(0, 200)}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'auto_bias_check', sourceEvent: event.id },
    });
  }
}
