import { logger } from './logger';

export interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (opts.retryableErrors && !opts.retryableErrors.some((code) => lastError?.message.includes(code))) {
        throw lastError;
      }

      if (attempt === opts.maxRetries) {
        break;
      }

      const delay = Math.min(opts.baseDelayMs * Math.pow(opts.backoffMultiplier, attempt), opts.maxDelayMs);
      const jitter = delay * (0.5 + Math.random() * 0.5);

      logger.warn(`Retry ${attempt + 1}/${opts.maxRetries} for "${label}" after ${Math.round(jitter)}ms`, {
        error: lastError.message,
        attempt: attempt + 1,
      });

      await sleep(jitter);
    }
  }

  throw lastError;
}
