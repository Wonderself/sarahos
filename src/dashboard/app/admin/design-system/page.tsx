'use client';

import React, { useState, useCallback } from 'react';
import { DESIGN_TOKENS, getProfileColor, getSemanticColor, exportTokensCSS, exportTokensJSON } from '@/lib/design-system';

const T = DESIGN_TOKENS;

// ─── Toast ────────────────────────────────────────────────────
function MiniToast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        background: T.colors.text.primary,
        color: T.colors.text.inverse,
        padding: '8px 16px',
        borderRadius: T.radius.md,
        fontSize: T.typography.sizes.sm,
        fontWeight: T.typography.weights.medium,
        zIndex: T.zIndex.toast,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: T.transitions.normal,
        pointerEvents: 'none',
      }}
    >
      {message}
    </div>
  );
}

// ─── Color Swatch ─────────────────────────────────────────────
function Swatch({
  color,
  label,
  onCopy,
}: {
  color: string;
  label: string;
  onCopy: (hex: string) => void;
}) {
  const isGradient = color.startsWith('linear-gradient') || color.startsWith('rgba');
  return (
    <div
      onClick={() => onCopy(color)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 10px',
        borderRadius: T.radius.md,
        cursor: 'pointer',
        transition: T.transitions.fast,
        border: `1px solid ${T.colors.border.primary}`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = T.colors.bg.hover;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'transparent';
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: T.radius.sm,
          background: color,
          border: `1px solid ${T.colors.border.primary}`,
          flexShrink: 0,
        }}
      />
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: T.typography.sizes.sm,
            fontWeight: T.typography.weights.medium,
            color: T.colors.text.primary,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: T.typography.sizes.xs,
            color: T.colors.text.muted,
            fontFamily: 'monospace',
          }}
        >
          {isGradient ? color.slice(0, 28) + '...' : color}
        </div>
      </div>
    </div>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────
