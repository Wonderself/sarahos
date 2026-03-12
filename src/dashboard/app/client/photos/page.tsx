'use client';

import { useState, useEffect, useCallback } from 'react';
import PageExplanation from '@/components/PageExplanation';
import { useIsMobile } from '@/lib/use-media-query';
import { PAGE_META } from '@/lib/emoji-map';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PhotoItem {
  id: string;
  title: string;
  photographer: string;
  width: number;
  height: number;
  category: string;
  gradient: string;
  favorite: boolean;
  createdAt: string;
}

interface PhotoCollection {
  id: string;
  name: string;
  photoIds: string[];
  createdAt: string;
}

interface PhotoStore {
  photos: PhotoItem[];
  collections: PhotoCollection[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'fz_photos';

const CATEGORIES = ['Tout', 'Business', 'Nature', 'Technologie', 'Personnes', 'Architecture', 'Nourriture', 'Voyage', 'Abstract'] as const;

const FILTERS = ['Populaire', 'Récent', 'Par couleur'] as const;

const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
  'linear-gradient(135deg, #f5576c 0%, #ff6a88 100%)',
  'linear-gradient(135deg, #667eea 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
  'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)',
  'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)',
  'linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%)',
  'linear-gradient(135deg, #feada6 0%, #f5efef 100%)',
  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  'linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)',
  'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)',
];

const DEMO_PHOTOS: PhotoItem[] = [
  { id: 'p1', title: 'Sunset Over Ocean', photographer: 'Marie Dupont', width: 4000, height: 2667, category: 'Nature', gradient: GRADIENTS[0], favorite: false, createdAt: '2026-03-01' },
  { id: 'p2', title: 'Modern Office Space', photographer: 'Jean Martin', width: 5000, height: 3333, category: 'Business', gradient: GRADIENTS[1], favorite: true, createdAt: '2026-03-02' },
  { id: 'p3', title: 'Code on Screen', photographer: 'Alex Chen', width: 3840, height: 2160, category: 'Technologie', gradient: GRADIENTS[2], favorite: false, createdAt: '2026-03-03' },
  { id: 'p4', title: 'Mountain Lake Reflection', photographer: 'Sophie Bernard', width: 6000, height: 4000, category: 'Nature', gradient: GRADIENTS[3], favorite: false, createdAt: '2026-03-01' },
  { id: 'p5', title: 'Team Brainstorming', photographer: 'Lucas Petit', width: 4500, height: 3000, category: 'Personnes', gradient: GRADIENTS[4], favorite: false, createdAt: '2026-03-04' },
  { id: 'p6', title: 'Glass Skyscraper', photographer: 'Emma Roux', width: 3000, height: 4500, category: 'Architecture', gradient: GRADIENTS[5], favorite: false, createdAt: '2026-03-02' },
  { id: 'p7', title: 'Gourmet Pasta Dish', photographer: 'Pierre Leroy', width: 4000, height: 4000, category: 'Nourriture', gradient: GRADIENTS[6], favorite: false, createdAt: '2026-03-05' },
  { id: 'p8', title: 'Paris Eiffel Tower', photographer: 'Claire Moreau', width: 3200, height: 4800, category: 'Voyage', gradient: GRADIENTS[7], favorite: true, createdAt: '2026-03-01' },
  { id: 'p9', title: 'Abstract Fluid Art', photographer: 'Hugo Laurent', width: 4000, height: 4000, category: 'Abstract', gradient: GRADIENTS[8], favorite: false, createdAt: '2026-03-06' },
  { id: 'p10', title: 'Startup Workspace', photographer: 'Camille Simon', width: 5200, height: 3467, category: 'Business', gradient: GRADIENTS[9], favorite: false, createdAt: '2026-03-03' },
  { id: 'p11', title: 'Forest Path Autumn', photographer: 'Thomas Garcia', width: 4800, height: 3200, category: 'Nature', gradient: GRADIENTS[10], favorite: false, createdAt: '2026-03-04' },
  { id: 'p12', title: 'Robot AI Concept', photographer: 'Julie Michel', width: 3600, height: 2400, category: 'Technologie', gradient: GRADIENTS[11], favorite: false, createdAt: '2026-03-05' },
  { id: 'p13', title: 'Portrait Professional', photographer: 'Nicolas Blanc', width: 3000, height: 4000, category: 'Personnes', gradient: GRADIENTS[12], favorite: false, createdAt: '2026-03-02' },
  { id: 'p14', title: 'Brutalist Building', photographer: 'Lea Fournier', width: 4200, height: 2800, category: 'Architecture', gradient: GRADIENTS[13], favorite: false, createdAt: '2026-03-06' },
  { id: 'p15', title: 'Colorful Macarons', photographer: 'Antoine Girard', width: 4000, height: 3000, category: 'Nourriture', gradient: GRADIENTS[14], favorite: false, createdAt: '2026-03-03' },
  { id: 'p16', title: 'Tokyo Night Streets', photographer: 'Manon Andre', width: 5000, height: 3333, category: 'Voyage', gradient: GRADIENTS[15], favorite: false, createdAt: '2026-03-04' },
  { id: 'p17', title: 'Geometric Patterns', photographer: 'Romain David', width: 4000, height: 4000, category: 'Abstract', gradient: GRADIENTS[16], favorite: false, createdAt: '2026-03-01' },
  { id: 'p18', title: 'Conference Speaker', photographer: 'Isabelle Thomas', width: 4800, height: 3200, category: 'Business', gradient: GRADIENTS[17], favorite: false, createdAt: '2026-03-05' },
  { id: 'p19', title: 'Northern Lights', photographer: 'Mathieu Robert', width: 6000, height: 4000, category: 'Nature', gradient: GRADIENTS[18], favorite: false, createdAt: '2026-03-06' },
  { id: 'p20', title: 'Smartphone Closeup', photographer: 'Sarah Richard', width: 3600, height: 2400, category: 'Technologie', gradient: GRADIENTS[19], favorite: false, createdAt: '2026-03-02' },
  { id: 'p21', title: 'Family at Beach', photographer: 'David Durand', width: 5400, height: 3600, category: 'Personnes', gradient: GRADIENTS[20], favorite: false, createdAt: '2026-03-04' },
  { id: 'p22', title: 'Medieval Cathedral', photographer: 'Chloe Morel', width: 3200, height: 4800, category: 'Architecture', gradient: GRADIENTS[21], favorite: false, createdAt: '2026-03-05' },
  { id: 'p23', title: 'Santorini Blue Domes', photographer: 'Julien Lefevre', width: 5000, height: 3333, category: 'Voyage', gradient: GRADIENTS[22], favorite: false, createdAt: '2026-03-03' },
  { id: 'p24', title: 'Color Splash Ink', photographer: 'Marine Bonnet', width: 4000, height: 4000, category: 'Abstract', gradient: GRADIENTS[23], favorite: false, createdAt: '2026-03-06' },
];

const DEMO_COLLECTIONS: PhotoCollection[] = [
  { id: 'c1', name: 'Marketing', photoIds: ['p1', 'p2', 'p5', 'p10'], createdAt: '2026-03-01' },
  { id: 'c2', name: 'Blog', photoIds: ['p4', 'p8', 'p11', 'p19'], createdAt: '2026-03-02' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadStore(): PhotoStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* */ }
  const store: PhotoStore = { photos: DEMO_PHOTOS, collections: DEMO_COLLECTIONS };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  return store;
}

function saveStore(store: PhotoStore) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch { /* */ }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PhotosPage() {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const [store, setStore] = useState<PhotoStore>({ photos: [], collections: [] });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tout');
  const [filter, setFilter] = useState<string>('Populaire');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [addToCollectionPhotoId, setAddToCollectionPhotoId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setStore(loadStore());
  }, []);

