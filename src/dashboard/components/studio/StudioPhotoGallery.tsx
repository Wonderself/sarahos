'use client';

import { useState, useEffect } from 'react';
import { type HistoryEntry, saveGeneration } from './GenerationHistory';

// Re-export saveGeneration for backward compat
export { saveGeneration };

export type { HistoryEntry };

const STORAGE_KEY = 'fz_studio_history';

interface StudioPhotoGalleryProps {
  onReusePrompt?: (prompt: string, style: string) => void;
  highlightedUrl?: string | null; // currently generated image (to highlight)
}

export default function StudioPhotoGallery({ onReusePrompt, highlightedUrl }: StudioPhotoGalleryProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [expanded, setExpanded] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const reload = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch { /* ignore */ }
  };

  useEffect(() => {
    reload();
    // Highlight newly generated image if any
    if (highlightedUrl) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const list: HistoryEntry[] = JSON.parse(raw);
        const match = list.find(e => e.imageUrl === highlightedUrl);
        if (match) setExpandedId(match.id);
      }
    }
  }, [highlightedUrl]);

  const handleDelete = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (expandedId === id) setExpandedId(null);
  };

  const handleClearAll = () => {
    if (!confirm('Vider toute la galerie ? Cette action est irréversible.')) return;
    setEntries([]);
    localStorage.removeItem(STORAGE_KEY);
    setExpandedId(null);
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
      });
    } catch { return iso; }
  };

  const expandedEntry = entries.find(e => e.id === expandedId);

  return (
    <div style={{ borderTop: '1px solid #e5e7eb', background: '#fafafa' }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', padding: '10px 16px', background: 'none', border: 'none',
          cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: expanded ? '1px solid #f0f0f0' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 14 }}>image</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#1d1d1f' }}>
            Mes créations
          </span>
          {entries.length > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: '#8b5cf6',
              background: '#f5f3ff', padding: '1px 8px', borderRadius: 10,
            }}>
              {entries.length}
            </span>
          )}
        </div>
        <span style={{ fontSize: 10, color: '#9ca3af' }}>
          {expanded ? '▲ Masquer' : '▼ Afficher'}
        </span>
      </button>

      {expanded && entries.length === 0 && (
        <div style={{ padding: '24px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}><span className="material-symbols-rounded" style={{ fontSize: 28 }}>palette</span></div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>
            Vos photos générées apparaîtront ici
          </div>
        </div>
      )}

      {expanded && entries.length > 0 && (
        <div style={{ padding: '12px 16px' }}>
          {/* Clear all */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button
              onClick={handleClearAll}
              style={{
                fontSize: 10, color: '#ef4444', background: 'none', border: 'none',
                cursor: 'pointer', textDecoration: 'underline', padding: 0,
              }}
            >
              Vider la galerie
            </button>
          </div>

          {/* Thumbnail grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
            gap: 8,
            maxHeight: 320,
            overflowY: 'auto',
          }}>
            {entries.map(entry => (
              <div key={entry.id} style={{ position: 'relative' }}>
                <div
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                  style={{
                    cursor: 'pointer', borderRadius: 8, overflow: 'hidden',
                    border: `2px solid ${expandedId === entry.id
                      ? '#8b5cf6'
                      : entry.imageUrl === highlightedUrl
                        ? '#10b981'
                        : '#e5e7eb'}`,
                    aspectRatio: '1', position: 'relative',
                    boxShadow: entry.imageUrl === highlightedUrl
                      ? '0 0 0 3px #10b98130'
                      : 'none',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={entry.imageUrl}
                    alt={entry.prompt.slice(0, 40)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  {entry.imageUrl === highlightedUrl && (
                    <div style={{
                      position: 'absolute', top: 4, right: 4,
                      background: '#10b981', borderRadius: '50%',
                      width: 14, height: 14, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 8, color: 'white', fontWeight: 700,
                    }}><span className="material-symbols-rounded" style={{ fontSize: 8 }}>check</span></div>
                  )}
                </div>
                <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2, textAlign: 'center' }}>
                  {formatDate(entry.date)}
                </div>
              </div>
            ))}
          </div>

          {/* Expanded detail */}
          {expandedEntry && (
            <div style={{
              marginTop: 12, padding: 14, background: 'white', borderRadius: 12,
              border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', gap: 14 }}>
                {/* Preview */}
                <div style={{ flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={expandedEntry.imageUrl}
                    alt=""
                    style={{
                      width: 140, height: 140, objectFit: 'cover',
                      borderRadius: 10, border: '1px solid #e5e7eb', display: 'block',
                    }}
                  />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 4 }}>
                    Prompt
                  </div>
                  <div style={{
                    fontSize: 11, color: '#4b5563', lineHeight: 1.5, marginBottom: 10,
                    maxHeight: 48, overflow: 'hidden',
                  }}>
                    {expandedEntry.prompt}
                  </div>

                  {/* Badges */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    {expandedEntry.style && (
                      <span style={{
                        fontSize: 9, background: '#f5f3ff', color: '#7c3aed',
                        padding: '2px 8px', borderRadius: 8, fontWeight: 600,
                      }}>
                        {expandedEntry.style}
                      </span>
                    )}
                    {expandedEntry.dimensions && (
                      <span style={{
                        fontSize: 9, background: '#f0f9ff', color: '#0284c7',
                        padding: '2px 8px', borderRadius: 8, fontWeight: 600,
                      }}>
                        {expandedEntry.dimensions}
                      </span>
                    )}
                    <span style={{
                      fontSize: 9, background: '#f0fdf4', color: '#16a34a',
                      padding: '2px 8px', borderRadius: 8, fontWeight: 600,
                    }}>
                      {expandedEntry.workflow}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {onReusePrompt && (
                      <button
                        onClick={() => {
                          onReusePrompt(expandedEntry.prompt, expandedEntry.style);
                          setExpandedId(null);
                        }}
                        style={{
                          fontSize: 10, padding: '5px 10px', borderRadius: 6,
                          border: '1px solid #8b5cf6', color: '#8b5cf6', background: 'white',
                          cursor: 'pointer', fontWeight: 600,
                        }}
                      >
                        <span className="material-symbols-rounded" style={{ fontSize: 10, verticalAlign: 'middle' }}>undo</span> Réutiliser
                      </button>
                    )}
                    <a
                      href={expandedEntry.imageUrl}
                      download={`fz-studio-${expandedEntry.id}.png`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 10, padding: '5px 10px', borderRadius: 6,
                        border: '1px solid #e5e7eb', color: '#374151', background: 'white',
                        cursor: 'pointer', fontWeight: 600, textDecoration: 'none',
                        display: 'inline-block',
                      }}
                    >
                      <span className="material-symbols-rounded" style={{ fontSize: 10, verticalAlign: 'middle' }}>download</span> Télécharger
                    </a>
                    <button
                      onClick={() => handleCopyUrl(expandedEntry.imageUrl, expandedEntry.id)}
                      style={{
                        fontSize: 10, padding: '5px 10px', borderRadius: 6,
                        border: '1px solid #e5e7eb', color: copied === expandedEntry.id ? '#10b981' : '#374151',
                        background: 'white', cursor: 'pointer', fontWeight: 600,
                      }}
                    >
                      {copied === expandedEntry.id ? <><span className="material-symbols-rounded" style={{ fontSize: 10 }}>check</span> Copié</> : <><span className="material-symbols-rounded" style={{ fontSize: 10 }}>link</span> URL</>}
                    </button>
                    <button
                      onClick={() => handleDelete(expandedEntry.id)}
                      style={{
                        fontSize: 10, padding: '5px 10px', borderRadius: 6,
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
          )}
        </div>
      )}
    </div>
  );
}
