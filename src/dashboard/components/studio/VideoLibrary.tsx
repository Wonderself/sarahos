'use client';

import { useState, useEffect } from 'react';
import {
  type VideoLibraryItem,
  getVideoLibrary,
  deleteVideoFromLibrary,
  setVideoProject,
} from '../../lib/studio-requests';

interface VideoLibraryProps {
  highlightedId?: string | null;
  onReuseScript?: (script: string) => void;
}

export default function VideoLibrary({ highlightedId, onReuseScript }: VideoLibraryProps) {
  const [items, setItems] = useState<VideoLibraryItem[]>([]);
  const [expanded, setExpanded] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [projectInput, setProjectInput] = useState('');

  const reload = () => setItems(getVideoLibrary());
  useEffect(() => { reload(); }, []);

  // Auto-expand and select highlighted item
  useEffect(() => {
    if (highlightedId) {
      setExpanded(true);
      setExpandedId(highlightedId);
    }
  }, [highlightedId]);

  const handleDelete = (id: string) => {
    if (!confirm('Supprimer cette vidéo de la bibliothèque ?')) return;
    deleteVideoFromLibrary(id);
    reload();
    if (expandedId === id) setExpandedId(null);
  };

  const handleSetProject = (id: string) => {
    setVideoProject(id, projectInput.trim());
    reload();
    setEditingProject(null);
    setProjectInput('');
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
      });
    } catch { return iso; }
  };

  // Group by project
  const byProject: Record<string, VideoLibraryItem[]> = {};
  for (const v of items) {
    const key = v.projectName || '__none__';
    if (!byProject[key]) byProject[key] = [];
    byProject[key].push(v);
  }

  const projects = Object.keys(byProject).filter(k => k !== '__none__');
  const noProject = byProject['__none__'] ?? [];

  const expandedItem = items.find(v => v.id === expandedId);

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
          <span style={{ fontSize: 14 }}>🎬</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#1d1d1f' }}>
            Vidéothèque
          </span>
          {items.length > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: '#1A1A1A',
              background: '#F7F7F7', padding: '1px 8px', borderRadius: 10,
            }}>
              {items.length} vidéo{items.length > 1 ? 's' : ''}
            </span>
          )}
          {projects.length > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: '#9B9B9B',
              background: '#F7F7F7', padding: '1px 8px', borderRadius: 10,
            }}>
              {projects.length} projet{projects.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <span style={{ fontSize: 10, color: '#9B9B9B' }}>
          {expanded ? '▲ Masquer' : '▼ Afficher'}
        </span>
      </button>

      {expanded && items.length === 0 && (
        <div style={{ padding: '24px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📹</div>
          <div style={{ fontSize: 12, color: '#9B9B9B' }}>
            Vos vidéos générées apparaîtront ici
          </div>
          <div style={{ fontSize: 11, color: '#d1d5db', marginTop: 4 }}>
            Regroupez-les par projet pour créer des films
          </div>
        </div>
      )}

      {expanded && items.length > 0 && (
        <div style={{ padding: '12px 16px' }}>

          {/* Film projects */}
          {projects.map(project => (
            <div key={project} style={{ marginBottom: 16 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
                paddingBottom: 6, borderBottom: '1px solid #f3f4f6',
              }}>
                <span style={{ fontSize: 12 }}>🎞️</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1d1d1f' }}>{project}</span>
                <span style={{
                  fontSize: 10, color: '#6b7280', background: '#f3f4f6',
                  padding: '1px 6px', borderRadius: 8,
                }}>
                  {byProject[project]?.length ?? 0} scène{(byProject[project]?.length ?? 0) > 1 ? 's' : ''}
                </span>
              </div>
              <VideoGrid
                items={byProject[project] ?? []}
                expandedId={expandedId}
                onToggle={id => setExpandedId(expandedId === id ? null : id)}
                onDelete={handleDelete}
                formatDate={formatDate}
                highlightedId={highlightedId ?? null}
              />
            </div>
          ))}

          {/* No-project videos */}
          {noProject.length > 0 && (
            <div>
              {projects.length > 0 && (
                <div style={{
                  fontSize: 10, fontWeight: 700, color: '#9B9B9B', textTransform: 'uppercase',
                  letterSpacing: 0.5, marginBottom: 8,
                }}>
                  Sans projet
                </div>
              )}
              <VideoGrid
                items={noProject}
                expandedId={expandedId}
                onToggle={id => setExpandedId(expandedId === id ? null : id)}
                onDelete={handleDelete}
                formatDate={formatDate}
                highlightedId={highlightedId ?? null}
              />
            </div>
          )}

          {/* Expanded detail */}
          {expandedItem && (
            <div style={{
              marginTop: 12, padding: 14, background: 'white', borderRadius: 12,
              border: '1px solid #e5e7eb',
            }}>
              {/* Video player */}
              <video
                src={expandedItem.url}
                controls
                style={{
                  width: '100%', borderRadius: 10, border: '1px solid #e5e7eb',
                  marginBottom: 12, maxHeight: 240, background: '#000',
                }}
              />

              {/* Script preview */}
              {expandedItem.script && (
                <div style={{
                  padding: '8px 12px', background: '#f9fafb', borderRadius: 8,
                  border: '1px solid #e5e7eb', marginBottom: 12,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', marginBottom: 4, textTransform: 'uppercase' }}>
                    Script
                  </div>
                  <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.5, maxHeight: 60, overflow: 'hidden' }}>
                    {expandedItem.script}
                  </div>
                </div>
              )}

              {/* Project assignment */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  <span style={{ fontSize: 11 }}>🎞️</span> Projet / Film
                </div>
                {editingProject === expandedItem.id ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="text"
                      value={projectInput}
                      onChange={e => setProjectInput(e.target.value)}
                      placeholder="Nom du projet ou film..."
                      onKeyDown={e => { if (e.key === 'Enter') handleSetProject(expandedItem.id); }}
                      style={{
                        flex: 1, padding: '6px 10px', borderRadius: 7, border: '1px solid #e5e7eb',
                        fontSize: 12, outline: 'none',
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => handleSetProject(expandedItem.id)}
                      style={{
                        padding: '6px 12px', borderRadius: 7, border: 'none',
                        background: '#1A1A1A', color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      }}
                    >OK</button>
                    <button
                      onClick={() => { setEditingProject(null); setProjectInput(''); }}
                      style={{
                        padding: '6px 10px', borderRadius: 7, border: '1px solid #e5e7eb',
                        background: 'white', color: '#6b7280', fontSize: 11, cursor: 'pointer',
                      }}
                    ><span style={{ fontSize: 14 }}>✕</span></button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingProject(expandedItem.id);
                      setProjectInput(expandedItem.projectName || '');
                    }}
                    style={{
                      padding: '6px 12px', borderRadius: 7, border: '1px dashed #d1d5db',
                      background: '#f9fafb', color: '#6b7280', fontSize: 11, cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    {expandedItem.projectName
                      ? <><span style={{ fontSize: 11 }}>📁</span> {expandedItem.projectName} (modifier)</>
                      : '+ Assigner à un projet'}
                  </button>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {onReuseScript && expandedItem.script && (
                  <button
                    onClick={() => { onReuseScript(expandedItem.script); setExpandedId(null); }}
                    style={{
                      fontSize: 10, padding: '5px 10px', borderRadius: 6,
                      border: '1px solid #1A1A1A', color: '#1A1A1A', background: 'white',
                      cursor: 'pointer', fontWeight: 600,
                    }}
                  >
                    <span style={{ fontSize: 10, verticalAlign: 'middle' }}>↩️</span> Réutiliser script
                  </button>
                )}
                <a
                  href={expandedItem.url}
                  download={`fz-video-${expandedItem.id}.mp4`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 10, padding: '5px 10px', borderRadius: 6,
                    border: '1px solid #e5e7eb', color: '#374151', background: 'white',
                    cursor: 'pointer', fontWeight: 600, textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  <span style={{ fontSize: 10, verticalAlign: 'middle' }}>📥</span> Télécharger
                </a>
                <button
                  onClick={() => handleDelete(expandedItem.id)}
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
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-component: thumbnail grid for a set of videos ──
function VideoGrid({
  items, expandedId, onToggle, onDelete, formatDate, highlightedId,
}: {
  items: VideoLibraryItem[];
  expandedId: string | null;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  formatDate: (iso: string) => string;
  highlightedId: string | null;
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
      gap: 8, marginBottom: 8,
    }}>
      {items.map((v, i) => (
        <div key={v.id}>
          <div
            onClick={() => onToggle(v.id)}
            style={{
              borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
              border: `2px solid ${expandedId === v.id
                ? '#1A1A1A'
                : v.id === highlightedId
                  ? '#1A1A1A'
                  : '#e5e7eb'}`,
              aspectRatio: '16/9', background: '#1d1d1f',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}
          >
            <span style={{ fontSize: 20, opacity: 0.7 }}>▶</span>
            <div style={{
              position: 'absolute', bottom: 3, left: 4, right: 4,
              fontSize: 8, color: 'rgba(255,255,255,0.6)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              Scène {i + 1}
            </div>
            {v.id === highlightedId && (
              <div style={{
                position: 'absolute', top: 3, right: 3,
                background: '#1A1A1A', borderRadius: '50%',
                width: 12, height: 12, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 7, color: 'white', fontWeight: 700,
              }}>✅</div>
            )}
          </div>
          <div style={{ fontSize: 9, color: '#9B9B9B', marginTop: 2, textAlign: 'center' }}>
            {formatDate(v.createdAt)}
          </div>
        </div>
      ))}
    </div>
  );
}
