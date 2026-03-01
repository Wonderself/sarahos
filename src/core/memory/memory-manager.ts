import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../utils/logger';
import { embeddingService } from './embedding.service';
import type { MemoryEntry, SearchResult, MemorySearchOptions, MemoryStoreOptions } from './memory.types';

export class MemoryManager {
  private memories = new Map<string, MemoryEntry>();

  async store(options: MemoryStoreOptions): Promise<MemoryEntry> {
    let embedding: number[] | undefined;

    try {
      const result = await embeddingService.generate(options.content);
      embedding = result.values;
    } catch (error) {
      logger.warn('Failed to generate embedding, storing without vector', {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    const entry: MemoryEntry = {
      id: uuidv4(),
      content: options.content,
      metadata: options.metadata ?? {},
      source: options.source,
      agentId: options.agentId,
      embedding,
      expiresAt: options.expiresAt,
      createdAt: new Date().toISOString(),
    };

    this.memories.set(entry.id, entry);

    logger.debug('Memory stored', {
      id: entry.id,
      source: entry.source,
      hasEmbedding: !!embedding,
    });

    return entry;
  }

  async search(options: MemorySearchOptions): Promise<SearchResult[]> {
    let queryEmbedding: number[] | undefined;

    try {
      const result = await embeddingService.generate(options.query);
      queryEmbedding = result.values;
    } catch {
      logger.warn('Failed to generate query embedding, falling back to text search');
      return this.textSearch(options.query, options.topK ?? 5);
    }

    const results: SearchResult[] = [];
    const minScore = options.minScore ?? 0.7;

    for (const entry of this.memories.values()) {
      if (this.isExpired(entry)) continue;
      if (options.source && entry.source !== options.source) continue;
      if (options.agentId && entry.agentId !== options.agentId) continue;

      if (entry.embedding && queryEmbedding) {
        const score = this.cosineSimilarity(queryEmbedding, entry.embedding);
        if (score >= minScore) {
          results.push({ entry, score, distance: 1 - score });
        }
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, options.topK ?? 5);
  }

  get(id: string): MemoryEntry | undefined {
    const entry = this.memories.get(id);
    if (entry && this.isExpired(entry)) {
      this.memories.delete(id);
      return undefined;
    }
    return entry;
  }

  delete(id: string): boolean {
    return this.memories.delete(id);
  }

  getBySource(source: string): MemoryEntry[] {
    return Array.from(this.memories.values()).filter(
      (e) => e.source === source && !this.isExpired(e)
    );
  }

  cleanup(): number {
    let removed = 0;
    for (const [id, entry] of this.memories) {
      if (this.isExpired(entry)) {
        this.memories.delete(id);
        removed++;
      }
    }
    if (removed > 0) {
      logger.info(`Cleaned up ${removed} expired memory entries`);
    }
    return removed;
  }

  getCount(): number {
    return this.memories.size;
  }

  private textSearch(query: string, topK: number): SearchResult[] {
    const queryLower = query.toLowerCase();
    const results: SearchResult[] = [];

    for (const entry of this.memories.values()) {
      if (this.isExpired(entry)) continue;

      const contentLower = entry.content.toLowerCase();
      if (contentLower.includes(queryLower)) {
        results.push({ entry, score: 0.5, distance: 0.5 });
      }
    }

    return results.slice(0, topK);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      const valA = a[i]!;
      const valB = b[i]!;
      dotProduct += valA * valB;
      normA += valA * valA;
      normB += valB * valB;
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) return 0;

    return dotProduct / denominator;
  }

  private isExpired(entry: MemoryEntry): boolean {
    if (!entry.expiresAt) return false;
    return new Date(entry.expiresAt).getTime() < Date.now();
  }
}

export const memoryManager = new MemoryManager();
