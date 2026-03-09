'use client';

import { useState, useEffect } from 'react';
import { loadWidgetConfig, saveWidgetConfig, generateEmbedCode, DEFAULT_WIDGET_CONFIG, type WidgetConfig } from '../../../lib/widget-config';
import { ALL_AGENTS } from '../../../lib/agent-config';
import { useIsMobile } from '../../../lib/use-media-query';

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

  return (
    <div style={{ padding: '24px 20px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span className="material-symbols-rounded" style={{ fontSize: isMobile ? 26 : 32, color: '#7c3aed' }}>code</span>
          Widget Embeddable
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>
          Intégrez un chatbot Freenzy directement sur votre site web
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
        {/* Left: Configuration */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
            <span className="material-symbols-rounded" style={{ fontSize: 20, verticalAlign: 'middle', marginRight: 6 }}>tune</span>
            Configuration
          </h2>

          {/* Agent selection */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>Agent</label>
            <select
              value={config.agentId}
              onChange={e => updateConfig({ agentId: e.target.value })}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', fontSize: 13, outline: 'none',
              }}
            >
              {ALL_AGENTS.slice(0, 34).map(a => (
                <option key={a.id} value={a.id}>{a.name} — {a.role}</option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>Couleur principale</label>
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
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: 13, fontFamily: 'monospace', outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Position */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>Position</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['bottom-right', 'bottom-left'] as const).map(pos => (
                <button
                  key={pos}
                  onClick={() => updateConfig({ position: pos })}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: config.position === pos ? '#7c3aed' : 'rgba(255,255,255,0.06)',
                    color: config.position === pos ? '#fff' : 'rgba(255,255,255,0.5)',
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
            <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>Titre du widget</label>
            <input
              type="text"
              value={config.headerTitle}
              onChange={e => updateConfig({ headerTitle: e.target.value })}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', fontSize: 13, outline: 'none',
              }}
            />
          </div>

          {/* Welcome message */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>Message d'accueil</label>
            <textarea
              value={config.welcomeMessage}
              onChange={e => updateConfig({ welcomeMessage: e.target.value })}
              rows={3}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8, resize: 'vertical',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', fontSize: 13, outline: 'none',
              }}
            />
          </div>

          {/* Size */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>Largeur (px)</label>
              <input
                type="number"
                value={config.width}
                onChange={e => updateConfig({ width: Number(e.target.value) })}
                min={300} max={500}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: 13, outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>Hauteur (px)</label>
              <input
                type="number"
                value={config.height}
                onChange={e => updateConfig({ height: Number(e.target.value) })}
                min={400} max={700}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: 13, outline: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
            <span className="material-symbols-rounded" style={{ fontSize: 20, verticalAlign: 'middle', marginRight: 6 }}>visibility</span>
            Aperçu
          </h2>

          {/* Widget preview */}
          <div style={{
            position: 'relative', height: 500,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14, overflow: 'hidden', backdropFilter: 'blur(12px)',
          }}>
            {/* Fake website background */}
            <div style={{ padding: 20 }}>
              <div style={{ width: 120, height: 16, background: 'rgba(255,255,255,0.08)', borderRadius: 4, marginBottom: 12 }} />
              <div style={{ width: '80%', height: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 3, marginBottom: 8 }} />
              <div style={{ width: '60%', height: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 3, marginBottom: 8 }} />
              <div style={{ width: '70%', height: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 3 }} />
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
                  boxShadow: `0 8px 32px ${config.primaryColor}25`,
                }}>
                  {/* Header */}
                  <div style={{
                    padding: '14px 16px', background: config.primaryColor,
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 22, color: '#fff' }}>smart_toy</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{config.headerTitle}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
                        {selectedAgent?.name ?? 'Agent'} • En ligne
                      </div>
                    </div>
                    <span
                      className="material-symbols-rounded"
                      onClick={() => setShowPreview(false)}
                      style={{ fontSize: 20, color: '#fff', cursor: 'pointer' }}
                    >close</span>
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
                    }}>
                      <span className="material-symbols-rounded" style={{ fontSize: 16, color: '#fff' }}>send</span>
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
                    boxShadow: `0 4px 20px ${config.primaryColor}40`,
                  }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 28, color: '#fff' }}>chat</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Embed code */}
      <div style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 20, verticalAlign: 'middle', marginRight: 6 }}>integration_instructions</span>
          Code d'intégration
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
          Copiez ce code et collez-le juste avant la balise &lt;/body&gt; de votre site web.
        </p>

        <div style={{
          position: 'relative',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12, padding: '16px 20px',
        }}>
          <pre style={{
            fontSize: 12, color: '#22c55e', fontFamily: 'monospace',
            whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0, lineHeight: 1.6,
          }}>
            {embedCode}
          </pre>
          <button
            onClick={handleCopy}
            style={{
              position: 'absolute', top: 12, right: 12,
              padding: '6px 14px', borderRadius: 6, border: 'none',
              background: copied ? '#22c55e' : '#7c3aed', color: '#fff',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 14 }}>
              {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? 'Copié !' : 'Copier'}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        marginTop: 20, padding: '16px 20px', borderRadius: 14,
        background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.12)',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 10 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 18, verticalAlign: 'middle', marginRight: 6, color: '#7c3aed' }}>help</span>
          Comment ça marche ?
        </div>
        <ol style={{ margin: 0, padding: '0 0 0 20px', fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 2 }}>
          <li>Configurez l'apparence et choisissez l'agent ci-dessus</li>
          <li>Copiez le code d'intégration</li>
          <li>Collez-le dans le HTML de votre site, juste avant <code style={{ color: '#22c55e' }}>&lt;/body&gt;</code></li>
          <li>Le widget apparaîtra automatiquement en bas de page</li>
        </ol>
      </div>
    </div>
  );
}
