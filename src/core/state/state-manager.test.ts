import fs from 'fs/promises';
import { StateManager } from './state-manager';

jest.mock('fs/promises');
jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

const mockState = {
  timestamp: '2026-02-27T10:00:00.000Z',
  current_phase: 1,
  active_agents: [],
  disabled_agents: [],
  unfinished_systems: [],
  known_bugs: [],
  security_risk_vectors: [],
  api_token_burn_rate: { daily_average: 0, by_agent: {}, budget_remaining: 0 },
  avatar_system: {
    founder_avatars: {
      sarah: { status: 'not_deployed' as const, sessions_today: 0 },
      emmanuel: { status: 'not_deployed' as const, sessions_today: 0 },
    },
    client_avatars_deployed: 0,
    cache_hit_rate_by_preset: {},
    did_api_usage_today: 0,
    tts_api_usage_today: 0,
  },
  infrastructure: { docker_containers: {}, database_size_mb: 0, redis_memory_mb: 0, uptime_hours: 0 },
  tasks_in_progress: [],
  blocked_tasks: [],
  last_self_improvement_cycle: null,
  autonomy_score: 0,
};

describe('StateManager', () => {
  let sm: StateManager;

  beforeEach(() => {
    sm = new StateManager();
    jest.clearAllMocks();
    (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockState));
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    (fs.rename as jest.Mock).mockResolvedValue(undefined);
  });

  it('loads state from file', async () => {
    const state = await sm.load();
    expect(state.current_phase).toBe(1);
    expect(state.autonomy_score).toBe(0);
  });

  it('throws when accessing state before load', () => {
    expect(() => sm.getState()).toThrow('State not loaded');
  });

  it('adds task in progress', async () => {
    await sm.load();
    await sm.addTaskInProgress('TASK-001');
    const state = sm.getState();
    expect(state.tasks_in_progress).toContain('TASK-001');
  });

  it('completes a task', async () => {
    await sm.load();
    await sm.addTaskInProgress('TASK-001');
    await sm.completeTask('TASK-001');
    const state = sm.getState();
    expect(state.tasks_in_progress).not.toContain('TASK-001');
  });

  it('blocks a task', async () => {
    await sm.load();
    await sm.addTaskInProgress('TASK-002');
    await sm.blockTask('TASK-002');
    const state = sm.getState();
    expect(state.tasks_in_progress).not.toContain('TASK-002');
    expect(state.blocked_tasks).toContain('TASK-002');
  });

  it('tracks token burn', async () => {
    await sm.load();
    await sm.updateTokenBurn('communication-agent', 150);
    await sm.updateTokenBurn('communication-agent', 50);
    const state = sm.getState();
    expect(state.api_token_burn_rate.by_agent['communication-agent']).toBe(200);
  });
});
