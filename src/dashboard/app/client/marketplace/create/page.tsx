'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES, CATEGORY_COLORS, type Category } from '../../../../lib/marketplace-data';
import { ALL_AGENTS } from '../../../../lib/agent-config';
import { saveUserTemplate, type UserTemplate } from '../../../../lib/marketplace-ratings';
import { useToast } from '../../../../components/Toast';
import { useAuthGuard } from '../../../../lib/useAuthGuard';
import { useVisitorDraftObject } from '../../../../lib/useVisitorDraft';
import { CU, pageContainer, headerRow, emojiIcon } from '../../../../lib/page-styles';
import { useIsMobile } from '../../../../lib/use-media-query';
import { PAGE_META } from '../../../../lib/emoji-map';
import PageExplanation from '../../../../components/PageExplanation';

// ═══════════════════════════════════════════════════
//   FREENZY.IO — Marketplace: Creer & Partager
//   Template creation form + live preview
// ═══════════════════════════════════════════════════

const PERSONALITY_SLIDERS = [
  { key: 'formality', label: 'Formalite', low: 'Decontracte', high: 'Formel' },
  { key: 'creativity', label: 'Creativite', low: 'Factuel', high: 'Creatif' },
  { key: 'proactivity', label: 'Proactivite', low: 'Reactif', high: 'Proactif' },
  { key: 'humor', label: 'Humour', low: 'Serieux', high: 'Humoristique' },
  { key: 'responseLength', label: 'Longueur', low: 'Concis', high: 'Detaille' },
  { key: 'expertiseLevel', label: 'Expertise', low: 'Generaliste', high: 'Expert' },
] as const;

type PersonalityKey = (typeof PERSONALITY_SLIDERS)[number]['key'];

