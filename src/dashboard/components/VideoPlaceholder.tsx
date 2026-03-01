'use client';

import { useState } from 'react';

interface VideoPlaceholderProps {
  id?: string;
  title?: string;
  subtitle?: string;
  thumbnailSrc?: string;
  videoUrl?: string;
}

export default function VideoPlaceholder({
  id,
  title = 'Découvrez Sarah en action',
  subtitle = 'Vidéo à venir',
  thumbnailSrc,
  videoUrl,
}: VideoPlaceholderProps) {
  const [playing, setPlaying] = useState(false);

  if (playing && videoUrl) {
    return (
      <div id={id} style={{
        position: 'relative', width: '100%', paddingTop: '56.25%',
        borderRadius: 'var(--radius-xl, 16px)', overflow: 'hidden',
        background: '#000',
      }}>
        <iframe
          src={videoUrl}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div
      id={id}
      onClick={() => videoUrl ? setPlaying(true) : undefined}
      style={{
        position: 'relative', width: '100%', paddingTop: '56.25%',
        borderRadius: 'var(--radius-xl, 16px)', overflow: 'hidden',
        background: thumbnailSrc
          ? `url(${thumbnailSrc}) center/cover no-repeat`
          : 'linear-gradient(135deg, #1e1b4b, #312e81)',
        cursor: videoUrl ? 'pointer' : 'default',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 12,
        background: thumbnailSrc ? 'rgba(0,0,0,0.4)' : 'transparent',
      }}>
        {/* Play button */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          border: '2px solid rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <polygon points="6,3 20,12 6,21" />
          </svg>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>
            {title}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  );
}
