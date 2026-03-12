'use client';

import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../../../lib/use-media-query';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';

// ═══════════════════════════════════════════════════
//  Freenzy.io — QR Codes
//  Générez des QR codes pour URLs, vCards, WiFi, etc.
// ═══════════════════════════════════════════════════

type QRType = 'url' | 'text' | 'email' | 'phone' | 'wifi' | 'vcard';

interface QRCode {
  id: string;
  type: QRType;
  label: string;
  data: string;
  fgColor: string;
  bgColor: string;
  size: 'small' | 'medium' | 'large';
  createdAt: string;
}

const STORAGE_KEY = 'fz_qrcodes';

const QR_TYPES: { id: QRType; label: string; emoji: string }[] = [
  { id: 'url', label: 'URL', emoji: '🔗' },
  { id: 'text', label: 'Texte', emoji: '📝' },
  { id: 'email', label: 'Email', emoji: '✉️' },
  { id: 'phone', label: 'Téléphone', emoji: '📞' },
  { id: 'wifi', label: 'WiFi', emoji: '📶' },
  { id: 'vcard', label: 'vCard', emoji: '👤' },
];

const SIZES: { id: 'small' | 'medium' | 'large'; label: string; px: number }[] = [
  { id: 'small', label: 'Petit', px: 150 },
  { id: 'medium', label: 'Moyen', px: 250 },
  { id: 'large', label: 'Grand', px: 350 },
];

function seedDemoQRCodes(): QRCode[] {
  return [
    {
      id: 'demo-qr-1', type: 'url', label: 'Site Freenzy.io',
      data: 'https://freenzy.io', fgColor: '#1a1a1a', bgColor: '#ffffff',
      size: 'medium', createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'demo-qr-2', type: 'wifi', label: 'WiFi Bureau',
      data: 'WIFI:T:WPA;S:FreenzyOffice;P:SecurePass123;;',
      fgColor: '#7c3aed', bgColor: '#ffffff',
      size: 'medium', createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ];
}

function buildQRData(type: QRType, fields: Record<string, string>): string {
  switch (type) {
    case 'url': return fields.url || '';
    case 'text': return fields.text || '';
    case 'email': return `mailto:${fields.email || ''}?subject=${encodeURIComponent(fields.subject || '')}&body=${encodeURIComponent(fields.body || '')}`;
    case 'phone': return `tel:${fields.phone || ''}`;
    case 'wifi': return `WIFI:T:${fields.encryption || 'WPA'};S:${fields.ssid || ''};P:${fields.password || ''};;`;
    case 'vcard': return `BEGIN:VCARD\nVERSION:3.0\nFN:${fields.name || ''}\nTEL:${fields.phone || ''}\nEMAIL:${fields.email || ''}\nORG:${fields.company || ''}\nTITLE:${fields.title || ''}\nEND:VCARD`;
    default: return '';
  }
}

// Simple QR placeholder renderer (SVG-based pattern)
function QRPlaceholder({ data, fgColor, bgColor, size }: { data: string; fgColor: string; bgColor: string; size: number }) {
  // Generate a deterministic pattern from the data string
  const hash = data.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const gridSize = 21;
  const cellSize = size / gridSize;
  const cells: { x: number; y: number }[] = [];

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      // Position patterns (finder patterns at corners)
      const isFinderTL = row < 7 && col < 7;
      const isFinderTR = row < 7 && col >= gridSize - 7;
      const isFinderBL = row >= gridSize - 7 && col < 7;

      if (isFinderTL || isFinderTR || isFinderBL) {
        // Finder pattern borders and center
        const lr = isFinderTL ? 0 : isFinderBL ? gridSize - 7 : 0;
        const lc = isFinderTL ? 0 : isFinderTR ? gridSize - 7 : 0;
        const rr = row - (isFinderTL ? 0 : isFinderBL ? gridSize - 7 : 0);
        const rc = col - (isFinderTL ? 0 : isFinderTR ? gridSize - 7 : 0);
        if (rr === 0 || rr === 6 || rc === 0 || rc === 6 || (rr >= 2 && rr <= 4 && rc >= 2 && rc <= 4)) {
          cells.push({ x: col, y: row });
        }
      } else {
        // Data area — pseudo-random based on hash
        const seed = (hash + row * 37 + col * 53) % 100;
        if (seed < 45) {
          cells.push({ x: col, y: row });
        }
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ borderRadius: 8 }}>
      <rect width={size} height={size} fill={bgColor} />
      {cells.map((cell, i) => (
        <rect key={i} x={cell.x * cellSize} y={cell.y * cellSize} width={cellSize} height={cellSize} fill={fgColor} />
      ))}
    </svg>
  );
}

