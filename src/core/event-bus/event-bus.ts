import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../utils/logger';
import type { EventType, SystemEvent, EventHandler, EventSubscription } from './event.types';

export class EventBus {
  private subscriptions = new Map<EventType, EventSubscription[]>();
  private globalHandlers: Array<{ handler: EventHandler; subscriberId: string }> = [];
  private eventLog: SystemEvent[] = [];
  private readonly maxLogSize: number;

  constructor(maxLogSize = 10000) {
    this.maxLogSize = maxLogSize;
  }

  subscribeAll(handler: EventHandler, subscriberId: string): () => void {
    this.globalHandlers.push({ handler, subscriberId });
    logger.debug('Global event subscription added', { subscriberId });

    return () => {
      this.globalHandlers = this.globalHandlers.filter((h) => h.subscriberId !== subscriberId);
      logger.debug('Global event subscription removed', { subscriberId });
    };
  }

  subscribe(eventType: EventType, handler: EventHandler, subscriberId: string): () => void {
    const subscription: EventSubscription = { eventType, handler, subscriberId };

    const existing = this.subscriptions.get(eventType) ?? [];
    existing.push(subscription);
    this.subscriptions.set(eventType, existing);

    logger.debug(`Event subscription added`, { eventType, subscriberId });

    return () => {
      this.unsubscribe(eventType, subscriberId);
    };
  }

  unsubscribe(eventType: EventType, subscriberId: string): void {
    const subs = this.subscriptions.get(eventType);
    if (!subs) return;

    const filtered = subs.filter((s) => s.subscriberId !== subscriberId);
    if (filtered.length === 0) {
      this.subscriptions.delete(eventType);
    } else {
      this.subscriptions.set(eventType, filtered);
    }

    logger.debug(`Event subscription removed`, { eventType, subscriberId });
  }

  async publish(
    type: EventType,
    sourceAgent: string,
    payload: Record<string, unknown> = {},
    targetAgent?: string,
    correlationId?: string
  ): Promise<SystemEvent> {
    const event: SystemEvent = {
      id: uuidv4(),
      type,
      sourceAgent,
      targetAgent,
      payload,
      timestamp: new Date().toISOString(),
      correlationId: correlationId ?? uuidv4(),
    };

    this.logEvent(event);

    const subscribers = this.subscriptions.get(type) ?? [];
    logger.debug(`Publishing event`, { type, sourceAgent, subscriberCount: subscribers.length });

    const allHandlers = [
      ...subscribers.map((sub) => sub.handler),
      ...this.globalHandlers.map((gh) => gh.handler),
    ];

    const results = await Promise.allSettled(allHandlers.map((handler) => handler(event)));

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result && result.status === 'rejected') {
        const sub = i < subscribers.length ? subscribers[i] : this.globalHandlers[i - subscribers.length];
        logger.error(`Event handler failed`, {
          eventType: type,
          subscriberId: sub?.subscriberId,
          error: result.reason,
        });
      }
    }

    return event;
  }

  getSubscribers(eventType: EventType): string[] {
    const subs = this.subscriptions.get(eventType) ?? [];
    return subs.map((s) => s.subscriberId);
  }

  getRecentEvents(count = 50): SystemEvent[] {
    return this.eventLog.slice(-count);
  }

  getEventsByType(type: EventType, count = 50): SystemEvent[] {
    return this.eventLog.filter((e) => e.type === type).slice(-count);
  }

  private logEvent(event: SystemEvent): void {
    this.eventLog.push(event);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog = this.eventLog.slice(-Math.floor(this.maxLogSize * 0.8));
    }
  }
}

export const eventBus = new EventBus();
