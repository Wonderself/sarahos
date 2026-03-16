'use client';

import { useState, useEffect, useCallback, useRef, type CSSProperties, type ChangeEvent, type DragEvent } from 'react';
import { useIsMobile } from '@/lib/use-media-query';
import PageBlogSection from '@/components/blog/PageBlogSection';

// ─── Types ────────────────────────────────────────────────────

interface BrandingConfig {
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  tonMarque: string;
  companyName: string;
  companyAddress: string;
  companySiret: string;
  companyPhone: string;
  companyEmail: string;
}

// ─── Constants ────────────────────────────────────────────────

const STORAGE_KEY = 'fz_branding';
const MAX_LOGO_SIZE = 200 * 1024; // 200KB

const DEFAULT_BRANDING: BrandingConfig = {
  logo: '',
  primaryColor: '#1A1A1A',
  secondaryColor: '#6B6B6B',
  accentColor: '#0EA5E9',
  fontFamily: 'Inter',
  tonMarque: 'Formel',
  companyName: '',
  companyAddress: '',
  companySiret: '',
  companyPhone: '',
  companyEmail: '',
};

const FONT_OPTIONS = ['Inter', 'Arial', 'Georgia', 'Roboto'];
const TON_OPTIONS = ['Formel', 'Decontracte', 'Luxe', 'Artisanal'];

// ─── Styles ───────────────────────────────────────────────────

