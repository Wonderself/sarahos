import { BaseAgent } from '../../base/base-agent';
import { LLMRouter } from '../../../core/llm/llm-router';
import { eventBus } from '../../../core/event-bus/event-bus';
import { agentRegistry } from '../../../core/agent-registry/agent-registry';
import { taskScheduler } from '../../../core/orchestrator/task-scheduler';
import { humanOverride } from '../../../core/human-override/human-override';
import { memoryManager } from '../../../core/memory/memory-manager';
import { stateManager } from '../../../core/state/state-manager';
import {
  CHIEF_ORCHESTRATION_SYSTEM_PROMPT,
  EXECUTIVE_REVIEW_TEMPLATE,
  DIRECTIVE_TEMPLATE,
  CONFLICT_RESOLUTION_TEMPLATE,
  GLOBAL_STATE_TEMPLATE,
} from './chief-orchestration.prompts';
import {
  issueDirective,
  resolveConflict,
  generateExecutiveReview,
  buildGlobalStateSnapshot,
  assessMissionAlignment,
} from './chief-orchestration.tools';
import type { AgentTask, AgentConfig } from '../../base/agent.types';
import type { SystemEvent } from '../../../core/event-bus/event.types';

export const CHIEF_ORCHESTRATION_CONFIG: AgentConfig = {
  id: 'chief-orchestration',
  name: 'Chief Orchestration Agent',
  level: 3,
  modelTier: 'advanced',
  capabilities: [
    'system-wide-coordination',
    'directive-issuance',
    'conflict-resolution',
    'global-state-management',
    'mission-oversight',
  ],
  systemPrompt: CHIEF_ORCHESTRATION_SYSTEM_PROMPT,
  maxRetries: 2,
  timeoutMs: 90_000,
  rateLimitPerMinute: 10,
};

type ChiefTaskType = 'executive-review' | 'issue-directive' | 'resolve-conflict' | 'update-global-state' | 'mission-check';

