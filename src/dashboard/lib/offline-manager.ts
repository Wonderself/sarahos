// ═══════════════════════════════════════════════════
//   FREENZY.IO — Offline Manager
//   IndexedDB cache + message queue + sync
// ═══════════════════════════════════════════════════

export interface QueuedMessage {
  id: string;
  agentId: string;
  content: string;
  timestamp: string;
  synced: boolean;
}

export interface CachedConversation {
  agentId: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>;
  cachedAt: string;
}

const QUEUE_KEY = 'fz_offline_queue';
const DB_NAME = 'fz_offline_db';
const STORE_NAME = 'conversations';

// ─── Offline detection

export function isOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
}

// ─── Message queue (localStorage — small data)

export function loadQueue(): QueuedMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]');
  } catch { return []; }
}

export function queueMessage(agentId: string, content: string): QueuedMessage {
  const msg: QueuedMessage = {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    agentId,
    content,
    timestamp: new Date().toISOString(),
    synced: false,
  };
  const queue = loadQueue();
  queue.push(msg);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  return msg;
}

export function markSynced(messageId: string): void {
  const queue = loadQueue().map(m => m.id === messageId ? { ...m, synced: true } : m);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.filter(m => !m.synced)));
}

export function clearQueue(): void {
  localStorage.removeItem(QUEUE_KEY);
}

// ─── IndexedDB conversation cache

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('No window'));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'agentId' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function cacheConversation(conv: CachedConversation): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(conv);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch { /* silent — IndexedDB not available */ }
}

export async function getCachedConversation(agentId: string): Promise<CachedConversation | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(agentId);
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  } catch { return null; }
}

export async function getAllCachedConversations(): Promise<CachedConversation[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result ?? []);
      req.onerror = () => resolve([]);
    });
  } catch { return []; }
}

export async function clearCache(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
  } catch { /* silent */ }
}
