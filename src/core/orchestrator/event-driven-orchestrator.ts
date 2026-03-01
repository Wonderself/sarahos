import { logger } from '../../utils/logger';
import { eventBus } from '../event-bus/event-bus';
import { stateManager } from '../state/state-manager';
import { taskScheduler } from './task-scheduler';
import type { SystemEvent } from '../event-bus/event.types';

export class EventDrivenOrchestrator {
  private triggerStats = new Map<string, number>();
  private unsubscribers: Array<() => void> = [];

  setupEventTriggers(): void {
    logger.info('Setting up event-driven triggers');

    // ASR transcription → update state
    this.registerTrigger('ASRTranscriptionCompleted', async (_event) => {
      await stateManager.update((state) => {
        state.avatar_system.asr_requests_today++;
      });
    });

    // TTS synthesis → update state
    this.registerTrigger('TTSSynthesisCompleted', async (_event) => {
      await stateManager.update((state) => {
        state.avatar_system.tts_api_usage_today++;
      });
    });

    // Video session → update state
    this.registerTrigger('VideoSessionStarted', async (_event) => {
      await stateManager.update((state) => {
        state.avatar_system.did_api_usage_today++;
      });
    });

    // Telephony calls → track active calls
    this.registerTrigger('TelephonyCallStarted', async (_event) => {
      await stateManager.update((state) => {
        state.avatar_system.active_calls++;
      });
    });

    this.registerTrigger('TelephonyCallEnded', async (_event) => {
      await stateManager.update((state) => {
        state.avatar_system.active_calls = Math.max(0, state.avatar_system.active_calls - 1);
      });
    });

    // Conversation turn → update pipeline latency
    this.registerTrigger('ConversationTurnCompleted', async (event) => {
      const latencyMs = (event.payload['latencyMs'] as number) ?? 0;
      await stateManager.update((state) => {
        const current = state.avatar_system.pipeline_latency_avg_ms;
        // Exponential moving average
        state.avatar_system.pipeline_latency_avg_ms = current === 0
          ? latencyMs
          : Math.round(current * 0.8 + latencyMs * 0.2);
      });
    });

    // Performance alert → trigger self-improvement task
    this.registerTrigger('PerformanceAlert', async (event) => {
      logger.warn('PerformanceAlert received — enqueuing self-improvement task', {
        score: event.payload['score'],
      });
      taskScheduler.enqueue({
        id: `auto-optimize-${Date.now()}`,
        title: 'Auto-optimize from PerformanceAlert',
        description: 'Triggered by PerformanceAlert event',
        priority: 'HIGH',
        payload: { taskType: 'optimize', triggeredBy: 'PerformanceAlert', alertData: event.payload },
        assignedBy: 'event-driven-orchestrator',
        correlationId: event.correlationId ?? '',
      });
    });

    // Tech debt report → auto-enqueue if score > 60
    this.registerTrigger('TechDebtReport', async (event) => {
      const score = (event.payload['totalDebtScore'] as number) ?? 0;
      if (score > 60) {
        logger.warn('High tech debt detected — enqueuing optimization task', { score });
        taskScheduler.enqueue({
          id: `auto-debt-${Date.now()}`,
          title: 'Auto code-review from TechDebtReport',
          description: `Triggered by TechDebtReport with score ${score}`,
          priority: 'MEDIUM',
          payload: { taskType: 'code-review', triggeredBy: 'TechDebtReport', debtScore: score },
          assignedBy: 'event-driven-orchestrator',
          correlationId: event.correlationId ?? '',
        });
      }
    });

    logger.info('Event-driven triggers configured', {
      triggerCount: this.triggerStats.size,
    });
  }

  private registerTrigger(
    eventType: SystemEvent['type'],
    handler: (event: SystemEvent) => Promise<void>,
  ): void {
    const unsubscribe = eventBus.subscribe(eventType, async (event) => {
      this.triggerStats.set(eventType, (this.triggerStats.get(eventType) ?? 0) + 1);
      try {
        await handler(event);
      } catch (error) {
        logger.error(`Event trigger failed for ${eventType}`, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }, `event-driven-orchestrator-${eventType}`);

    this.unsubscribers.push(unsubscribe);
  }

  getEventTriggerStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const [type, count] of this.triggerStats) {
      stats[type] = count;
    }
    return stats;
  }

  teardown(): void {
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];
    this.triggerStats.clear();
    logger.info('Event-driven orchestrator torn down');
  }
}

export const eventDrivenOrchestrator = new EventDrivenOrchestrator();
