'use client';

import { useState } from 'react';
import Link from 'next/link';
import { VIDEO_WORKFLOWS, PHOTO_WORKFLOWS } from '../../../lib/studio-workflows';
import RoadmapBadge from '../../../components/studio/RoadmapBadge';

const PHOTO_CATEGORIES = [
  { id: 'all', label: 'Tous', icon: '✨' },
  { id: 'social', label: 'Social', icon: '📱' },
  { id: 'commercial', label: 'Commerce', icon: '💼' },
  { id: 'creative', label: 'Creatif', icon: '🎨' },
  { id: 'personal', label: 'Personnel', icon: '❤️' },
  { id: 'professional', label: 'Pro', icon: '💎' },
] as const;

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState<'photo' | 'video'>('photo');
  const [photoCategory, setPhotoCategory] = useState<string>('all');

  const filteredPhotos = photoCategory === 'all'
    ? PHOTO_WORKFLOWS
    : PHOTO_WORKFLOWS.filter(wf => wf.category === photoCategory);

  const availableVideoCount = VIDEO_WORKFLOWS.filter(w => w.available).length;
  const availablePhotoCount = PHOTO_WORKFLOWS.filter(w => w.available).length;

  return (
    <div style={{ padding: 32, maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          Studio Creatif
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
          Creez des photos et videos professionnelles guidees par nos agents specialises.
        </p>
      </div>

      {/* ─── Tab Switcher ─── */}
      <div style={{
        display: 'flex', background: 'var(--bg-secondary)', borderRadius: 10,
        padding: 3, gap: 2, marginBottom: 28,
      }}>
        <button
          onClick={() => setActiveTab('photo')}
          style={{
            flex: 1, textAlign: 'center', padding: '10px 16px', borderRadius: 8,
            fontSize: 14, fontWeight: activeTab === 'photo' ? 600 : 400,
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: activeTab === 'photo' ? 'var(--bg-primary)' : 'transparent',
            color: activeTab === 'photo' ? 'var(--text-primary)' : 'var(--text-tertiary)',
            boxShadow: activeTab === 'photo' ? 'var(--shadow-sm)' : 'none',
          }}
        >
          📸 Photo
          <span style={{
            marginLeft: 8, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
            background: activeTab === 'photo' ? 'var(--success)' : 'var(--bg-tertiary)',
            color: activeTab === 'photo' ? '#fff' : 'var(--text-muted)',
          }}>
            {availablePhotoCount}/{PHOTO_WORKFLOWS.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('video')}
          style={{
            flex: 1, textAlign: 'center', padding: '10px 16px', borderRadius: 8,
            fontSize: 14, fontWeight: activeTab === 'video' ? 600 : 400,
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: activeTab === 'video' ? 'var(--bg-primary)' : 'transparent',
            color: activeTab === 'video' ? 'var(--text-primary)' : 'var(--text-tertiary)',
            boxShadow: activeTab === 'video' ? 'var(--shadow-sm)' : 'none',
          }}
        >
          🎬 Video
          <span style={{
            marginLeft: 8, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
            background: activeTab === 'video' ? 'var(--success)' : 'var(--bg-tertiary)',
            color: activeTab === 'video' ? '#fff' : 'var(--text-muted)',
          }}>
            {availableVideoCount}/{VIDEO_WORKFLOWS.length}
          </span>
        </button>
      </div>

      {/* ─── PHOTO TAB ─── */}
      {activeTab === 'photo' && (
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 28 }}>📸</span>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Photo Studio</h2>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Guide par Emma — Directrice artistique</p>
            </div>
            <span style={{
              marginLeft: 'auto', fontSize: 11, color: 'var(--success)', fontWeight: 600,
              padding: '3px 10px', borderRadius: 12, background: 'var(--accent-muted)',
            }}>
              {availablePhotoCount}/{PHOTO_WORKFLOWS.length} disponibles
            </span>
          </div>

          {/* Category filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {PHOTO_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setPhotoCategory(cat.id)}
                style={{
                  padding: '6px 14px', borderRadius: 20,
                  border: `1px solid ${photoCategory === cat.id ? 'var(--accent)' : 'var(--border-primary)'}`,
                  background: photoCategory === cat.id ? 'var(--accent-muted)' : 'var(--bg-primary)',
                  color: photoCategory === cat.id ? 'var(--accent)' : 'var(--text-tertiary)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {cat.icon} {cat.label}
                {cat.id !== 'all' && (
                  <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.7 }}>
                    ({PHOTO_WORKFLOWS.filter(w => w.category === cat.id).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {filteredPhotos.map(wf => (
              <Link
                key={wf.id}
                href={wf.available ? `/client/studio/photo?workflow=${wf.id}` : '#'}
                style={{
                  display: 'block', padding: 16, borderRadius: 12,
                  border: wf.id === 'photo-post' ? '2px solid var(--accent)' : '1px solid var(--border-primary)',
                  background: wf.id === 'photo-post' ? 'var(--accent-muted)' : 'var(--bg-elevated)',
                  textDecoration: 'none', transition: 'all 0.15s',
                  opacity: wf.available ? 1 : 0.7,
                  cursor: wf.available ? 'pointer' : 'default',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 22 }}>{wf.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{wf.label}</span>
                  {wf.id === 'photo-post' && (
                    <span style={{
                      padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700,
                      background: '#fef3c7', color: '#d97706',
                    }}>Populaire</span>
                  )}
                  {!wf.available && <RoadmapBadge />}
                  {wf.available && wf.id !== 'photo-post' && (
                    <span style={{
                      padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600,
                      background: 'rgba(22, 163, 74, 0.1)', color: 'var(--success)',
                    }}>Disponible</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                  {wf.description}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                  {wf.steps.length} etapes — {wf.costSteps.length > 0 ? 'IA generative' : 'Chat uniquement'}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── VIDEO TAB ─── */}
      {activeTab === 'video' && (
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 28 }}>🎬</span>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Video Studio</h2>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Guide par Lucas — Directeur video</p>
            </div>
            <span style={{
              marginLeft: 'auto', fontSize: 11, color: 'var(--success)', fontWeight: 600,
              padding: '3px 10px', borderRadius: 12, background: 'var(--accent-muted)',
            }}>
              {availableVideoCount}/{VIDEO_WORKFLOWS.length} disponibles
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {VIDEO_WORKFLOWS.map(wf => (
              <Link
                key={wf.id}
                href={wf.available ? `/client/studio/video?workflow=${wf.id}` : '#'}
                style={{
                  display: 'block', padding: 16, borderRadius: 12,
                  border: '1px solid var(--border-primary)', background: 'var(--bg-elevated)',
                  textDecoration: 'none', transition: 'all 0.15s',
                  opacity: wf.available ? 1 : 0.7,
                  cursor: wf.available ? 'pointer' : 'default',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 22 }}>{wf.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{wf.label}</span>
                  {!wf.available && <RoadmapBadge />}
                  {wf.available && (
                    <span style={{
                      padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600,
                      background: 'rgba(22, 163, 74, 0.1)', color: 'var(--success)',
                    }}>Disponible</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                  {wf.description}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                  {wf.steps.length} etapes — {wf.costSteps.length > 0 ? `~${wf.costSteps.length + 1} APIs` : 'Chat uniquement'}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Cost Summary — always visible */}
      <section style={{
        padding: 20, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>
          Tarification Studio
        </h3>

        {/* Photo */}
        <div style={{ marginBottom: 14 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase',
            letterSpacing: 0.5, marginBottom: 8,
          }}>
            📸 Photo
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px 16px', fontSize: 12 }}>
            <div style={{ color: 'var(--text-secondary)' }}>Generation image (Nano Banana)</div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600, textAlign: 'right' }}>~10 credits</div>
            <div style={{ color: 'var(--text-secondary)' }}>Generation image HD</div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600, textAlign: 'right' }}>~15 credits</div>
          </div>
        </div>

        {/* Video */}
        <div style={{ marginBottom: 14 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase',
            letterSpacing: 0.5, marginBottom: 8,
          }}>
            🎬 Video
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px 16px', fontSize: 12 }}>
            <div style={{ color: 'var(--text-secondary)' }}>Video D-ID (talking head)</div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600, textAlign: 'right' }}>~25 credits</div>
            <div style={{ color: 'var(--text-secondary)' }}>Synthese vocale Deepgram</div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600, textAlign: 'right' }}>~0.5 credits</div>
          </div>
        </div>

        {/* Common */}
        <div>
          <div style={{
            fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase',
            letterSpacing: 0.5, marginBottom: 8,
          }}>
            Commun
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px 16px', fontSize: 12 }}>
            <div style={{ color: 'var(--text-secondary)' }}>Message IA (guidage)</div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600, textAlign: 'right' }}>~1.5 credits</div>
            <div style={{ color: 'var(--text-muted)' }}>Direction artistique (chat)</div>
            <div style={{ color: 'var(--success)', fontWeight: 600, textAlign: 'right' }}>Inclus</div>
          </div>
        </div>
      </section>
    </div>
  );
}