  const persist = useCallback((updated: PhotoStore) => {
    setStore(updated);
    saveStore(updated);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setStore(prev => {
      const next = { ...prev, photos: prev.photos.map(p => p.id === id ? { ...p, favorite: !p.favorite } : p) };
      saveStore(next);
      if (selectedPhoto?.id === id) setSelectedPhoto(next.photos.find(p => p.id === id) || null);
      return next;
    });
  }, [selectedPhoto]);

  const createCollection = useCallback(() => {
    if (!newCollectionName.trim()) return;
    const col: PhotoCollection = { id: `c${Date.now()}`, name: newCollectionName.trim(), photoIds: [], createdAt: new Date().toISOString().slice(0, 10) };
    const next = { ...store, collections: [...store.collections, col] };
    persist(next);
    setNewCollectionName('');
    setShowNewCollection(false);
  }, [newCollectionName, store, persist]);

  const addToCollection = useCallback((colId: string, photoId: string) => {
    const next = {
      ...store,
      collections: store.collections.map(c =>
        c.id === colId
          ? { ...c, photoIds: c.photoIds.includes(photoId) ? c.photoIds.filter(x => x !== photoId) : [...c.photoIds, photoId] }
          : c
      ),
    };
    persist(next);
    setAddToCollectionPhotoId(null);
  }, [store, persist]);

