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
  title = 'Decouvrez Freenzy en action',
  subtitle = 'Video a venir',
  thumbnailSrc,
  videoUrl,
}: VideoPlaceholderProps) {
  const [playing, setPlaying] = useState(false);

  const isSafeUrl = (url: string) => /^https?:\/\//i.test(url);

  if (playing && videoUrl && isSafeUrl(videoUrl)) {
    return (
      <div id={id} style={{
        position: 'relative', width: '100%', paddingTop: '56.25%',
        borderRadius: 20, overflow: 'hidden',
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
      onClick={() => videoUrl && isSafeUrl(videoUrl) ? setPlaying(true) : undefined}
      style={{
        position: 'relative', width: '100%', paddingTop: '56.25%',
        borderRadius: 20, overflow: 'hidden',
        background: thumbnailSrc
          ? `url(${thumbnailSrc}) center/cover no-repeat`
          : 'linear-gradient(135deg, #111827, #1f2937)',
        cursor: videoUrl ? 'pointer' : 'default',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 14,
        background: thumbnailSrc ? 'rgba(0,0,0,0.35)' : 'transparent',
      }}>
        {/* Play button */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          border: '1.5px solid rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <polygon points="6,3 20,12 6,21" />
          </svg>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#fff', fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>
            {title}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  );
}
