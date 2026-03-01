import { logger } from '../../../utils/logger';
import { memoryManager } from '../../../core/memory/memory-manager';

export interface VectorSearchResult {
  results: Array<{ content: string; score: number; source: string }>;
  totalFound: number;
}

export interface GetContextResult {
  context: string;
  sources: string[];
  relevanceScore: number;
}

export interface GetHistoryResult {
  entries: Array<{ content: string; timestamp: string; agent: string }>;
}

export interface IndexDocumentResult {
  success: boolean;
  documentId: string;
  chunksCreated: number;
}

export async function vectorSearch(
  query: string,
  options?: { topK?: number; source?: string; minScore?: number }
): Promise<VectorSearchResult> {
  const searchResults = await memoryManager.search({
    query,
    topK: options?.topK ?? 5,
    source: options?.source,
    minScore: options?.minScore ?? 0.5,
  });

  return {
    results: searchResults.map((r) => ({
      content: r.entry.content,
      score: r.score,
      source: r.entry.source,
    })),
    totalFound: searchResults.length,
  };
}

export async function getContext(
  topic: string,
  agentId?: string
): Promise<GetContextResult> {
  const results = await memoryManager.search({
    query: topic,
    topK: 10,
    agentId,
    minScore: 0.5,
  });

  const context = results.map((r) => r.entry.content).join('\n\n');
  const sources = [...new Set(results.map((r) => r.entry.source))];
  const avgScore = results.length > 0
    ? results.reduce((sum, r) => sum + r.score, 0) / results.length
    : 0;

  return { context, sources, relevanceScore: avgScore };
}

export async function getHistory(
  entityId: string,
  type?: string
): Promise<GetHistoryResult> {
  const source = type ? `${type}:${entityId}` : entityId;
  const entries = memoryManager.getBySource(source);

  return {
    entries: entries.map((e) => ({
      content: e.content,
      timestamp: e.createdAt,
      agent: e.agentId ?? 'unknown',
    })),
  };
}

export async function indexDocument(
  content: string,
  metadata: Record<string, unknown>,
  source: string
): Promise<IndexDocumentResult> {
  const entry = await memoryManager.store({
    content,
    metadata,
    source,
  });

  logger.info('Document indexed', { documentId: entry.id, source });

  return {
    success: true,
    documentId: entry.id,
    chunksCreated: 1,
  };
}
