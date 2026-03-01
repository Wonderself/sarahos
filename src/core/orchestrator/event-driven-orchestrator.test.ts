import { EventDrivenOrchestrator } from './event-driven-orchestrator';
import { eventBus } from '../event-bus/event-bus';
import { stateManager } from '../state/state-manager';
import { taskScheduler } from './task-scheduler';

jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

jest.mock('uuid', () => ({ v4: () => 'orch-uuid' }));

// Mock stateManager.update to execute the callback
jest.mock('../state/state-manager', () => {
  const state = {
    avatar_system: {
      asr_requests_today: 0,
      tts_api_usage_today: 0,
      did_api_usage_today: 0,
      active_calls: 0,
      pipeline_latency_avg_ms: 0,
    },
  };
  return {
    stateManager: {
      update: jest.fn().mockImplementation(async (cb: (s: typeof state) => void) => {
        cb(state);
      }),
      getState: () => state,
    },
    __state: state,
  };
});

jest.mock('./task-scheduler', () => ({
  taskScheduler: {
    enqueue: jest.fn(),
  },
}));

describe('EventDrivenOrchestrator', () => {
  let orchestrator: EventDrivenOrchestrator;
  const { __state: state } = jest.requireMock('../state/state-manager');

  beforeEach(() => {
    jest.clearAllMocks();
    state.avatar_system.asr_requests_today = 0;
    state.avatar_system.tts_api_usage_today = 0;
    state.avatar_system.did_api_usage_today = 0;
    state.avatar_system.active_calls = 0;
    state.avatar_system.pipeline_latency_avg_ms = 0;
    orchestrator = new EventDrivenOrchestrator();
    orchestrator.setupEventTriggers();
  });

  afterEach(() => {
    orchestrator.teardown();
  });

  it('should setup event triggers', () => {
    const stats = orchestrator.getEventTriggerStats();
    expect(stats).toEqual({});
  });

  it('should increment asr_requests on ASRTranscriptionCompleted', async () => {
    await eventBus.publish('ASRTranscriptionCompleted', 'test');
    expect(stateManager.update).toHaveBeenCalled();
    expect(state.avatar_system.asr_requests_today).toBe(1);
  });

  it('should increment tts_api_usage on TTSSynthesisCompleted', async () => {
    await eventBus.publish('TTSSynthesisCompleted', 'test');
    expect(state.avatar_system.tts_api_usage_today).toBe(1);
  });

  it('should increment did_api_usage on VideoSessionStarted', async () => {
    await eventBus.publish('VideoSessionStarted', 'test');
    expect(state.avatar_system.did_api_usage_today).toBe(1);
  });

  it('should track active calls', async () => {
    await eventBus.publish('TelephonyCallStarted', 'test');
    expect(state.avatar_system.active_calls).toBe(1);

    await eventBus.publish('TelephonyCallEnded', 'test');
    expect(state.avatar_system.active_calls).toBe(0);
  });

  it('should not go below 0 active calls', async () => {
    await eventBus.publish('TelephonyCallEnded', 'test');
    expect(state.avatar_system.active_calls).toBe(0);
  });

  it('should update pipeline latency on ConversationTurnCompleted', async () => {
    await eventBus.publish('ConversationTurnCompleted', 'test', { latencyMs: 500 });
    expect(state.avatar_system.pipeline_latency_avg_ms).toBe(500);

    await eventBus.publish('ConversationTurnCompleted', 'test', { latencyMs: 300 });
    // Exponential moving average: 500 * 0.8 + 300 * 0.2 = 460
    expect(state.avatar_system.pipeline_latency_avg_ms).toBe(460);
  });

  it('should enqueue optimization task on PerformanceAlert', async () => {
    await eventBus.publish('PerformanceAlert', 'test', { score: 30 });
    expect(taskScheduler.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ title: expect.stringContaining('PerformanceAlert'), priority: 'HIGH' }),
    );
  });

  it('should enqueue code review on high tech debt', async () => {
    await eventBus.publish('TechDebtReport', 'test', { totalDebtScore: 75 });
    expect(taskScheduler.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ title: expect.stringContaining('TechDebtReport'), priority: 'MEDIUM' }),
    );
  });

  it('should NOT enqueue code review on low tech debt', async () => {
    await eventBus.publish('TechDebtReport', 'test', { totalDebtScore: 30 });
    expect(taskScheduler.enqueue).not.toHaveBeenCalled();
  });

  it('should track trigger stats', async () => {
    await eventBus.publish('ASRTranscriptionCompleted', 'test');
    await eventBus.publish('ASRTranscriptionCompleted', 'test');
    await eventBus.publish('TTSSynthesisCompleted', 'test');

    const stats = orchestrator.getEventTriggerStats();
    expect(stats['ASRTranscriptionCompleted']).toBe(2);
    expect(stats['TTSSynthesisCompleted']).toBe(1);
  });

  it('should teardown cleanly', () => {
    orchestrator.teardown();
    const stats = orchestrator.getEventTriggerStats();
    expect(stats).toEqual({});
  });
});
