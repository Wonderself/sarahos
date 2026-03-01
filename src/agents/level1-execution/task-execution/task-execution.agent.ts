import { BaseAgent } from '../../base/base-agent';
import { LLMRouter } from '../../../core/llm/llm-router';
import { PromptBuilder } from '../../../core/llm/prompt-builder';
import { eventBus } from '../../../core/event-bus/event-bus';
import { TASK_EXECUTION_SYSTEM_PROMPT, DATA_TRANSFORM_TEMPLATE } from './task-execution.prompts';
import { updateCRM, migrateFile, runScript, transformData } from './task-execution.tools';
import type { AgentTask, AgentConfig } from '../../base/agent.types';
import type { SystemEvent } from '../../../core/event-bus/event.types';

export const TASK_EXECUTION_AGENT_CONFIG: AgentConfig = {
  id: 'task-execution-agent',
  name: 'Task Execution Agent',
  level: 1,
  modelTier: 'fast',
  capabilities: ['crm', 'file-migration', 'script-execution', 'data-transform'],
  systemPrompt: TASK_EXECUTION_SYSTEM_PROMPT,
  maxRetries: 2,
  timeoutMs: 60_000,
  rateLimitPerMinute: 20,
};

type TaskExecutionType = 'crm' | 'file' | 'script' | 'data' | 'general';

export class TaskExecutionAgent extends BaseAgent {
  constructor(config: AgentConfig = TASK_EXECUTION_AGENT_CONFIG) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    eventBus.subscribe('TaskAssigned', async (event) => {
      if (event.targetAgent === this.id) {
        this.logger.info('Task assigned to execution agent', { eventId: event.id });
      }
    }, this.id);

    this.logger.info('Task Execution Agent initialized');
  }

  protected async onExecute(task: AgentTask): Promise<Record<string, unknown>> {
    const taskType = (task.payload['taskType'] as TaskExecutionType | undefined) ?? 'general';

    switch (taskType) {
      case 'crm':
        return this.handleCRMTask(task);
      case 'file':
        return this.handleFileTask(task);
      case 'script':
        return this.handleScriptTask(task);
      case 'data':
        return this.handleDataTask(task);
      case 'general':
      default:
        return this.handleGeneralTask(task);
    }
  }

  protected async onEvent(event: SystemEvent): Promise<void> {
    if (event.type === 'TaskAssigned' && event.targetAgent === this.id) {
      this.logger.debug('Received task assignment', { eventId: event.id });
    }
  }

  protected async onShutdown(): Promise<void> {
    eventBus.unsubscribe('TaskAssigned', this.id);
    this.logger.info('Task Execution Agent shut down');
  }

  private async handleCRMTask(task: AgentTask): Promise<Record<string, unknown>> {
    const entity = String(task.payload['entity'] ?? 'contact');
    const entityId = String(task.payload['entityId'] ?? '');
    const fields = (task.payload['fields'] as Record<string, unknown>) ?? {};

    const result = await updateCRM(entity, entityId, fields);
    return { ...result, action: 'crm_update' };
  }

  private async handleFileTask(task: AgentTask): Promise<Record<string, unknown>> {
    const source = String(task.payload['source'] ?? '');
    const destination = String(task.payload['destination'] ?? '');
    const options = task.payload['options'] as Record<string, unknown> | undefined;

    const result = await migrateFile(source, destination, options);
    return { ...result, action: 'file_migration' };
  }

  private async handleScriptTask(task: AgentTask): Promise<Record<string, unknown>> {
    const scriptPath = String(task.payload['scriptPath'] ?? '');
    const args = task.payload['args'] as string[] | undefined;

    const result = await runScript(scriptPath, args);

    await eventBus.publish('ScriptExecuted', this.id, {
      scriptPath,
      exitCode: result.exitCode,
      executionTimeMs: result.executionTimeMs,
    });

    return { ...result, action: 'script_execution' };
  }

  private async handleDataTask(task: AgentTask): Promise<Record<string, unknown>> {
    const input = (task.payload['input'] as Record<string, unknown>) ?? {};
    const format = String(task.payload['format'] ?? 'json');
    const schema = task.payload['schema'] as Record<string, unknown> | undefined;

    // For complex transformations, use LLM
    if (task.payload['useLLM']) {
      const response = await LLMRouter.route({
        agentId: this.id,
        agentName: this.name,
        modelTier: this.modelTier,
        systemPrompt: this.systemPrompt,
        userMessage: DATA_TRANSFORM_TEMPLATE
          .replace('{inputFormat}', String(task.payload['inputFormat'] ?? 'unknown'))
          .replace('{outputFormat}', format)
          .replace('{data}', JSON.stringify(input))
          .replace('{schema}', JSON.stringify(schema ?? {})),
      });

      return { action: 'data_transform_llm', output: response.content, tokensUsed: response.totalTokens };
    }

    const result = await transformData(input, format, schema);
    return { ...result, action: 'data_transform' };
  }

  private async handleGeneralTask(task: AgentTask): Promise<Record<string, unknown>> {
    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: PromptBuilder.buildTaskPrompt(task.title, task.description),
    });

    return { action: 'general_execution', result: response.content, tokensUsed: response.totalTokens };
  }
}
