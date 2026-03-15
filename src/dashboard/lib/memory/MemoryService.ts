/**
 * MemoryService — Persistent user memory system
 *
 * localStorage-first implementation (key: fz_user_memories).
 * Designed to switch to pgvector-backed server storage later
 * without changing the public API.
 */

const STORAGE_KEY = 'fz_user_memories';
const DEFAULT_MAX_TOKENS = 2000;
const APPROX_CHARS_PER_TOKEN = 4;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MemoryCategory = 'client' | 'project' | 'preference' | 'fact' | 'instruction' | 'other';
export type MemorySource = 'manual' | 'auto' | 'conversation';

export interface UserMemory {
  id: string;
  category: MemoryCategory;
  title: string;
  content: string;
  tags: string[];
  shared: boolean;
  active: boolean;
  source: MemorySource;
  assistantIds: string[]; // empty = all assistants
  createdAt: string;
  updatedAt: string;
}

export type UserMemoryCreate = Omit<UserMemory, 'id' | 'createdAt' | 'updatedAt'>;
export type UserMemoryUpdate = Partial<Omit<UserMemory, 'id' | 'createdAt'>>;

export interface MemoryStats {
  total: number;
  byCategory: Record<string, number>;
  shared: number;
  private: number;
  storageUsed: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function readAll(): UserMemory[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as UserMemory[];
  } catch {
    return [];
  }
}

function writeAll(memories: UserMemory[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function matchesQuery(memory: UserMemory, query: string): boolean {
  const q = query.toLowerCase();
  return (
    memory.title.toLowerCase().includes(q) ||
    memory.content.toLowerCase().includes(q) ||
    memory.tags.some((t) => t.toLowerCase().includes(q))
  );
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const MemoryService = {
  /**
   * Returns all active memories, sorted by updatedAt desc.
   */
  getAll(): UserMemory[] {
    return readAll()
      .filter((m) => m.active)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  /**
   * Filter active memories by category.
   */
  getByCategory(category: MemoryCategory): UserMemory[] {
    return this.getAll().filter((m) => m.category === category);
  },

  /**
   * Returns memories relevant to a specific assistant.
   * A memory is relevant if assistantIds is empty (applies to all)
   * or explicitly includes the given assistantId.
   */
  getForAssistant(assistantId: string): UserMemory[] {
    return this.getAll().filter(
      (m) => m.assistantIds.length === 0 || m.assistantIds.includes(assistantId)
    );
  },

  /**
   * Simple text search across title, content, and tags.
   */
  search(query: string): UserMemory[] {
    if (!query.trim()) return this.getAll();
    return this.getAll().filter((m) => matchesQuery(m, query));
  },

  /**
   * Create a new memory. Generates id and timestamps.
   */
  create(input: UserMemoryCreate): UserMemory {
    const now = new Date().toISOString();
    const memory: UserMemory = {
      ...input,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const all = readAll();
    all.push(memory);
    writeAll(all);
    return memory;
  },

  /**
   * Update an existing memory. Bumps updatedAt.
   */
  update(id: string, partial: UserMemoryUpdate): UserMemory {
    const all = readAll();
    const idx = all.findIndex((m) => m.id === id);
    if (idx === -1) {
      throw new Error(`Memory not found: ${id}`);
    }
    const updated: UserMemory = {
      ...all[idx],
      ...partial,
      id: all[idx].id,
      createdAt: all[idx].createdAt,
      updatedAt: new Date().toISOString(),
    };
    all[idx] = updated;
    writeAll(all);
    return updated;
  },

  /**
   * Soft delete — sets active=false.
   */
  remove(id: string): void {
    this.update(id, { active: false });
  },

  /**
   * Hard delete — actually removes from storage.
   */
  hardDelete(id: string): void {
    const all = readAll();
    const filtered = all.filter((m) => m.id !== id);
    writeAll(filtered);
  },

  /**
   * Returns stats: total, byCategory, shared/private counts, storage size.
   */
  getStats(): MemoryStats {
    const all = this.getAll();
    const byCategory: Record<string, number> = {};
    let shared = 0;
    let privateCount = 0;

    for (const m of all) {
      byCategory[m.category] = (byCategory[m.category] || 0) + 1;
      if (m.shared) {
        shared++;
      } else {
        privateCount++;
      }
    }

    const raw = localStorage.getItem(STORAGE_KEY) || '';
    const storageUsed = formatBytes(new Blob([raw]).size);

    return {
      total: all.length,
      byCategory,
      shared,
      private: privateCount,
      storageUsed,
    };
  },

  /**
   * Exports all memories (including inactive) as pretty JSON.
   */
  exportJSON(): string {
    return JSON.stringify(readAll(), null, 2);
  },

  /**
   * Imports memories from JSON string. Returns count imported.
   * Existing memories with matching IDs are skipped.
   */
  importJSON(json: string): number {
    const incoming: UserMemory[] = JSON.parse(json);
    if (!Array.isArray(incoming)) {
      throw new Error('Invalid memory export format: expected an array');
    }
    const existing = readAll();
    const existingIds = new Set(existing.map((m) => m.id));
    let imported = 0;

    for (const mem of incoming) {
      if (!mem.id || !mem.title || !mem.content || !mem.category) continue;
      if (existingIds.has(mem.id)) continue;
      existing.push(mem);
      imported++;
    }

    writeAll(existing);
    return imported;
  },

  /**
   * Builds a context string from relevant memories for injection into
   * an assistant's system prompt. Respects maxTokens limit.
   *
   * Format:
   * MÉMOIRE UTILISATEUR:
   * - [client] Nom du client: Détails...
   * - [preference] Langue: Toujours répondre en français
   */
  buildContextForAssistant(assistantId: string, maxTokens: number = DEFAULT_MAX_TOKENS): string {
    const memories = this.getForAssistant(assistantId);
    if (memories.length === 0) return '';

    const maxChars = maxTokens * APPROX_CHARS_PER_TOKEN;
    const lines: string[] = ['MÉMOIRE UTILISATEUR:'];
    let currentLength = lines[0].length;

    for (const m of memories) {
      const line = `- [${m.category}] ${m.title}: ${m.content}`;
      if (currentLength + line.length + 1 > maxChars) break;
      lines.push(line);
      currentLength += line.length + 1;
    }

    if (lines.length === 1) return ''; // only header, no memories fit
    return lines.join('\n');
  },

  /**
   * Returns memories marked as shared (for team view).
   */
  getSharedTeamMemories(): UserMemory[] {
    return this.getAll().filter((m) => m.shared);
  },
};
