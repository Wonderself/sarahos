// ===============================================================
// Ceremonie Agent — "Maitre de Ceremonie" (Event Planner)
// ===============================================================

import { BaseAgent } from '../../../base/base-agent';
import { LLMRouter } from '../../../../core/llm/llm-router';
import { eventBus } from '../../../../core/event-bus/event-bus';
import { memoryManager } from '../../../../core/memory/memory-manager';
import {
  CEREMONIE_SYSTEM_PROMPT,
  PLAN_PROMPT,
  GUESTS_PROMPT,
  TIMELINE_PROMPT,
  BUDGET_PROMPT,
  TIMELINE_TEMPLATES,
} from './ceremonie.prompts';
import {
  getEvents,
  createEvent,
  updateEvent,
  getGuests,
  addGuest,
  updateGuestRSVP,
  getRSVPSummary,
} from './ceremonie.tools';
import type { AgentTask, AgentConfig } from '../../../base/agent.types';
import type { SystemEvent } from '../../../../core/event-bus/event.types';
import type {
  CeremonieTaskType,
  PlanPayload,
  GuestsPayload,
  TimelinePayload,
  BudgetPayload,
} from './ceremonie.types';

export const CEREMONIE_AGENT_CONFIG: AgentConfig = {
  id: 'ceremonie-agent',
  name: 'Ceremonie Agent',
  level: 1,
  modelTier: 'fast',
  capabilities: [
    'event-planning',
    'guest-management',
    'timeline-creation',
    'event-budgeting',
  ],
  systemPrompt: CEREMONIE_SYSTEM_PROMPT,
  maxRetries: 2,
  timeoutMs: 30_000,
  rateLimitPerMinute: 30,
};

export class CeremonieAgent extends BaseAgent {
  constructor(config: AgentConfig = CEREMONIE_AGENT_CONFIG) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    eventBus.subscribe('EventPlannerGuestRSVP', async (event) => {
      await this.handleGuestRSVPEvent(event);
    }, this.id);