  const copyLink = useCallback((photo: PhotoItem) => {
    navigator.clipboard.writeText(`https://freenzy.io/photos/${photo.id}`).catch(() => {});
  }, []);

  if (!mounted) return null;

  const filtered = store.photos
    .filter(p => category === 'Tout' || p.category === category)
    .filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.photographer.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (filter === 'Récent') return b.createdAt.localeCompare(a.createdAt);
      if (filter === 'Par couleur') return a.gradient.localeCompare(b.gradient);
      return (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0);
    });

  const favCount = store.photos.filter(p => p.favorite).length;
  const totalCollections = store.collections.length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: isMobile ? '16px 12px' : '32px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>{PAGE_META.photos.emoji}</span>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{PAGE_META.photos.title}</h1>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{PAGE_META.photos.subtitle}</p>
            </div>
          </div>
        </div>
        <PageExplanation pageId="photos" text={PAGE_META.photos?.helpText} />

        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #dbeafe, #ede9fe)',
          borderRadius: 12,
          padding: isMobile ? 14 : 18,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13,
          color: '#3730a3',
        }}>
          <span style={{ fontSize: 18 }}>🔗</span>
          Connectez l&apos;API Unsplash pour acc&eacute;der &agrave; des millions d&apos;images gratuites
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { emoji: '🖼️', label: 'Images sauvegardées', value: store.photos.length },
            { emoji: '❤️', label: 'Favoris', value: favCount },
            { emoji: '📁', label: 'Collections', value: totalCollections },
          ].map(s => (
            <div key={s.label} style={{
              flex: '1 1 140px',
              background: 'var(--bg-secondary)',
              borderRadius: 12,
              padding: isMobile ? 14 : 18,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              border: '1px solid var(--border-primary)',
            }}>
              <span style={{ fontSize: 24 }}>{s.emoji}</span>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Rechercher des images..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid var(--border-primary)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Category buttons */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                background: category === cat ? 'var(--accent)' : 'var(--bg-secondary)',
                color: category === cat ? '#fff' : 'var(--text-secondary)',
                border: category === cat ? 'none' : '1px solid var(--border-primary)',
                borderRadius: 20,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? '#1A1A1A' : 'transparent',
                color: filter === f ? '#fff' : 'var(--text-secondary)',
                border: filter === f ? 'none' : '1px solid var(--border-primary)',
                borderRadius: 8,
                padding: '5px 12px',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Collections */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 16 }}>📁</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Collections</span>
            <button
              onClick={() => setShowNewCollection(!showNewCollection)}
              style={{
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '3px 10px',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                marginLeft: 'auto',
              }}
            >
              + Nouvelle
            </button>
          </div>
          {showNewCollection && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input
                type="text"
                placeholder="Nom de la collection..."
                value={newCollectionName}
                onChange={e => setNewCollectionName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createCollection()}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              <button
                onClick={createCollection}
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cr&eacute;er
              </button>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {store.collections.map(col => (
              <div key={col.id} style={{
                flexShrink: 0,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 10,
                padding: '8px 14px',
                minWidth: 100,
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{col.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{col.photoIds.length} images</div>
              </div>
            ))}
          </div>
        </div>

        {/* Image Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: 14,
        }}>
          {filtered.map(photo => (
            <div
              key={photo.id}
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: 12,
                overflow: 'hidden',
                border: '1px solid var(--border-primary)',
                cursor: 'pointer',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              {/* Gradient placeholder */}
              <div
                onClick={() => setSelectedPhoto(photo)}
                style={{
                  background: photo.gradient,
                  height: isMobile ? 120 : 160,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <span style={{ fontSize: 32, opacity: 0.4 }}>🖼️</span>
                {/* Favorite */}
                <button
                  onClick={e => { e.stopPropagation(); toggleFavorite(photo.id); }}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: 'rgba(0,0,0,0.3)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 30,
                    height: 30,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: 16,
                  }}
                >
                  {photo.favorite ? '❤️' : '🤍'}
                </button>
              </div>
              {/* Info */}
              <div style={{ padding: isMobile ? 10 : 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {photo.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  {photo.photographer}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                  {photo.width} x {photo.height}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)', fontSize: 14 }}>
            Aucune image trouv&eacute;e pour cette recherche.
          </div>
        )}

        {/* Detail Modal */}
        {selectedPhoto && (
          <div
            onClick={() => { setSelectedPhoto(null); setAddToCollectionPhotoId(null); }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--bg-primary)',
                borderRadius: 16,
                maxWidth: 600,
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
              }}
            >
              {/* Large preview */}
              <div style={{
                background: selectedPhoto.gradient,
                height: isMobile ? 200 : 320,
                borderRadius: '16px 16px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: 64, opacity: 0.3 }}>🖼️</span>
              </div>
              <div style={{ padding: isMobile ? 16 : 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{selectedPhoto.title}</h2>
                  <button
                    onClick={() => toggleFavorite(selectedPhoto.id)}
                    style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}
                  >
                    {selectedPhoto.favorite ? '❤️' : '🤍'}
                  </button>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Par {selectedPhoto.photographer}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  {selectedPhoto.width} x {selectedPhoto.height} &bull; {selectedPhoto.category}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  <button
                    onClick={() => copyLink(selectedPhoto)}
                    style={{
                      background: 'var(--accent)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Copier le lien
                  </button>
                  <button
                    onClick={() => setAddToCollectionPhotoId(addToCollectionPhotoId === selectedPhoto.id ? null : selectedPhoto.id)}
                    style={{
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Ajouter &agrave; une collection
                  </button>
                  <button
                    style={{
                      background: '#1A1A1A',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    T&eacute;l&eacute;charger
                  </button>
                </div>

                {/* Collection picker */}
                {addToCollectionPhotoId === selectedPhoto.id && (
                  <div style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: 10,
                    padding: 12,
                    border: '1px solid var(--border-primary)',
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                      Choisir une collection :
                    </div>
                    {store.collections.map(col => {
                      const isIn = col.photoIds.includes(selectedPhoto.id);
                      return (
                        <button
                          key={col.id}
                          onClick={() => addToCollection(col.id, selectedPhoto.id)}
                          style={{
                            display: 'block',
                            width: '100%',
                            textAlign: 'left',
                            background: isIn ? 'rgba(124,58,237,0.1)' : 'transparent',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 10px',
                            fontSize: 13,
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            marginBottom: 4,
                          }}
                        >
                          {isIn ? '✅ ' : ''}{col.name} ({col.photoIds.length})
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Close */}
                <div style={{ textAlign: 'right', marginTop: 12 }}>
                  <button
                    onClick={() => { setSelectedPhoto(null); setAddToCollectionPhotoId(null); }}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border-primary)',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
