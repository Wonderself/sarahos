jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

import { CircuitBreaker } from './circuit-breaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker(3, 1000); // 3 failures, 1s reset
  });

  describe('initial state', () => {
    it('should start in CLOSED state', () => {
      expect(breaker.getState().state).toBe('CLOSED');
      expect(breaker.getState().failures).toBe(0);
    });

    it('should allow execution when CLOSED', () => {
      expect(breaker.canExecute()).toBe(true);
    });
  });

  describe('failure counting', () => {
    it('should stay CLOSED with failures below threshold', () => {
      breaker.recordFailure();
      breaker.recordFailure();
      expect(breaker.getState().state).toBe('CLOSED');
      expect(breaker.getState().failures).toBe(2);
      expect(breaker.canExecute()).toBe(true);
    });

    it('should transition to OPEN when threshold reached', () => {
      breaker.recordFailure();
      breaker.recordFailure();
      breaker.recordFailure();
      expect(breaker.getState().state).toBe('OPEN');
      expect(breaker.canExecute()).toBe(false);
    });
  });

  describe('OPEN state', () => {
    beforeEach(() => {
      breaker.recordFailure();
      breaker.recordFailure();
      breaker.recordFailure();
    });

    it('should block execution when OPEN', () => {
      expect(breaker.canExecute()).toBe(false);
    });

    it('should transition to HALF_OPEN after reset time', () => {
      // Simulate time passing by using a breaker with 0ms reset
      const fastBreaker = new CircuitBreaker(1, 0);
      fastBreaker.recordFailure();
      expect(fastBreaker.getState().state).toBe('OPEN');

      // After 0ms, should allow probe
      expect(fastBreaker.canExecute()).toBe(true);
      expect(fastBreaker.getState().state).toBe('HALF_OPEN');
    });
  });

  describe('HALF_OPEN state', () => {
    it('should transition to CLOSED on success', () => {
      const fastBreaker = new CircuitBreaker(1, 0);
      fastBreaker.recordFailure();
      fastBreaker.canExecute(); // transitions to HALF_OPEN

      fastBreaker.recordSuccess();
      expect(fastBreaker.getState().state).toBe('CLOSED');
      expect(fastBreaker.getState().failures).toBe(0);
    });

    it('should transition back to OPEN on failure', () => {
      const fastBreaker = new CircuitBreaker(1, 0);
      fastBreaker.recordFailure();
      fastBreaker.canExecute(); // transitions to HALF_OPEN

      fastBreaker.recordFailure();
      expect(fastBreaker.getState().state).toBe('OPEN');
    });
  });

  describe('recovery', () => {
    it('should reset failure count on success', () => {
      breaker.recordFailure();
      breaker.recordFailure();
      breaker.recordSuccess();
      expect(breaker.getState().failures).toBe(0);
      expect(breaker.getState().state).toBe('CLOSED');
    });
  });

  describe('reset', () => {
    it('should reset all state', () => {
      breaker.recordFailure();
      breaker.recordFailure();
      breaker.recordFailure();
      expect(breaker.getState().state).toBe('OPEN');

      breaker.reset();
      expect(breaker.getState().state).toBe('CLOSED');
      expect(breaker.getState().failures).toBe(0);
      expect(breaker.canExecute()).toBe(true);
    });
  });

  describe('getState', () => {
    it('should expose threshold', () => {
      expect(breaker.getState().threshold).toBe(3);
    });
  });
});