export class ChiefOrchestrationAgent extends BaseAgent {
  constructor(config: AgentConfig = CHIEF_ORCHESTRATION_CONFIG) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    eventBus.subscribe('OperationReport', async (event) => {
      await memoryManager.store({
        content: `OperationReport: ${JSON.stringify(event.payload).slice(0, 500)}`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'l2_report', manager: 'operations' },
      });
    }, this.id);

    eventBus.subscribe('GrowthReport', async (event) => {
      await memoryManager.store({
        content: `GrowthReport: ${JSON.stringify(event.payload).slice(0, 500)}`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'l2_report', manager: 'growth' },
      });
    }, this.id);

    eventBus.subscribe('TechDebtReport', async (event) => {
      this.logger.info('Technical debt report received', { score: event.payload['totalDebtScore'] });
      await memoryManager.store({
        content: `TechDebtReport: score=${String(event.payload['totalDebtScore'])}`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'l2_report', manager: 'technical' },
      });
    }, this.id);

    eventBus.subscribe('KnowledgeAuditComplete', async (event) => {
      await memoryManager.store({
        content: `KnowledgeAudit: coverage=${String(event.payload['coverageScore'])} quality=${String(event.payload['qualityScore'])}`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'l2_report', manager: 'knowledge' },
      });
    }, this.id);

    eventBus.subscribe('PerformanceAlert', async (event) => {
      this.logger.warn('Performance alert escalated to L3', { score: event.payload['score'] });
      await this.handlePerformanceEscalation(event);
    }, this.id);

    eventBus.subscribe('InfraUpgradeNeeded', async (event) => {
      this.logger.warn('Infrastructure upgrade request', { upgrades: event.payload['upgradeNeeded'] });
      await humanOverride.requestApproval(
        'INFRASTRUCTURE',
        'Infrastructure Upgrade Required',
        `Upgrade needed: ${JSON.stringify(event.payload['upgradeNeeded'])}`,
        this.id,
        { estimatedCost: event.payload['estimatedCost'] },
      );
    }, this.id);

    this.logger.info('Chief Orchestration Agent initialized — supreme coordination active');
  }

  protected async onExecute(task: AgentTask): Promise<Record<string, unknown>> {
    const taskType = (task.payload['taskType'] as ChiefTaskType | undefined) ?? 'executive-review';

    switch (taskType) {
      case 'executive-review':
        return this.handleExecutiveReview(task);
      case 'issue-directive':
        return this.handleIssueDirective(task);
      case 'resolve-conflict':
        return this.handleResolveConflict(task);
      case 'update-global-state':
        return this.handleUpdateGlobalState();
      case 'mission-check':
        return this.handleMissionCheck();
      default:
        return { error: `Unknown chief orchestration task: ${String(taskType)}` };
    }
  }

  protected async onEvent(event: SystemEvent): Promise<void> {
    if (event.type === 'PerformanceAlert') {
      this.logger.warn('Performance alert tracked', { eventId: event.id });
    }
  }

  protected async onShutdown(): Promise<void> {
    eventBus.unsubscribe('OperationReport', this.id);
    eventBus.unsubscribe('GrowthReport', this.id);
    eventBus.unsubscribe('TechDebtReport', this.id);
    eventBus.unsubscribe('KnowledgeAuditComplete', this.id);
    eventBus.unsubscribe('PerformanceAlert', this.id);
    eventBus.unsubscribe('InfraUpgradeNeeded', this.id);
    this.logger.info('Chief Orchestration Agent shut down');
  }

  private async handleExecutiveReview(_task: AgentTask): Promise<Record<string, unknown>> {
    const recentReports = await memoryManager.search({
      query: 'l2_report OperationReport GrowthReport TechDebtReport KnowledgeAudit',
      topK: 20,
      agentId: this.id,
      minScore: 0.3,
    });

    const state = stateManager.getState();
    const review = generateExecutiveReview();

    const prompt = EXECUTIVE_REVIEW_TEMPLATE
      .replace('{operationReport}', recentReports.filter((r) => r.entry.content.startsWith('OperationReport')).map((r) => r.entry.content).join(' | ') || 'No data')
      .replace('{growthReport}', recentReports.filter((r) => r.entry.content.startsWith('GrowthReport')).map((r) => r.entry.content).join(' | ') || 'No data')
      .replace('{techReport}', recentReports.filter((r) => r.entry.content.startsWith('TechDebtReport')).map((r) => r.entry.content).join(' | ') || 'No data')
      .replace('{knowledgeReport}', recentReports.filter((r) => r.entry.content.startsWith('KnowledgeAudit')).map((r) => r.entry.content).join(' | ') || 'No data')
      .replace('{globalState}', JSON.stringify({ phase: state.current_phase, autonomyScore: state.autonomy_score, agents: state.active_agents.length }));

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    const result = {
      action: 'executive-review',
      ...review,
      reportsAnalyzed: recentReports.length,
      llmSynthesis: response.content,
      tokensUsed: response.totalTokens,
    };

    await eventBus.publish('GlobalStateUpdate', this.id, result);
    return result;
  }

  private async handleIssueDirective(task: AgentTask): Promise<Record<string, unknown>> {
    const target = String(task.payload['target'] ?? 'operations-manager');
    const action = String(task.payload['action'] ?? task.description);
    const priority = (task.payload['priority'] as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW') ?? 'MEDIUM';
    const rationale = String(task.payload['rationale'] ?? '');

    const directiveResult = issueDirective(target, action, priority, rationale);

    const prompt = DIRECTIVE_TEMPLATE
      .replace('{context}', rationale)
      .replace('{problem}', action)
      .replace('{targetManagers}', target)
      .replace('{constraints}', String(task.payload['constraints'] ?? 'none'));

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    if (priority === 'CRITICAL') {
      await humanOverride.requestApproval(
        'STRATEGIC',
        `Critical Directive: ${action}`,
        `Directive to ${target}: ${action}. Rationale: ${rationale}`,
        this.id,
        { directive: directiveResult },
      );
    }

    taskScheduler.enqueue({
      id: `directive-${directiveResult.directives[0]?.id ?? Date.now()}`,
      title: `Directive: ${action}`,
      description: `From Chief Orchestration: ${action}`,
      priority,
      payload: { taskType: 'directive', action, source: this.id },
      assignedBy: this.id,
      correlationId: task.correlationId,
    });

    const result = {
      action: 'issue-directive',
      ...directiveResult,
      llmAnalysis: response.content,
      tokensUsed: response.totalTokens,
    };

    await eventBus.publish('DirectiveIssued', this.id, result);
    return result;
  }

  private async handleResolveConflict(task: AgentTask): Promise<Record<string, unknown>> {
    const agents = (task.payload['agents'] as string[]) ?? [];
    const conflictDescription = String(task.payload['conflictDescription'] ?? task.description);
    const resources = String(task.payload['resources'] ?? '');

    const conflictResult = resolveConflict(agents, conflictDescription);

    const recentHistory = await memoryManager.search({
      query: `conflict ${agents.join(' ')}`,
      topK: 10,
      agentId: this.id,
      minScore: 0.3,
    });

    const prompt = CONFLICT_RESOLUTION_TEMPLATE
      .replace('{agents}', agents.join(', '))
      .replace('{conflictDescription}', conflictDescription)
      .replace('{resources}', resources)
      .replace('{recentHistory}', recentHistory.map((r) => r.entry.content).join(' | ') || 'No history');

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    const result = {
      action: 'resolve-conflict',
      ...conflictResult,
      llmResolution: response.content,
      tokensUsed: response.totalTokens,
    };

    for (const agent of agents) {
      await eventBus.publish('DirectiveIssued', this.id, {
        target: agent,
        action: `Conflict resolution: ${conflictResult.resolution}`,
        priority: 'HIGH',
      });
    }

    return result;
  }

  private async handleUpdateGlobalState(): Promise<Record<string, unknown>> {
    const snapshot = buildGlobalStateSnapshot();
    const state = stateManager.getState();

    const recentEvents = await memoryManager.search({
      query: 'report alert escalation',
      topK: 20,
      agentId: this.id,
      minScore: 0.2,
    });

    const prompt = GLOBAL_STATE_TEMPLATE
      .replace('{currentMetrics}', JSON.stringify(snapshot))
      .replace('{recentEvents}', recentEvents.map((r) => r.entry.content).join(' | ') || 'None')
      .replace('{autonomyScore}', String(state.autonomy_score));

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    await stateManager.update((s) => {
      s.timestamp = new Date().toISOString();
    });

    const result = {
      action: 'update-global-state',
      snapshot,
      llmAnalysis: response.content,
      tokensUsed: response.totalTokens,
    };

    await eventBus.publish('GlobalStateUpdate', this.id, result);
    return result;
  }

  private async handleMissionCheck(): Promise<Record<string, unknown>> {
    const agentHealth = await agentRegistry.healthCheckAll();
    const entries = agentRegistry.getAllEntries();

    const reports = await memoryManager.search({
      query: 'l2_report mission progress',
      topK: 20,
      agentId: this.id,
      minScore: 0.2,
    });

    const alignment = assessMissionAlignment(reports.map((r) => ({ content: r.entry.content })));

    const result = {
      action: 'mission-check',
      totalAgents: entries.length,
      healthyAgents: Array.from(agentHealth.values()).filter((h) => h.healthy).length,
      alignment,
      reportsReviewed: reports.length,
    };

    return result;
  }

  private async handlePerformanceEscalation(event: SystemEvent): Promise<void> {
    const score = (event.payload['score'] as number) ?? 0;
    if (score < 50) {
      this.logger.warn('Critical performance — issuing emergency directive');
      taskScheduler.enqueue({
        id: `perf-emergency-${event.id}`,
        title: 'Emergency: Critical performance degradation',
        description: `Performance score ${score}/100 — immediate investigation required`,
        priority: 'CRITICAL',
        payload: { taskType: 'performance', urgency: 'critical', score },
        assignedBy: this.id,
        correlationId: event.correlationId ?? '',
      });
    }
  }
}
