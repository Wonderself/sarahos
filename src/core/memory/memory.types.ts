export interface MemoryEntry {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  source: string;
  agentId?: string;
  embedding?: number[];
  expiresAt?: string;
  createdAt: string;
}

export interface SearchResult {
  entry: MemoryEntry;
  score: number;
  distance: number;
}

export interface EmbeddingVector {
  values: number[];
  model: string;
  dimensions: number;
}

export interface MemorySearchOptions {
  query: string;
  topK?: number;
  source?: string;
  agentId?: string;
  minScore?: number;
}

export interface MemoryStoreOptions {
  content: string;
  metadata?: Record<string, unknown>;
  source: string;
  agentId?: string;
  expiresAt?: string;
}