function Section({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2
        style={{
          fontSize: T.typography.sizes.xl,
          fontWeight: T.typography.weights.semibold,
          color: T.colors.text.primary,
          margin: '0 0 16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span>{emoji}</span> {title}
      </h2>
      {children}
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          fontSize: T.typography.sizes.sm,
          fontWeight: T.typography.weights.semibold,
          color: T.colors.text.secondary,
          textTransform: 'uppercase' as const,
          letterSpacing: 0.5,
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function DesignSystemPage() {
  const [toast, setToast] = useState({ message: '', visible: false });

  const showToast = useCallback((msg: string) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 1800);
  }, []);

  const copyToClipboard = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text).then(() => showToast('Copie !'));
    },
    [showToast],
  );

  const swatchGrid: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
    gap: 8,
  };

  return (
    <div
      style={{
        padding: '32px 40px',
        maxWidth: 1200,
        margin: '0 auto',
        fontFamily: T.typography.fontFamily,
        color: T.colors.text.primary,
      }}
    >
      {/* ─── Header ─────────────────────────────────── */}
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 28 }}>{'🎨'}</span>
          <h1
            style={{
              fontSize: T.typography.sizes['3xl'],
              fontWeight: T.typography.weights.bold,
              margin: 0,
            }}
          >
            Design System
          </h1>
        </div>
        <p
          style={{
            fontSize: T.typography.sizes.base,
            color: T.colors.text.secondary,
            margin: '4px 0 0 0',
          }}
        >
          Tokens et composants Freenzy.io
        </p>
        <span
          style={{
            display: 'inline-block',
            marginTop: 8,
            fontSize: T.typography.sizes.xs,
            color: T.colors.text.muted,
            background: T.colors.bg.tertiary,
            padding: '2px 8px',
            borderRadius: T.radius.full,
          }}
        >
          Version 1.0
        </span>
      </div>

      {/* ═══ 1. Colors ═══════════════════════════════ */}
      <Section title="Colors" emoji="🎨">
        <SubSection title="Text">
          <div style={swatchGrid}>
            {Object.entries(T.colors.text).map(([k, v]) => (
              <Swatch key={k} color={v} label={`text.${k}`} onCopy={copyToClipboard} />
            ))}
          </div>
        </SubSection>

        <SubSection title="Background">
          <div style={swatchGrid}>
            {Object.entries(T.colors.bg).map(([k, v]) => (
              <Swatch key={k} color={v} label={`bg.${k}`} onCopy={copyToClipboard} />
            ))}
          </div>
        </SubSection>

        <SubSection title="Border">
          <div style={swatchGrid}>
            {Object.entries(T.colors.border).map(([k, v]) => (
              <Swatch key={k} color={v} label={`border.${k}`} onCopy={copyToClipboard} />
            ))}
          </div>
        </SubSection>

        <SubSection title="Accent">
          <div style={swatchGrid}>
            {Object.entries(T.colors.accent).map(([k, v]) => (
              <Swatch key={k} color={v} label={`accent.${k}`} onCopy={copyToClipboard} />
            ))}
          </div>
        </SubSection>

        <SubSection title="Semantic">
          <div style={swatchGrid}>
            {(Object.keys(T.colors.semantic) as Array<'success' | 'warning' | 'danger' | 'info'>).map(
              (type) => {
                const s = getSemanticColor(type);
                return (
                  <React.Fragment key={type}>
                    <Swatch color={s.bg} label={`${type}.bg`} onCopy={copyToClipboard} />
                    <Swatch color={s.text} label={`${type}.text`} onCopy={copyToClipboard} />
                    <Swatch color={s.border} label={`${type}.border`} onCopy={copyToClipboard} />
                  </React.Fragment>
                );
              },
            )}
          </div>
        </SubSection>

        <SubSection title="Profiles">
          <div style={swatchGrid}>
            {Object.entries(T.colors.profiles).map(([k, v]) => (
              <Swatch key={k} color={v} label={k} onCopy={copyToClipboard} />
            ))}
          </div>
        </SubSection>

        <SubSection title="Brand">
          <div style={swatchGrid}>
            <Swatch color={T.colors.brand.gradient} label="brand.gradient" onCopy={copyToClipboard} />
          </div>
        </SubSection>
      </Section>

      {/* ═══ 2. Typography ═══════════════════════════ */}
      <Section title="Typography" emoji="🔤">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            background: T.colors.bg.secondary,
            padding: 20,
            borderRadius: T.radius.lg,
            border: `1px solid ${T.colors.border.primary}`,
          }}
        >
          {Object.entries(T.typography.sizes).map(([key, size]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 60,
                  flexShrink: 0,
                  fontSize: T.typography.sizes.xs,
                  color: T.colors.text.muted,
                  fontFamily: 'monospace',
                  textAlign: 'right',
                }}
              >
                {key}
              </div>
              <div
                style={{
                  width: 40,
                  flexShrink: 0,
                  fontSize: T.typography.sizes.xs,
                  color: T.colors.text.secondary,
                  fontFamily: 'monospace',
                }}
              >
                {size}px
              </div>
              <div
                style={{
                  fontSize: size,
                  fontWeight: T.typography.weights.medium,
                  color: T.colors.text.primary,
                  lineHeight: T.typography.lineHeights.normal,
                }}
              >
                Freenzy.io — Votre OS IA
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16 }}>
          <SubSection title="Font Weights">
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {Object.entries(T.typography.weights).map(([key, weight]) => (
                <div key={key} style={{ fontSize: T.typography.sizes.base, fontWeight: weight }}>
                  {key} ({weight})
                </div>
              ))}
            </div>
          </SubSection>
        </div>
      </Section>

      {/* ═══ 3. Spacing ══════════════════════════════ */}
      <Section title="Spacing" emoji="📏">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            background: T.colors.bg.secondary,
            padding: 20,
            borderRadius: T.radius.lg,
            border: `1px solid ${T.colors.border.primary}`,
          }}
        >
          {Object.entries(T.spacing).map(([key, val]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 50,
                  fontSize: T.typography.sizes.xs,
                  color: T.colors.text.muted,
                  fontFamily: 'monospace',
                  textAlign: 'right',
                }}
              >
                {key}
              </div>
              <div
                style={{
                  width: 40,
                  fontSize: T.typography.sizes.xs,
                  color: T.colors.text.secondary,
                  fontFamily: 'monospace',
                }}
              >
                {val}px
              </div>
              <div
                style={{
                  width: val,
                  height: 16,
                  background: T.colors.accent.primary,
                  borderRadius: T.radius.sm,
                  transition: T.transitions.fast,
                }}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ 4. Border Radius ════════════════════════ */}
      <Section title="Border Radius" emoji="⬜">
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {Object.entries(T.radius).map(([key, val]) => (
            <div key={key} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  background: T.colors.bg.tertiary,
                  border: `2px solid ${T.colors.accent.primary}`,
                  borderRadius: val,
                }}
              />
              <div
                style={{
                  marginTop: 6,
                  fontSize: T.typography.sizes.xs,
                  fontWeight: T.typography.weights.medium,
                  color: T.colors.text.secondary,
                }}
              >
                {key}
              </div>
              <div
                style={{
                  fontSize: T.typography.sizes.xs,
                  color: T.colors.text.muted,
                  fontFamily: 'monospace',
                }}
              >
                {val}px
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ 5. Shadows ══════════════════════════════ */}
      <Section title="Shadows" emoji="💫">
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {Object.entries(T.shadows).map(([key, val]) => (
            <div
              key={key}
              style={{
                width: 140,
                height: 100,
                background: T.colors.bg.primary,
                borderRadius: T.radius.lg,
                boxShadow: val,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${T.colors.border.primary}`,
              }}
            >
              <div
                style={{
                  fontSize: T.typography.sizes.sm,
                  fontWeight: T.typography.weights.semibold,
                  color: T.colors.text.primary,
                }}
              >
                {key}
              </div>
              <div
                style={{
                  fontSize: T.typography.sizes.xs,
                  color: T.colors.text.muted,
                  fontFamily: 'monospace',
                  marginTop: 4,
                  textAlign: 'center',
                  padding: '0 8px',
                  wordBreak: 'break-all',
                }}
              >
                {val}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ 6. Components ═══════════════════════════ */}
      <Section title="Components" emoji="🧩">
        {/* Buttons */}
        <SubSection title="Buttons">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              style={{
                height: T.components.button.primary.height,
                padding: '0 20px',
                background: T.components.button.primary.bg,
                color: T.components.button.primary.color,
                border: 'none',
                borderRadius: T.components.button.primary.borderRadius,
                fontWeight: T.components.button.primary.fontWeight,
                fontSize: T.typography.sizes.md,
                cursor: 'pointer',
                fontFamily: T.typography.fontFamily,
              }}
            >
              Primary
            </button>
            <button
              style={{
                height: T.components.button.ghost.height,
                padding: '0 20px',
                background: T.components.button.ghost.bg,
                color: T.components.button.ghost.color,
                border: T.components.button.ghost.border,
                borderRadius: T.components.button.ghost.borderRadius,
                fontSize: T.typography.sizes.md,
                cursor: 'pointer',
                fontFamily: T.typography.fontFamily,
              }}
            >
              Ghost
            </button>
            <button
              style={{
                height: T.components.button.primary.height,
                padding: '0 20px',
                background: T.colors.semantic.danger.text,
                color: T.colors.text.inverse,
                border: 'none',
                borderRadius: T.components.button.primary.borderRadius,
                fontWeight: T.components.button.primary.fontWeight,
                fontSize: T.typography.sizes.md,
                cursor: 'pointer',
                fontFamily: T.typography.fontFamily,
              }}
            >
              Danger
            </button>
            <button
              style={{
                height: T.components.button.primary.height,
                padding: '0 20px',
                background: T.colors.bg.tertiary,
                color: T.colors.text.muted,
                border: `1px solid ${T.colors.border.primary}`,
                borderRadius: T.components.button.primary.borderRadius,
                fontWeight: T.components.button.primary.fontWeight,
                fontSize: T.typography.sizes.md,
                cursor: 'not-allowed',
                fontFamily: T.typography.fontFamily,
                opacity: 0.5,
              }}
              disabled
            >
              Disabled
            </button>
          </div>
        </SubSection>

        {/* Inputs */}
        <SubSection title="Inputs">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <input
              type="text"
              placeholder="Saisir du texte..."
              style={{
                height: T.components.input.height,
                border: T.components.input.border,
                borderRadius: T.components.input.borderRadius,
                fontSize: T.components.input.fontSize,
                padding: T.components.input.padding,
                fontFamily: T.typography.fontFamily,
                outline: 'none',
                width: 220,
              }}
            />
            <select
              style={{
                height: T.components.input.height,
                border: T.components.input.border,
                borderRadius: T.components.input.borderRadius,
                fontSize: T.components.input.fontSize,
                padding: T.components.input.padding,
                fontFamily: T.typography.fontFamily,
                outline: 'none',
                background: T.colors.bg.primary,
                width: 180,
              }}
            >
              <option>Option A</option>
              <option>Option B</option>
            </select>
            <textarea
              placeholder="Zone de texte..."
              rows={3}
              style={{
                border: T.components.input.border,
                borderRadius: T.components.input.borderRadius,
                fontSize: T.components.input.fontSize,
                padding: '8px 12px',
                fontFamily: T.typography.fontFamily,
                outline: 'none',
                resize: 'vertical',
                width: 260,
              }}
            />
          </div>
        </SubSection>

        {/* Cards */}
        <SubSection title="Cards">
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div
              style={{
                width: 220,
                background: T.components.card.background,
                border: T.components.card.border,
                borderRadius: T.components.card.borderRadius,
                padding: T.components.card.padding,
              }}
            >
              <div
                style={{
                  fontSize: T.typography.sizes.base,
                  fontWeight: T.typography.weights.semibold,
                  marginBottom: 4,
                }}
              >
                Carte standard
              </div>
              <div style={{ fontSize: T.typography.sizes.sm, color: T.colors.text.secondary }}>
                Contenu de la carte avec du texte descriptif.
              </div>
            </div>
            <div
              style={{
                width: 220,
                background: T.components.card.background,
                border: T.components.card.border,
                borderRadius: T.components.card.borderRadius,
                padding: T.components.card.padding,
                cursor: 'pointer',
                transition: T.transitions.fast,
                boxShadow: T.shadows.sm,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = T.shadows.md;
                (e.currentTarget as HTMLDivElement).style.borderColor = T.colors.border.secondary;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = T.shadows.sm;
                (e.currentTarget as HTMLDivElement).style.borderColor = T.colors.border.primary;
              }}
            >
              <div
                style={{
                  fontSize: T.typography.sizes.base,
                  fontWeight: T.typography.weights.semibold,
                  marginBottom: 4,
                }}
              >
                Carte hoverable
              </div>
              <div style={{ fontSize: T.typography.sizes.sm, color: T.colors.text.secondary }}>
                Survolez pour voir l{"'"}effet de hover.
              </div>
            </div>
          </div>
        </SubSection>

        {/* Badges */}
        <SubSection title="Badges">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { label: 'Default', bg: T.colors.bg.tertiary, color: T.colors.text.secondary },
              { label: 'Success', bg: T.colors.semantic.success.bg, color: T.colors.semantic.success.text },
              { label: 'Warning', bg: T.colors.semantic.warning.bg, color: T.colors.semantic.warning.text },
              { label: 'Danger', bg: T.colors.semantic.danger.bg, color: T.colors.semantic.danger.text },
              { label: 'Info', bg: T.colors.semantic.info.bg, color: T.colors.semantic.info.text },
            ].map((b) => (
              <span
                key={b.label}
                style={{
                  padding: T.components.badge.padding,
                  borderRadius: T.components.badge.borderRadius,
                  fontSize: T.components.badge.fontSize,
                  fontWeight: T.components.badge.fontWeight,
                  background: b.bg,
                  color: b.color,
                }}
              >
                {b.label}
              </span>
            ))}
          </div>
        </SubSection>

        {/* Avatars */}
        <SubSection title="Avatars">
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {(Object.entries(T.components.avatar.sizes) as Array<[string, number]>).map(
              ([key, size]) => (
                <div key={key} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: size,
                      height: size,
                      borderRadius: T.radius.full,
                      background: T.colors.accent.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: T.colors.text.inverse,
                      fontSize: size * 0.4,
                      fontWeight: T.typography.weights.semibold,
                    }}
                  >
                    F
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: T.typography.sizes.xs,
                      color: T.colors.text.muted,
                    }}
                  >
                    {key} ({size}px)
                  </div>
                </div>
              ),
            )}
          </div>
        </SubSection>
      </Section>

      {/* ═══ 7. Export ═══════════════════════════════ */}
      <Section title="Export" emoji="📦">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              const css = exportTokensCSS();
              navigator.clipboard.writeText(css).then(() => showToast('CSS Variables copiees !'));
            }}
            style={{
              height: T.components.button.primary.height,
              padding: '0 20px',
              background: T.components.button.primary.bg,
              color: T.components.button.primary.color,
              border: 'none',
              borderRadius: T.components.button.primary.borderRadius,
              fontWeight: T.components.button.primary.fontWeight,
              fontSize: T.typography.sizes.md,
              cursor: 'pointer',
              fontFamily: T.typography.fontFamily,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {'📋'} Copier CSS Variables
          </button>
          <button
            onClick={() => {
              const json = exportTokensJSON();
              const blob = new Blob([json], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'freenzy-design-tokens.json';
              a.click();
              URL.revokeObjectURL(url);
              showToast('JSON telecharge !');
            }}
            style={{
              height: T.components.button.ghost.height,
              padding: '0 20px',
              background: T.components.button.ghost.bg,
              color: T.components.button.ghost.color,
              border: T.components.button.ghost.border,
              borderRadius: T.components.button.ghost.borderRadius,
              fontSize: T.typography.sizes.md,
              cursor: 'pointer',
              fontFamily: T.typography.fontFamily,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {'📥'} Exporter JSON
          </button>
        </div>
      </Section>

      <MiniToast message={toast.message} visible={toast.visible} />
    </div>
  );
}
