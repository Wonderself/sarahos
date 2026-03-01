import { TaskScheduler } from './task-scheduler';
import type { AgentTask } from '../../agents/base/agent.types';

jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

function makeTask(overrides: Partial<AgentTask> = {}): AgentTask {
  return {
    id: 'task-1',
    title: 'Test Task',
    description: 'A test task',
    priority: 'MEDIUM',
    payload: {},
    assignedBy: 'orchestrator',
    correlationId: 'corr-1',
    ...overrides,
  };
}

describe('TaskScheduler', () => {
  let scheduler: TaskScheduler;

  beforeEach(() => {
    scheduler = new TaskScheduler();
  });

  it('enqueues and dequeues tasks', () => {
    scheduler.enqueue(makeTask({ id: 't1' }));
    scheduler.enqueue(makeTask({ id: 't2' }));

    expect(scheduler.getQueueSize()).toBe(2);
    const task = scheduler.dequeue();
    expect(task).toBeDefined();
    expect(scheduler.getQueueSize()).toBe(1);
  });

  it('prioritizes CRITICAL over LOW', () => {
    scheduler.enqueue(makeTask({ id: 'low', priority: 'LOW' }));
    scheduler.enqueue(makeTask({ id: 'critical', priority: 'CRITICAL' }));

    const first = scheduler.dequeue();
    expect(first?.id).toBe('critical');
  });

  it('boosts autonomy tasks', () => {
    scheduler.enqueue(makeTask({ id: 'high', priority: 'HIGH' }));
    scheduler.enqueue(makeTask({ id: 'medium-auto', priority: 'MEDIUM' }), true);

    const first = scheduler.dequeue();
    // MEDIUM (50) + autonomy boost (30) = 80 > HIGH (75)
    expect(first?.id).toBe('medium-auto');
  });

  it('removes tasks by id', () => {
    scheduler.enqueue(makeTask({ id: 't1' }));
    scheduler.enqueue(makeTask({ id: 't2' }));

    expect(scheduler.remove('t1')).toBe(true);
    expect(scheduler.getQueueSize()).toBe(1);
    expect(scheduler.remove('nonexistent')).toBe(false);
  });

  it('peeks without removing', () => {
    scheduler.enqueue(makeTask({ id: 't1', priority: 'HIGH' }));
    const peeked = scheduler.peek();
    expect(peeked?.id).toBe('t1');
    expect(scheduler.getQueueSize()).toBe(1);
  });
});
