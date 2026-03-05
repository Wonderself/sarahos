'use client';

import { useState, useEffect, useCallback } from 'react';

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

// ── Helpers ──────────────────────────────────────────────────────────────────
function loadGallery(): GalleryItem[] {
  try { return JSON.parse(localStorage.getItem(GALLERY_KEY) ?? '[]') as GalleryItem[]; }
  catch { return []; }
}

function saveGallery(items: GalleryItem[]) {
  localStorage.setItem(GALLERY_KEY, JSON.stringify(items));
}

// ── Component ────────────────────────────────────────────────────────────────
export default function AdminMyStudioPage() {
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

  // Gallery
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  useEffect(() => { setGallery(loadGallery()); }, []);

  const addToGallery = useCallback((item: Omit<GalleryItem, 'id' | 'createdAt'>) => {
    const entry: GalleryItem = {
      ...item,
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    setGallery(prev => {
      const next = [entry, ...prev];
      saveGallery(next);
      return next;
    });
  }, []);

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
    if (!videoId || videoStatus === 'done' || videoStatus === 'error') return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/video?id=${videoId}`);
        const data = await res.json();
        setVideoStatus(data.status);
        if (data.status === 'done' && data.resultUrl) {
          setVideoResult(data.resultUrl);
          addToGallery({ type: 'video', prompt: videoPrompt, url: data.resultUrl });
          clearInterval(interval);
        } else if (data.status === 'error') {
          setVideoError('La generation video a echoue.');
          clearInterval(interval);
        }
      } catch { /* retry on next tick */ }
    }, 4000);
    return () => clearInterval(interval);
  }, [videoId, videoStatus, videoPrompt, addToGallery]);

  const clearGallery = () => {
    setGallery([]);
    localStorage.removeItem(GALLERY_KEY);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 space-y-6 admin-page-scrollable">
      <h1 className="text-2xl font-bold">Mon Studio Creatif</h1>
      <p className="text-gray-400 text-sm">Generez des photos et videos avec l&apos;IA directement depuis l&apos;admin.</p>

      {/* Mode switcher */}
      <div className="flex gap-2">
        {(['photo', 'video'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-5 py-2 rounded-lg font-medium transition ${
              mode === m ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {m === 'photo' ? 'Photo' : 'Video'}
          </button>
        ))}
      </div>

      {/* ── Photo Mode ─────────────────────────────────────────────────────── */}
      {mode === 'photo' && (
        <div className="bg-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Generation Photo</h2>

          <textarea
            value={photoPrompt}
            onChange={e => setPhotoPrompt(e.target.value)}
            placeholder="Decrivez l'image que vous souhaitez generer..."
            rows={3}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Style */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Style</label>
              <select
                value={photoStyle}
                onChange={e => setPhotoStyle(e.target.value as PhotoStyle)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm"
              >
                {STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Format</label>
              <div className="flex gap-2">
                {ASPECT_RATIOS.map(a => (
                  <button
                    key={a.value}
                    onClick={() => setAspectRatio(a.value)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                      aspectRatio === a.value ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* HD Toggle */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Qualite</label>
              <button
                onClick={() => setHd(!hd)}
                className={`px-4 py-1.5 rounded text-xs font-medium transition ${
                  hd ? 'bg-amber-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {hd ? 'HD Active (Flux Dev)' : 'Standard (Flux Schnell)'}
              </button>
            </div>
          </div>

          <button
            onClick={generatePhoto}
            disabled={photoLoading || !photoPrompt.trim()}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition"
          >
            {photoLoading ? 'Generation en cours...' : 'Generer la photo'}
          </button>

          {photoError && <p className="text-red-400 text-sm">{photoError}</p>}

          {photoResult && (
            <div className="mt-4">
              <img src={photoResult} alt={photoPrompt} className="max-w-md rounded-lg border border-gray-700" />
            </div>
          )}
        </div>
      )}

      {/* ── Video Mode ─────────────────────────────────────────────────────── */}
      {mode === 'video' && (
        <div className="bg-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Generation Video</h2>

          <textarea
            value={videoPrompt}
            onChange={e => setVideoPrompt(e.target.value)}
            placeholder="Decrivez la video que vous souhaitez generer..."
            rows={3}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
          />

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Duree</label>
            <div className="flex gap-2">
              {DURATIONS.map(d => (
                <button
                  key={d.value}
                  onClick={() => setVideoDuration(d.value)}
                  className={`px-4 py-1.5 rounded text-xs font-medium transition ${
                    videoDuration === d.value ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generateVideo}
            disabled={videoLoading || !videoPrompt.trim()}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition"
          >
            {videoLoading ? 'Lancement...' : 'Generer la video'}
          </button>

          {videoError && <p className="text-red-400 text-sm">{videoError}</p>}

          {videoStatus && (
            <div className="flex items-center gap-3 mt-2">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                videoStatus === 'done' ? 'bg-green-500' : videoStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
              }`} />
              <span className="text-sm text-gray-300">
                {videoStatus === 'queued' && 'En file d\'attente...'}
                {videoStatus === 'processing' && 'Generation en cours...'}
                {videoStatus === 'done' && 'Video terminee !'}
                {videoStatus === 'error' && 'Erreur de generation'}
              </span>
            </div>
          )}

          {videoResult && (
            <div className="mt-4">
              <video src={videoResult} controls className="max-w-md rounded-lg border border-gray-700" />
            </div>
          )}
        </div>
      )}

      {/* ── Gallery ────────────────────────────────────────────────────────── */}
      <div className="bg-gray-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Galerie ({gallery.length})</h2>
          {gallery.length > 0 && (
            <button onClick={clearGallery} className="text-xs text-red-400 hover:text-red-300">
              Vider la galerie
            </button>
          )}
        </div>

        {gallery.length === 0 && (
          <p className="text-gray-500 text-sm">Aucune creation pour le moment. Generez votre premiere image ou video !</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.map(item => (
            <div key={item.id} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 group">
              {item.type === 'photo' ? (
                <img src={item.url} alt={item.prompt} className="w-full h-40 object-cover" />
              ) : (
                <video src={item.url} className="w-full h-40 object-cover" muted />
              )}
              <div className="p-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  item.type === 'photo' ? 'bg-blue-900/50 text-blue-300' : 'bg-purple-900/50 text-purple-300'
                }`}>
                  {item.type === 'photo' ? 'Photo' : 'Video'}
                </span>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.prompt}</p>
                <p className="text-[10px] text-gray-600 mt-1">
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
