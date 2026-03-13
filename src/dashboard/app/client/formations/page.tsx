'use client';

import { useState, useEffect } from 'react';
import { useUserData } from '../../../lib/use-user-data';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { useIsMobile } from '../../../lib/use-media-query';
import { CU, pageContainer, headerRow, emojiIcon, cardGrid } from '../../../lib/page-styles';

const DONE_KEY = 'fz_formations_done';

/* ─── Formation Data ─── */
const FORMATIONS = [
  {
    id: 'ia-entreprise',
    icon: 'bar_chart',
    title: 'Maitriser l\'IA pour votre entreprise',
    description: 'Apprenez a integrer l\'intelligence artificielle dans vos processus metier. Decouvrez les outils, strategies et bonnes pratiques pour tirer parti de l\'IA au quotidien.',
    level: 'Debutant',
    levelColor: '#22c55e',
    duration: '2h',
    price: 'Gratuit',
    available: true,
  },
  {
    id: 'communication-digitale',
    icon: 'chat',
    title: 'Communication digitale avancee',
    description: 'Maitrisez les leviers de la communication numerique : strategie de contenu, branding, storytelling et gestion de votre image en ligne pour maximiser votre impact.',
    level: 'Intermediaire',
    levelColor: '#f59e0b',
    duration: '3h',
    price: 'Gratuit',
    available: true,
  },
  {
    id: 'reseaux-sociaux',
    icon: 'phone_iphone',
    title: 'Reseaux sociaux pour professionnels',
    description: 'Construisez une presence professionnelle forte sur LinkedIn, Instagram et TikTok. Apprenez a creer du contenu engageant et a developper votre communaute.',
    level: 'Debutant',
    levelColor: '#22c55e',
    duration: '2h30',
    price: 'Gratuit',
    available: true,
  },
  {
    id: 'contenu-video',
    icon: 'videocam',
    title: 'Creation de contenu video',
    description: 'De la conception au montage, maitrisez la creation de videos professionnelles. Tournage smartphone, montage IA, sous-titrage automatique et diffusion multi-plateforme.',
    level: 'Intermediaire',
    levelColor: '#f59e0b',
    duration: '4h',
    price: 'Gratuit',
    available: false,
  },
  {
    id: 'email-marketing',
    icon: 'mail',
    title: 'Email marketing automatise',
    description: 'Concevez des campagnes email performantes avec l\'IA. Segmentation, personnalisation, automatisation des sequences et analyse des resultats pour un ROI optimal.',
    level: 'Avance',
    levelColor: '#ef4444',
    duration: '3h',
    price: 'Gratuit',
    available: false,
  },
  {
    id: 'seo-visibilite',
    icon: 'search',
    title: 'SEO et visibilite en ligne',
    description: 'Optimisez votre presence sur les moteurs de recherche. Mots-cles, contenu optimise, backlinks et outils IA pour ameliorer votre positionnement Google.',
    level: 'Debutant',
    levelColor: '#22c55e',
    duration: '2h',
    price: 'Gratuit',
    available: true,
  },
];

const BENEFITS = [
  { icon: '🎯', title: 'Sur mesure', desc: 'Formations adaptees a votre secteur et vos objectifs' },
  { icon: '👤', title: 'Expert dedie', desc: 'Formateur specialise avec experience terrain' },
  { icon: '📈', title: 'Resultats concrets', desc: 'Exercices pratiques et plan d\'action personnalise' },
  { icon: '🔄', title: 'Suivi post-formation', desc: '30 jours d\'accompagnement apres chaque session' },
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  formations: string[];
  context: string;
}

const emptyForm: FormData = {
  name: '',
  email: '',
  phone: '',
  formations: [],
  context: '',
};

interface FormationRequest extends FormData {
  createdAt: string;
  status: string;
}