export default function MarketplaceCreatePage() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const { requireAuth, LoginModalComponent } = useAuthGuard();
  const { showSuccess, showError } = useToast();

  // ─── Visitor draft — persist key fields to localStorage for visitors
  const { draft: tplDraft, updateField: updateTplField, clearDraft: clearTplDraft } = useVisitorDraftObject('marketplace_create', {
    name: '',
    description: '',
    systemPrompt: '',
    welcomeMessage: '',
  });

  // ─── Form state
  const [name, _setName] = useState(tplDraft.name);
  const setName = (v: string) => { _setName(v); updateTplField('name', v); };
  const [description, _setDescription] = useState(tplDraft.description);
  const setDescription = (v: string) => { _setDescription(v); updateTplField('description', v); };
  const [category, setCategory] = useState<Category>('Productivite');
  const [agentBase, setAgentBase] = useState<string>(ALL_AGENTS[0]?.id ?? '');
  const [systemPrompt, _setSystemPrompt] = useState(tplDraft.systemPrompt);
  const setSystemPrompt = (v: string) => { _setSystemPrompt(v); updateTplField('systemPrompt', v); };
  const [welcomeMessage, _setWelcomeMessage] = useState(tplDraft.welcomeMessage);
  const setWelcomeMessage = (v: string) => { _setWelcomeMessage(v); updateTplField('welcomeMessage', v); };
  const [personality, setPersonality] = useState<Record<PersonalityKey, number>>({
    formality: 50,
    creativity: 50,
    proactivity: 50,
    humor: 30,
    responseLength: 50,
    expertiseLevel: 50,
  });
  const [publishing, setPublishing] = useState(false);

  // ─── Selected agent info
  const selectedAgent = useMemo(
    () => ALL_AGENTS.find((a) => a.id === agentBase),
    [agentBase]
  );

  // ─── Category options (exclude "Tous")
  const categoryOptions = CATEGORIES.filter((c) => c !== 'Tous');

  // ─── Slider update
  const updateSlider = (key: PersonalityKey, value: number) => {
    setPersonality((prev) => ({ ...prev, [key]: value }));
  };

  // ─── Publish handler
  const handlePublish = () => {
    if (!requireAuth('Connectez-vous pour publier un template')) return;
    if (!name.trim()) {
      showError('Veuillez saisir un nom pour votre template');
      return;
    }
    if (!description.trim()) {
      showError('Veuillez ajouter une description');
      return;
    }

    setPublishing(true);

    try {
      const template: UserTemplate = {
        id: `user-tpl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: name.trim(),
        description: description.trim(),
        category,
        agentConfig: {
          agentBase,
          systemPrompt: systemPrompt.trim(),
          welcomeMessage: welcomeMessage.trim(),
          personality: { ...personality },
        },
        authorName: 'Moi',
        authorId: 'local-user',
        publishedAt: new Date().toISOString(),
        installCount: 0,
        ratings: [],
        averageRating: 0,
        status: 'approved',
      };

      saveUserTemplate(template);
      clearTplDraft();
      showSuccess('Template publie avec succes !');

      setTimeout(() => {
        router.push('/client/marketplace');
      }, 800);
    } catch {
      showError('Erreur lors de la publication');
    } finally {
      setPublishing(false);
    }
  };

  // ─── Styles
  const cardBg = CU.bgSecondary;
  const borderColor = CU.border;
  const accent = CU.accent;
  const catColor = CATEGORY_COLORS[category] || accent;

  return (
    <div style={pageContainer(isMobile)}>
      {/* Header */}
      <div>
        {/* Back link */}
        <button
          onClick={() => router.push('/client/marketplace')}
          style={{
            ...CU.btnSmall,
            background: 'none',
            border: 'none',
            color: CU.textMuted,
            padding: 0,
            marginBottom: 16,
          }}
        >
          ← Retour au Marketplace
        </button>

        <div style={headerRow()}>
          <span style={emojiIcon(24)}>➕</span>
          <div>
            <h1 style={CU.pageTitle}>Creer & Partager</h1>
            <p style={CU.pageSubtitle}>
              Creez votre propre template d&apos;agent et partagez-le avec la communaute
            </p>
          </div>
          <PageExplanation
            pageId="marketplace-create"
            text="Configurez un template d'agent personnalise et partagez-le avec la communaute Freenzy."
          />
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', gap: 28, alignItems: 'start', marginTop: 20 }}>
          {/* ─── Left: Form ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Basic info */}
            <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>ℹ️</span>
                Informations de base
              </h2>

              {/* Name */}
              <label style={{ display: 'block', marginBottom: 14 }}>
                <span style={{ fontSize: 12, color: CU.textMuted, display: 'block', marginBottom: 6 }}>
                  Nom du template *
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Assistant SEO Expert"
                  maxLength={60}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: CU.bgSecondary,
                    border: `1px solid ${borderColor}`,
                    borderRadius: 8,
                    color: CU.text,
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </label>

              {/* Description */}
              <label style={{ display: 'block', marginBottom: 14 }}>
                <span style={{ fontSize: 12, color: CU.textMuted, display: 'block', marginBottom: 6 }}>
                  Description *
                </span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Decrivez ce que fait votre template, ses cas d'usage..."
                  maxLength={300}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: CU.bgSecondary,
                    border: `1px solid ${borderColor}`,
                    borderRadius: 8,
                    color: CU.text,
                    fontSize: 14,
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
                <span style={{ fontSize: 11, color: CU.textMuted, float: 'right', marginTop: 2 }}>
                  {description.length}/300
                </span>
              </label>

              {/* Category + Agent base row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))', gap: 14 }}>
                {/* Category */}
                <label>
                  <span style={{ fontSize: 12, color: CU.textMuted, display: 'block', marginBottom: 6 }}>
                    Categorie
                  </span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: CU.bgSecondary,
                      border: `1px solid ${borderColor}`,
                      borderRadius: 8,
                      color: CU.text,
                      fontSize: 14,
                      outline: 'none',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                    }}
                  >
                    {categoryOptions.map((c) => (
                      <option key={c} value={c} style={{ background: '#fff', color: '#1A1A1A' }}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Agent base */}
                <label>
                  <span style={{ fontSize: 12, color: CU.textMuted, display: 'block', marginBottom: 6 }}>
                    Agent de base
                  </span>
                  <select
                    value={agentBase}
                    onChange={(e) => setAgentBase(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: CU.bgSecondary,
                      border: `1px solid ${borderColor}`,
                      borderRadius: 8,
                      color: CU.text,
                      fontSize: 14,
                      outline: 'none',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                    }}
                  >
                    {ALL_AGENTS.map((a) => (
                      <option key={a.id} value={a.id} style={{ background: '#fff', color: '#1A1A1A' }}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {/* Agent config */}
            <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>⚙️</span>
                Configuration de l&apos;agent
              </h2>

              {/* System prompt */}
              <label style={{ display: 'block', marginBottom: 14 }}>
                <span style={{ fontSize: 12, color: CU.textMuted, display: 'block', marginBottom: 6 }}>
                  Prompt systeme personnalise
                </span>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Instructions specifiques pour l'agent... (optionnel)"
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: CU.bgSecondary,
                    border: `1px solid ${borderColor}`,
                    borderRadius: 8,
                    color: CU.text,
                    fontSize: 13,
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </label>

              {/* Welcome message */}
              <label style={{ display: 'block', marginBottom: 18 }}>
                <span style={{ fontSize: 12, color: CU.textMuted, display: 'block', marginBottom: 6 }}>
                  Message d&apos;accueil
                </span>
                <input
                  type="text"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="Bonjour ! Comment puis-je vous aider ?"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: CU.bgSecondary,
                    border: `1px solid ${borderColor}`,
                    borderRadius: 8,
                    color: CU.text,
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </label>

              {/* Personality sliders */}
              <div style={{ marginTop: 4 }}>
                <span style={{ fontSize: 12, color: CU.textMuted, display: 'block', marginBottom: 12 }}>
                  Personnalite
                </span>
                {PERSONALITY_SLIDERS.map(({ key, label, low, high }) => (
                  <div key={key} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: CU.textMuted }}>{label}</span>
                      <span style={{ fontSize: 11, color: accent, fontWeight: 600 }}>{personality[key]}%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 10, color: CU.textMuted, minWidth: 60, textAlign: 'right' }}>{low}</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={personality[key]}
                        onChange={(e) => updateSlider(key, Number(e.target.value))}
                        style={{
                          flex: 1,
                          height: 4,
                          accentColor: accent,
                          cursor: 'pointer',
                        }}
                      />
                      <span style={{ fontSize: 10, color: CU.textMuted, minWidth: 60 }}>{high}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Publish button */}
            <button
              onClick={handlePublish}
              disabled={publishing}
              style={{
                width: '100%',
                padding: '14px 24px',
                background: publishing ? 'rgba(91,108,247,0.4)' : accent,
                border: 'none',
                borderRadius: 8,
                color: CU.bg,
                fontSize: 15,
                fontWeight: 700,
                cursor: publishing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background 0.2s',
              }}
            >
              <span style={{ fontSize: 18 }}>
                {publishing ? '⏳' : '📤'}
              </span>
              {publishing ? 'Publication en cours...' : 'Publier le template'}
            </button>
          </div>

          {/* ─── Right: Live preview ─── */}
          <div style={{ position: 'sticky', top: 24 }}>
            <div style={{ fontSize: 13, color: CU.textMuted, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              👁️
              Apercu en direct
            </div>

            {/* Preview card */}
            <div
              style={{
                background: cardBg,
                border: `1px solid ${borderColor}`,
                borderRadius: 8,
                padding: 24,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Category badge */}
              <div
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  background: `${catColor}22`,
                  border: `1px solid ${catColor}44`,
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                  color: catColor,
                  marginBottom: 14,
                }}
              >
                {category}
              </div>

              {/* Agent icon + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    background: `${catColor}18`,
                    border: `1px solid ${catColor}33`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: 22, color: catColor }}>
                    {selectedAgent?.emoji || 'smart_toy'}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: CU.text }}>
                    {name || 'Nom du template'}
                  </div>
                  <div style={{ fontSize: 12, color: CU.textMuted }}>
                    Base: {selectedAgent?.name || '—'}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: 12, color: CU.textMuted, lineHeight: 1.5, margin: '0 0 16px' }}>
                {description || 'La description de votre template apparaitra ici...'}
              </p>

              {/* Welcome message preview */}
              {welcomeMessage && (
                <div
                  style={{
                    background: CU.bgSecondary,
                    border: `1px solid ${borderColor}`,
                    borderRadius: 10,
                    padding: '10px 14px',
                    marginBottom: 16,
                  }}
                >
                  <div style={{ fontSize: 10, color: CU.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Message d&apos;accueil
                  </div>
                  <div style={{ fontSize: 12, color: CU.textMuted, fontStyle: 'italic' }}>
                    &ldquo;{welcomeMessage}&rdquo;
                  </div>
                </div>
              )}

              {/* Personality bars */}
              <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: 14 }}>
                <div style={{ fontSize: 11, color: CU.textMuted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Personnalite
                </div>
                {PERSONALITY_SLIDERS.map(({ key, label }) => (
                  <div key={key} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 11, color: CU.textMuted }}>{label}</span>
                      <span style={{ fontSize: 10, color: accent }}>{personality[key]}%</span>
                    </div>
                    <div style={{ height: 3, background: CU.bgSecondary, borderRadius: 2 }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${personality[key]}%`,
                          background: catColor,
                          borderRadius: 2,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 16,
                  paddingTop: 14,
                  borderTop: `1px solid ${borderColor}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  👤
                  <span style={{ fontSize: 12, color: CU.textMuted }}>Par Moi</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  ⭐
                  <span style={{ fontSize: 12, color: CU.textMuted }}>Nouveau</span>
                </div>
              </div>
            </div>

            {/* Tip */}
            <div
              style={{
                marginTop: 14,
                padding: '12px 16px',
                background: 'rgba(91,108,247,0.06)',
                border: `1px solid rgba(91,108,247,0.15)`,
                borderRadius: 10,
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
              }}
            >
              <span style={{ fontSize: 16, marginTop: 1, flexShrink: 0 }}>
                💡
              </span>
              <div style={{ fontSize: 12, color: CU.textMuted, lineHeight: 1.5 }}>
                <strong style={{ color: CU.textSecondary }}>Astuce :</strong> Un bon template a un prompt systeme precis et une personnalite coherente avec son cas d&apos;usage.
              </div>
            </div>
          </div>
        </div>
      </div>
      {LoginModalComponent}
    </div>
  );
}
