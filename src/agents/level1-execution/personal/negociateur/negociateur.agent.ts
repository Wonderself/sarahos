// ═══════════════════════════════════════════════════════
// NegociateurAgent — Negotiation Coach & Simulator
// ═══════════════════════════════════════════════════════

import { BaseAgent } from '../../../base/base-agent';
import { LLMRouter } from '../../../../core/llm/llm-router';
import { eventBus } from '../../../../core/event-bus/event-bus';
import { memoryManager } from '../../../../core/memory/memory-manager';
import {
  NEGOCIATEUR_SYSTEM_PROMPT,
  SALARY_NEGOTIATION_TEMPLATE,
  RENT_NEGOTIATION_TEMPLATE,
  CONTRACT_NEGOTIATION_TEMPLATE,
  ROLEPLAY_TEMPLATE,
} from './negociateur.prompts';
import { getRecommendedTechniques } from './negociateur.tools';
import type { AgentTask, AgentConfig } from '../../../base/agent.types';
import type { SystemEvent } from '../../../../core/event-bus/event.types';
import type { NegociateurTaskType } from './negociateur.types';

export const NEGOCIATEUR_AGENT_CONFIG: AgentConfig = {
  id: 'negociateur-agent',
  name: 'Negociateur Agent',
  level: 1,
  modelTier: 'fast',
  capabilities: ['salary-negotiation', 'rent-negotiation', 'contract-negotiation', 'roleplay'],
  systemPrompt: NEGOCIATEUR_SYSTEM_PROMPT,
  maxRetries: 2,
  timeoutMs: 30_000,
  rateLimitPerMinute: 30,
};

export class NegociateurAgent extends BaseAgent {
  constructor(config: AgentConfig = NEGOCIATEUR_AGENT_CONFIG) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    eventBus.subscribe('NegotiationRequested', async (event) => {
      await this.handleNegotiationRequest(event);
    }, this.id);

    eventBus.subscribe('RoleplayRequested', async (event) => {
      await this.handleRoleplayRequest(event);
    }, this.id);

