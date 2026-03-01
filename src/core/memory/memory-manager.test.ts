import { MemoryManager } from './memory-manager';

jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock('./embedding.service', () => ({
  embeddingService: {
    generate: jest.fn().mockRejectedValue(new Error('No API key')),
    generateBatch: jest.fn().mockRejectedValue(new Error('No API key')),
  },
}));

describe('MemoryManager', () => {
  let mm: MemoryManager;

  beforeEach(() => {
    mm = new MemoryManager();
  });

  it('stores and retrieves memory entries', async () => {
    const entry = await mm.store({
      content: 'Test memory content',
      source: 'test',
      metadata: { key: 'value' },
    });

    expect(entry.id).toBeDefined();
    expect(entry.content).toBe('Test memory content');

    const retrieved = mm.get(entry.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.content).toBe('Test memory content');
  });

  it('deletes memory entries', async () => {
    const entry = await mm.store({ content: 'To delete', source: 'test' });
    expect(mm.delete(entry.id)).toBe(true);
    expect(mm.get(entry.id)).toBeUndefined();
  });

  it('filters by source', async () => {
    await mm.store({ content: 'A', source: 'agent-1' });
    await mm.store({ content: 'B', source: 'agent-2' });
    await mm.store({ content: 'C', source: 'agent-1' });

    const results = mm.getBySource('agent-1');
    expect(results).toHaveLength(2);
  });

  it('cleans up expired entries', async () => {
    await mm.store({
      content: 'Expired',
      source: 'test',
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    });
    await mm.store({ content: 'Valid', source: 'test' });

    const removed = mm.cleanup();
    expect(removed).toBe(1);
    expect(mm.getCount()).toBe(1);
  });

  it('returns count', async () => {
    await mm.store({ content: 'One', source: 'test' });
    await mm.store({ content: 'Two', source: 'test' });
    expect(mm.getCount()).toBe(2);
  });
});
