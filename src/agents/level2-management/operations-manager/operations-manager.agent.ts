import { BaseAgent } from '../../base/base-agent';
import { LLMRouter } from '../../../core/llm/llm-router';
import { eventBus } from '../../../core/event-bus/event-bus';
import { agentRegistry } from '../../../core/agent-registry/agent-registry';
import { taskScheduler } from '../../../core/orchestrator/task-scheduler';
import { humanOverride } from '../../../core/human-override/human-override';
import { memoryManager } from '../../../core/memory/memory-manager';
import { OPERATIONS_MANAGER_SYSTEM_PROMPT, DECOMPOSE_TEMPLATE, ESCALATION_TEMPLATE, REPORT_TEMPLATE } from './operations-manager.prompts';
import { decomposeTask, allocateResources, generateOperationReport, assessEscalation } from './operations-manager.tools';
import type { AgentTask, AgentConfig } from '../../base/agent.types';
import type { SystemEvent } from '../../../core/event-bus/event.types';

export const OPERATIONS_MANAGER_CONFIG: AgentConfig = {
  id: 'operations-manager',
  name: 'Operations Manager',
  level: 2,
  modelTier: 'standard',
  capabilities: ['task-decomposition', 'resource-allocation', 'operation-reporting', 'escalation-handling'],
  systemPrompt: OPERATIONS_MANAGER_SYSTEM_PROMPT,
  maxRetries: 2,
  timeoutMs: 60_000,
  rateLimitPerMinute: 20,
};

type OpsTaskType = 'decompose' | 'report' | 'escalation' | 'allocate';

export class OperationsManager extends BaseAgent {
  constructor(config: AgentConfig = OPERATIONS_MANAGER_CONFIG) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    eventBus.subscribe('TaskCompleted', async (event) => {
      this.logger.debug('Task completed by L1 agent', { source: event.sourceAgent, taskId: event.payload['taskId'] });
    }, this.id);