const styles: Record<string, CSSProperties> = {
  container: {
    maxWidth: 960,
    margin: '0 auto',
    padding: '32px 24px',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1A1A1A',
    margin: 0,
    lineHeight: 1.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#9B9B9B',
    margin: '4px 0 0 0',
    lineHeight: 1.5,
  },
  grid: {
    display: 'grid',
    gap: 24,
  },
  card: {
    background: '#FFFFFF',
    border: '1px solid #E5E5E5',
    borderRadius: 8,
    padding: 20,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1A1A1A',
    margin: '0 0 16px 0',
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 500,
    color: '#6B6B6B',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #E5E5E5',
    borderRadius: 6,
    fontSize: 13,
    color: '#1A1A1A',
    background: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #E5E5E5',
    borderRadius: 6,
    fontSize: 13,
    color: '#1A1A1A',
    background: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box' as const,
    cursor: 'pointer',
  },
  colorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  colorInput: {
    width: 40,
    height: 32,
    border: '1px solid #E5E5E5',
    borderRadius: 6,
    cursor: 'pointer',
    padding: 0,
    background: 'none',
  },
  colorLabel: {
    fontSize: 12,
    color: '#6B6B6B',
    flex: 1,
  },
  colorHex: {
    fontSize: 11,
    color: '#9B9B9B',
    fontFamily: 'monospace',
  },
  dropZone: {
    border: '2px dashed #E5E5E5',
    borderRadius: 8,
    padding: 24,
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
  dropZoneActive: {
    borderColor: '#0EA5E9',
    background: '#F0F9FF',
  },
  dropText: {
    fontSize: 13,
    color: '#9B9B9B',
    margin: 0,
  },
  dropHint: {
    fontSize: 11,
    color: '#9B9B9B',
    margin: '8px 0 0 0',
  },
  logoPreview: {
    maxWidth: 120,
    maxHeight: 80,
    objectFit: 'contain' as const,
    borderRadius: 4,
    marginBottom: 8,
  },
  removeBtn: {
    fontSize: 11,
    color: '#DC2626',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 0',
  },
  resetBtn: {
    padding: '8px 16px',
    fontSize: 13,
    color: '#6B6B6B',
    background: '#FAFAFA',
    border: '1px solid #E5E5E5',
    borderRadius: 6,
    cursor: 'pointer',
  },
  savedBadge: {
    fontSize: 11,
    color: '#38A169',
    marginLeft: 8,
  },
  previewContainer: {
    background: '#FAFAFA',
    border: '1px solid #E5E5E5',
    borderRadius: 8,
    padding: 20,
    minHeight: 140,
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  previewBar: {
    height: 3,
    borderRadius: 2,
    marginBottom: 12,
  },
  previewCompany: {
    fontSize: 15,
    fontWeight: 700,
    margin: 0,
  },
  previewInfo: {
    fontSize: 10,
    margin: '2px 0 0 0',
  },
  previewDoc: {
    fontSize: 18,
    fontWeight: 700,
    textAlign: 'right' as const,
    margin: 0,
  },
  fieldGroup: {
    marginBottom: 14,
  },
};

// ─── Component ────────────────────────────────────────────────

export default function BrandingPage() {
  const isMobile = useIsMobile();
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING);
  const [isDragging, setIsDragging] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<BrandingConfig>;
        setBranding({ ...DEFAULT_BRANDING, ...parsed });
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Debounced save
  const scheduleSave = useCallback((config: BrandingConfig) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
  }, []);

  const updateField = useCallback(<K extends keyof BrandingConfig>(key: K, value: BrandingConfig[K]) => {
    setBranding(prev => {
      const next = { ...prev, [key]: value };
      scheduleSave(next);
      return next;
    });
  }, [scheduleSave]);

  // ─── Logo Handling ──────────────────────────────────────────

  const handleLogoFile = useCallback((file: File) => {
    if (file.size > MAX_LOGO_SIZE) {
      alert('Logo trop volumineux. Maximum 200 Ko.');
      return;
    }
    if (!file.type.match(/^image\/(png|jpeg|jpg|svg\+xml)$/)) {
      alert('Format accepte : PNG, JPG, SVG');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        updateField('logo', result);
      }
    };
    reader.readAsDataURL(file);
  }, [updateField]);

  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleLogoFile(file);
  }, [handleLogoFile]);

  const onFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleLogoFile(file);
  }, [handleLogoFile]);

  const handleReset = useCallback(() => {
    setBranding({ ...DEFAULT_BRANDING });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BRANDING));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  // ─── Render ─────────────────────────────────────────────────

  const gridStyle: CSSProperties = {
    ...styles.grid,
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={styles.title}>
              {'🎨 Mon Branding'}
              {saved && <span style={styles.savedBadge}>Sauvegarde</span>}
            </h1>
            <p style={styles.subtitle}>Personnalisez l&apos;apparence de vos documents</p>
          </div>
          <button style={styles.resetBtn} onClick={handleReset}>
            Reinitialiser
          </button>
        </div>
      </div>

      <div style={gridStyle}>
        {/* Logo */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Logo</h2>
          {branding.logo ? (
            <div style={{ textAlign: 'center' }}>
              <img src={branding.logo} alt="Logo" style={styles.logoPreview} />
              <br />
              <button style={styles.removeBtn} onClick={() => updateField('logo', '')}>
                Supprimer le logo
              </button>
            </div>
          ) : (
            <div
              style={{ ...styles.dropZone, ...(isDragging ? styles.dropZoneActive : {}) }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <p style={styles.dropText}>
                {isDragging ? 'Deposez ici...' : 'Glissez votre logo ou cliquez'}
              </p>
              <p style={styles.dropHint}>PNG, JPG ou SVG — max 200 Ko</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.svg"
            style={{ display: 'none' }}
            onChange={onFileChange}
          />
        </div>

        {/* Colors */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Couleurs</h2>
          {([
            { key: 'primaryColor' as const, label: 'Primaire' },
            { key: 'secondaryColor' as const, label: 'Secondaire' },
            { key: 'accentColor' as const, label: 'Accent' },
          ]).map(({ key, label }) => (
            <div key={key} style={styles.colorRow}>
              <input
                type="color"
                value={branding[key]}
                onChange={(e) => updateField(key, e.target.value)}
                style={styles.colorInput}
              />
              <span style={styles.colorLabel}>{label}</span>
              <span style={styles.colorHex}>{branding[key]}</span>
            </div>
          ))}
        </div>

        {/* Font */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Police</h2>
          <label style={styles.label}>Famille de police</label>
          <select
            style={styles.select}
            value={branding.fontFamily}
            onChange={(e) => updateField('fontFamily', e.target.value)}
          >
            {FONT_OPTIONS.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* Ton */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Ton de marque</h2>
          <label style={styles.label}>Style de communication</label>
          <select
            style={styles.select}
            value={branding.tonMarque}
            onChange={(e) => updateField('tonMarque', e.target.value)}
          >
            {TON_OPTIONS.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Company Info — full width */}
        <div style={{ ...styles.card, gridColumn: isMobile ? undefined : '1 / -1' }}>
          <h2 style={styles.cardTitle}>Infos entreprise</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Nom</label>
              <input
                style={styles.input}
                placeholder="Mon Entreprise"
                value={branding.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>SIRET</label>
              <input
                style={styles.input}
                placeholder="000 000 000 00000"
                value={branding.companySiret}
                onChange={(e) => updateField('companySiret', e.target.value)}
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Adresse</label>
              <input
                style={styles.input}
                placeholder="1 Rue Exemple, 75001 Paris"
                value={branding.companyAddress}
                onChange={(e) => updateField('companyAddress', e.target.value)}
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Telephone</label>
              <input
                style={styles.input}
                placeholder="+33 1 00 00 00 00"
                value={branding.companyPhone}
                onChange={(e) => updateField('companyPhone', e.target.value)}
              />
            </div>
            <div style={{ ...styles.fieldGroup, gridColumn: isMobile ? undefined : '1 / -1' }}>
              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                placeholder="contact@monentreprise.fr"
                value={branding.companyEmail}
                onChange={(e) => updateField('companyEmail', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Live Preview — full width */}
        <div style={{ ...styles.card, gridColumn: isMobile ? undefined : '1 / -1' }}>
          <h2 style={styles.cardTitle}>Apercu du document</h2>
          <div style={styles.previewContainer}>
            <div style={{ ...styles.previewBar, background: branding.primaryColor }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={styles.previewHeader}>
                {branding.logo && (
                  <img src={branding.logo} alt="" style={{ width: 40, height: 40, objectFit: 'contain' }} />
                )}
                <div>
                  <p style={{ ...styles.previewCompany, color: branding.primaryColor, fontFamily: branding.fontFamily }}>
                    {branding.companyName || 'Mon Entreprise'}
                  </p>
                  <p style={{ ...styles.previewInfo, color: '#9B9B9B' }}>
                    {branding.companyAddress || '1 Rue Exemple, 75001 Paris'}
                  </p>
                  <p style={{ ...styles.previewInfo, color: '#9B9B9B' }}>
                    {branding.companyEmail || 'contact@monentreprise.fr'}
                  </p>
                </div>
              </div>
              <p style={{ ...styles.previewDoc, color: branding.accentColor }}>DEVIS</p>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <div style={{ flex: 3, height: 8, background: branding.primaryColor, borderRadius: 4, opacity: 0.2 }} />
              <div style={{ flex: 1, height: 8, background: branding.secondaryColor, borderRadius: 4, opacity: 0.2 }} />
              <div style={{ flex: 1, height: 8, background: branding.accentColor, borderRadius: 4, opacity: 0.3 }} />
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <div style={{ flex: 2, height: 8, background: '#E5E5E5', borderRadius: 4 }} />
              <div style={{ flex: 2, height: 8, background: '#E5E5E5', borderRadius: 4 }} />
            </div>
            <p style={{ fontSize: 9, color: '#9B9B9B', marginTop: 12, fontStyle: 'italic' }}>
              {branding.tonMarque === 'Formel' && 'Ton formel — Communication professionnelle et structuree'}
              {branding.tonMarque === 'Decontracte' && 'Ton decontracte — Communication accessible et chaleureuse'}
              {branding.tonMarque === 'Luxe' && 'Ton luxe — Communication raffinee et exclusive'}
              {branding.tonMarque === 'Artisanal' && 'Ton artisanal — Communication authentique et proche'}
            </p>
          </div>
        </div>
      </div>
      <PageBlogSection pageId="branding" />
    </div>
  );
}
