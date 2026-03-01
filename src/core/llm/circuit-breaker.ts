import { logger } from '../../utils/logger';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

/**
 * Circuit breaker for Anthropic API calls.
 * Prevents cascading failures when the API is down.
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: After threshold failures, all requests rejected for resetTimeMs
 * - HALF_OPEN: After cooldown, allow one probe request to test recovery
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: CircuitState = 'CLOSED';

  constructor(
    private readonly threshold: number = 5,
    private readonly resetTimeMs: number = 60_000,
  ) {}

  canExecute(): boolean {
    if (this.state === 'CLOSED') return true;

    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.resetTimeMs) {
        this.state = 'HALF_OPEN';
        logger.info('Circuit breaker transitioning to HALF_OPEN (probe allowed)');
        return true;
      }
      return false;
    }

    // HALF_OPEN: allow one probe request
    return true;
  }

  recordSuccess(): void {
    if (this.state !== 'CLOSED') {
      logger.info('Circuit breaker recovered, transitioning to CLOSED');
    }
    this.failures = 0;
    this.state = 'CLOSED';
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      logger.warn('Circuit breaker OPEN — Anthropic API calls blocked', {
        failures: this.failures,
        resetTimeMs: this.resetTimeMs,
      });
    }
  }

  getState(): { state: CircuitState; failures: number; threshold: number } {
    return { state: this.state, failures: this.failures, threshold: this.threshold };
  }

  /** Reset for testing purposes. */
  reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'CLOSED';
  }
}

/** Singleton circuit breaker for all Anthropic API calls. */
export const llmCircuitBreaker = new CircuitBreaker();
