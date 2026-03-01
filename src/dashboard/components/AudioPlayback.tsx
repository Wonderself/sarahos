'use client';

import { useState, useRef } from 'react';
import type { AgentGender } from '../lib/agent-config';

interface AudioPlaybackProps {
  text: string;
  gender?: AgentGender;
  size?: 'sm' | 'md';
}

export default function AudioPlayback({ text, gender = 'F', size = 'sm' }: AudioPlaybackProps) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const iconSize = size === 'sm' ? 14 : 18;
  const btnSize = size === 'sm' ? 28 : 36;

  async function handlePlay() {
    setError('');

    // If already playing, pause
    if (playing && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }

    // If we already have the audio cached, replay
    if (blobUrlRef.current) {
      playAudio(blobUrlRef.current);
      return;
    }

    // Fetch audio from TTS
    setLoading(true);
    try {
      const res = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 2000), gender }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'TTS error' }));
        setError(data.error || 'Erreur audio');
        setLoading(false);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      playAudio(url);
    } catch {
      setError('Erreur audio');
    } finally {
      setLoading(false);
    }
  }

  function playAudio(url: string) {
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => setPlaying(false);
    audio.onerror = () => { setPlaying(false); setError('Lecture impossible'); };
    audio.play();
    setPlaying(true);
  }

  if (!text || text.length < 10) return null;

  return (
    <button
      type="button"
      onClick={handlePlay}
      disabled={loading}
      title={playing ? 'Pause' : loading ? 'Chargement audio...' : 'Ecouter'}
      style={{
        width: btnSize, height: btnSize, borderRadius: '50%', border: 'none',
        cursor: loading ? 'default' : 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: playing ? '#6366f122' : 'transparent',
        color: playing ? '#6366f1' : error ? '#ef4444' : 'var(--text-muted)',
        transition: 'all 0.2s ease',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {loading ? (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
          </circle>
        </svg>
      ) : playing ? (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
    </button>
  );
}
