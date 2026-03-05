// ═══════════════════════════════════════════════════════
// ImpotsAgent — French Tax Guide & Simulator
// ═══════════════════════════════════════════════════════

import { BaseAgent } from '../../../base/base-agent';
import { LLMRouter } from '../../../../core/llm/llm-router';
import { eventBus } from '../../../../core/event-bus/event-bus';
import { memoryManager } from '../../../../core/memory/memory-manager';
import {
  IMPOTS_SYSTEM_PROMPT,
  FISCAL_DISCLAIMER,
  GUIDE_TEMPLATE,
  DEDUCTIONS_TEMPLATE,
  CALENDAR_TEMPLATE,
  SIMULATE_TEMPLATE,
} from './impots.prompts';
import {
  getCurrentFiscalYear,
  getKeyDates,
  getNextDeadline,
} from './impots.tools';
import type { AgentTask, AgentConfig } from '../../../base/agent.types';
import type { SystemEvent } from '../../../../core/event-bus/event.types';
import type { ImpotsTaskType } from './impots.types';

export const IMPOTS_AGENT_CONFIG: AgentConfig = {
  id: 'impots-agent',
  name: 'Impots Agent',
  level: 1,
  modelTier: 'fast',
  capabilities: ['tax-guide', 'deductions', 'fiscal-calendar', 'tax-simulation'],
  systemPrompt: IMPOTS_SYSTEM_PROMPT,
  maxRetries: 2,
  timeoutMs: 30_000,
  rateLimitPerMinute: 30,
};

export class ImpotsAgent extends BaseAgent {
  constructor(config: AgentConfig = IMPOTS_AGENT_CONFIG) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    eventBus.subscribe('TaxQuestionAsked', async (event) => {
      await this.handleTaxQuestion(event);
    }, this.id);

    eventBus.subscribe('FiscalCalendarRequested', async (event) => {
      await this.handleCalendarRequest(event);
    }, this.id);

