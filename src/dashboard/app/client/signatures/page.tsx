'use client';

import { useState, useEffect } from 'react';
import { useIsMobile } from '../../../lib/use-media-query';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';

// ═══════════════════════════════════════════════════
//  Freenzy.io — Signatures Email
//  Créez des signatures email HTML professionnelles
// ═══════════════════════════════════════════════════

interface Signature {
  id: string;
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  linkedin: string;
  photoUrl: string;
  template: TemplateStyle;
  accentColor: string;
  isActive: boolean;
  createdAt: string;
}

type TemplateStyle = 'corporate' | 'creatif' | 'minimal' | 'moderne';

const STORAGE_KEY = 'fz_signatures';

const TEMPLATE_OPTIONS: { id: TemplateStyle; label: string; emoji: string }[] = [
  { id: 'corporate', label: 'Corporate', emoji: '🏢' },
  { id: 'creatif', label: 'Créatif', emoji: '🎨' },
  { id: 'minimal', label: 'Minimal', emoji: '✨' },
  { id: 'moderne', label: 'Moderne', emoji: '🚀' },
];

const ACCENT_COLORS = ['#7c3aed', '#2563eb', '#059669', '#dc2626', '#d97706', '#0891b2', '#1A1A1A', '#6366f1'];

function emptySignature(): Omit<Signature, 'id' | 'createdAt'> {
  return { name: '', title: '', company: '', phone: '', email: '', website: '', linkedin: '', photoUrl: '', template: 'corporate', accentColor: '#7c3aed', isActive: false };
}

function seedDemoSignature(): Signature[] {
  return [{
    id: 'demo-sig-1',
    name: 'Marie Dupont',
    title: 'Directrice Marketing',
    company: 'Freenzy.io',
    phone: '+33 6 12 34 56 78',
    email: 'marie@freenzy.io',
    website: 'https://freenzy.io',
    linkedin: 'https://linkedin.com/in/mariedupont',
    photoUrl: '',
    template: 'corporate',
    accentColor: '#7c3aed',
    isActive: true,
    createdAt: new Date().toISOString(),
  }];
}

function renderSignatureHtml(sig: Signature): string {
  const c = sig.accentColor;
  const sep = `<span style="color:${c};margin:0 6px">|</span>`;
  switch (sig.template) {
    case 'corporate':
      return `<table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:13px;color:#333"><tr>${sig.photoUrl ? `<td style="padding-right:14px;vertical-align:top"><img src="${sig.photoUrl}" width="70" height="70" style="border-radius:50%;object-fit:cover" /></td>` : ''}<td style="border-left:3px solid ${c};padding-left:14px"><div style="font-size:16px;font-weight:700;color:${c}">${sig.name}</div><div style="font-size:12px;color:#666;margin:2px 0 6px">${sig.title}${sig.company ? ` — ${sig.company}` : ''}</div><div style="font-size:12px;color:#333">${[sig.phone, sig.email, sig.website].filter(Boolean).join(' | ')}</div>${sig.linkedin ? `<div style="margin-top:4px"><a href="${sig.linkedin}" style="color:${c};font-size:11px;text-decoration:none">LinkedIn</a></div>` : ''}</td></tr></table>`;
    case 'creatif':
      return `<div style="font-family:'Segoe UI',sans-serif;padding:12px;background:linear-gradient(135deg,${c}11,${c}05);border-radius:10px;max-width:400px"><div style="font-size:20px;font-weight:800;color:${c}">${sig.name}</div><div style="font-size:13px;color:#555;margin:4px 0 8px">${sig.title}${sig.company ? ` @ ${sig.company}` : ''}</div><div style="display:flex;gap:8px;flex-wrap:wrap;font-size:12px;color:#333">${sig.phone ? `<span>📞 ${sig.phone}</span>` : ''}${sig.email ? `<span>✉️ ${sig.email}</span>` : ''}${sig.website ? `<span>🌐 ${sig.website}</span>` : ''}</div>${sig.linkedin ? `<div style="margin-top:6px"><a href="${sig.linkedin}" style="color:${c};font-size:12px;text-decoration:none">🔗 LinkedIn</a></div>` : ''}</div>`;
    case 'minimal':
      return `<div style="font-family:Arial,sans-serif;font-size:13px;color:#333"><strong style="color:${c}">${sig.name}</strong>${sig.title ? `, ${sig.title}` : ''}${sig.company ? ` — ${sig.company}` : ''}<br/><span style="font-size:12px;color:#666">${[sig.phone, sig.email, sig.website].filter(Boolean).join(' · ')}</span></div>`;
    case 'moderne':
      return `<table cellpadding="0" cellspacing="0" style="font-family:'Segoe UI',sans-serif;font-size:13px"><tr><td style="padding-right:16px;vertical-align:middle">${sig.photoUrl ? `<img src="${sig.photoUrl}" width="60" height="60" style="border-radius:8px;object-fit:cover" />` : `<div style="width:60px;height:60px;border-radius:8px;background:${c};display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;font-weight:700">${sig.name.charAt(0)}</div>`}</td><td><div style="font-weight:700;font-size:15px;color:#1a1a1a">${sig.name}</div><div style="font-size:12px;color:${c};font-weight:600;margin:2px 0">${sig.title}</div><div style="font-size:11px;color:#666">${sig.company}</div><div style="margin-top:6px;font-size:11px;color:#555">${sig.phone}${sep}${sig.email}</div></td></tr></table>`;
    default:
      return '';
  }
}

