'use client';

import { useState, useEffect, useCallback } from 'react';
import PageExplanation from '@/components/PageExplanation';
import { useIsMobile } from '@/lib/use-media-query';
import { PAGE_META } from '@/lib/emoji-map';
import { CU, pageContainer, headerRow, emojiIcon, cardGrid, toolbar } from '@/lib/page-styles';

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
    <div style={pageContainer(isMobile)}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={headerRow()}>
          <span style={emojiIcon(24)}>{PAGE_META.photos.emoji}</span>
          <div>
            <h1 style={CU.pageTitle}>{PAGE_META.photos.title}</h1>
            <p style={CU.pageSubtitle}>{PAGE_META.photos.subtitle}</p>
          </div>
        </div>
      </div>
      <PageExplanation pageId="photos" text={PAGE_META.photos?.helpText} />

      {/* Banner */}
      <div style={{
        ...CU.card,
        background: CU.accentLight,
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 13,
        color: CU.textSecondary,
      }}>
        <span style={{ fontSize: 18 }}>🔗</span>
        Connectez l&apos;API Unsplash pour acc&eacute;der &agrave; des millions d&apos;images gratuites
      </div>

      {/* Stats */}
      <div style={{ ...cardGrid(isMobile, 3), marginBottom: 20 }}>
        {[
          { emoji: '🖼️', label: 'Images sauvegardées', value: store.photos.length },
          { emoji: '❤️', label: 'Favoris', value: favCount },
          { emoji: '📁', label: 'Collections', value: totalCollections },
        ].map(s => (
          <div key={s.label} style={{
            ...CU.card,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: isMobile ? 14 : 18,
          }}>
            <span style={{ fontSize: 24 }}>{s.emoji}</span>
            <div>
              <div style={CU.statValue}>{s.value}</div>
              <div style={CU.statLabel}>{s.label}</div>
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
          style={CU.input}
        />
      </div>

      {/* Category buttons */}
      <div style={toolbar()}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={category === cat
              ? { ...CU.btnSmall, background: CU.accent, color: '#fff', border: `1px solid ${CU.accent}`, borderRadius: 20 }
              : { ...CU.btnSmall, borderRadius: 20 }
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filter buttons */}
      <div style={{ ...toolbar(), marginBottom: 20 }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={filter === f
              ? { ...CU.btnSmall, background: CU.accent, color: '#fff', border: `1px solid ${CU.accent}` }
              : CU.btnSmall
            }
          >
            {f}
          </button>
        ))}
      </div>

      {/* Collections */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={emojiIcon(16)}>📁</span>
          <span style={CU.sectionTitle}>Collections</span>
          <button
            onClick={() => setShowNewCollection(!showNewCollection)}
            style={{ ...CU.btnSmall, background: CU.accent, color: '#fff', border: `1px solid ${CU.accent}`, marginLeft: 'auto' }}
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
              style={{ ...CU.input, flex: 1 }}
            />
            <button onClick={createCollection} style={CU.btnPrimary}>
              Cr&eacute;er
            </button>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {store.collections.map(col => (
            <div key={col.id} style={{
              ...CU.card,
              flexShrink: 0,
              padding: '8px 14px',
              minWidth: 100,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: CU.text }}>{col.name}</div>
              <div style={{ fontSize: 11, color: CU.textSecondary }}>{col.photoIds.length} images</div>
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
              ...CU.cardHoverable,
              padding: 0,
              overflow: 'hidden',
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
              <div style={{ fontSize: 13, fontWeight: 600, color: CU.text, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {photo.title}
              </div>
              <div style={{ fontSize: 11, color: CU.textSecondary, marginBottom: 4 }}>
                {photo.photographer}
              </div>
              <div style={{ fontSize: 10, color: CU.textMuted }}>
                {photo.width} x {photo.height}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={CU.emptyState}>
          <div style={CU.emptyEmoji}>🖼️</div>
          <div style={CU.emptyTitle}>Aucune image trouv&eacute;e</div>
          <div style={CU.emptyDesc}>Aucune image trouv&eacute;e pour cette recherche.</div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedPhoto && (
        <div onClick={() => { setSelectedPhoto(null); setAddToCollectionPhotoId(null); }} style={CU.overlay}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              ...CU.modal,
              maxWidth: 600,
              padding: 0,
              overflow: 'hidden',
              maxHeight: '90vh',
            }}
          >
            {/* Large preview */}
            <div style={{
              background: selectedPhoto.gradient,
              height: isMobile ? 200 : 320,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{ fontSize: 64, opacity: 0.3 }}>🖼️</span>
            </div>
            <div style={{ padding: isMobile ? 16 : 24, overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <h2 style={{ ...CU.sectionTitle, fontSize: 18 }}>{selectedPhoto.title}</h2>
                <button
                  onClick={() => toggleFavorite(selectedPhoto.id)}
                  style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}
                >
                  {selectedPhoto.favorite ? '❤️' : '🤍'}
                </button>
              </div>
              <div style={{ fontSize: 13, color: CU.textSecondary, marginBottom: 4 }}>
                Par {selectedPhoto.photographer}
              </div>
              <div style={{ fontSize: 12, color: CU.textMuted, marginBottom: 16 }}>
                {selectedPhoto.width} x {selectedPhoto.height} &bull; {selectedPhoto.category}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                <button onClick={() => copyLink(selectedPhoto)} style={CU.btnPrimary}>
                  Copier le lien
                </button>
                <button
                  onClick={() => setAddToCollectionPhotoId(addToCollectionPhotoId === selectedPhoto.id ? null : selectedPhoto.id)}
                  style={CU.btnGhost}
                >
                  Ajouter &agrave; une collection
                </button>
                <button style={CU.btnPrimary}>
                  T&eacute;l&eacute;charger
                </button>
              </div>

              {/* Collection picker */}
              {addToCollectionPhotoId === selectedPhoto.id && (
                <div style={{ ...CU.card, background: CU.bgSecondary, padding: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: CU.text, marginBottom: 8 }}>
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
                          background: isIn ? CU.accentLight : 'transparent',
                          border: 'none',
                          borderRadius: 6,
                          padding: '6px 10px',
                          fontSize: 13,
                          color: CU.text,
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
                  style={CU.btnGhost}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
