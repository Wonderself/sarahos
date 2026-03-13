'use client';

import { useState, useEffect } from 'react';
import { loadWidgetConfig, saveWidgetConfig, generateEmbedCode, DEFAULT_WIDGET_CONFIG, type WidgetConfig } from '../../../lib/widget-config';
import { ALL_AGENTS } from '../../../lib/agent-config';
import { useIsMobile } from '../../../lib/use-media-query';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { CU, pageContainer, headerRow, emojiIcon } from '../../../lib/page-styles';

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
    <div style={{ ...pageContainer(isMobile), maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={headerRow()}>
          <span style={emojiIcon(24)}>{meta.emoji}</span>
          <h1 style={CU.pageTitle}>{meta.title}</h1>
          <HelpBubble text={meta.helpText} />
        </div>
        <p style={CU.pageSubtitle}>
          {meta.subtitle}
        </p>
      </div>
      <PageExplanation pageId="widget" text={PAGE_META.widget?.helpText} />

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
        {/* Left: Configuration */}
        <div>
          <h2 style={{ ...CU.sectionTitle, marginBottom: 16 }}>
            <span style={{ ...emojiIcon(20), verticalAlign: 'middle', marginRight: 6 }}>⚙️</span>
            Configuration
          </h2>

          {/* Agent selection */}
          <div style={{ marginBottom: 16 }}>
            <label style={CU.label}>Agent</label>
            <select
              value={config.agentId}
              onChange={e => updateConfig({ agentId: e.target.value })}
              style={{ ...CU.select, width: '100%' }}
            >
              {ALL_AGENTS.slice(0, 34).map(a => (
                <option key={a.id} value={a.id}>{a.name} — {a.role}</option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div style={{ marginBottom: 16 }}>
            <label style={CU.label}>🎨 Couleur principale</label>
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
                style={{ ...CU.input, flex: 1, fontFamily: 'monospace' }}
              />
            </div>
          </div>

          {/* Position */}
          <div style={{ marginBottom: 16 }}>
            <label style={CU.label}>Position</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['bottom-right', 'bottom-left'] as const).map(pos => (
                <button
                  key={pos}
                  onClick={() => updateConfig({ position: pos })}
                  style={config.position === pos
                    ? { ...CU.btnPrimary, flex: 1 }
                    : { ...CU.btnGhost, flex: 1, color: CU.textMuted }
                  }
                >
                  {pos === 'bottom-right' ? 'Bas-droite' : 'Bas-gauche'}
                </button>
              ))}
            </div>
          </div>

          {/* Header title */}
          <div style={{ marginBottom: 16 }}>
            <label style={CU.label}>Titre du widget</label>
            <input
              type="text"
              value={config.headerTitle}
              onChange={e => updateConfig({ headerTitle: e.target.value })}
              style={CU.input}
            />
          </div>

          {/* Welcome message */}
          <div style={{ marginBottom: 16 }}>
            <label style={CU.label}>Message d'accueil</label>
            <textarea
              value={config.welcomeMessage}
              onChange={e => updateConfig({ welcomeMessage: e.target.value })}
              rows={3}
              style={CU.textarea}
            />
          </div>

          {/* Size */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={CU.label}>Largeur (px)</label>
              <input
                type="number"
                value={config.width}
                onChange={e => updateConfig({ width: Number(e.target.value) })}
                min={300} max={500}
                style={CU.input}
              />
            </div>
            <div>
              <label style={CU.label}>Hauteur (px)</label>
              <input
                type="number"
                value={config.height}
                onChange={e => updateConfig({ height: Number(e.target.value) })}
                min={400} max={700}
                style={CU.input}
              />
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div>
          <h2 style={{ ...CU.sectionTitle, marginBottom: 16 }}>
            <span style={{ ...emojiIcon(20), verticalAlign: 'middle', marginRight: 6 }}>👁️</span>
            Aperçu
          </h2>

          {/* Widget preview */}
          <div style={{
            position: 'relative', height: 500,
            background: CU.bgSecondary, border: `1px solid ${CU.border}`,
            borderRadius: 8, overflow: 'hidden',
          }}>
            {/* Fake website background */}
            <div style={{ padding: 20 }}>
              <div style={{ width: 120, height: 16, background: CU.border, borderRadius: 4, marginBottom: 12 }} />
              <div style={{ width: '80%', height: 10, background: CU.accentLight, borderRadius: 3, marginBottom: 8 }} />
              <div style={{ width: '60%', height: 10, background: CU.accentLight, borderRadius: 3, marginBottom: 8 }} />
              <div style={{ width: '70%', height: 10, background: CU.accentLight, borderRadius: 3 }} />
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
        <h2 style={{ ...CU.sectionTitle, marginBottom: 12 }}>
          <span style={{ ...emojiIcon(20), verticalAlign: 'middle', marginRight: 6 }}>🔌</span>
          Code d'intégration
        </h2>
        <p style={{ ...CU.pageSubtitle, marginBottom: 12 }}>
          Copiez ce code et collez-le juste avant la balise &lt;/body&gt; de votre site web.
        </p>

        <div style={{
          position: 'relative',
          ...CU.card, background: CU.bgSecondary,
        }}>
          <pre style={{
            fontSize: 12, color: CU.text, fontFamily: 'monospace',
            whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0, lineHeight: 1.6,
          }}>
            {embedCode}
          </pre>
          <button
            onClick={handleCopy}
            style={{
              ...CU.btnPrimary,
              position: 'absolute', top: 12, right: 12,
              fontSize: 12,
            }}
          >
            {copied ? '✅' : '📋'}
            {copied ? ' Copié !' : ' Copier'}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div style={{ ...CU.card, marginTop: 20, background: CU.bgSecondary }}>
        <div style={{ ...CU.sectionTitle, fontSize: 14, marginBottom: 10 }}>
          <span style={{ ...emojiIcon(18), verticalAlign: 'middle', marginRight: 6 }}>❓</span>
          Comment ça marche ?
        </div>
        <ol style={{ margin: 0, padding: '0 0 0 20px', fontSize: 13, color: CU.textMuted, lineHeight: 2 }}>
          <li>Configurez l'apparence et choisissez l'agent ci-dessus</li>
          <li>Copiez le code d'intégration</li>
          <li>Collez-le dans le HTML de votre site, juste avant <code style={{ color: CU.text }}>&lt;/body&gt;</code></li>
          <li>Le widget apparaîtra automatiquement en bas de page</li>
        </ol>
      </div>
    </div>
  );
}
