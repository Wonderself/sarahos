'use client';

import { useState, useEffect, useCallback } from 'react';

interface PhotoPreviewProps {
  generationId: string | null;
  onComplete?: (imageUrl: string) => void;
}

export default function PhotoPreview({ generationId, onComplete }: PhotoPreviewProps) {
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const pollStatus = useCallback(async (id: string) => {
    try {
      const res = await fetch('/api/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status', generationId: id }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.status === 'completed' || data.output?.length > 0 || data.image_url) {
        const url = data.image_url || data.output?.[0]?.url || data.output?.[0] || '';
        setImageUrl(url);
        setStatus('completed');
        onComplete?.(url);
        return true;
      }
      if (data.status === 'failed' || data.status === 'error') {
        setErrorMsg(data.error || 'Generation echouee');
        setStatus('error');
        return true;
      }
      setProgress(p => Math.min(p + 5, 90));
      return false;
    } catch {
      return false;
    }
  }, [onComplete]);

  useEffect(() => {
    if (!generationId) { setStatus('idle'); return; }
    setStatus('processing');
    setProgress(10);
    setImageUrl(null);
    setErrorMsg('');

    const interval = setInterval(async () => {
      const done = await pollStatus(generationId);
      if (done) clearInterval(interval);
    }, 3000);

    // Timeout after 3 min
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (status === 'processing') {
        setStatus('error');
        setErrorMsg('Timeout — la generation prend trop de temps. Reessayez.');
      }
    }, 180000);

    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [generationId, pollStatus, status]);

  if (status === 'idle') {
    return (
      <div style={{
        height: 300, borderRadius: 12, border: '2px dashed #e5e7eb',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#94a3b8', fontSize: 13,
      }}>
        L&apos;image generee apparaitra ici
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div style={{
        height: 300, borderRadius: 12, border: '1px solid #e5e7eb', background: '#f8fafc',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid #e5e7eb', borderTopColor: '#8b5cf6',
          animation: 'spin 1s linear infinite',
        }} />
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f' }}>Generation en cours...</div>
        <div style={{ width: '60%', height: 4, borderRadius: 2, background: '#e5e7eb', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#8b5cf6', width: `${progress}%`, transition: 'width 0.5s' }} />
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>Cela peut prendre 15-60 secondes</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{
        height: 300, borderRadius: 12, border: '1px solid #fca5a5', background: '#fef2f2',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 28 }}>😞</span>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#991b1b' }}>Erreur de generation</div>
        <div style={{ fontSize: 11, color: '#b91c1c' }}>{errorMsg}</div>
      </div>
    );
  }

  // Completed
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {imageUrl && (
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <img
            src={imageUrl}
            alt="Generated"
            style={{ width: '100%', display: 'block' }}
          />
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        {imageUrl && (
          <a
            href={imageUrl}
            download={`fz-photo-${Date.now()}.png`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1, padding: '10px 16px', borderRadius: 8, border: 'none',
              background: '#8b5cf6', color: 'white', fontSize: 13, fontWeight: 600,
              textAlign: 'center', textDecoration: 'none', cursor: 'pointer',
            }}
          >
            Telecharger
          </a>
        )}
        <button
          onClick={() => {
            setStatus('idle');
            setImageUrl(null);
          }}
          style={{
            padding: '10px 16px', borderRadius: 8, border: '1px solid #e5e7eb',
            background: 'white', color: '#1d1d1f', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Nouvelle generation
        </button>
      </div>
    </div>
  );
}
