import { logger } from '../../utils/logger';
import type { SystemEvent, EventHandler, EventType } from './event.types';

type HandlerRegistry = Map<EventType, EventHandler[]>;

export class EventHandlerRegistry {
  private handlers: HandlerRegistry = new Map();

  register(eventType: EventType, handler: EventHandler): void {
    const existing = this.handlers.get(eventType) ?? [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
    logger.debug(`Handler registered for event type: ${eventType}`);
  }

  async dispatch(event: SystemEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) ?? [];

    if (handlers.length === 0) {
      logger.debug(`No handlers for event type: ${event.type}`);
      return;
    }

    const results = await Promise.allSettled(handlers.map((h) => h(event)));

    for (const result of results) {
      if (result.status === 'rejected') {
        logger.error(`Event handler failed for ${event.type}`, { error: result.reason });
      }
    }
  }

  getRegisteredTypes(): EventType[] {
    return Array.from(this.handlers.keys());
  }
}

export const handlerRegistry = new EventHandlerRegistry();
