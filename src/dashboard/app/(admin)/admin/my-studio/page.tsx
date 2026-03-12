'use client';

import { useState, useCallback, useEffect } from 'react';
import { useUserData } from '../../../../lib/use-user-data';
import { useIsMobile } from '../../../../lib/use-media-query';

// ── Auth helper ──────────────────────────────────────────────────────────────
function getToken(): string {
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}').token ?? ''; }
  catch { return ''; }
}

// ── Types ────────────────────────────────────────────────────────────────────
interface GalleryItem {
  id: string;
  type: 'photo' | 'video';
  prompt: string;
  url: string;
  createdAt: string;
}

type PhotoStyle = 'realistic' | 'artistic' | 'anime' | 'cinematic' | 'minimalist';
type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3';
type VideoDuration = '5s' | '10s' | '15s';

const STYLES: { value: PhotoStyle; label: string }[] = [
  { value: 'realistic', label: 'Realiste' },
  { value: 'artistic', label: 'Artistique' },
  { value: 'anime', label: 'Anime' },
  { value: 'cinematic', label: 'Cinematique' },
  { value: 'minimalist', label: 'Minimaliste' },
];

const ASPECT_RATIOS: { value: AspectRatio; label: string; dimensions: string }[] = [
  { value: '1:1', label: '1:1', dimensions: 'square' },
  { value: '16:9', label: '16:9', dimensions: 'landscape' },
  { value: '9:16', label: '9:16', dimensions: 'portrait' },
  { value: '4:3', label: '4:3', dimensions: 'landscape' },
];

const DURATIONS: { value: VideoDuration; label: string }[] = [
  { value: '5s', label: '5 secondes' },
  { value: '10s', label: '10 secondes' },
  { value: '15s', label: '15 secondes' },
];

const GALLERY_KEY = 'fz_admin_studio_gallery';

