import type { Response } from 'express';
import { logger } from '../utils/logger';
import { eventBus } from '../core/event-bus/event-bus';
import type { SystemEvent } from '../core/event-bus/event.types';

export class SSEManager {
  private clients = new Map<string, { res: Response; types?: string[]; lastActivity: number }>();
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private unsubscribe: (() => void) | null = null;
  private static readonly DEAD_CLIENT_TIMEOUT_MS = 90000;

  initialize(): void {
    this.unsubscribe = eventBus.subscribeAll(async (event: SystemEvent) => {
      this.broadcast(event);
    }, 'sse-manager');

    logger.info('SSE Manager initialized');
  }

  addClient(clientId: string, res: Response, types?: string[]): void {
    this.clients.set(clientId, { res, types, lastActivity: Date.now() });
    logger.debug('SSE client connected', { clientId, clientCount: this.clients.size });
  }

  removeClient(clientId: string): void {
    this.clients.delete(clientId);
    logger.debug('SSE client disconnected', { clientId, clientCount: this.clients.size });
  }

  broadcast(event: SystemEvent): void {
    const data = `data: ${JSON.stringify(event)}\n\n`;

    for (const [clientId, client] of this.clients) {
      // Filter by event types if client specified them
      if (client.types && client.types.length > 0 && !client.types.includes(event.type)) {
        continue;
      }

      try {
        client.res.write(data);
        client.lastActivity = Date.now();
      } catch {
        this.removeClient(clientId);
      }
    }
  }

  getClientCount(): number {
    return this.clients.size;
  }

  startHeartbeat(intervalMs = 30000): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      const heartbeat = ':heartbeat\n\n';

      for (const [clientId, client] of this.clients) {
        // Remove dead clients that haven't had activity
        if (now - client.lastActivity > SSEManager.DEAD_CLIENT_TIMEOUT_MS) {
          logger.debug('Removing dead SSE client', { clientId, inactiveMs: now - client.lastActivity });
          this.removeClient(clientId);
          continue;
        }

        try {
          client.res.write(heartbeat);
          client.lastActivity = now;
        } catch {
          this.removeClient(clientId);
        }
      }
    }, intervalMs);
  }

  stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  teardown(): void {
    this.stopHeartbeat();
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.clients.clear();
    logger.info('SSE Manager torn down');
  }
}

export const sseManager = new SSEManager();
