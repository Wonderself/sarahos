import { RecurringScheduler } from './recurring-scheduler';

jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

describe('RecurringScheduler', () => {
  let scheduler: RecurringScheduler;

  beforeEach(() => {
    jest.useFakeTimers();
    scheduler = new RecurringScheduler();
  });

  afterEach(() => {
    scheduler.stop();
    jest.useRealTimers();
  });

  it('should construct in stopped state', () => {
    expect(scheduler.isRunning()).toBe(false);
    expect(scheduler.getTaskCount()).toBe(0);
  });

  it('should add recurring tasks', () => {
    scheduler.addRecurringTask('test', 1000, async () => {});
    expect(scheduler.getTaskCount()).toBe(1);
  });

  it('should start and run tasks', () => {
    const taskFn = jest.fn().mockResolvedValue(undefined);
    scheduler.addRecurringTask('counter', 1000, taskFn);
    scheduler.start();

    expect(scheduler.isRunning()).toBe(true);

    jest.advanceTimersByTime(1000);
    expect(taskFn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1000);
    expect(taskFn).toHaveBeenCalledTimes(2);
  });

  it('should stop all tasks', () => {
    const taskFn = jest.fn().mockResolvedValue(undefined);
    scheduler.addRecurringTask('stopper', 500, taskFn);
    scheduler.start();

    jest.advanceTimersByTime(500);
    expect(taskFn).toHaveBeenCalledTimes(1);

    scheduler.stop();
    expect(scheduler.isRunning()).toBe(false);

    jest.advanceTimersByTime(1000);
    expect(taskFn).toHaveBeenCalledTimes(1); // No more calls
  });

  it('should list scheduled tasks', () => {
    scheduler.addRecurringTask('task-a', 5000, async () => {});
    scheduler.addRecurringTask('task-b', 10000, async () => {});

    const tasks = scheduler.getScheduledTasks();
    expect(tasks).toHaveLength(2);
    expect(tasks[0]!.name).toBe('task-a');
    expect(tasks[0]!.intervalMs).toBe(5000);
    expect(tasks[1]!.name).toBe('task-b');
  });

  it('should remove a task', () => {
    scheduler.addRecurringTask('removable', 1000, async () => {});
    expect(scheduler.getTaskCount()).toBe(1);

    const removed = scheduler.removeTask('removable');
    expect(removed).toBe(true);
    expect(scheduler.getTaskCount()).toBe(0);
  });

  it('should handle multiple concurrent tasks', () => {
    const taskA = jest.fn().mockResolvedValue(undefined);
    const taskB = jest.fn().mockResolvedValue(undefined);

    scheduler.addRecurringTask('fast', 500, taskA);
    scheduler.addRecurringTask('slow', 1000, taskB);
    scheduler.start();

    jest.advanceTimersByTime(1000);
    expect(taskA).toHaveBeenCalledTimes(2);
    expect(taskB).toHaveBeenCalledTimes(1);
  });

  it('should warn on duplicate start', () => {
    scheduler.addRecurringTask('test', 1000, async () => {});
    scheduler.start();
    scheduler.start(); // Should warn
    expect(scheduler.isRunning()).toBe(true);
  });

  it('should track lastRun and nextRun', () => {
    scheduler.addRecurringTask('tracked', 1000, async () => {});
    scheduler.start();

    const tasksBefore = scheduler.getScheduledTasks();
    expect(tasksBefore[0]!.lastRun).toBeNull();
    expect(tasksBefore[0]!.nextRun).not.toBeNull();

    jest.advanceTimersByTime(1000);

    const tasksAfter = scheduler.getScheduledTasks();
    expect(tasksAfter[0]!.lastRun).not.toBeNull();
  });
});