export default function QRCodePage() {
  const isMobile = useIsMobile();
  const meta = PAGE_META.qrcode;

  const [qrType, setQrType] = useState<QRType>('url');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [fgColor, setFgColor] = useState('#1a1a1a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [generatedData, setGeneratedData] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setQrCodes(JSON.parse(stored));
      } else {
        const demo = seedDemoQRCodes();
        setQrCodes(demo);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
      }
    } catch { /* */ }
  }, []);

  function save(list: QRCode[]) {
    setQrCodes(list);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* */ }
  }

  function updateField(key: string, val: string) {
    setFields(prev => ({ ...prev, [key]: val }));
  }

  function handleGenerate() {
    const data = buildQRData(qrType, fields);
    if (!data.trim()) return;
    setGeneratedData(data);
    const label = fields.url || fields.text || fields.ssid || fields.name || fields.email || fields.phone || data.slice(0, 30);
    const qr: QRCode = {
      id: `qr-${Date.now()}`, type: qrType, label,
      data, fgColor, bgColor, size,
      createdAt: new Date().toISOString(),
    };
    save([qr, ...qrCodes]);
  }

  function handleDelete(id: string) {
    save(qrCodes.filter(q => q.id !== id));
  }

  function handleDownload() {
    // Download SVG as PNG placeholder
    const svgEl = document.querySelector('#qr-preview svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    const sizeInfo = SIZES.find(s => s.id === size);
    const px = sizeInfo?.px || 250;
    canvas.width = px;
    canvas.height = px;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const a = document.createElement('a');
      a.download = `qrcode-${Date.now()}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-secondary)', borderRadius: 12, padding: isMobile ? 16 : 20,
    border: '1px solid var(--border-primary)',
  };

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-primary)',
    background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13, width: '100%',
  };

  const sizePx = SIZES.find(s => s.id === size)?.px || 250;

  function renderFields() {
    switch (qrType) {
      case 'url':
        return <input placeholder="https://example.com" value={fields.url || ''} onChange={e => updateField('url', e.target.value)} style={inputStyle} />;
      case 'text':
        return <textarea placeholder="Votre texte ici..." value={fields.text || ''} onChange={e => updateField('text', e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />;
      case 'email':
        return (
          <>
            <input placeholder="Email" value={fields.email || ''} onChange={e => updateField('email', e.target.value)} style={inputStyle} />
            <input placeholder="Objet" value={fields.subject || ''} onChange={e => updateField('subject', e.target.value)} style={inputStyle} />
            <textarea placeholder="Corps du message" value={fields.body || ''} onChange={e => updateField('body', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
          </>
        );
      case 'phone':
        return <input placeholder="+33 6 12 34 56 78" value={fields.phone || ''} onChange={e => updateField('phone', e.target.value)} style={inputStyle} />;
      case 'wifi':
        return (
          <>
            <input placeholder="Nom du réseau (SSID)" value={fields.ssid || ''} onChange={e => updateField('ssid', e.target.value)} style={inputStyle} />
            <input placeholder="Mot de passe" type="password" value={fields.password || ''} onChange={e => updateField('password', e.target.value)} style={inputStyle} />
            <select value={fields.encryption || 'WPA'} onChange={e => updateField('encryption', e.target.value)} style={inputStyle}>
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">Aucun</option>
            </select>
          </>
        );
      case 'vcard':
        return (
          <>
            <input placeholder="Nom complet" value={fields.name || ''} onChange={e => updateField('name', e.target.value)} style={inputStyle} />
            <input placeholder="Téléphone" value={fields.phone || ''} onChange={e => updateField('phone', e.target.value)} style={inputStyle} />
            <input placeholder="Email" value={fields.email || ''} onChange={e => updateField('email', e.target.value)} style={inputStyle} />
            <input placeholder="Entreprise" value={fields.company || ''} onChange={e => updateField('company', e.target.value)} style={inputStyle} />
            <input placeholder="Poste" value={fields.title || ''} onChange={e => updateField('title', e.target.value)} style={inputStyle} />
          </>
        );
    }
  }

  return (
    <div style={{ padding: isMobile ? '16px 12px' : '24px 20px', maxWidth: 900, margin: '0 auto' }}>
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
      <PageExplanation pageId="qrcode" text={PAGE_META.qrcode?.helpText} />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[{ id: 'generate' as const, label: 'Générer', emoji: '🔳' }, { id: 'history' as const, label: 'Historique', emoji: '📜' }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-primary)',
            background: activeTab === tab.id ? 'var(--accent)' : 'var(--bg-secondary)',
            color: activeTab === tab.id ? '#fff' : 'var(--text-primary)',
            cursor: 'pointer', fontWeight: 600, fontSize: 13,
          }}>
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'generate' && (
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 16 }}>
          {/* Form */}
          <div style={{ flex: 1, ...cardStyle }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
              🔳 Type de QR Code
            </h3>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {QR_TYPES.map(t => (
                <button key={t.id} onClick={() => { setQrType(t.id); setFields({}); setGeneratedData(null); }} style={{
                  padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-primary)',
                  background: qrType === t.id ? 'var(--accent)' : 'var(--bg-primary)',
                  color: qrType === t.id ? '#fff' : 'var(--text-primary)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}>
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {renderFields()}
            </div>

            {/* Colors */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Premier plan</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} style={{ width: 32, height: 32, border: 'none', cursor: 'pointer' }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{fgColor}</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Arrière-plan</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: 32, height: 32, border: 'none', cursor: 'pointer' }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{bgColor}</span>
                </div>
              </div>
            </div>

            {/* Size */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Taille</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {SIZES.map(s => (
                  <button key={s.id} onClick={() => setSize(s.id)} style={{
                    padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-primary)',
                    background: size === s.id ? 'var(--accent)' : 'var(--bg-primary)',
                    color: size === s.id ? '#fff' : 'var(--text-primary)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}>
                    {s.label} ({s.px}px)
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleGenerate} style={{
              width: '100%', padding: '10px 16px', borderRadius: 8, border: 'none',
              background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}>
              ✨ Générer le QR Code
            </button>
          </div>

          {/* Preview */}
          <div style={{ flex: 1, ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, alignSelf: 'flex-start' }}>
              👁️ Aperçu
            </h3>
            <div id="qr-preview" style={{
              background: bgColor, borderRadius: 12, padding: 20, border: '1px solid var(--border-primary)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            }}>
              {generatedData ? (
                <>
                  <QRPlaceholder data={generatedData} fgColor={fgColor} bgColor={bgColor} size={sizePx} />
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center', maxWidth: sizePx, wordBreak: 'break-all' }}>
                    {generatedData.length > 100 ? generatedData.slice(0, 100) + '...' : generatedData}
                  </div>
                </>
              ) : (
                <div style={{
                  width: sizePx, height: sizePx, borderRadius: 8,
                  background: 'var(--bg-primary)', border: '2px dashed var(--border-primary)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 48 }}>🔳</span>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 8 }}>Votre QR code apparaîtra ici</p>
                </div>
              )}
            </div>
            {generatedData && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={handleDownload} style={{
                  padding: '8px 16px', borderRadius: 8, border: 'none',
                  background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                }}>
                  📥 Télécharger PNG
                </button>
              </div>
            )}
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 12, textAlign: 'center' }}>
              Connectez l'API pour les vrais QR codes scannables
            </p>
          </div>
        </div>
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {qrCodes.length === 0 && (
            <div style={{ ...cardStyle, textAlign: 'center', padding: 40 }}>
              <span style={{ fontSize: 40 }}>🔳</span>
              <p style={{ color: 'var(--text-secondary)', marginTop: 12 }}>Aucun QR code généré</p>
            </div>
          )}
          {qrCodes.map(qr => {
            const typeInfo = QR_TYPES.find(t => t.id === qr.type);
            return (
              <div key={qr.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flexShrink: 0 }}>
                  <QRPlaceholder data={qr.data} fgColor={qr.fgColor} bgColor={qr.bgColor} size={60} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                    {typeInfo?.emoji} {qr.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {qr.data}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {typeInfo?.label} — {new Date(qr.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <button onClick={() => handleDelete(qr.id)} style={{
                  padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border-primary)',
                  background: 'var(--bg-primary)', fontSize: 12, cursor: 'pointer', color: '#ef4444',
                }}>🗑️</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