    this.logger.info('Negociateur Agent initialized — ready to coach negotiations');
  }

  protected async onExecute(task: AgentTask): Promise<Record<string, unknown>> {
    const taskType = (task.payload['type'] as NegociateurTaskType | undefined) ?? 'contract';

    switch (taskType) {
      case 'salary':
        return this.handleSalaryTask(task);
      case 'rent':
        return this.handleRentTask(task);
      case 'contract':
        return this.handleContractTask(task);
      case 'roleplay':
        return this.handleRoleplayTask(task);
      default:
        return { error: `Unknown negotiation task type: ${String(taskType)}` };
    }
  }

  protected async onEvent(event: SystemEvent): Promise<void> {
    switch (event.type) {
      case 'NegotiationRequested':
        await this.handleNegotiationRequest(event);
        break;
      case 'RoleplayRequested':
        await this.handleRoleplayRequest(event);
        break;
    }
  }

  protected async onShutdown(): Promise<void> {
    eventBus.unsubscribe('NegotiationRequested', this.id);
    eventBus.unsubscribe('RoleplayRequested', this.id);
    this.logger.info('Negociateur Agent shut down');
  }

  // ── Salary Negotiation ──

  private async handleSalaryTask(task: AgentTask): Promise<Record<string, unknown>> {
    const position = String(task.payload['position'] ?? 'Non precise');
    const currentSalary = String(task.payload['currentSalary'] ?? 'Non precise');
    const targetSalary = String(task.payload['targetSalary'] ?? 'Non precise');
    const seniority = String(task.payload['seniority'] ?? 'Non precise');
    const context = String(task.payload['context'] ?? task.description);
    const sector = String(task.payload['sector'] ?? 'Non precise');

    const prompt = SALARY_NEGOTIATION_TEMPLATE
      .replace('{position}', position)
      .replace('{currentSalary}', currentSalary)
      .replace('{targetSalary}', targetSalary)
      .replace('{seniority}', seniority)
      .replace('{context}', context)
      .replace('{sector}', sector);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    const techniques = getRecommendedTechniques('salary');

    await memoryManager.store({
      content: `Negotiation coaching [salary]: ${position} — ${currentSalary} -> ${targetSalary}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'negotiation', subType: 'salary', position, sector },
    });

    await eventBus.publish('NegotiationPrepared', this.id, {
      negotiationType: 'salary',
      position,
      sector,
    });

    return {
      negotiationType: 'salary',
      advice: response.content,
      recommendedTechniques: techniques,
      tokensUsed: response.totalTokens,
    };
  }

  // ── Rent Negotiation ──

  private async handleRentTask(task: AgentTask): Promise<Record<string, unknown>> {
    const negotiationType = String(task.payload['negotiationType'] ?? 'reduction');
    const currentRent = String(task.payload['currentRent'] ?? 'Non precise');
    const targetRent = String(task.payload['targetRent'] ?? 'Non precise');
    const location = String(task.payload['location'] ?? 'Non precise');
    const leaseDuration = String(task.payload['leaseDuration'] ?? 'Non precise');
    const context = String(task.payload['context'] ?? task.description);

    const prompt = RENT_NEGOTIATION_TEMPLATE
      .replace('{negotiationType}', negotiationType)
      .replace('{currentRent}', currentRent)
      .replace('{targetRent}', targetRent)
      .replace('{location}', location)
      .replace('{leaseDuration}', leaseDuration)
      .replace('{context}', context);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    const techniques = getRecommendedTechniques('rent');

    await memoryManager.store({
      content: `Negotiation coaching [rent]: ${location} — ${currentRent} -> ${targetRent}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'negotiation', subType: 'rent', location },
    });

    await eventBus.publish('NegotiationPrepared', this.id, {
      negotiationType: 'rent',
      location,
    });

    return {
      negotiationType: 'rent',
      advice: response.content,
      recommendedTechniques: techniques,
      tokensUsed: response.totalTokens,
    };
  }

  // ── Contract Negotiation ──

  private async handleContractTask(task: AgentTask): Promise<Record<string, unknown>> {
    const contractType = String(task.payload['contractType'] ?? 'Non precise');
    const counterparty = String(task.payload['counterparty'] ?? 'Non precise');
    const mainStake = String(task.payload['mainStake'] ?? 'Non precise');
    const amount = String(task.payload['amount'] ?? 'Non precise');
    const context = String(task.payload['context'] ?? task.description);

    const prompt = CONTRACT_NEGOTIATION_TEMPLATE
      .replace('{contractType}', contractType)
      .replace('{counterparty}', counterparty)
      .replace('{mainStake}', mainStake)
      .replace('{amount}', amount)
      .replace('{context}', context);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    const techniques = getRecommendedTechniques('contract');

    await memoryManager.store({
      content: `Negotiation coaching [contract]: ${contractType} with ${counterparty} — ${amount}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'negotiation', subType: 'contract', contractType, counterparty },
    });

    await eventBus.publish('NegotiationPrepared', this.id, {
      negotiationType: 'contract',
      contractType,
      counterparty,
    });

    return {
      negotiationType: 'contract',
      advice: response.content,
      recommendedTechniques: techniques,
      tokensUsed: response.totalTokens,
    };
  }

  // ── Roleplay Simulation ──

  private async handleRoleplayTask(task: AgentTask): Promise<Record<string, unknown>> {
    const scenario = String(task.payload['scenario'] ?? 'Negociation generale');
    const counterpartRole = String(task.payload['counterpartRole'] ?? 'Manager');
    const difficulty = String(task.payload['difficulty'] ?? 'medium');
    const userObjective = String(task.payload['userObjective'] ?? 'Obtenir un accord favorable');
    const context = String(task.payload['context'] ?? task.description);

    const prompt = ROLEPLAY_TEMPLATE
      .replace('{scenario}', scenario)
      .replace(/\{counterpartRole\}/g, counterpartRole)
      .replace(/\{difficulty\}/g, difficulty)
      .replace('{userObjective}', userObjective)
      .replace('{context}', context);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    const techniques = getRecommendedTechniques('roleplay');

    await memoryManager.store({
      content: `Roleplay simulation: ${scenario} — difficulty ${difficulty}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'negotiation', subType: 'roleplay', scenario, difficulty },
    });

    await eventBus.publish('RoleplayCompleted', this.id, {
      scenario,
      difficulty,
    });

    return {
      negotiationType: 'roleplay',
      simulation: response.content,
      recommendedTechniques: techniques,
      tokensUsed: response.totalTokens,
    };
  }

  // ── Event Handlers ──

  private async handleNegotiationRequest(event: SystemEvent): Promise<void> {
    const negotiationType = String(event.payload['negotiationType'] ?? 'contract');
    const task: AgentTask = {
      id: event.id,
      title: `Negotiation coaching: ${negotiationType}`,
      description: String(event.payload['description'] ?? 'Negotiation request'),
      priority: 'MEDIUM',
      payload: { type: negotiationType, ...event.payload },
      assignedBy: event.sourceAgent,
      correlationId: event.correlationId ?? event.id,
    };
    await this.execute(task);
  }

  private async handleRoleplayRequest(event: SystemEvent): Promise<void> {
    const task: AgentTask = {
      id: event.id,
      title: 'Roleplay simulation',
      description: String(event.payload['scenario'] ?? 'Roleplay request'),
      priority: 'LOW',
      payload: { type: 'roleplay', ...event.payload },
      assignedBy: event.sourceAgent,
      correlationId: event.correlationId ?? event.id,
    };
    await this.execute(task);
  }
}
