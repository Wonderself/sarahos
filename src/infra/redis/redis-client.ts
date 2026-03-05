import Redis from 'ioredis';
import { logger } from '../../utils/logger';
import { getRedisUrl } from '../../utils/config';

type RedisMessageHandler = (message: string, channel: string) => void;

export class RedisClient {
  private client: Redis | null = null;
  private subscriber: Redis | null = null;
  private connected = false;
  private handlers = new Map<string, RedisMessageHandler[]>();

  async connect(urlOverride?: string): Promise<void> {
    if (this.connected) {
      logger.warn('RedisClient already connected');
      return;
    }

    try {
      const url = urlOverride ?? getRedisUrl();
      const retryStrategy = (times: number) => Math.min(times * 200, 5000);
      this.client = new Redis(url, { maxRetriesPerRequest: 3, lazyConnect: true, retryStrategy });
      await this.client.connect();

      this.subscriber = new Redis(url, { maxRetriesPerRequest: 3, lazyConnect: true, retryStrategy });
      await this.subscriber.connect();

      this.subscriber.on('message', (channel: string, message: string) => {
        const channelHandlers = this.handlers.get(channel) ?? [];
        for (const handler of channelHandlers) {
          try {
            handler(message, channel);
          } catch (error) {
            logger.error('Redis message handler error', { channel, error });
          }
        }
      });

      this.connected = true;
      logger.info('RedisClient connected', { url: url.replace(/\/\/[^@]+@/, '//***@') });
    } catch (error) {
      logger.warn('RedisClient connection failed — running without Redis', {
        error: error instanceof Error ? error.message : String(error),
      });
      this.client = null;
      this.subscriber = null;
      this.connected = false;
    }
  }

  async publish(channel: string, message: string): Promise<number> {
    if (!this.client || !this.connected) {
      throw new Error('RedisClient not connected. Call connect() first.');
    }
    return this.client.publish(channel, message);
  }

  async subscribe(channel: string, handler: RedisMessageHandler): Promise<void> {
    if (!this.subscriber || !this.connected) {
      throw new Error('RedisClient not connected. Call connect() first.');
    }

    const existing = this.handlers.get(channel);
    if (!existing) {
      await this.subscriber.subscribe(channel);
      this.handlers.set(channel, [handler]);
    } else {
      existing.push(handler);
    }

    logger.debug('Redis subscription added', { channel });
  }

  async unsubscribe(channel: string): Promise<void> {
    if (!this.subscriber) return;

    await this.subscriber.unsubscribe(channel);
    this.handlers.delete(channel);
    logger.debug('Redis subscription removed', { channel });
  }

  async get(key: string): Promise<string | null> {
    if (!this.client || !this.connected) {
      throw new Error('RedisClient not connected.');
    }
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.client || !this.connected) {
      throw new Error('RedisClient not connected.');
    }
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<number> {
    if (!this.client || !this.connected) {
      throw new Error('RedisClient not connected.');
    }
    return this.client.del(key);
  }

  /** Atomic increment by value. Returns new value after increment. */
  async incrBy(key: string, value: number): Promise<number> {
    if (!this.client || !this.connected) return 0;
    return this.client.incrby(key, value);
  }

  /** Set TTL on an existing key (seconds). */
  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    if (!this.client || !this.connected) return false;
    const result = await this.client.expire(key, ttlSeconds);
    return result === 1;
  }

  /** Get multiple keys at once. */
  async mget(...keys: string[]): Promise<(string | null)[]> {
    if (!this.client || !this.connected) return keys.map(() => null);
    return this.client.mget(...keys);
  }

  /**
   * Atomic SET if Not eXists with TTL. Used for distributed locking.
   * Returns true if the key was set (lock acquired), false if it already existed.
   */
  async setNx(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    if (!this.client || !this.connected) {
      return false; // No Redis = single process, no lock needed
    }
    const result = await this.client.set(key, value, 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  isConnected(): boolean {
    return this.connected;
  }

  async disconnect(): Promise<void> {
    if (this.subscriber) {
      this.subscriber.disconnect();
      this.subscriber = null;
    }
    if (this.client) {
      this.client.disconnect();
      this.client = null;
    }
    this.connected = false;
    this.handlers.clear();
    logger.info('RedisClient disconnected');
  }

  async healthCheck(): Promise<{ connected: boolean; latencyMs: number }> {
    if (!this.client || !this.connected) {
      return { connected: false, latencyMs: -1 };
    }

    const start = Date.now();
    try {
      await this.client.ping();
      return { connected: true, latencyMs: Date.now() - start };
    } catch {
      return { connected: false, latencyMs: Date.now() - start };
    }
  }
}

export const redisClient = new RedisClient();
