jest.mock('../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

jest.mock('../core/event-bus/event-bus', () => ({
  eventBus: {
    subscribeAll: jest.fn().mockReturnValue(jest.fn()),
  },
}));

import { SSEManager } from './sse-manager';
import type { Response } from 'express';
import type { SystemEvent } from '../core/event-bus/event.types';

const mockResponse = () => {
  const res: Partial<Response> = {
    write: jest.fn().mockReturnValue(true),
  };
  return res as Response;
};

const mockEvent: SystemEvent = {
  id: 'evt-1',
  type: 'TaskCreated',
  sourceAgent: 'test',
  payload: { taskId: 't1' },
  timestamp: new Date().toISOString(),
  correlationId: 'corr-1',
};

describe('SSEManager', () => {
  let manager: SSEManager;

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new SSEManager();
  });

  afterEach(() => {
    manager.teardown();
  });

  it('should initialize and subscribe to event bus', () => {
    const { eventBus } = jest.requireMock('../core/event-bus/event-bus');
    manager.initialize();
    expect(eventBus.subscribeAll).toHaveBeenCalledWith(expect.any(Function), 'sse-manager');
  });

  it('should add and remove clients', () => {
    const res = mockResponse();
    manager.addClient('c1', res);
    expect(manager.getClientCount()).toBe(1);

    manager.removeClient('c1');
    expect(manager.getClientCount()).toBe(0);
  });

  it('should broadcast events to all clients', () => {
    const res1 = mockResponse();
    const res2 = mockResponse();

    manager.addClient('c1', res1);
    manager.addClient('c2', res2);

    manager.broadcast(mockEvent);

    expect(res1.write).toHaveBeenCalledWith(expect.stringContaining('"type":"TaskCreated"'));
    expect(res2.write).toHaveBeenCalledWith(expect.stringContaining('"type":"TaskCreated"'));
  });

  it('should filter events by type when client specifies types', () => {
    const res1 = mockResponse();
    const res2 = mockResponse();

    manager.addClient('c1', res1, ['TaskCreated']);
    manager.addClient('c2', res2, ['AgentResponse']);

    manager.broadcast(mockEvent);

    expect(res1.write).toHaveBeenCalled();
    expect(res2.write).not.toHaveBeenCalled();
  });

  it('should remove client on write error', () => {
    const res = { write: jest.fn().mockImplementation(() => { throw new Error('broken'); }) } as unknown as Response;
    manager.addClient('c1', res);

    manager.broadcast(mockEvent);
    expect(manager.getClientCount()).toBe(0);
  });

  it('should start and stop heartbeat', () => {
    jest.useFakeTimers();
    const res = mockResponse();
    manager.addClient('c1', res);

    manager.startHeartbeat(1000);
    jest.advanceTimersByTime(1000);

    expect(res.write).toHaveBeenCalledWith(':heartbeat\n\n');

    manager.stopHeartbeat();
    jest.useRealTimers();
  });

  it('should teardown cleanly', () => {
    const res = mockResponse();
    manager.addClient('c1', res);
    manager.initialize();
    manager.startHeartbeat();

    manager.teardown();
    expect(manager.getClientCount()).toBe(0);
  });

  it('should return client count', () => {
    expect(manager.getClientCount()).toBe(0);
    manager.addClient('c1', mockResponse());
    manager.addClient('c2', mockResponse());
    expect(manager.getClientCount()).toBe(2);
  });
});