    this.logger.info('Impots Agent initialized — ready to assist with French taxation');
  }

  protected async onExecute(task: AgentTask): Promise<Record<string, unknown>> {
    const taskType = (task.payload['type'] as ImpotsTaskType | undefined) ?? 'guide';

    switch (taskType) {
      case 'guide':
        return this.handleGuideTask(task);
      case 'deductions':
        return this.handleDeductionsTask(task);
      case 'calendar':
        return this.handleCalendarTask(task);
      case 'simulate':
        return this.handleSimulateTask(task);
      default:
        return { error: `Unknown impots task type: ${String(taskType)}`, disclaimer: FISCAL_DISCLAIMER };
    }
  }

  protected async onEvent(event: SystemEvent): Promise<void> {
    switch (event.type) {
      case 'TaxQuestionAsked':
        await this.handleTaxQuestion(event);
        break;
      case 'FiscalCalendarRequested':
        await this.handleCalendarRequest(event);
        break;
    }
  }

  protected async onShutdown(): Promise<void> {
    eventBus.unsubscribe('TaxQuestionAsked', this.id);
    eventBus.unsubscribe('FiscalCalendarRequested', this.id);
    this.logger.info('Impots Agent shut down');
  }

  // ── Tax Guide ──

  private async handleGuideTask(task: AgentTask): Promise<Record<string, unknown>> {
    const topic = String(task.payload['topic'] ?? task.description);
    const taxpayerProfile = String(task.payload['taxpayerProfile'] ?? 'Non precise');
    const situation = String(task.payload['situation'] ?? 'Non precise');
    const fiscalYear = String(task.payload['fiscalYear'] ?? getCurrentFiscalYear().incomeYear);

    const prompt = GUIDE_TEMPLATE
      .replace('{topic}', topic)
      .replace('{taxpayerProfile}', taxpayerProfile)
      .replace('{situation}', situation)
      .replace('{fiscalYear}', fiscalYear);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    await memoryManager.store({
      content: `Tax guide [${topic}]: ${response.content.slice(0, 200)}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'tax_guide', topic, fiscalYear },
    });

    await eventBus.publish('TaxGuideProvided', this.id, {
      topic,
      fiscalYear,
    });

    return {
      taskType: 'guide',
      advice: response.content,
      fiscalYear,
      tokensUsed: response.totalTokens,
      disclaimer: FISCAL_DISCLAIMER,
    };
  }

  // ── Deductions Finder ──

  private async handleDeductionsTask(task: AgentTask): Promise<Record<string, unknown>> {
    const income = String(task.payload['income'] ?? 'Non precise');
    const familySituation = String(task.payload['familySituation'] ?? 'Non precise');
    const taxParts = String(task.payload['taxParts'] ?? '1');
    const eligibleExpenses = String(task.payload['eligibleExpenses'] ?? 'Non precise');
    const fiscalYear = String(task.payload['fiscalYear'] ?? getCurrentFiscalYear().incomeYear);

    const prompt = DEDUCTIONS_TEMPLATE
      .replace('{income}', income)
      .replace('{familySituation}', familySituation)
      .replace('{taxParts}', taxParts)
      .replace('{eligibleExpenses}', eligibleExpenses)
      .replace('{fiscalYear}', fiscalYear);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    await memoryManager.store({
      content: `Tax deductions analysis: income=${income}, parts=${taxParts}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'tax_deductions', fiscalYear, familySituation },
    });

    await eventBus.publish('DeductionsAnalyzed', this.id, {
      fiscalYear,
      familySituation,
    });

    return {
      taskType: 'deductions',
      advice: response.content,
      fiscalYear,
      tokensUsed: response.totalTokens,
      disclaimer: FISCAL_DISCLAIMER,
    };
  }

  // ── Fiscal Calendar ──

  private async handleCalendarTask(task: AgentTask): Promise<Record<string, unknown>> {
    const fiscalYear = String(task.payload['fiscalYear'] ?? getCurrentFiscalYear().declarationYear);
    const taxpayerType = String(task.payload['taxpayerType'] ?? 'salarie');
    const department = String(task.payload['department'] ?? 'Non precise');
    const situation = String(task.payload['situation'] ?? 'Standard');

    const yearNum = parseInt(fiscalYear, 10) || getCurrentFiscalYear().declarationYear;
    const keyDates = getKeyDates(yearNum);
    const nextDeadline = getNextDeadline(yearNum);

    const prompt = CALENDAR_TEMPLATE
      .replace('{fiscalYear}', fiscalYear)
      .replace('{taxpayerType}', taxpayerType)
      .replace('{department}', department)
      .replace('{situation}', situation);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    await eventBus.publish('FiscalCalendarProvided', this.id, {
      fiscalYear,
      datesCount: keyDates.length,
    });

    return {
      taskType: 'calendar',
      advice: response.content,
      keyDates,
      nextDeadline,
      fiscalYear,
      tokensUsed: response.totalTokens,
      disclaimer: FISCAL_DISCLAIMER,
    };
  }

  // ── Tax Simulation ──

  private async handleSimulateTask(task: AgentTask): Promise<Record<string, unknown>> {
    const taxableIncome = String(task.payload['taxableIncome'] ?? 'Non precise');
    const familySituation = String(task.payload['familySituation'] ?? 'celibataire');
    const taxParts = String(task.payload['taxParts'] ?? '1');
    const rentalIncome = String(task.payload['rentalIncome'] ?? '0');
    const capitalGains = String(task.payload['capitalGains'] ?? '0');
    const knownDeductions = String(task.payload['knownDeductions'] ?? 'Aucune');
    const fiscalYear = String(task.payload['fiscalYear'] ?? getCurrentFiscalYear().incomeYear);

    const prompt = SIMULATE_TEMPLATE
      .replace('{taxableIncome}', taxableIncome)
      .replace('{familySituation}', familySituation)
      .replace('{taxParts}', taxParts)
      .replace('{rentalIncome}', rentalIncome)
      .replace('{capitalGains}', capitalGains)
      .replace('{knownDeductions}', knownDeductions)
      .replace('{fiscalYear}', fiscalYear);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    await memoryManager.store({
      content: `Tax simulation: income=${taxableIncome}, parts=${taxParts}, year=${fiscalYear}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'tax_simulation', fiscalYear, taxableIncome, taxParts },
    });

    await eventBus.publish('TaxSimulationCompleted', this.id, {
      fiscalYear,
      taxableIncome,
    });

    return {
      taskType: 'simulate',
      advice: response.content,
      fiscalYear,
      tokensUsed: response.totalTokens,
      disclaimer: FISCAL_DISCLAIMER,
    };
  }

  // ── Event Handlers ──

  private async handleTaxQuestion(event: SystemEvent): Promise<void> {
    const taskType = String(event.payload['taskType'] ?? 'guide');
    const task: AgentTask = {
      id: event.id,
      title: `Tax question: ${taskType}`,
      description: String(event.payload['question'] ?? 'Tax question'),
      priority: 'MEDIUM',
      payload: { type: taskType, ...event.payload },
      assignedBy: event.sourceAgent,
      correlationId: event.correlationId ?? event.id,
    };
    await this.execute(task);
  }

  private async handleCalendarRequest(event: SystemEvent): Promise<void> {
    const task: AgentTask = {
      id: event.id,
      title: 'Fiscal calendar request',
      description: 'User requested fiscal calendar',
      priority: 'LOW',
      payload: { type: 'calendar', ...event.payload },
      assignedBy: event.sourceAgent,
      correlationId: event.correlationId ?? event.id,
    };
    await this.execute(task);
  }
}
