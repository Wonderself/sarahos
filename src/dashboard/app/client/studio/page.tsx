'use client';

import { useState } from 'react';
import Link from 'next/link';
import { VIDEO_WORKFLOWS, PHOTO_WORKFLOWS } from '../../../lib/studio-workflows';
import RoadmapBadge from '../../../components/studio/RoadmapBadge';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { useIsMobile } from '../../../lib/use-media-query';
import { CU, pageContainer, headerRow, emojiIcon, cardGrid, tabBar } from '../../../lib/page-styles';

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
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'photo' | 'video'>('photo');
  const [photoCategory, setPhotoCategory] = useState<string>('all');

  const filteredPhotos = photoCategory === 'all'
    ? PHOTO_WORKFLOWS
    : PHOTO_WORKFLOWS.filter(wf => wf.category === photoCategory);

  const availableVideoCount = VIDEO_WORKFLOWS.filter(w => w.available).length;
  const availablePhotoCount = PHOTO_WORKFLOWS.filter(w => w.available).length;

  const meta = PAGE_META.studio;

  return (
    <div style={pageContainer(isMobile)}>
      {/* ─── Page Header ─── */}
      <div style={headerRow()}>
        <span style={emojiIcon(24)}>{meta.emoji}</span>
        <div style={{ flex: 1 }}>
          <h1 style={{ ...CU.pageTitle, display: 'flex', alignItems: 'center', gap: 8 }}>
            {meta.title}
            <HelpBubble text={meta.helpText} />
          </h1>
          <p style={CU.pageSubtitle}>
            {meta.subtitle}
          </p>
        </div>
      </div>
      <PageExplanation pageId="studio" text={PAGE_META.studio?.helpText} />

      {/* ─── Stat cards ─── */}
      <div style={cardGrid(isMobile, 2)}>
        <div style={{ ...CU.card, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={emojiIcon(22)}>📸</span>
          <div>
            <div style={CU.statValue}>{availablePhotoCount}/{PHOTO_WORKFLOWS.length}</div>
            <div style={CU.statLabel}>Photos disponibles</div>
          </div>
        </div>
        <div style={{ ...CU.card, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={emojiIcon(22)}>🎬</span>
          <div>
            <div style={CU.statValue}>{availableVideoCount}/{VIDEO_WORKFLOWS.length}</div>
            <div style={CU.statLabel}>Vidéos disponibles</div>
          </div>
        </div>
      </div>

      {/* ─── Tab Switcher ─── */}
      <div style={{ ...tabBar(), marginTop: 24 }}>
        {(['photo', 'video'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={activeTab === tab ? CU.tabActive : CU.tab}
          >
            {tab === 'photo' ? '📸 Photo' : '🎬 Video'}
            <span style={{
              ...CU.badge,
              marginLeft: 8,
              background: activeTab === tab ? CU.accent : CU.accentLight,
              color: activeTab === tab ? '#fff' : CU.textMuted,
            }}>
              {tab === 'photo' ? `${availablePhotoCount}/${PHOTO_WORKFLOWS.length}` : `${availableVideoCount}/${VIDEO_WORKFLOWS.length}`}
            </span>
          </button>
        ))}
      </div>

      {/* ─── PHOTO TAB ─── */}
      {activeTab === 'photo' && (
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={emojiIcon(18)}>📸</span>
            <div>
              <h2 style={CU.sectionTitle}>Photo Studio</h2>
              <p style={{ fontSize: 12, color: CU.textMuted, margin: 0 }}>Guide par Emma — Directrice artistique</p>
            </div>
            <div style={{ flex: 1 }} />
            <span style={{
              ...CU.badge,
              fontWeight: 600,
              color: CU.text,
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
                  height: isMobile ? 36 : 32, padding: isMobile ? '0 12px' : '0 14px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                  border: `1px solid ${photoCategory === cat.id ? CU.accent : CU.border}`,
                  background: photoCategory === cat.id ? CU.accentLight : CU.bg,
                  color: photoCategory === cat.id ? CU.accent : CU.textMuted,
                  cursor: 'pointer', transition: 'all 0.15s',
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

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {filteredPhotos.map(wf => (
              <Link
                key={wf.id}
                href={wf.available ? `/client/studio/photo?workflow=${wf.id}` : '#'}
                style={{
                  display: 'block',
                  ...CU.cardHoverable,
                  padding: 16,
                  borderLeft: wf.id === 'photo-post' ? `3px solid ${CU.accent}` : undefined,
                  textDecoration: 'none',
                  opacity: wf.available ? 1 : 0.7,
                  cursor: wf.available ? 'pointer' : 'default',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 20 }}>{getEmoji(wf.icon)}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: CU.text }}>{wf.label}</span>
                  {wf.id === 'photo-post' && (
                    <span style={CU.badge}>Populaire</span>
                  )}
                  {!wf.available && <RoadmapBadge />}
                  {wf.available && wf.id !== 'photo-post' && (
                    <span style={CU.badge}>Disponible</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: CU.textSecondary, lineHeight: 1.5 }}>
                  {wf.description}
                </div>
                <div style={{ fontSize: 11, color: CU.textMuted, marginTop: 8 }}>
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
            <span style={emojiIcon(18)}>🎬</span>
            <div>
              <h2 style={CU.sectionTitle}>Video Studio</h2>
              <p style={{ fontSize: 12, color: CU.textMuted, margin: 0 }}>Guide par Lucas — Directeur video</p>
            </div>
            <div style={{ flex: 1 }} />
            <span style={{
              ...CU.badge,
              fontWeight: 600,
              color: CU.text,
            }}>
              {availableVideoCount}/{VIDEO_WORKFLOWS.length} disponibles
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {VIDEO_WORKFLOWS.map(wf => (
              <Link
                key={wf.id}
                href={wf.available ? `/client/studio/video?workflow=${wf.id}` : '#'}
                style={{
                  display: 'block',
                  ...CU.cardHoverable,
                  padding: 16,
                  textDecoration: 'none',
                  opacity: wf.available ? 1 : 0.7,
                  cursor: wf.available ? 'pointer' : 'default',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>{getEmoji(wf.icon)}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: CU.text }}>{wf.label}</span>
                  {!wf.available && <RoadmapBadge />}
                  {wf.available && (
                    <span style={CU.badge}>Disponible</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: CU.textSecondary, lineHeight: 1.5 }}>
                  {wf.description}
                </div>
                <div style={{ fontSize: 11, color: CU.textMuted, marginTop: 8 }}>
                  {wf.steps.length} etapes — {wf.costSteps.length > 0 ? `~${wf.costSteps.length + 1} APIs` : 'Chat uniquement'}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── Cost Summary ─── */}
      <section style={{
        ...CU.card, padding: 20,
      }}>
        <h3 style={{ ...CU.sectionTitle, marginBottom: 16 }}>
          💰 Tarification Studio
        </h3>

        {/* Photo */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            ...CU.label,
            textTransform: 'uppercase' as const,
            letterSpacing: 0.5,
            color: CU.text,
            fontWeight: 600,
            marginBottom: 8,
          }}>
            📸 Photo
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px 16px', fontSize: 12 }}>
            <div style={{ color: CU.textSecondary }}>Generation image (Nano Banana)</div>
            <div style={{ color: CU.text, fontWeight: 600, textAlign: 'right' as const }}>~10 credits</div>
            <div style={{ color: CU.textSecondary }}>Generation image HD</div>
            <div style={{ color: CU.text, fontWeight: 600, textAlign: 'right' as const }}>~15 credits</div>
          </div>
        </div>

        {/* Video */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            ...CU.label,
            textTransform: 'uppercase' as const,
            letterSpacing: 0.5,
            color: CU.text,
            fontWeight: 600,
            marginBottom: 8,
          }}>
            🎬 Video
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px 16px', fontSize: 12 }}>
            <div style={{ color: CU.textSecondary }}>Video D-ID (talking head)</div>
            <div style={{ color: CU.text, fontWeight: 600, textAlign: 'right' as const }}>~25 credits</div>
            <div style={{ color: CU.textSecondary }}>Synthese vocale Deepgram</div>
            <div style={{ color: CU.text, fontWeight: 600, textAlign: 'right' as const }}>~0.5 credits</div>
          </div>
        </div>

        {/* Common */}
        <div>
          <div style={{
            ...CU.label,
            textTransform: 'uppercase' as const,
            letterSpacing: 0.5,
            marginBottom: 8,
          }}>
            Commun
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px 16px', fontSize: 12 }}>
            <div style={{ color: CU.textSecondary }}>Message IA (guidage)</div>
            <div style={{ color: CU.text, fontWeight: 600, textAlign: 'right' as const }}>~1.5 credits</div>
            <div style={{ color: CU.textMuted }}>Direction artistique (chat)</div>
            <div style={{ color: CU.text, fontWeight: 600, textAlign: 'right' as const }}>Inclus</div>
          </div>
        </div>
      </section>
    </div>
  );
}
