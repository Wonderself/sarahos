import { BaseAgent } from '../../base/base-agent';
import { eventBus } from '../../../core/event-bus/event-bus';
import { SCHEDULING_SYSTEM_PROMPT } from './scheduling.prompts';
import { createEvent, checkConflicts, syncCalendars, convertTimezone } from './scheduling.tools';
import type { AgentTask, AgentConfig } from '../../base/agent.types';
import type { SystemEvent } from '../../../core/event-bus/event.types';

export const SCHEDULING_AGENT_CONFIG: AgentConfig = {
  id: 'scheduling-agent',
  name: 'Scheduling Agent',
  level: 1,
  modelTier: 'fast',
  capabilities: ['create-event', 'check-conflicts', 'sync-calendars', 'timezone-conversion'],
  systemPrompt: SCHEDULING_SYSTEM_PROMPT,
  maxRetries: 2,
  timeoutMs: 15_000,
  rateLimitPerMinute: 30,
};

type SchedulingTaskType = 'create-event' | 'check-conflicts' | 'sync' | 'convert-timezone';

export class SchedulingAgent extends BaseAgent {
  constructor(config: AgentConfig = SCHEDULING_AGENT_CONFIG) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    eventBus.subscribe('MeetingScheduled', async (event) => {
      // Auto-check for conflicts when meetings are scheduled externally
      const start = String(event.payload['startTime'] ?? '');
      const end = String(event.payload['endTime'] ?? '');
      const attendees = (event.payload['attendees'] as string[]) ?? [];
      if (start && end) {
        const result = await checkConflicts(start, end, attendees);
        if (result.hasConflicts) {
          await eventBus.publish('ConflictDetected', this.id, {
            sourceEvent: event.id,
            conflicts: result.conflicts,
          });
        }
      }
    }, this.id);

    this.logger.info('Scheduling Agent initialized — monitoring for meeting conflicts');
  }

  protected async onExecute(task: AgentTask): Promise<Record<string, unknown>> {
    const taskType = (task.payload['taskType'] as SchedulingTaskType | undefined) ?? 'create-event';

    switch (taskType) {
      case 'create-event':
        return this.handleCreateEvent(task);
      case 'check-conflicts':
        return this.handleCheckConflicts(task);
      case 'sync':
        return this.handleSync(task);
      case 'convert-timezone':
        return this.handleTimezoneConversion(task);
      default:
        return { error: `Unknown scheduling task: ${String(taskType)}` };
    }
  }

  protected async onEvent(event: SystemEvent): Promise<void> {
    if (event.type === 'MeetingScheduled') {
      this.logger.debug('External meeting detected', { eventId: event.id });
    }
  }

  protected async onShutdown(): Promise<void> {
    eventBus.unsubscribe('MeetingScheduled', this.id);
    this.logger.info('Scheduling Agent shut down');
  }

  private async handleCreateEvent(task: AgentTask): Promise<Record<string, unknown>> {
    const title = String(task.payload['title'] ?? task.title);
    const startTime = String(task.payload['startTime'] ?? '');
    const endTime = String(task.payload['endTime'] ?? '');
    const attendees = (task.payload['attendees'] as string[]) ?? [];
    const timezone = task.payload['timezone'] as string | undefined;

    // Check conflicts first
    const conflicts = await checkConflicts(startTime, endTime, attendees);
    if (conflicts.hasConflicts) {
      await eventBus.publish('ConflictDetected', this.id, { conflicts: conflicts.conflicts });
      return { ...conflicts, action: 'create-event', blocked: true, reason: 'conflicts_detected' };
    }

    const result = await createEvent(title, startTime, endTime, attendees, timezone);

    await eventBus.publish('MeetingScheduled', this.id, {
      eventId: result.eventId,
      title,
      startTime,
      endTime,
      attendees,
    });

    return { ...result, action: 'create-event' };
  }

  private async handleCheckConflicts(task: AgentTask): Promise<Record<string, unknown>> {
    const startTime = String(task.payload['startTime'] ?? '');
    const endTime = String(task.payload['endTime'] ?? '');
    const attendees = (task.payload['attendees'] as string[]) ?? [];

    const result = await checkConflicts(startTime, endTime, attendees);
    return { ...result, action: 'check-conflicts' };
  }

  private async handleSync(task: AgentTask): Promise<Record<string, unknown>> {
    const sources = (task.payload['sources'] as string[]) ?? [];
    const result = await syncCalendars(sources);
    return { ...result, action: 'sync' };
  }

  private async handleTimezoneConversion(task: AgentTask): Promise<Record<string, unknown>> {
    const time = String(task.payload['time'] ?? '');
    const from = String(task.payload['from'] ?? 'UTC');
    const to = String(task.payload['to'] ?? 'Europe/Paris');

    const result = convertTimezone(time, from, to);
    return { ...result, action: 'convert-timezone' };
  }
}
