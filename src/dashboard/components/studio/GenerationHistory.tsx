'use client';

import { useState, useEffect } from 'react';

export interface HistoryEntry {
  id: string;
  imageUrl: string;
  prompt: string;
  style: string;
  dimensions: string;
  workflow: string;
  date: string;
}

const STORAGE_KEY = 'fz_studio_history';
const MAX_ENTRIES = 50;

export function saveGeneration(entry: Omit<HistoryEntry, 'id' | 'date'>): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: HistoryEntry[] = raw ? JSON.parse(raw) : [];
    const newEntry: HistoryEntry = {
      ...entry,
      id: `gen_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString(),
    };
    list.unshift(newEntry);
    if (list.length > MAX_ENTRIES) list.length = MAX_ENTRIES;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch { /* localStorage full or unavailable */ }
}

interface Props {
  onReusePrompt?: (prompt: string, style: string) => void;
}

export default function GenerationHistory({ onReusePrompt }: Props) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  if (entries.length === 0) return null;

  const handleDelete = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (expanded === id) setExpanded(null);
  };

  const handleClearAll = () => {
    setEntries([]);
    localStorage.removeItem(STORAGE_KEY);
    setExpanded(null);
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch { return iso; }
  };

  return (
    <div style={{ borderTop: '1px solid #e5e7eb', background: '#fafafa' }}>
      {/* Toggle header */}
      <button
        onClick={() => setVisible(!visible)}
        style={{
          width: '100%', padding: '10px 16px', background: 'none', border: 'none',
          cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: '#1d1d1f' }}>
          Historique ({entries.length})
        </span>
        <span style={{ fontSize: 10, color: '#6b7280' }}>
          {visible ? '▲ Masquer' : '▼ Afficher'}
        </span>
      </button>

      {visible && (
        <div style={{ padding: '0 16px 16px' }}>
          {/* Clear all */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button
              onClick={handleClearAll}
              style={{
                fontSize: 10, color: '#ef4444', background: 'none', border: 'none',
                cursor: 'pointer', textDecoration: 'underline',
              }}
            >
              Vider l&apos;historique
            </button>
          </div>

          {/* Gallery grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: 8,
            maxHeight: 400,
            overflowY: 'auto',
          }}>
            {entries.map(entry => (
              <div key={entry.id} style={{ position: 'relative' }}>
                {/* Thumbnail */}
                <div
                  onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                  style={{
                    cursor: 'pointer', borderRadius: 8, overflow: 'hidden',
                    border: expanded === entry.id ? '2px solid #1A1A1A' : '1px solid #e5e7eb',
                    aspectRatio: '1',
                  }}
                >
                  <img
                    src={entry.imageUrl}
                    alt={entry.prompt.slice(0, 50)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
                <div style={{ fontSize: 9, color: '#9B9B9B', marginTop: 2, textAlign: 'center' }}>
                  {formatDate(entry.date)}
                </div>
              </div>
            ))}
          </div>

          {/* Expanded detail */}
          {expanded && (() => {
            const entry = entries.find(e => e.id === expanded);
            if (!entry) return null;
            return (
              <div style={{
                marginTop: 12, padding: 12, background: 'white', borderRadius: 10,
                border: '1px solid #e5e7eb',
              }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <img
                    src={entry.imageUrl}
                    alt=""
                    style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#1d1d1f', marginBottom: 4 }}>
                      Prompt
                    </div>
                    <div style={{ fontSize: 11, color: '#4b5563', lineHeight: 1.4, marginBottom: 8 }}>
                      {entry.prompt}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                      <span style={{
                        fontSize: 9, background: '#F7F7F7', color: '#1A1A1A', padding: '2px 8px',
                        borderRadius: 10, fontWeight: 600,
                      }}>
                        {entry.style}
                      </span>
                      <span style={{
                        fontSize: 9, background: '#F7F7F7', color: '#6B6B6B', padding: '2px 8px',
                        borderRadius: 10, fontWeight: 600,
                      }}>
                        {entry.dimensions}
                      </span>
                      <span style={{
                        fontSize: 9, background: '#F7F7F7', color: '#1A1A1A', padding: '2px 8px',
                        borderRadius: 10, fontWeight: 600,
                      }}>
                        {entry.workflow}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {onReusePrompt && (
                        <button
                          onClick={() => onReusePrompt(entry.prompt, entry.style)}
                          style={{
                            fontSize: 10, padding: '4px 10px', borderRadius: 6,
                            border: '1px solid #1A1A1A', color: '#1A1A1A', background: 'white',
                            cursor: 'pointer', fontWeight: 600,
                          }}
                        >
                          Reutiliser
                        </button>
                      )}
                      <a
                        href={entry.imageUrl}
                        download={`fz-studio-${entry.id}.png`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: 10, padding: '4px 10px', borderRadius: 6,
                          border: '1px solid #e5e7eb', color: '#4b5563', background: 'white',
                          cursor: 'pointer', fontWeight: 600, textDecoration: 'none',
                        }}
                      >
                        Telecharger
                      </a>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        style={{
                          fontSize: 10, padding: '4px 10px', borderRadius: 6,
                          border: '1px solid #fecaca', color: '#ef4444', background: 'white',
                          cursor: 'pointer', fontWeight: 600,
                        }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
