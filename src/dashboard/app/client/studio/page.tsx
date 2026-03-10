'use client';

import { useState } from 'react';
import Link from 'next/link';
import { VIDEO_WORKFLOWS, PHOTO_WORKFLOWS } from '../../../lib/studio-workflows';
import RoadmapBadge from '../../../components/studio/RoadmapBadge';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';

const ICON_TO_EMOJI: Record<string, string> = {
  auto_awesome: '✨',
  phone_iphone: '📱',
  work: '💼',
  palette: '🎨',
  favorite: '❤️',
  diamond: '💎',
  photo_camera: '📸',
  movie: '🎬',
  videocam: '📹',
  image: '🖼️',
  edit: '✏️',
  star: '⭐',
  share: '🔗',
  menu_book: '📖',
  family_restroom: '👨‍👩‍👧',
  live_tv: '📺',
  person: '👤',
  sync: '🔄',
  redeem: '🎁',
  mail: '✉️',
  campaign: '📣',
  mood: '😊',
  inventory_2: '📦',
};

const getEmoji = (icon: string): string => ICON_TO_EMOJI[icon] || '🔹';

const PHOTO_CATEGORIES = [
  { id: 'all', label: 'Tous', icon: 'auto_awesome' },
  { id: 'social', label: 'Social', icon: 'phone_iphone' },
  { id: 'commercial', label: 'Commerce', icon: 'work' },
  { id: 'creative', label: 'Creatif', icon: 'palette' },
  { id: 'personal', label: 'Personnel', icon: 'favorite' },
  { id: 'professional', label: 'Pro', icon: 'diamond' },
] as const;

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState<'photo' | 'video'>('photo');
  const [photoCategory, setPhotoCategory] = useState<string>('all');

  const filteredPhotos = photoCategory === 'all'
    ? PHOTO_WORKFLOWS
    : PHOTO_WORKFLOWS.filter(wf => wf.category === photoCategory);

  const availableVideoCount = VIDEO_WORKFLOWS.filter(w => w.available).length;
  const availablePhotoCount = PHOTO_WORKFLOWS.filter(w => w.available).length;

  const meta = PAGE_META.studio;

  return (
    <div className="client-page-scrollable" style={{ padding: 32, maxWidth: 960, margin: '0 auto' }}>
      {/* ─── Page Header ─── */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <span style={{ fontSize: 32, lineHeight: 1 }}>{meta.emoji}</span>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--fz-text, #1E293B)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            {meta.title}
            <HelpBubble text={meta.helpText} />
          </h1>
          <p style={{ fontSize: 14, color: 'var(--fz-text-muted, #94A3B8)', lineHeight: 1.6 }}>
            {meta.subtitle}
          </p>
        </div>
      </div>
      <PageExplanation pageId="studio" text={PAGE_META.studio?.helpText} />

      {/* ─── Tab Switcher ─── */}
      <div style={{
        display: 'flex', background: 'var(--fz-bg-secondary, #F8FAFC)', borderRadius: 10,
        padding: 3, gap: 2, marginBottom: 28,
      }}>
        <button
          onClick={() => setActiveTab('photo')}
          style={{
            flex: 1, textAlign: 'center', padding: '10px 16px', borderRadius: 8,
            fontSize: 14, fontWeight: activeTab === 'photo' ? 600 : 400,
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: activeTab === 'photo' ? 'var(--fz-bg, #FFFFFF)' : 'transparent',
            color: activeTab === 'photo' ? 'var(--fz-text, #1E293B)' : 'var(--fz-text-muted, #94A3B8)',
            boxShadow: activeTab === 'photo' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          📸 Photo
          <span style={{
            marginLeft: 8, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
            background: activeTab === 'photo' ? 'var(--success)' : 'var(--fz-bg-secondary, #F8FAFC)',
            color: activeTab === 'photo' ? '#fff' : 'var(--fz-text-muted, #94A3B8)',
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
            background: activeTab === 'video' ? 'var(--fz-bg, #FFFFFF)' : 'transparent',
            color: activeTab === 'video' ? 'var(--fz-text, #1E293B)' : 'var(--fz-text-muted, #94A3B8)',
            boxShadow: activeTab === 'video' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          🎬 Video
          <span style={{
            marginLeft: 8, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
            background: activeTab === 'video' ? 'var(--success)' : 'var(--fz-bg-secondary, #F8FAFC)',
            color: activeTab === 'video' ? '#fff' : 'var(--fz-text-muted, #94A3B8)',
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
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fz-text, #1E293B)' }}>Photo Studio</h2>
              <p style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)' }}>Guide par Emma — Directrice artistique</p>
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
                  border: `1px solid ${photoCategory === cat.id ? 'var(--accent)' : 'var(--fz-border, #E2E8F0)'}`,
                  background: photoCategory === cat.id ? 'var(--accent-muted)' : 'var(--fz-bg, #FFFFFF)',
                  color: photoCategory === cat.id ? 'var(--accent)' : 'var(--fz-text-muted, #94A3B8)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {getEmoji(cat.icon)} {cat.label}
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
                  border: wf.id === 'photo-post' ? '2px solid var(--accent)' : '1px solid var(--fz-border, #E2E8F0)',
                  background: wf.id === 'photo-post' ? 'var(--accent-muted)' : 'var(--fz-bg, #FFFFFF)',
                  textDecoration: 'none', transition: 'all 0.15s',
                  opacity: wf.available ? 1 : 0.7,
                  cursor: wf.available ? 'pointer' : 'default',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 22 }}>{getEmoji(wf.icon)}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fz-text, #1E293B)' }}>{wf.label}</span>
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
                <div style={{ fontSize: 12, color: 'var(--fz-text-secondary, #64748B)', lineHeight: 1.5 }}>
                  {wf.description}
                </div>
                <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)', marginTop: 8 }}>
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
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fz-text, #1E293B)' }}>Video Studio</h2>
              <p style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)' }}>Guide par Lucas — Directeur video</p>
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
                  border: '1px solid var(--fz-border, #E2E8F0)', background: 'var(--fz-bg, #FFFFFF)',
                  textDecoration: 'none', transition: 'all 0.15s',
                  opacity: wf.available ? 1 : 0.7,
                  cursor: wf.available ? 'pointer' : 'default',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 22 }}>{getEmoji(wf.icon)}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fz-text, #1E293B)' }}>{wf.label}</span>
                  {!wf.available && <RoadmapBadge />}
                  {wf.available && (
                    <span style={{
                      padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600,
                      background: 'rgba(22, 163, 74, 0.1)', color: 'var(--success)',
                    }}>Disponible</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--fz-text-secondary, #64748B)', lineHeight: 1.5 }}>
                  {wf.description}
                </div>
                <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)', marginTop: 8 }}>
                  {wf.steps.length} etapes — {wf.costSteps.length > 0 ? `~${wf.costSteps.length + 1} APIs` : 'Chat uniquement'}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Cost Summary — always visible */}
      <section style={{
        padding: 20, borderRadius: 12, background: 'var(--fz-bg-secondary, #F8FAFC)', border: '1px solid var(--fz-border, #E2E8F0)',
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--fz-text, #1E293B)', marginBottom: 14 }}>
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
            <div style={{ color: 'var(--fz-text-secondary, #64748B)' }}>Generation image (Nano Banana)</div>
            <div style={{ color: 'var(--fz-text, #1E293B)', fontWeight: 600, textAlign: 'right' }}>~10 credits</div>
            <div style={{ color: 'var(--fz-text-secondary, #64748B)' }}>Generation image HD</div>
            <div style={{ color: 'var(--fz-text, #1E293B)', fontWeight: 600, textAlign: 'right' }}>~15 credits</div>
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
            <div style={{ color: 'var(--fz-text-secondary, #64748B)' }}>Video D-ID (talking head)</div>
            <div style={{ color: 'var(--fz-text, #1E293B)', fontWeight: 600, textAlign: 'right' }}>~25 credits</div>
            <div style={{ color: 'var(--fz-text-secondary, #64748B)' }}>Synthese vocale Deepgram</div>
            <div style={{ color: 'var(--fz-text, #1E293B)', fontWeight: 600, textAlign: 'right' }}>~0.5 credits</div>
          </div>
        </div>

        {/* Common */}
        <div>
          <div style={{
            fontSize: 11, fontWeight: 700, color: 'var(--fz-text-muted, #94A3B8)', textTransform: 'uppercase',
            letterSpacing: 0.5, marginBottom: 8,
          }}>
            Commun
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px 16px', fontSize: 12 }}>
            <div style={{ color: 'var(--fz-text-secondary, #64748B)' }}>Message IA (guidage)</div>
            <div style={{ color: 'var(--fz-text, #1E293B)', fontWeight: 600, textAlign: 'right' }}>~1.5 credits</div>
            <div style={{ color: 'var(--fz-text-muted, #94A3B8)' }}>Direction artistique (chat)</div>
            <div style={{ color: 'var(--success)', fontWeight: 600, textAlign: 'right' }}>Inclus</div>
          </div>
        </div>
      </section>
    </div>
  );
}
