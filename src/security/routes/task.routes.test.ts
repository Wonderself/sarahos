jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

jest.mock('../../utils/config', () => ({
  config: {
    JWT_SECRET: 'test-secret-at-least-16-chars',
    JWT_EXPIRES_IN: '1h',
    API_KEYS_ADMIN: 'admin-key',
    API_KEYS_OPERATOR: '',
    API_KEYS_VIEWER: '',
    API_KEYS_SYSTEM: '',
  },
}));

jest.mock('../../core/event-bus/event-bus', () => ({
  eventBus: { publish: jest.fn().mockResolvedValue({}) },
}));

import { TaskScheduler } from '../../core/orchestrator/task-scheduler';

describe('Task API (unit)', () => {
  let scheduler: TaskScheduler;

  beforeEach(() => {
    scheduler = new TaskScheduler();
  });

  it('should enqueue a task', () => {
    const task = {
      id: 'task-1',
      title: 'Test task',
      description: 'A test',
      priority: 'MEDIUM' as const,
      payload: {},
      assignedBy: 'admin',
      correlationId: 'corr-1',
    };

    scheduler.enqueue(task);
    expect(scheduler.getQueueSize()).toBe(1);
  });

  it('should get task by ID', () => {
    const task = {
      id: 'task-2',
      title: 'Another task',
      description: 'Another test',
      priority: 'HIGH' as const,
      payload: {},
      assignedBy: 'api',
      correlationId: 'corr-2',
    };

    scheduler.enqueue(task);
    const found = scheduler.getById('task-2');
    expect(found).toBeDefined();
    expect(found!.title).toBe('Another task');
  });

  it('should return undefined for nonexistent task', () => {
    expect(scheduler.getById('nonexistent')).toBeUndefined();
  });

  it('should list all tasks', () => {
    scheduler.enqueue({
      id: 't1', title: 'T1', description: 'D1', priority: 'LOW', payload: {}, assignedBy: 'a', correlationId: 'c1',
    });
    scheduler.enqueue({
      id: 't2', title: 'T2', description: 'D2', priority: 'HIGH', payload: {}, assignedBy: 'b', correlationId: 'c2',
    });

    const queue = scheduler.getQueue();
    expect(queue).toHaveLength(2);
  });

  it('should filter tasks by priority', () => {
    scheduler.enqueue({
      id: 't1', title: 'T1', description: 'D1', priority: 'LOW', payload: {}, assignedBy: 'a', correlationId: 'c1',
    });
    scheduler.enqueue({
      id: 't2', title: 'T2', description: 'D2', priority: 'HIGH', payload: {}, assignedBy: 'a', correlationId: 'c2',
    });

    const high = scheduler.getQueue().filter((t) => t.priority === 'HIGH');
    expect(high).toHaveLength(1);
  });

  it('should remove a task', () => {
    scheduler.enqueue({
      id: 'rm-1', title: 'Remove me', description: 'D', priority: 'LOW', payload: {}, assignedBy: 'a', correlationId: 'c',
    });

    expect(scheduler.remove('rm-1')).toBe(true);
    expect(scheduler.getQueueSize()).toBe(0);
  });

  it('should return false when removing nonexistent task', () => {
    expect(scheduler.remove('nope')).toBe(false);
  });

  it('should sort by priority', () => {
    scheduler.enqueue({
      id: 'low', title: 'Low', description: 'D', priority: 'LOW', payload: {}, assignedBy: 'a', correlationId: 'c',
    });
    scheduler.enqueue({
      id: 'crit', title: 'Critical', description: 'D', priority: 'CRITICAL', payload: {}, assignedBy: 'a', correlationId: 'c',
    });

    const queue = scheduler.getQueue();
    expect(queue[0]!.id).toBe('crit');
  });
});
