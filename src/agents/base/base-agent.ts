import { v4 as uuidv4 } from 'uuid';
import { createAgentLogger } from '../../utils/logger';
import { AgentError } from '../../utils/errors';
import { withRetry } from '../../utils/retry';
import { RateLimiter } from '../../utils/rate-limiter';
import { eventBus } from '../../core/event-bus/event-bus';
import type { IAgent } from './agent.interface';
import type {
  AgentStatus,
  AgentLevel,
  ModelTier,
  AgentTask,
  AgentResult,
  HealthStatus,
  AgentConfig,
} from './agent.types';
import type { SystemEvent } from '../../core/event-bus/event.types';

export abstract class BaseAgent implements IAgent {
  readonly id: string;
  readonly name: string;
  readonly level: AgentLevel;
  status: AgentStatus = 'IDLE';
  readonly capabilities: string[];
  readonly modelTier: ModelTier;

  protected readonly logger;
  protected readonly systemPrompt: string;
  protected readonly maxRetries: number;
  protected readonly timeoutMs: number;
  protected readonly rateLimiter: RateLimiter;

  private initTime: number | null = null;
  private lastActivityTime: string | null = null;

  constructor(config: AgentConfig) {
    this.id = config.id || uuidv4();
    this.name = config.name;
    this.level = config.level;
    this.modelTier = config.modelTier;
    this.capabilities = config.capabilities;
    this.systemPrompt = config.systemPrompt;
    this.maxRetries = config.maxRetries;
    this.timeoutMs = config.timeoutMs;
    this.rateLimiter = new RateLimiter({
      maxRequests: config.rateLimitPerMinute,
      windowMs: 60_000,
    });
    this.logger = createAgentLogger(this.name);
  }

  async initialize(): Promise<void> {
    this.logger.info(`Initializing agent: ${this.name}`);
    this.initTime = Date.now();
    this.status = 'IDLE';

    await this.onInitialize();

    this.logger.info(`Agent initialized: ${this.name}`, {
      level: this.level,
      modelTier: this.modelTier,
      capabilities: this.capabilities,
    });
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    if (this.status === 'DISABLED') {
      throw new AgentError(this.id, `Agent ${this.name} is disabled`);
    }

    if (!this.rateLimiter.canProceed(this.id)) {
      throw new AgentError(this.id, `Rate limit exceeded for agent ${this.name}`);
    }

    this.status = 'BUSY';
    this.lastActivityTime = new Date().toISOString();
    const startTime = Date.now();

    this.logger.info(`Executing task`, { taskId: task.id, title: task.title });

    try {
      const result = await withRetry(
        () => this.onExecute(task),
        `${this.name}:execute:${task.id}`,
        { maxRetries: this.maxRetries }
      );

      this.rateLimiter.record(this.id);
      this.status = 'IDLE';

      const agentResult: AgentResult = {
        taskId: task.id,
        agentId: this.id,
        success: true,
        output: result,
        tokensUsed: 0,
        executionTimeMs: Date.now() - startTime,
      };

      await eventBus.publish('TaskCompleted', this.id, {
        taskId: task.id,
        result: agentResult,
      });

      this.logger.info(`Task completed`, {
        taskId: task.id,
        executionTimeMs: agentResult.executionTimeMs,
      });

      return agentResult;
    } catch (error) {
      this.status = 'ERROR';
      const errorMessage = error instanceof Error ? error.message : String(error);

      await eventBus.publish('TaskFailed', this.id, {
        taskId: task.id,
        error: errorMessage,
      });

      this.logger.error(`Task failed`, { taskId: task.id, error: errorMessage });

      return {
        taskId: task.id,
        agentId: this.id,
        success: false,
        output: {},
        error: errorMessage,
        tokensUsed: 0,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }

  async handleEvent(event: SystemEvent): Promise<void> {
    this.lastActivityTime = new Date().toISOString();
    this.logger.debug(`Handling event`, { eventType: event.type, eventId: event.id });
    await this.onEvent(event);
  }

  async healthCheck(): Promise<HealthStatus> {
    return {
      agentId: this.id,
      healthy: this.status !== 'ERROR' && this.status !== 'DISABLED',
      status: this.status,
      uptime: this.initTime ? Date.now() - this.initTime : 0,
      lastActivity: this.lastActivityTime,
      details: await this.getHealthDetails(),
    };
  }

  async shutdown(): Promise<void> {
    this.logger.info(`Shutting down agent: ${this.name}`);
    await this.onShutdown();
    this.status = 'DISABLED';
    this.logger.info(`Agent shut down: ${this.name}`);
  }

  protected abstract onInitialize(): Promise<void>;
  protected abstract onExecute(task: AgentTask): Promise<Record<string, unknown>>;
  protected abstract onEvent(event: SystemEvent): Promise<void>;
  protected abstract onShutdown(): Promise<void>;

  protected async getHealthDetails(): Promise<Record<string, unknown>> {
    return {
      rateLimitRemaining: this.rateLimiter.getRemainingRequests(this.id),
    };
  }
}
