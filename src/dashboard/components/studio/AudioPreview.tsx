'use client';

import { useState, useEffect } from 'react';

interface AudioPreviewProps {
  text: string;
  token: string;
  onSelect?: (provider: string) => void;
  defaultGender?: 'male' | 'female';
}

export default function AudioPreview({ text, token, onSelect, defaultGender }: AudioPreviewProps) {
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('deepgram');
  const [elevenLabsStatus, setElevenLabsStatus] = useState<'active' | 'fallback' | 'loading'>('loading');

  useEffect(() => {
    fetch('/api/voice/elevenlabs')
      .then(r => r.json())
      .then(d => setElevenLabsStatus(d.configured ? 'active' : 'fallback'))
      .catch(() => setElevenLabsStatus('fallback'));
  }, []);

  const preview = async (provider: string) => {
    if (!text.trim()) return;
    setLoading(true);
    setSelectedProvider(provider);
    try {
      const previewText = text.length > 200 ? text.slice(0, 200) + '...' : text;
      const endpoint = provider === 'elevenlabs' ? '/api/voice/elevenlabs' : '/api/voice/tts';
      const body: Record<string, string> = { text: previewText };
      if (defaultGender) body.gender = defaultGender;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('TTS failed');

      const blob = await res.blob();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(URL.createObjectURL(blob));
      onSelect?.(provider);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  const elLabel = elevenLabsStatus === 'active' ? 'ElevenLabs' : 'ElevenLabs';
  const elSub = elevenLabsStatus === 'active' ? '~2 credits — Premium' : '~0.5 credits — via Deepgram';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => preview('deepgram')}
          disabled={loading || !text.trim()}
          style={{
            flex: 1, padding: '10px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            border: `2px solid ${selectedProvider === 'deepgram' ? '#1A1A1A' : '#e5e7eb'}`,
            background: selectedProvider === 'deepgram' ? '#F7F7F7' : 'white',
            cursor: loading ? 'wait' : 'pointer', color: '#1d1d1f',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            Deepgram TTS
            <span style={{
              fontSize: 9, padding: '1px 5px', borderRadius: 4,
              background: '#E5E5E5', color: '#1A1A1A', fontWeight: 700,
            }}>Standard</span>
          </div>
          <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 400, marginTop: 2 }}>~0.5 credits</div>
        </button>
        <button
          onClick={() => preview('elevenlabs')}
          disabled={loading || !text.trim()}
          style={{
            flex: 1, padding: '10px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            border: `2px solid ${selectedProvider === 'elevenlabs' ? '#1A1A1A' : '#e5e7eb'}`,
            background: selectedProvider === 'elevenlabs' ? '#F7F7F7' : 'white',
            cursor: loading ? 'wait' : 'pointer', color: '#1d1d1f',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            {elLabel}
            <span style={{
              fontSize: 9, padding: '1px 5px', borderRadius: 4,
              background: '#E5E5E5', color: '#1A1A1A', fontWeight: 700,
            }}>Premium</span>
          </div>
          <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 400, marginTop: 2 }}>{elSub}</div>
        </button>
      </div>

      {loading && <div style={{ fontSize: 12, color: '#1A1A1A', textAlign: 'center' }}>Generation audio...</div>}

      {audioUrl && (
        <audio controls src={audioUrl} style={{ width: '100%', height: 36 }} />
      )}
    </div>
  );
}