// ── Component ────────────────────────────────────────────────────────────────
export default function AdminMyStudioPage() {
  const isMobile = useIsMobile();
  const [mode, setMode] = useState<'photo' | 'video'>('photo');

  // Photo state
  const [photoPrompt, setPhotoPrompt] = useState('');
  const [photoStyle, setPhotoStyle] = useState<PhotoStyle>('realistic');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [hd, setHd] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoResult, setPhotoResult] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState('');

  // Video state
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoDuration, setVideoDuration] = useState<VideoDuration>('5s');
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoStatus, setVideoStatus] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const [videoError, setVideoError] = useState('');

  // Gallery (synced to backend via useUserData)
  const { data: gallery, setData: setGallery } = useUserData<GalleryItem[]>('admin_studio_gallery', [], GALLERY_KEY);

  const addToGallery = useCallback((item: Omit<GalleryItem, 'id' | 'createdAt'>) => {
    const entry: GalleryItem = {
      ...item,
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    setGallery(prev => [entry, ...prev]);
  }, [setGallery]);

  // ── Photo generation ─────────────────────────────────────────────────────
  const generatePhoto = async () => {
    if (!photoPrompt.trim()) return;
    setPhotoLoading(true);
    setPhotoError('');
    setPhotoResult(null);
    try {
      const dims = ASPECT_RATIOS.find(a => a.value === aspectRatio)?.dimensions ?? 'square';
      const res = await fetch('/api/photo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: photoPrompt, style: photoStyle, dimensions: dims, hd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Erreur ${res.status}`);
      setPhotoResult(data.imageUrl);
      addToGallery({ type: 'photo', prompt: photoPrompt, url: data.imageUrl });
    } catch (e) {
      setPhotoError(e instanceof Error ? e.message : 'Erreur generation photo');
    } finally {
      setPhotoLoading(false);
    }
  };

  // ── Video generation ─────────────────────────────────────────────────────
  const generateVideo = async () => {
    if (!videoPrompt.trim()) return;
    setVideoLoading(true);
    setVideoError('');
    setVideoStatus('queued');
    setVideoResult(null);
    setVideoId(null);
    try {
      const res = await fetch('/api/video', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: videoPrompt, duration: videoDuration }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Erreur ${res.status}`);
      setVideoId(data.id);
      setVideoStatus(data.status ?? 'processing');
    } catch (e) {
      setVideoError(e instanceof Error ? e.message : 'Erreur generation video');
      setVideoStatus(null);
    } finally {
      setVideoLoading(false);
    }
  };

  // ── Video polling ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!videoId) return;
    let stopped = false;
    const interval = setInterval(async () => {
      if (stopped) return;
      try {
        const res = await fetch(`/api/video?id=${videoId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (stopped) return;
        setVideoStatus(data.status);
        if (data.status === 'done' && data.resultUrl) {
          stopped = true;
          setVideoResult(data.resultUrl);
          addToGallery({ type: 'video', prompt: videoPrompt, url: data.resultUrl });
          clearInterval(interval);
        } else if (data.status === 'error') {
          stopped = true;
          setVideoError('La generation video a echoue.');
          clearInterval(interval);
        }
      } catch { /* retry on next tick */ }
    }, 4000);
    return () => { stopped = true; clearInterval(interval); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  const clearGallery = () => {
    if (!confirm('Vider toute la galerie ? Cette action est irreversible.')) return;
    setGallery([]);
  };

  const pad = isMobile ? 16 : 24;
  const cardStyle = { background: '#FFFFFF', borderRadius: 8, padding: pad, border: '1px solid rgba(0,0,0,0.08)' as const };
  const btnBase = { border: 'none', cursor: 'pointer', borderRadius: 8, fontWeight: 500 as const, fontSize: 14, minHeight: 44 };
  const inputStyle = {
    width: '100%', background: '#F7F7F7', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8,
    padding: 12, fontSize: 14, color: '#1A1A1A', outline: 'none', resize: 'none' as const,
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', color: '#1A1A1A', padding: pad }} className="admin-page-scrollable">
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Mon Studio Creatif</h1>
      <p style={{ color: '#9B9B9B', fontSize: 14, marginBottom: 24 }}>Generez des photos et videos avec l&apos;IA directement depuis l&apos;admin.</p>

      {/* Mode switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {(['photo', 'video'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              ...btnBase, padding: '8px 20px',
              background: mode === m ? '#1A1A1A' : '#F7F7F7',
              color: mode === m ? '#fff' : '#9B9B9B',
            }}
          >
            {m === 'photo' ? 'Photo' : 'Video'}
          </button>
        ))}
      </div>

      {/* ── Photo Mode ─────────────────────────────────────────────────────── */}
      {mode === 'photo' && (
        <div style={{ ...cardStyle, marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Generation Photo</h2>

          <textarea
            value={photoPrompt}
            onChange={e => setPhotoPrompt(e.target.value)}
            placeholder="Decrivez l'image que vous souhaitez generer..."
            rows={3}
            style={{ ...inputStyle, marginBottom: 16 }}
          />

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 16, marginBottom: 16,
          }}>
            {/* Style */}
            <div>
              <label style={{ fontSize: 12, color: '#9B9B9B', marginBottom: 4, display: 'block' }}>Style</label>
              <select
                value={photoStyle}
                onChange={e => setPhotoStyle(e.target.value as PhotoStyle)}
                style={{ ...inputStyle, padding: 8 }}
              >
                {STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label style={{ fontSize: 12, color: '#9B9B9B', marginBottom: 4, display: 'block' }}>Format</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ASPECT_RATIOS.map(a => (
                  <button
                    key={a.value}
                    onClick={() => setAspectRatio(a.value)}
                    style={{
                      ...btnBase, padding: '6px 12px', fontSize: 12,
                      background: aspectRatio === a.value ? '#1A1A1A' : 'rgba(0,0,0,0.04)',
                      color: aspectRatio === a.value ? '#fff' : '#1A1A1A',
                    }}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* HD Toggle */}
            <div>
              <label style={{ fontSize: 12, color: '#9B9B9B', marginBottom: 4, display: 'block' }}>Qualite</label>
              <button
                onClick={() => setHd(!hd)}
                style={{
                  ...btnBase, padding: '6px 16px', fontSize: 12,
                  background: hd ? '#9B9B9B' : 'rgba(0,0,0,0.04)',
                  color: hd ? '#fff' : '#1A1A1A',
                }}
              >
                {hd ? 'HD Active (Flux Dev)' : 'Standard (Flux Schnell)'}
              </button>
            </div>
          </div>

          <button
            onClick={generatePhoto}
            disabled={photoLoading || !photoPrompt.trim()}
            style={{
              ...btnBase, padding: '10px 24px',
              background: (photoLoading || !photoPrompt.trim()) ? 'rgba(0,0,0,0.04)' : '#1A1A1A',
              color: (photoLoading || !photoPrompt.trim()) ? '#9B9B9B' : '#fff',
            }}
          >
            {photoLoading ? 'Generation en cours...' : 'Generer la photo'}
          </button>

          {photoError && <p style={{ color: '#DC2626', fontSize: 14, marginTop: 12 }}>{photoError}</p>}

          {photoResult && (
            <div style={{ marginTop: 16 }}>
              <img src={photoResult} alt={photoPrompt} style={{ maxWidth: isMobile ? '100%' : 400, borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)' }} />
            </div>
          )}
        </div>
      )}

      {/* ── Video Mode ─────────────────────────────────────────────────────── */}
      {mode === 'video' && (
        <div style={{ ...cardStyle, marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Generation Video</h2>

          <textarea
            value={videoPrompt}
            onChange={e => setVideoPrompt(e.target.value)}
            placeholder="Decrivez la video que vous souhaitez generer..."
            rows={3}
            style={{ ...inputStyle, marginBottom: 16 }}
          />

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: '#9B9B9B', marginBottom: 4, display: 'block' }}>Duree</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {DURATIONS.map(d => (
                <button
                  key={d.value}
                  onClick={() => setVideoDuration(d.value)}
                  style={{
                    ...btnBase, padding: '6px 16px', fontSize: 12,
                    background: videoDuration === d.value ? '#1A1A1A' : 'rgba(0,0,0,0.04)',
                    color: videoDuration === d.value ? '#fff' : '#1A1A1A',
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generateVideo}
            disabled={videoLoading || !videoPrompt.trim()}
            style={{
              ...btnBase, padding: '10px 24px',
              background: (videoLoading || !videoPrompt.trim()) ? 'rgba(0,0,0,0.04)' : '#1A1A1A',
              color: (videoLoading || !videoPrompt.trim()) ? '#9B9B9B' : '#fff',
            }}
          >
            {videoLoading ? 'Lancement...' : 'Generer la video'}
          </button>

          {videoError && <p style={{ color: '#DC2626', fontSize: 14, marginTop: 12 }}>{videoError}</p>}

          {videoStatus && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <span style={{
                display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
                background: videoStatus === 'done' ? '#1A1A1A' : videoStatus === 'error' ? '#DC2626' : '#9B9B9B',
              }} />
              <span style={{ fontSize: 14, color: '#1A1A1A' }}>
                {videoStatus === 'queued' && 'En file d\'attente...'}
                {videoStatus === 'processing' && 'Generation en cours...'}
                {videoStatus === 'done' && 'Video terminee !'}
                {videoStatus === 'error' && 'Erreur de generation'}
              </span>
            </div>
          )}

          {videoResult && (
            <div style={{ marginTop: 16 }}>
              <video src={videoResult} controls style={{ maxWidth: isMobile ? '100%' : 400, borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)' }} />
            </div>
          )}
        </div>
      )}

      {/* ── Gallery ────────────────────────────────────────────────────────── */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Galerie ({gallery.length})</h2>
          {gallery.length > 0 && (
            <button onClick={clearGallery} style={{ fontSize: 12, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', minHeight: 44, padding: '8px 12px' }}>
              Vider la galerie
            </button>
          )}
        </div>

        {gallery.length === 0 && (
          <p style={{ color: '#9B9B9B', fontSize: 14 }}>Aucune creation pour le moment. Generez votre premiere image ou video !</p>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: 16,
        }}>
          {gallery.map(item => (
            <div key={item.id} style={{ background: '#F7F7F7', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
              {item.type === 'photo' ? (
                <img src={item.url} alt={item.prompt} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
              ) : (
                <video src={item.url} style={{ width: '100%', height: 160, objectFit: 'cover' }} muted />
              )}
              <div style={{ padding: 8 }}>
                <span style={{
                  fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 500,
                  background: 'rgba(0,0,0,0.04)',
                  color: '#1A1A1A',
                }}>
                  {item.type === 'photo' ? 'Photo' : 'Video'}
                </span>
                <p style={{ fontSize: 12, color: '#9B9B9B', marginTop: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.prompt}</p>
                <p style={{ fontSize: 10, color: '#9B9B9B', marginTop: 4 }}>
                  {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
