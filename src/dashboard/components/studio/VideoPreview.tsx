'use client';

import { useState, useEffect, useRef } from 'react';

interface VideoPreviewProps {
  videoId: string | null;
  resultUrl: string | null;
  token: string;
  onComplete?: (url: string) => void;
}

export default function VideoPreview({ videoId, resultUrl, token, onComplete }: VideoPreviewProps) {
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(resultUrl);
  const [progress, setProgress] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!videoId || resultUrl) return;

    setStatus('processing');
    setProgress(0);

    // Poll D-ID for video status
    pollRef.current = setInterval(async () => {
      try {
        setProgress(prev => Math.min(prev + 5, 90));
        const res = await fetch('/api/video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'status', talkId: videoId, token }),
        });
        const data = await res.json();

        if (data.status === 'done' && data.result_url) {
          setVideoUrl(data.result_url);
          setStatus('done');
          setProgress(100);
          onComplete?.(data.result_url);
          if (pollRef.current) clearInterval(pollRef.current);
        } else if (data.status === 'error') {
          setStatus('error');
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        // Keep polling
      }
    }, 3000);

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [videoId, resultUrl, token, onComplete]);

  if (status === 'idle' && !videoUrl) {
    return (
      <div style={{
        padding: 40, textAlign: 'center', border: '2px dashed #e5e7eb',
        borderRadius: 12, color: '#9B9B9B', fontSize: 13,
      }}>
        La video apparaitra ici apres generation
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div style={{
        padding: 40, textAlign: 'center', border: '2px dashed #1A1A1A',
        borderRadius: 12, background: '#F7F7F7',
      }}>
        <div style={{ fontSize: 28, marginBottom: 12 }}><span className="material-symbols-rounded" style={{ fontSize: 28 }}>movie</span></div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f', marginBottom: 8 }}>
          Generation en cours...
        </div>
        <div style={{
          width: '60%', height: 6, borderRadius: 3, background: '#e5e7eb',
          margin: '0 auto', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 3, background: '#1A1A1A',
            width: `${progress}%`, transition: 'width 0.5s',
          }} />
        </div>
        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 8 }}>
          D-ID traite votre video... (30s a 2min)
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{
        padding: 20, textAlign: 'center', border: '1px solid #fecaca',
        borderRadius: 12, background: '#fef2f2', color: '#dc2626', fontSize: 13,
      }}>
        Erreur lors de la generation. Veuillez reessayer.
      </div>
    );
  }

  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', background: '#000' }}>
      <video
        controls
        src={videoUrl ?? undefined}
        style={{ width: '100%', maxHeight: 400, display: 'block' }}
      />
      {videoUrl && (
        <div style={{ padding: 10, display: 'flex', justifyContent: 'center' }}>
          <a
            href={videoUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 20px', borderRadius: 8, background: '#1A1A1A',
              color: 'white', fontSize: 12, fontWeight: 600, textDecoration: 'none',
            }}
          >
            Telecharger la video
          </a>
        </div>
      )}
    </div>
  );
}