    eventBus.subscribe('TaskFailed', async (event) => {
      this.logger.warn('Task failure detected', { source: event.sourceAgent, error: event.payload['error'] });
      await memoryManager.store({
        content: `TaskFailed: ${String(event.payload['error'])} from ${event.sourceAgent}`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'task_failure', sourceAgent: event.sourceAgent, eventId: event.id },
      });
    }, this.id);

    eventBus.subscribe('ThresholdBreached', async (event) => {
      const severity = event.payload['severity'] as string;
      this.logger.warn('Threshold breach received', { severity, metric: event.payload['metric'] });
      if (severity === 'critical') {
        await this.triggerEscalation(event);
      }
    }, this.id);

    eventBus.subscribe('EscalationToHuman', async (event) => {
      this.logger.warn('Human escalation received — assessing', { eventId: event.id });
      await this.triggerEscalation(event);
    }, this.id);

    eventBus.subscribe('HealthReport', async (event) => {
      await memoryManager.store({
        content: `HealthReport: status=${String(event.payload['status'])} alerts=${JSON.stringify(event.payload['alerts'] ?? [])}`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'health_report', status: event.payload['status'] },
      });
    }, this.id);

    this.logger.info('Operations Manager initialized — coordinating L1 agents');
  }

  protected async onExecute(task: AgentTask): Promise<Record<string, unknown>> {
    const taskType = (task.payload['taskType'] as OpsTaskType | undefined) ?? 'decompose';

    switch (taskType) {
      case 'decompose':
        return this.handleDecompose(task);
      case 'report':
        return this.handleReport(task);
      case 'escalation':
        return this.handleEscalation(task);
      case 'allocate':
        return this.handleAllocate(task);
      default:
        return { error: `Unknown operations task: ${String(taskType)}` };
    }
  }

  protected async onEvent(event: SystemEvent): Promise<void> {
    if (event.type === 'TaskFailed') {
      this.logger.debug('Monitoring L1 task failure', { eventId: event.id });
    }
  }

  protected async onShutdown(): Promise<void> {
    eventBus.unsubscribe('TaskCompleted', this.id);
    eventBus.unsubscribe('TaskFailed', this.id);
    eventBus.unsubscribe('ThresholdBreached', this.id);
    eventBus.unsubscribe('EscalationToHuman', this.id);
    eventBus.unsubscribe('HealthReport', this.id);
    this.logger.info('Operations Manager shut down');
  }

  private async handleDecompose(task: AgentTask): Promise<Record<string, unknown>> {
    const description = String(task.payload['description'] ?? task.description);
    const context = String(task.payload['context'] ?? '');
    const parentPriority = task.priority;

    const prompt = DECOMPOSE_TEMPLATE
      .replace('{task}', description)
      .replace('{context}', context)
      .replace('{priority}', parentPriority);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    let subtasks: Array<{ title: string; description?: string; targetAgent: string; priority?: string; payload?: Record<string, unknown> }>;
    try {
      const parsed = JSON.parse(response.content) as Record<string, unknown>;
      subtasks = (parsed['subtasks'] as typeof subtasks) ?? [];
    } catch {
      // Fallback: use stub decomposition
      const stub = decomposeTask(description, context);
      subtasks = stub.subtasks;
    }

    // Enqueue each subtask
    const enqueuedIds: string[] = [];
    for (let i = 0; i < subtasks.length; i++) {
      const sub = subtasks[i]!;
      const subtaskId = `${task.id}-sub-${i}`;
      taskScheduler.enqueue({
        id: subtaskId,
        title: sub.title,
        description: sub.description ?? sub.title,
        priority: (sub.priority as AgentTask['priority']) ?? parentPriority,
        payload: { ...sub.payload, taskType: sub.payload?.['taskType'] ?? 'general' },
        assignedBy: this.id,
        correlationId: task.correlationId,
      });
      enqueuedIds.push(subtaskId);
    }

    await eventBus.publish('TaskDecomposed', this.id, {
      parentTaskId: task.id,
      subtaskCount: subtasks.length,
      subtaskIds: enqueuedIds,
    });

    await eventBus.publish('SubtasksAssigned', this.id, {
      parentTaskId: task.id,
      assignments: subtasks.map((s, i) => ({ subtaskId: enqueuedIds[i], targetAgent: s.targetAgent })),
    });

    return {
      action: 'decompose',
      parentTaskId: task.id,
      subtaskCount: subtasks.length,
      subtaskIds: enqueuedIds,
      tokensUsed: response.totalTokens,
    };
  }

  private async handleReport(task: AgentTask): Promise<Record<string, unknown>> {
    const period = String(task.payload['period'] ?? 'today');

    // Gather recent data from memory
    const recentFailures = await memoryManager.search({
      query: 'TaskFailed',
      topK: 20,
      agentId: this.id,
      minScore: 0.3,
    });

    const recentHealth = await memoryManager.search({
      query: 'HealthReport',
      topK: 5,
      agentId: this.id,
      minScore: 0.3,
    });

    // Get agent health
    const healthMap = await agentRegistry.healthCheckAll();
    const healthSummary: Record<string, string> = {};
    for (const [id, status] of healthMap) {
      healthSummary[id] = status.healthy ? 'healthy' : 'unhealthy';
    }

    const stubReport = generateOperationReport(period);

    const prompt = REPORT_TEMPLATE
      .replace('{period}', period)
      .replace('{completed}', String(stubReport.tasksCompleted))
      .replace('{failed}', String(recentFailures.length))
      .replace('{health}', JSON.stringify(healthSummary))
      .replace('{metrics}', JSON.stringify({ avgLatency: stubReport.avgLatencyMs, agentCount: agentRegistry.getCount() }));

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    const report = {
      action: 'report',
      period,
      summary: response.content,
      agentHealth: healthSummary,
      recentFailures: recentFailures.length,
      recentHealthReports: recentHealth.length,
      tokensUsed: response.totalTokens,
    };

    await eventBus.publish('OperationReport', this.id, report);
    return report;
  }

  private async handleEscalation(task: AgentTask): Promise<Record<string, unknown>> {
    const event = String(task.payload['event'] ?? '');
    const source = String(task.payload['source'] ?? '');
    const severity = String(task.payload['severity'] ?? 'medium');

    const prompt = ESCALATION_TEMPLATE
      .replace('{event}', event)
      .replace('{source}', source)
      .replace('{severity}', severity)
      .replace('{context}', String(task.payload['context'] ?? ''));

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    const assessment = assessEscalation(event);
    const requiresHuman = severity === 'critical' || assessment.requiresHuman;

    if (requiresHuman) {
      await humanOverride.requestApproval(
        'INFRASTRUCTURE',
        `Escalation: ${event}`,
        response.content,
        this.id,
        { severity, source, assessment: response.content },
      );
    }

    return {
      action: 'escalation',
      severity,
      source,
      analysis: response.content,
      requiresHuman,
      tokensUsed: response.totalTokens,
    };
  }

  private async handleAllocate(task: AgentTask): Promise<Record<string, unknown>> {
    const taskIds = (task.payload['taskIds'] as string[]) ?? [];

    // Discover idle L1 agents
    const idleAgents = agentRegistry.discover({ level: 1, status: 'IDLE' });
    const availableIds = idleAgents.map((a) => a.id);

    const result = allocateResources(taskIds, availableIds);

    return {
      action: 'allocate',
      ...result,
      totalAgentsAvailable: availableIds.length,
    };
  }

  private async triggerEscalation(event: SystemEvent): Promise<void> {
    const severity = String(event.payload['severity'] ?? 'high');

    if (severity === 'critical') {
      await humanOverride.requestApproval(
        'INFRASTRUCTURE',
        `Critical escalation from ${event.sourceAgent}`,
        `Event: ${event.type} | Payload: ${JSON.stringify(event.payload)}`,
        this.id,
        { eventId: event.id, eventType: event.type },
      );
    }

    await memoryManager.store({
      content: `Escalation: severity=${severity} source=${event.sourceAgent} type=${event.type}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'escalation', severity, sourceAgent: event.sourceAgent },
    });
  }
}