    this.logger.info('Ceremonie Agent initialized — ready to plan events');
  }

  protected async onExecute(task: AgentTask): Promise<Record<string, unknown>> {
    const taskType = (task.payload['type'] as CeremonieTaskType | undefined) ?? 'plan';

    switch (taskType) {
      case 'plan':
        return this.handlePlan(task);
      case 'guests':
        return this.handleGuests(task);
      case 'timeline':
        return this.handleTimeline(task);
      case 'budget':
        return this.handleBudget(task);
      default:
        return { error: `Unknown ceremonie task type: ${String(taskType)}` };
    }
  }

  protected async onEvent(event: SystemEvent): Promise<void> {
    if (event.type === 'EventPlannerGuestRSVP') {
      await this.handleGuestRSVPEvent(event);
    }
  }

  protected async onShutdown(): Promise<void> {
    eventBus.unsubscribe('EventPlannerGuestRSVP', this.id);
    this.logger.info('Ceremonie Agent shut down');
  }

  // ── Plan ──

  private async handlePlan(task: AgentTask): Promise<Record<string, unknown>> {
    const payload = task.payload as unknown as PlanPayload;

    // Create the event in DB
    const event = await createEvent(payload.userId, {
      eventType: payload.eventType,
      title: payload.title,
      eventDate: payload.eventDate,
      venue: payload.venue,
      budgetCents: payload.budgetCents,
      guestCount: payload.guestCount,
      status: 'planning',
    });

    // Get default timeline template
    const timelineTemplate = TIMELINE_TEMPLATES[payload.eventType] ?? TIMELINE_TEMPLATES.autre;

    // Use LLM for enhanced planning
    const prompt = PLAN_PROMPT
      .replace('{eventType}', payload.eventType)
      .replace('{title}', payload.title)
      .replace('{eventDate}', payload.eventDate)
      .replace('{venue}', payload.venue ?? 'A definir')
      .replace('{budget}', String(payload.budgetCents ?? 0))
      .replace('{guestCount}', String(payload.guestCount ?? 0));

    const llmResponse = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: CEREMONIE_SYSTEM_PROMPT,
      userMessage: prompt,
    });

    // Store in memory
    await memoryManager.store({
      content: `Evenement "${payload.title}" (${payload.eventType}) cree pour ${payload.eventDate}`,
      source: this.name,
      agentId: this.id,
      metadata: {
        type: 'event_plan',
        eventType: payload.eventType,
        eventDate: payload.eventDate,
      },
    });

    return {
      event,
      timelineTemplate,
      llmPlan: llmResponse.content,
    };
  }

  // ── Guests ──

  private async handleGuests(task: AgentTask): Promise<Record<string, unknown>> {
    const payload = task.payload as unknown as GuestsPayload;

    switch (payload.action) {
      case 'list': {
        const guests = await getGuests(payload.eventId);
        const rsvpSummary = await getRSVPSummary(payload.eventId);
        return { guests, rsvpSummary };
      }

      case 'add': {
        if (!payload.guestData?.name) {
          return { error: 'Guest name is required' };
        }
        const guest = await addGuest(payload.eventId, {
          name: payload.guestData.name,
          email: payload.guestData.email,
          phone: payload.guestData.phone,
          dietary: payload.guestData.dietary,
          plusOne: payload.guestData.plusOne,
          tableNumber: payload.guestData.tableNumber,
        });

        return { guest, added: true };
      }

      case 'update_rsvp': {
        if (!payload.guestData?.id || !payload.guestData?.rsvpStatus) {
          return { error: 'Guest ID and RSVP status are required' };
        }
        const updatedGuest = await updateGuestRSVP(
          payload.guestData.id,
          payload.guestData.rsvpStatus,
        );

        // Publish event for RSVP tracking
        if (updatedGuest) {
          await eventBus.publish('EventPlannerGuestRSVP', this.id, {
            eventId: payload.eventId,
            guestId: updatedGuest.id,
            guestName: updatedGuest.name,
            rsvpStatus: updatedGuest.rsvpStatus,
          });
        }

        const rsvpSummary = await getRSVPSummary(payload.eventId);
        return { guest: updatedGuest, rsvpSummary };
      }

      case 'summary': {
        const guests = await getGuests(payload.eventId);
        const rsvpSummary = await getRSVPSummary(payload.eventId);

        const prompt = GUESTS_PROMPT
          .replace('{action}', 'summary')
          .replace('{eventId}', payload.eventId)
          .replace('{guestData}', '')
          .replace('{currentGuests}', JSON.stringify({ guests, rsvpSummary }));

        const llmResponse = await LLMRouter.route({
          agentId: this.id,
          agentName: this.name,
          modelTier: this.modelTier,
          systemPrompt: CEREMONIE_SYSTEM_PROMPT,
          userMessage: prompt,
        });

        return { guests, rsvpSummary, llmSummary: llmResponse.content };
      }

      default:
        return { error: `Unknown guests action: ${String(payload.action)}` };
    }
  }

  // ── Timeline ──

  private async handleTimeline(task: AgentTask): Promise<Record<string, unknown>> {
    const payload = task.payload as unknown as TimelinePayload;
    const eventType = payload.eventType ?? 'autre';

    // Get event data if we have an eventId
    const events = await getEvents(payload.userId);
    const event = events.find((e) => e.id === payload.eventId);

    const template = TIMELINE_TEMPLATES[eventType] ?? TIMELINE_TEMPLATES.autre;

    const prompt = TIMELINE_PROMPT
      .replace('{eventType}', eventType)
      .replace('{eventDate}', event?.eventDate ?? 'Non definie')
      .replace('{eventData}', JSON.stringify(event ?? {}));

    const llmResponse = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: CEREMONIE_SYSTEM_PROMPT,
      userMessage: prompt,
    });

    // Update event with timeline if we have a match
    if (event) {
      await updateEvent(payload.eventId, payload.userId, {
        timeline: template,
      });
    }

    return {
      timeline: template,
      event,
      llmTimeline: llmResponse.content,
    };
  }

  // ── Budget ──

  private async handleBudget(task: AgentTask): Promise<Record<string, unknown>> {
    const payload = task.payload as unknown as BudgetPayload;

    const events = await getEvents(payload.userId);
    const event = events.find((e) => e.id === payload.eventId);

    const prompt = BUDGET_PROMPT
      .replace('{action}', payload.action)
      .replace('{budgetTotal}', String(event?.budgetCents ?? 0))
      .replace('{currentSpent}', String(event?.spentCents ?? 0))
      .replace('{budgetItems}', JSON.stringify(payload.budgetItem ?? {}));

    const llmResponse = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: CEREMONIE_SYSTEM_PROMPT,
      userMessage: prompt,
    });

    return {
      event,
      budgetOverview: {
        totalBudgetCents: event?.budgetCents ?? 0,
        spentCents: event?.spentCents ?? 0,
        remainingCents: (event?.budgetCents ?? 0) - (event?.spentCents ?? 0),
      },
      llmAnalysis: llmResponse.content,
    };
  }

  // ── Event Handlers ──

  private async handleGuestRSVPEvent(event: SystemEvent): Promise<void> {
    this.logger.info('Guest RSVP updated', {
      eventId: event.payload['eventId'],
      guestName: event.payload['guestName'],
      rsvpStatus: event.payload['rsvpStatus'],
    });
  }
}
