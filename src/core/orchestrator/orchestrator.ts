import { logger } from '../../utils/logger';
import { stateManager } from '../state/state-manager';
import { roadmapParser } from '../state/roadmap-parser';
import { agentRegistry } from '../agent-registry/agent-registry';
import { taskScheduler } from './task-scheduler';
import type { SystemState } from '../state/state.types';

export class Orchestrator {
  private running = false;
  private loopIntervalMs: number;
  private loopTimer: ReturnType<typeof setInterval> | null = null;

  constructor(loopIntervalMs = 30_000) {
    this.loopIntervalMs = loopIntervalMs;
  }

  async initialize(): Promise<void> {
    logger.info('Orchestrator initializing...');

    // Step 1: Read-State Protocol
    const state = await stateManager.load();
    await roadmapParser.load();

    logger.info('System state loaded', {
      phase: state.current_phase,
      activeAgents: state.active_agents.length,
      tasksInProgress: state.tasks_in_progress.length,
      blockedTasks: state.blocked_tasks.length,
    });

    // Step 2: Diagnostic
    const diagnostics = this.runDiagnostics(state);
    if (diagnostics.length > 0) {
      logger.warn('Diagnostics found issues', { issues: diagnostics });
    }

    // Step 3: Initialize registered agents
    const agents = agentRegistry.getAllEntries();
    logger.info(`Initializing ${agents.length} registered agents`);

    for (const entry of agents) {
      const agent = agentRegistry.get(entry.id);
      if (agent) {
        try {
          await agent.initialize();
        } catch (error) {
          logger.error(`Failed to initialize agent: ${entry.name}`, { error });
        }
      }
    }

    logger.info('Orchestrator initialized', { agentCount: agents.length });
  }

  async start(): Promise<void> {
    if (this.running) {
      logger.warn('Orchestrator already running');
      return;
    }

    this.running = true;
    logger.info('Orchestrator started', { loopIntervalMs: this.loopIntervalMs });

    // Run first cycle immediately
    await this.executeCycle();

    // Schedule subsequent cycles
    this.loopTimer = setInterval(() => {
      this.executeCycle().catch((error) => {
        logger.error('Orchestrator cycle failed', { error });
      });
    }, this.loopIntervalMs);
  }

  async stop(): Promise<void> {
    this.running = false;

    if (this.loopTimer) {
      clearInterval(this.loopTimer);
      this.loopTimer = null;
    }

    // Shutdown all agents
    const agents = agentRegistry.getAllEntries();
    for (const entry of agents) {
      const agent = agentRegistry.get(entry.id);
      if (agent) {
        try {
          await agent.shutdown();
        } catch (error) {
          logger.error(`Failed to shutdown agent: ${entry.name}`, { error });
        }
      }
    }

    await stateManager.save();
    logger.info('Orchestrator stopped');
  }

  private async executeCycle(): Promise<void> {
    if (!this.running) return;

    logger.debug('Orchestrator cycle starting');

    // Process queued tasks
    const task = taskScheduler.dequeue();
    if (task) {
      // Find best agent for the task
      const idleAgents = agentRegistry.discover({ status: 'IDLE' });

      if (idleAgents.length > 0) {
        const agent = agentRegistry.get(idleAgents[0]!.id);
        if (agent) {
          logger.info('Assigning task to agent', {
            taskId: task.id,
            agent: idleAgents[0]!.name,
          });

          agent.execute(task).catch((error) => {
            logger.error('Task execution failed', { taskId: task.id, error });
          });
        }
      } else {
        // Re-enqueue if no agents available
        taskScheduler.enqueue(task);
        logger.debug('No idle agents, task re-enqueued', { taskId: task.id });
      }
    }

    // Health check all agents periodically
    await agentRegistry.healthCheckAll();

    // Update state
    await stateManager.update((state) => {
      const entries = agentRegistry.getAllEntries();
      state.active_agents = entries.filter((e) => e.status !== 'DISABLED').map((e) => e.name);
      state.disabled_agents = entries.filter((e) => e.status === 'DISABLED').map((e) => e.name);
    });

    logger.debug('Orchestrator cycle completed');
  }

  private runDiagnostics(state: SystemState): string[] {
    const issues: string[] = [];

    if (state.blocked_tasks.length > 0) {
      issues.push(`${state.blocked_tasks.length} blocked tasks found`);
    }

    if (state.known_bugs.length > 0) {
      issues.push(`${state.known_bugs.length} known bugs`);
    }

    if (state.unfinished_systems.length > 0) {
      issues.push(`${state.unfinished_systems.length} unfinished systems`);
    }

    return issues;
  }

  isRunning(): boolean {
    return this.running;
  }
}

export const orchestrator = new Orchestrator();