export default function FormationsPage() {
  const isMobile = useIsMobile();
  const [form, setForm] = useState<FormData>({ ...emptyForm });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());

  // Formation requests synced to backend
  const { data: requests, setData: setRequests } = useUserData<FormationRequest[]>('formation_requests', [], 'fz_formation_requests');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DONE_KEY);
      if (raw) setDoneIds(new Set(JSON.parse(raw) as string[]));
    } catch { /* */ }
  }, []);

  function toggleDone(id: string) {
    setDoneIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      try { localStorage.setItem(DONE_KEY, JSON.stringify([...next])); } catch { /* */ }
      return next;
    });
  }

  const filteredFormations = FORMATIONS.filter(f => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return f.title.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
  });

  const doneCount = FORMATIONS.filter(f => doneIds.has(f.id)).length;

  const toggleFormation = (id: string) => {
    setForm(prev => ({
      ...prev,
      formations: prev.formations.includes(id)
        ? prev.formations.filter(f => f !== id)
        : [...prev.formations, id],
    }));
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim() || form.formations.length === 0) {
      setError('Veuillez remplir votre nom, email et selectionner au moins une formation.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Veuillez entrer une adresse email valide.');
      return;
    }
    setError('');

    setRequests(prev => [...prev, {
      ...form,
      createdAt: new Date().toISOString(),
      status: 'pending',
    }]);

    setSubmitted(true);
    setForm({ ...emptyForm });
  };

  return (
    <div style={{ ...pageContainer(isMobile), paddingBottom: 80 }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={headerRow()}>
          <span style={emojiIcon(24)}>{PAGE_META.formations.emoji}</span>
          <div>
            <h1 style={CU.pageTitle}>{PAGE_META.formations.title}</h1>
            <p style={CU.pageSubtitle}>{PAGE_META.formations.subtitle}</p>
          </div>
          <HelpBubble text={PAGE_META.formations.helpText} />
        </div>
      </div>
      <PageExplanation pageId="formations" text={PAGE_META.formations?.helpText} />

      {/* ── Benefits Bar ── */}
      <section style={{ marginBottom: 32 }}>
        <div style={cardGrid(isMobile, 4)}>
          {BENEFITS.map(b => (
            <div key={b.title} style={{
              ...CU.card,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{b.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: CU.text, marginBottom: 4 }}>{b.title}</div>
              <div style={{ fontSize: 12, color: CU.textSecondary, lineHeight: 1.5 }}>{b.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Formation Cards Grid ── */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{ ...CU.sectionTitle, fontSize: 20 }}>
            Nos formations
          </h2>
          <p style={{ fontSize: 13, color: CU.textSecondary, maxWidth: 480, margin: '6px auto 0', lineHeight: 1.5 }}>
            Des programmes concus pour vous rendre autonome rapidement, avec des cas pratiques adaptes a votre activite.
          </p>
        </div>

        {/* Search + progress */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: isMobile ? 0 : 200 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: CU.textMuted }}>🔍</span>
            <input
              type="text"
              placeholder="Rechercher une formation..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                ...CU.input,
                paddingLeft: 36,
              }}
            />
          </div>
          {doneCount > 0 && (
            <div style={{ fontSize: 13, color: CU.text, fontWeight: 600, flexShrink: 0 }}>
              ✅ {doneCount}/{FORMATIONS.length} terminée{doneCount > 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div style={cardGrid(isMobile, 2)}>
          {filteredFormations.length === 0 && (
            <div style={{ gridColumn: '1/-1', ...CU.emptyState, padding: '40px 0' }}>
              <div style={CU.emptyEmoji}>🔍</div>
              <div style={CU.emptyDesc}>Aucune formation ne correspond à votre recherche.</div>
              <button onClick={() => setSearch('')} style={{ ...CU.btnSmall, color: CU.accent, textDecoration: 'underline', border: 'none', background: 'none' }}>Réinitialiser</button>
            </div>
          )}
          {filteredFormations.map(f => (
            <div
              key={f.id}
              style={{
                ...CU.card,
                position: 'relative',
                opacity: f.available ? 1 : 0.85,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.background = CU.bgSecondary;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.background = CU.bg;
              }}
            >
              {/* Unavailable badge */}
              {!f.available && (
                <div style={{
                  ...CU.badgeWarning,
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  fontSize: 10,
                  fontWeight: 700,
                }}>
                  Bientot disponible
                </div>
              )}

              {/* Icon + Title */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  background: CU.accentLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0,
                }}>
                  🎓
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: CU.text,
                    lineHeight: 1.3,
                    margin: 0,
                  }}>
                    {f.title}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p style={{
                fontSize: 13,
                color: CU.textSecondary,
                lineHeight: 1.6,
                margin: 0,
                flex: 1,
              }}>
                {f.description}
              </p>

              {/* Meta: Level, Duration, Price */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
                paddingTop: 8,
                borderTop: `1px solid ${CU.border}`,
              }}>
                {/* Level Badge */}
                <span style={{
                  ...CU.badge,
                  background: `${f.levelColor}18`,
                  color: f.levelColor,
                  fontWeight: 600,
                }}>
                  {f.level}
                </span>

                {/* Duration */}
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  color: CU.textSecondary,
                  fontWeight: 500,
                }}>
                  ⏱️ {f.duration}
                </span>

                {/* Price */}
                <span style={{
                  marginLeft: 'auto',
                  fontSize: 13,
                  fontWeight: 700,
                  color: CU.accent,
                }}>
                  {f.price}
                </span>
              </div>

              {/* Inscription note for unavailable */}
              {!f.available && (
                <div style={{
                  ...CU.badgeWarning,
                  width: '100%',
                  justifyContent: 'center',
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 11,
                  lineHeight: 1.5,
                }}>
                  Inscrivez-vous pour etre informe de la disponibilite
                </div>
              )}

              {/* Done toggle */}
              {f.available && (
                <button
                  onClick={() => toggleDone(f.id)}
                  style={{
                    ...(doneIds.has(f.id) ? CU.badgeSuccess : CU.btnGhost),
                    width: '100%',
                    height: 36,
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 8,
                    border: `1px solid ${doneIds.has(f.id) ? CU.success : CU.border}`,
                    background: doneIds.has(f.id) ? '#f0fdf4' : 'transparent',
                    color: doneIds.has(f.id) ? CU.success : CU.textMuted,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {doneIds.has(f.id) ? <>✅ Terminée</> : 'Marquer comme terminée'}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA / Quote Request Section ── */}
      <section>
        <div style={{
          ...CU.card,
          borderRadius: 12,
          padding: isMobile ? 24 : 40,
          maxWidth: 680,
          margin: '0 auto',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📧</div>
            <h2 style={{ ...CU.sectionTitle, fontSize: 20, marginBottom: 6 }}>
              Faire une demande
            </h2>
            <p style={{ fontSize: 13, color: CU.textSecondary, lineHeight: 1.6, maxWidth: 420, margin: '0 auto' }}>
              Decrivez vos besoins et nous vous proposons un programme sur mesure adapte a votre activite.
            </p>
          </div>

          {submitted ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 24px',
              background: '#f0fdf4',
              borderRadius: 8,
              border: '1px solid #bbf7d0',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#15803d', marginBottom: 8, margin: '0 0 8px' }}>
                Demande envoyee !
              </h3>
              <p style={{ fontSize: 13, color: '#166534', lineHeight: 1.6, marginBottom: 20 }}>
                Merci pour votre interet. Nous reviendrons vers vous sous 24 a 48 heures avec une proposition personnalisee.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                style={CU.btnGhost}
              >
                Faire une autre demande
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Error */}
              {error && (
                <div style={{
                  ...CU.badgeDanger,
                  padding: '10px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  width: '100%',
                  border: '1px solid #fecaca',
                }}>
                  {error}
                </div>
              )}

              {/* Name */}
              <div>
                <label style={CU.label}>Nom complet *</label>
                <input
                  type="text"
                  placeholder="Jean Dupont"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  style={CU.input}
                />
              </div>

              {/* Email */}
              <div>
                <label style={CU.label}>Email *</label>
                <input
                  type="email"
                  placeholder="jean@entreprise.com"
                  value={form.email}
                  onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                  style={CU.input}
                />
              </div>

              {/* Phone */}
              <div>
                <label style={CU.label}>Telephone</label>
                <input
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  value={form.phone}
                  onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  style={CU.input}
                />
              </div>

              {/* Formation Selection */}
              <div>
                <label style={CU.label}>Formation(s) souhaitee(s) *</label>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}>
                  {FORMATIONS.map(f => {
                    const selected = form.formations.includes(f.id);
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => toggleFormation(f.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '10px 14px',
                          borderRadius: 8,
                          minHeight: 44,
                          border: `1.5px solid ${selected ? CU.accent : CU.border}`,
                          background: selected ? `${CU.accent}08` : CU.bg,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'border-color 0.15s, background 0.15s',
                          fontFamily: 'inherit',
                        }}
                      >
                        <span style={{
                          width: 20,
                          height: 20,
                          borderRadius: 5,
                          border: `2px solid ${selected ? CU.accent : CU.border}`,
                          background: selected ? CU.accent : CU.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          color: CU.bg,
                          flexShrink: 0,
                          transition: 'background 0.15s, border-color 0.15s',
                        }}>
                          {selected ? '✓' : ''}
                        </span>
                        <span style={{ fontSize: 16 }}>🎓</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: CU.text }}>
                            {f.title}
                          </div>
                          <div style={{ fontSize: 11, color: CU.textMuted, marginTop: 1 }}>
                            {f.level} &middot; {f.duration}
                            {!f.available && <span style={{ color: CU.warning, fontWeight: 600, marginLeft: 6 }}>Bientot</span>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Context / Needs */}
              <div>
                <label style={CU.label}>Vos besoins / contexte</label>
                <textarea
                  placeholder="Decrivez votre entreprise, vos objectifs et le contexte de cette demande de formation..."
                  value={form.context}
                  onChange={e => setForm(prev => ({ ...prev, context: e.target.value }))}
                  rows={4}
                  style={CU.textarea}
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                style={{
                  ...CU.btnPrimary,
                  width: '100%',
                  height: 44,
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                Envoyer ma demande
              </button>

              <p style={{
                fontSize: 11,
                color: CU.textMuted,
                textAlign: 'center',
                lineHeight: 1.5,
                margin: 0,
              }}>
                Vos donnees sont utilisees uniquement pour traiter votre demande. Reponse sous 24 a 48h.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
