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

jest.mock('../../core/memory/embedding.service', () => ({
  embeddingService: {
    generate: jest.fn().mockResolvedValue({ values: [0.1, 0.2, 0.3] }),
  },
}));

import { MemoryManager } from '../../core/memory/memory-manager';

describe('Memory Routes (unit)', () => {
  let manager: MemoryManager;

  beforeEach(() => {
    manager = new MemoryManager();
  });

  it('should store a memory entry', async () => {
    const entry = await manager.store({
      content: 'Test observation',
      source: 'knowledge-agent',
    });
    expect(entry.id).toBeDefined();
    expect(entry.content).toBe('Test observation');
    expect(entry.source).toBe('knowledge-agent');
  });

  it('should get a memory entry by ID', async () => {
    const entry = await manager.store({
      content: 'Stored data',
      source: 'test',
    });
    const found = manager.get(entry.id);
    expect(found).toBeDefined();
    expect(found!.content).toBe('Stored data');
  });

  it('should return undefined for nonexistent entry', () => {
    expect(manager.get('nonexistent')).toBeUndefined();
  });

  it('should delete a memory entry', async () => {
    const entry = await manager.store({
      content: 'Delete me',
      source: 'test',
    });
    expect(manager.delete(entry.id)).toBe(true);
    expect(manager.get(entry.id)).toBeUndefined();
  });

  it('should return false when deleting nonexistent', () => {
    expect(manager.delete('nope')).toBe(false);
  });

  it('should search memories by text', async () => {
    await manager.store({ content: 'Important finding about performance', source: 'test' });
    await manager.store({ content: 'Revenue data analysis', source: 'test' });

    const results = await manager.search({ query: 'performance', topK: 5 });
    expect(results.length).toBeGreaterThan(0);
  });

  it('should store with metadata', async () => {
    const entry = await manager.store({
      content: 'With meta',
      source: 'test',
      metadata: { category: 'debug', severity: 'low' },
    });
    expect(entry.metadata).toEqual({ category: 'debug', severity: 'low' });
  });

  it('should store with agentId', async () => {
    const entry = await manager.store({
      content: 'Agent specific',
      source: 'test',
      agentId: 'monitoring-agent',
    });
    expect(entry.agentId).toBe('monitoring-agent');
  });

  it('should get count', async () => {
    await manager.store({ content: 'A', source: 'test' });
    await manager.store({ content: 'B', source: 'test' });
    expect(manager.getCount()).toBe(2);
  });

  it('should get by source', async () => {
    await manager.store({ content: 'From alpha', source: 'alpha' });
    await manager.store({ content: 'From beta', source: 'beta' });
    const alphaEntries = manager.getBySource('alpha');
    expect(alphaEntries).toHaveLength(1);
    expect(alphaEntries[0]!.source).toBe('alpha');
  });
});

describe('createMemoryRouter', () => {
  it('should create the router', () => {
    jest.mock('../../core/memory/memory-manager', () => ({
      memoryManager: new MemoryManager(),
    }));
    const { createMemoryRouter } = require('./memory.routes');
    const router = createMemoryRouter();
    expect(router).toBeDefined();
  });
});
