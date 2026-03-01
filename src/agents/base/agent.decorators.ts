import { logger } from '../../utils/logger';

type AsyncMethod = (...args: unknown[]) => Promise<unknown>;

export function LogExecution(_target: object, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const original = descriptor.value as AsyncMethod;

  descriptor.value = async function (this: { name?: string }, ...args: unknown[]) {
    const agentName = this.name ?? 'unknown';
    const start = Date.now();

    logger.debug(`[${agentName}] ${propertyKey} started`, { args: args.length });

    try {
      const result = await original.apply(this, args);
      const duration = Date.now() - start;
      logger.debug(`[${agentName}] ${propertyKey} completed`, { durationMs: duration });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error(`[${agentName}] ${propertyKey} failed`, {
        durationMs: duration,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };

  return descriptor;
}

export function ValidateInput(schema: { parse: (data: unknown) => unknown }) {
  return function (_target: object, _propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const original = descriptor.value as AsyncMethod;

    descriptor.value = async function (...args: unknown[]) {
      if (args[0] !== undefined) {
        schema.parse(args[0]);
      }
      return original.apply(this, args);
    };

    return descriptor;
  };
}

export function RateLimit(maxCalls: number, windowMs: number) {
  const calls = new Map<string, number[]>();

  return function (_target: object, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const original = descriptor.value as AsyncMethod;

    descriptor.value = async function (this: { id?: string }, ...args: unknown[]) {
      const key = `${this.id ?? 'global'}:${propertyKey}`;
      const now = Date.now();
      const timestamps = (calls.get(key) ?? []).filter((t) => t > now - windowMs);

      if (timestamps.length >= maxCalls) {
        throw new Error(`Rate limit exceeded for ${propertyKey}: ${maxCalls} calls per ${windowMs}ms`);
      }

      timestamps.push(now);
      calls.set(key, timestamps);

      return original.apply(this, args);
    };

    return descriptor;
  };
}