export default function SignaturesPage() {
  const isMobile = useIsMobile();
  const meta = PAGE_META.signatures;

  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [form, setForm] = useState(emptySignature());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSignatures(JSON.parse(stored));
      } else {
        const demo = seedDemoSignature();
        setSignatures(demo);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
      }
    } catch { /* */ }
  }, []);

  function save(list: Signature[]) {
    setSignatures(list);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* */ }
  }

  function handleSave() {
    if (!form.name.trim()) return;
    if (editingId) {
      save(signatures.map(s => s.id === editingId ? { ...s, ...form } : s));
      setEditingId(null);
    } else {
      const newSig: Signature = { ...form, id: `sig-${Date.now()}`, isActive: signatures.length === 0, createdAt: new Date().toISOString() };
      save([newSig, ...signatures]);
    }
    setForm(emptySignature());
  }

  function handleEdit(sig: Signature) {
    setEditingId(sig.id);
    setForm({ name: sig.name, title: sig.title, company: sig.company, phone: sig.phone, email: sig.email, website: sig.website, linkedin: sig.linkedin, photoUrl: sig.photoUrl, template: sig.template, accentColor: sig.accentColor, isActive: sig.isActive });
  }

  function handleDelete(id: string) {
    save(signatures.filter(s => s.id !== id));
    if (editingId === id) { setEditingId(null); setForm(emptySignature()); }
  }

  function handleSetActive(id: string) {
    save(signatures.map(s => ({ ...s, isActive: s.id === id })));
  }

  function handleCopyHtml() {
    const preview = editingId ? signatures.find(s => s.id === editingId) : { ...form, id: 'preview', isActive: false, createdAt: '' } as Signature;
    if (!preview || !preview.name) return;
    const html = renderSignatureHtml(preview as Signature);
    navigator.clipboard.writeText(html).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const currentPreview: Signature = editingId
    ? (signatures.find(s => s.id === editingId) || { ...form, id: 'tmp', isActive: false, createdAt: '' } as Signature)
    : { ...form, id: 'tmp', isActive: false, createdAt: '' } as Signature;

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-secondary)', borderRadius: 12, padding: isMobile ? 16 : 20,
    border: '1px solid var(--border-primary)',
  };

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-primary)',
    background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13, width: '100%',
  };

  return (
    <div style={{ padding: isMobile ? '16px 12px' : '24px 20px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: isMobile ? 22 : 28, fontWeight: 800, color: 'var(--text-primary)',
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
        }}>
          <span style={{ fontSize: isMobile ? 26 : 32 }}>{meta?.emoji}</span>
          {meta?.title}
          <HelpBubble text={meta?.helpText || ''} />
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{meta?.subtitle}</p>
      </div>
      <PageExplanation pageId="signatures" text={PAGE_META.signatures?.helpText} />

      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 16 }}>
        {/* Form */}
        <div style={{ flex: 1, ...cardStyle }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
            {editingId ? '✏️ Modifier' : '➕ Nouvelle signature'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input placeholder="Nom complet *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            <input placeholder="Titre / Poste" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} />
            <input placeholder="Entreprise" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} style={inputStyle} />
            <div style={{ display: 'flex', gap: 8 }}>
              <input placeholder="Téléphone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
              <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
            </div>
            <input placeholder="Site web" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} style={inputStyle} />
            <input placeholder="LinkedIn URL" value={form.linkedin} onChange={e => setForm({ ...form, linkedin: e.target.value })} style={inputStyle} />
            <input placeholder="Photo URL (optionnel)" value={form.photoUrl} onChange={e => setForm({ ...form, photoUrl: e.target.value })} style={inputStyle} />

            {/* Template selector */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Style</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {TEMPLATE_OPTIONS.map(t => (
                  <button key={t.id} onClick={() => setForm({ ...form, template: t.id })} style={{
                    padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-primary)',
                    background: form.template === t.id ? 'var(--accent)' : 'var(--bg-primary)',
                    color: form.template === t.id ? '#fff' : 'var(--text-primary)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}>
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Couleur d'accent</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {ACCENT_COLORS.map(c => (
                  <button key={c} onClick={() => setForm({ ...form, accentColor: c })} style={{
                    width: 28, height: 28, borderRadius: '50%', background: c, border: form.accentColor === c ? '3px solid var(--text-primary)' : '2px solid var(--border-primary)',
                    cursor: 'pointer',
                  }} />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSave} style={{
                flex: 1, padding: '10px 16px', borderRadius: 8, border: 'none',
                background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              }}>
                {editingId ? '💾 Mettre à jour' : '➕ Créer'}
              </button>
              <button onClick={handleCopyHtml} style={{
                padding: '10px 16px', borderRadius: 8, border: '1px solid var(--border-primary)',
                background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
              }}>
                {copied ? '✅ Copié !' : '📋 Copier le HTML'}
              </button>
            </div>
          </div>
        </div>

        {/* Preview + List */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Live preview */}
          {currentPreview.name && (
            <div style={cardStyle}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                👁️ Aperçu en direct
              </h3>
              <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #e5e5e5' }}
                dangerouslySetInnerHTML={{ __html: renderSignatureHtml(currentPreview as Signature) }} />
            </div>
          )}

          {/* Saved signatures */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
              📂 Mes signatures ({signatures.length})
            </h3>
            {signatures.length === 0 && (
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', padding: 20 }}>
                Aucune signature créée
              </p>
            )}
            {signatures.map(sig => (
              <div key={sig.id} style={{
                padding: 12, borderRadius: 8, border: '1px solid var(--border-primary)',
                background: sig.isActive ? `${sig.accentColor}10` : 'var(--bg-primary)',
                marginBottom: 8,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                      {sig.name} {sig.isActive && <span style={{ fontSize: 11, color: sig.accentColor, fontWeight: 600 }}>● Active</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {sig.title}{sig.company ? ` — ${sig.company}` : ''} — {TEMPLATE_OPTIONS.find(t => t.id === sig.template)?.label}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {!sig.isActive && (
                      <button onClick={() => handleSetActive(sig.id)} style={{
                        padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border-primary)',
                        background: 'var(--bg-primary)', fontSize: 11, cursor: 'pointer', color: 'var(--text-primary)',
                      }}>✅</button>
                    )}
                    <button onClick={() => handleEdit(sig)} style={{
                      padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border-primary)',
                      background: 'var(--bg-primary)', fontSize: 11, cursor: 'pointer', color: 'var(--text-primary)',
                    }}>✏️</button>
                    <button onClick={() => handleDelete(sig.id)} style={{
                      padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border-primary)',
                      background: 'var(--bg-primary)', fontSize: 11, cursor: 'pointer', color: '#ef4444',
                    }}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
