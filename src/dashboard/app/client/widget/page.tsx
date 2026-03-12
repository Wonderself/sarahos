'use client';

import { useState, useEffect } from 'react';
import { loadWidgetConfig, saveWidgetConfig, generateEmbedCode, DEFAULT_WIDGET_CONFIG, type WidgetConfig } from '../../../lib/widget-config';
import { ALL_AGENTS } from '../../../lib/agent-config';
import { useIsMobile } from '../../../lib/use-media-query';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';

export default function WidgetPage() {
  const isMobile = useIsMobile();
  const [config, setConfig] = useState<WidgetConfig>(DEFAULT_WIDGET_CONFIG);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setConfig(loadWidgetConfig());
  }, []);

  const updateConfig = (updates: Partial<WidgetConfig>) => {
    const next = { ...config, ...updates };
    setConfig(next);
    saveWidgetConfig(next);
  };

  const embedCode = generateEmbedCode(config);
  const selectedAgent = ALL_AGENTS.find(a => a.id === config.agentId);

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const meta = PAGE_META.widget;

  return (
    <div style={{ padding: '24px 20px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: 'var(--fz-text, #1A1A1A)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: isMobile ? 26 : 32 }}>{meta.emoji}</span>
          {meta.title}
          <HelpBubble text={meta.helpText} />
        </h1>
        <p style={{ color: 'var(--fz-text-muted, #9B9B9B)', fontSize: 14 }}>
          {meta.subtitle}
        </p>
      </div>
      <PageExplanation pageId="widget" text={PAGE_META.widget?.helpText} />

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
        {/* Left: Configuration */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--fz-text, #1A1A1A)', marginBottom: 16 }}>
            <span style={{ fontSize: 20, verticalAlign: 'middle', marginRight: 6 }}>⚙️</span>
            Configuration
          </h2>

          {/* Agent selection */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--fz-text-muted, #9B9B9B)', display: 'block', marginBottom: 6 }}>Agent</label>
            <select
              value={config.agentId}
              onChange={e => updateConfig({ agentId: e.target.value })}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                background: 'var(--fz-bg-secondary, #F7F7F7)', border: '1px solid var(--border-primary, #E5E5E5)',
                color: 'var(--fz-text, #1A1A1A)', fontSize: 13, outline: 'none',
              }}
            >
              {ALL_AGENTS.slice(0, 34).map(a => (
                <option key={a.id} value={a.id}>{a.name} — {a.role}</option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--fz-text-muted, #9B9B9B)', display: 'block', marginBottom: 6 }}>🎨 Couleur principale</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="color"
                value={config.primaryColor}
                onChange={e => updateConfig({ primaryColor: e.target.value })}
                style={{ width: 40, height: 36, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'transparent' }}
              />
              <input
                type="text"
                value={config.primaryColor}
                onChange={e => updateConfig({ primaryColor: e.target.value })}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 8,
                  background: 'var(--fz-bg-secondary, #F7F7F7)', border: '1px solid var(--border-primary, #E5E5E5)',
                  color: 'var(--fz-text, #1A1A1A)', fontSize: 13, fontFamily: 'monospace', outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Position */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--fz-text-muted, #9B9B9B)', display: 'block', marginBottom: 6 }}>Position</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['bottom-right', 'bottom-left'] as const).map(pos => (
                <button
                  key={pos}
                  onClick={() => updateConfig({ position: pos })}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: config.position === pos ? '#1A1A1A' : 'var(--fz-bg-secondary, #F7F7F7)',
                    color: config.position === pos ? '#fff' : 'var(--fz-text-muted, #9B9B9B)',
                    fontSize: 12, fontWeight: 700,
                  }}
                >
                  {pos === 'bottom-right' ? 'Bas-droite' : 'Bas-gauche'}
                </button>
              ))}
            </div>
          </div>

          {/* Header title */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--fz-text-muted, #9B9B9B)', display: 'block', marginBottom: 6 }}>Titre du widget</label>
            <input
              type="text"
              value={config.headerTitle}
              onChange={e => updateConfig({ headerTitle: e.target.value })}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                background: 'var(--fz-bg-secondary, #F7F7F7)', border: '1px solid var(--border-primary, #E5E5E5)',
                color: 'var(--fz-text, #1A1A1A)', fontSize: 13, outline: 'none',
              }}
            />
          </div>

          {/* Welcome message */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--fz-text-muted, #9B9B9B)', display: 'block', marginBottom: 6 }}>Message d'accueil</label>
            <textarea
              value={config.welcomeMessage}
              onChange={e => updateConfig({ welcomeMessage: e.target.value })}
              rows={3}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8, resize: 'vertical',
                background: 'var(--fz-bg-secondary, #F7F7F7)', border: '1px solid var(--border-primary, #E5E5E5)',
                color: 'var(--fz-text, #1A1A1A)', fontSize: 13, outline: 'none',
              }}
            />
          </div>

          {/* Size */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--fz-text-muted, #9B9B9B)', display: 'block', marginBottom: 6 }}>Largeur (px)</label>
              <input
                type="number"
                value={config.width}
                onChange={e => updateConfig({ width: Number(e.target.value) })}
                min={300} max={500}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  background: 'var(--fz-bg-secondary, #F7F7F7)', border: '1px solid var(--border-primary, #E5E5E5)',
                  color: 'var(--fz-text, #1A1A1A)', fontSize: 13, outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--fz-text-muted, #9B9B9B)', display: 'block', marginBottom: 6 }}>Hauteur (px)</label>
              <input
                type="number"
                value={config.height}
                onChange={e => updateConfig({ height: Number(e.target.value) })}
                min={400} max={700}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  background: 'var(--fz-bg-secondary, #F7F7F7)', border: '1px solid var(--border-primary, #E5E5E5)',
                  color: 'var(--fz-text, #1A1A1A)', fontSize: 13, outline: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--fz-text, #1A1A1A)', marginBottom: 16 }}>
            <span style={{ fontSize: 20, verticalAlign: 'middle', marginRight: 6 }}>👁️</span>
            Aperçu
          </h2>

          {/* Widget preview */}
          <div style={{
            position: 'relative', height: 500,
            background: 'var(--fz-bg-secondary, #F7F7F7)', border: '1px solid var(--border-primary, #E5E5E5)',
            borderRadius: 14, overflow: 'hidden',
          }}>
            {/* Fake website background */}
            <div style={{ padding: 20 }}>
              <div style={{ width: 120, height: 16, background: 'var(--fz-border, #E5E5E5)', borderRadius: 4, marginBottom: 12 }} />
              <div style={{ width: '80%', height: 10, background: 'var(--fz-bg-hover, #F0F0F0)', borderRadius: 3, marginBottom: 8 }} />
              <div style={{ width: '60%', height: 10, background: 'var(--fz-bg-hover, #F0F0F0)', borderRadius: 3, marginBottom: 8 }} />
              <div style={{ width: '70%', height: 10, background: 'var(--fz-bg-hover, #F0F0F0)', borderRadius: 3 }} />
            </div>

            {/* Widget bubble */}
            <div style={{
              position: 'absolute',
              [config.position === 'bottom-right' ? 'right' : 'left']: 16,
              bottom: 16,
            }}>
              {showPreview ? (
                <div style={{
                  width: Math.min(config.width, 340), height: Math.min(config.height, 420),
                  borderRadius: config.borderRadius, overflow: 'hidden',
                  background: '#0f0720', border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex', flexDirection: 'column',
                  
                }}>
                  {/* Header */}
                  <div style={{
                    padding: '14px 16px', background: config.primaryColor,
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <span style={{ fontSize: 22 }}>🤖</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{config.headerTitle}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
                        {selectedAgent?.name ?? 'Agent'} • En ligne
                      </div>
                    </div>
                    <span
                      onClick={() => setShowPreview(false)}
                      style={{ fontSize: 20, color: '#fff', cursor: 'pointer' }}
                    >✕</span>
                  </div>

                  {/* Messages */}
                  <div style={{ flex: 1, padding: 14, overflowY: 'auto' }}>
                    <div style={{
                      padding: '10px 14px', borderRadius: '14px 14px 14px 4px',
                      background: 'rgba(255,255,255,0.06)', maxWidth: '85%',
                      fontSize: 13, color: '#fff', lineHeight: 1.5,
                    }}>
                      {config.welcomeMessage}
                    </div>
                  </div>

                  {/* Input */}
                  <div style={{
                    padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', gap: 8,
                  }}>
                    <div style={{
                      flex: 1, padding: '8px 12px', borderRadius: 8,
                      background: 'rgba(255,255,255,0.06)', fontSize: 12, color: 'rgba(255,255,255,0.35)',
                    }}>
                      Écrivez un message...
                    </div>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: config.primaryColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16,
                    }}>
                      ➤
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowPreview(true)}
                  style={{
                    width: 56, height: 56, borderRadius: '50%', border: 'none',
                    background: config.primaryColor, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    
                    fontSize: 28,
                  }}
                >
                  💬
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Embed code */}
      <div style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--fz-text, #1A1A1A)', marginBottom: 12 }}>
          <span style={{ fontSize: 20, verticalAlign: 'middle', marginRight: 6 }}>🔌</span>
          Code d'intégration
        </h2>
        <p style={{ fontSize: 13, color: 'var(--fz-text-muted, #9B9B9B)', marginBottom: 12 }}>
          Copiez ce code et collez-le juste avant la balise &lt;/body&gt; de votre site web.
        </p>

        <div style={{
          position: 'relative',
          background: 'var(--fz-bg-secondary, #F7F7F7)', border: '1px solid var(--border-primary, #E5E5E5)',
          borderRadius: 12, padding: '16px 20px',
        }}>
          <pre style={{
            fontSize: 12, color: '#1A1A1A', fontFamily: 'monospace',
            whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0, lineHeight: 1.6,
          }}>
            {embedCode}
          </pre>
          <button
            onClick={handleCopy}
            style={{
              position: 'absolute', top: 12, right: 12,
              padding: '6px 14px', borderRadius: 6, border: 'none',
              background: '#1A1A1A', color: '#fff',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            {copied ? '✅' : '📋'}
            {copied ? ' Copié !' : ' Copier'}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        marginTop: 20, padding: '16px 20px', borderRadius: 14,
        background: '#F7F7F7', border: '1px solid #E5E5E5',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fz-text, #1A1A1A)', marginBottom: 10 }}>
          <span style={{ fontSize: 18, verticalAlign: 'middle', marginRight: 6 }}>❓</span>
          Comment ça marche ?
        </div>
        <ol style={{ margin: 0, padding: '0 0 0 20px', fontSize: 13, color: 'var(--fz-text-muted, #9B9B9B)', lineHeight: 2 }}>
          <li>Configurez l'apparence et choisissez l'agent ci-dessus</li>
          <li>Copiez le code d'intégration</li>
          <li>Collez-le dans le HTML de votre site, juste avant <code style={{ color: '#1A1A1A' }}>&lt;/body&gt;</code></li>
          <li>Le widget apparaîtra automatiquement en bas de page</li>
        </ol>
      </div>
    </div>
  );
}
