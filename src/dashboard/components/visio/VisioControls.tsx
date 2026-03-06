'use client';

import { useState, useEffect } from 'react';

interface VisioControlsProps {
  isMuted: boolean;
  onToggleMute: () => void;
  isTextMode: boolean;
  onToggleMode: () => void;
  onHangup: () => void;
  audioLevel?: number; // 0-100
  startTime: number; // Date.now()
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

export default function VisioControls({
  isMuted, onToggleMute, isTextMode, onToggleMode, onHangup, audioLevel = 0, startTime,
}: VisioControlsProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsed(Date.now() - startTime), 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
      padding: '12px 20px', background: '#1a1a2e', borderRadius: 16,
    }}>
      {/* Duration */}
      <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums', minWidth: 60 }}>
        {formatDuration(elapsed)}
      </div>

      {/* Audio level meter */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 20, minWidth: 40 }}>
        {[0, 1, 2, 3, 4].map(i => {
          const threshold = (i + 1) * 20;
          const active = !isMuted && audioLevel >= threshold;
          return (
            <div key={i} style={{
              width: 4, height: 6 + i * 3, borderRadius: 2,
              background: active ? (i < 3 ? '#22c55e' : i < 4 ? '#eab308' : '#ef4444') : '#334155',
              transition: 'background 0.1s',
            }} />
          );
        })}
      </div>

      {/* Mute */}
      <button
        onClick={onToggleMute}
        style={{
          width: 44, height: 44, borderRadius: '50%', border: 'none',
          background: isMuted ? '#ef4444' : '#334155', color: 'white',
          cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
        }}
        title={isMuted ? 'Activer le micro' : 'Couper le micro'}
      >
        <span className="material-symbols-rounded" style={{ fontSize: 18 }}>{isMuted ? 'volume_off' : 'mic'}</span>
      </button>

      {/* Mode toggle */}
      <button
        onClick={onToggleMode}
        style={{
          width: 44, height: 44, borderRadius: '50%', border: 'none',
          background: isTextMode ? '#5b6cf7' : '#334155', color: 'white',
          cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
        }}
        title={isTextMode ? 'Mode voix' : 'Mode texte'}
      >
        <span className="material-symbols-rounded" style={{ fontSize: 18 }}>{isTextMode ? 'keyboard' : 'forum'}</span>
      </button>

      {/* Hangup */}
      <button
        onClick={onHangup}
        style={{
          width: 56, height: 44, borderRadius: 22, border: 'none',
          background: '#ef4444', color: 'white', cursor: 'pointer',
          fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, transition: 'background 0.2s',
        }}
        title="Raccrocher"
      >
        <span className="material-symbols-rounded" style={{ fontSize: 18 }}>call</span>
      </button>
    </div>
  );
}
